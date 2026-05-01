/* ═══════════════════════════════════════════════════════════
   SECOND BRAIN — app.js
   Motor principal: API, editor, grafo D3, busca, sidebar
═══════════════════════════════════════════════════════════ */

const API = 'http://localhost:3737/api';
let allNotes = [];
let currentNoteId = null;
let previewMode = false;
let searchTimeout = null;

// ─── Marked config ────────────────────────────────────────

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

// ─── WebSocket (live reload) ──────────────────────────────

function connectWS() {
  try {
    const ws = new WebSocket('ws://localhost:3737');
    ws.onopen = () => setStatus(true);
    ws.onclose = () => { setStatus(false); setTimeout(connectWS, 3000); };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'vault-change') loadNotes(true);
    };
  } catch {}
}

function setStatus(online) {
  const dot = document.getElementById('status-dot');
  dot.className = online ? '' : 'offline';
  dot.title = online ? 'Conectado ao servidor' : 'Offline — reconectando...';
}

// ─── API helpers ──────────────────────────────────────────

async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Load all notes ───────────────────────────────────────

async function loadNotes(silent = false) {
  try {
    allNotes = await apiFetch('/notes');
    renderSidebar();
    updateStats();
    if (!silent) showWelcome();
  } catch (e) {
    toast('Erro ao carregar notas: ' + e.message, 'error');
  }
}

// ─── Stats ────────────────────────────────────────────────

function updateStats() {
  const totalLinks = allNotes.reduce((s, n) => s + (n.links || []).length, 0);
  const allTags = new Set(allNotes.flatMap(n => n.tags || []));
  document.getElementById('stat-notes').textContent = allNotes.length;
  document.getElementById('stat-links').textContent = totalLinks;
  document.getElementById('stat-tags').textContent = allTags.size;
  document.getElementById('note-count').textContent = allNotes.length;
}

// ─── Sidebar ──────────────────────────────────────────────

function renderSidebar() {
  const tree = document.getElementById('note-tree');
  tree.innerHTML = '';

  // Group by folder
  const groups = {};
  for (const note of allNotes) {
    const parts = note.id.split('/');
    const folder = parts.length > 1 ? parts[0] : '__root__';
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(note);
  }

  // Sort: root first, then alphabetical
  const folderOrder = ['__root__', 'projects', 'methodologies'];
  const sortedFolders = [
    ...folderOrder.filter(f => groups[f]),
    ...Object.keys(groups).filter(f => !folderOrder.includes(f)).sort(),
  ];

  for (const folder of sortedFolders) {
    const notes = groups[folder];
    if (folder !== '__root__') {
      const icon = folder === 'projects' ? '📁' : folder === 'methodologies' ? '🔬' : '📂';
      const folderEl = document.createElement('div');
      folderEl.className = 'tree-folder';
      folderEl.innerHTML = `<span>${icon}</span><span>${folder}</span>`;
      tree.appendChild(folderEl);
    }
    for (const note of notes.sort((a, b) => a.name.localeCompare(b.name))) {
      const el = document.createElement('div');
      el.className = 'tree-note' + (note.id === currentNoteId ? ' active' : '');
      el.dataset.id = note.id;
      el.innerHTML = `<span class="tree-note-icon">📄</span><span>${note.title || note.name}</span>`;
      el.addEventListener('click', () => openNote(note.id));
      tree.appendChild(el);
    }
  }
}

// ─── Open note ────────────────────────────────────────────

async function openNote(id) {
  try {
    const note = await apiFetch('/notes/' + id);
    currentNoteId = id;
    document.getElementById('note-title-input').value = note.title || note.name;
    document.getElementById('raw-editor').value = note.content;
    renderPreview(note.content);
    renderBacklinks(id);
    switchView('editor');
    renderSidebar();
    document.getElementById('view-welcome').classList.remove('active');
    document.getElementById('view-editor').classList.add('active');
    document.getElementById('view-graph').classList.remove('active');
  } catch (e) {
    toast('Erro ao abrir nota: ' + e.message, 'error');
  }
}

// ─── Preview ──────────────────────────────────────────────

function renderPreview(content) {
  const panel = document.getElementById('preview-panel');
  let html = marked.parse(content || '');
  // Wiki-links: [[nome]] → <a class="wiki-link">
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
    return `<a class="wiki-link" onclick="navigateToLink('${name}')" href="#">${name}</a>`;
  });
  // Tags: #tag → pill
  html = html.replace(/#([a-zA-Z0-9_\-áéíóúàèìòùãõâêîôûçÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ]+)/g,
    (_, tag) => `<span class="tag-pill">#${tag}</span>`);
  panel.innerHTML = html;
  panel.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
}

function navigateToLink(name) {
  const note = allNotes.find(n => n.id === name || n.name === name || n.id.endsWith('/' + name));
  if (note) openNote(note.id);
  else toast(`Nota "${name}" não encontrada`, 'error');
}

function togglePreview() {
  previewMode = !previewMode;
  const raw = document.getElementById('raw-editor');
  const preview = document.getElementById('preview-panel');
  const btn = document.getElementById('btn-preview');
  raw.style.display = previewMode ? 'none' : '';
  preview.style.display = previewMode ? 'block' : '';
  btn.textContent = previewMode ? '✏️ Editar' : '👁 Preview';
}

// ─── Auto-preview on type ─────────────────────────────────

document.getElementById('raw-editor').addEventListener('input', function () {
  renderPreview(this.value);
});

// ─── Save note ────────────────────────────────────────────

async function saveNote() {
  if (!currentNoteId) return;
  const content = document.getElementById('raw-editor').value;
  try {
    await apiFetch('/notes/' + currentNoteId, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    await loadNotes(true);
    toast('Nota salva! 💾', 'success');
  } catch (e) {
    toast('Erro ao salvar: ' + e.message, 'error');
  }
}

// Ctrl+S to save
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveNote(); }
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); document.getElementById('search-input').focus(); }
});

// ─── Delete note ──────────────────────────────────────────

async function deleteCurrentNote() {
  if (!currentNoteId) return;
  if (!confirm(`Deletar "${currentNoteId}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await apiFetch('/notes/' + currentNoteId, { method: 'DELETE' });
    currentNoteId = null;
    await loadNotes();
    toast('Nota deletada', 'info');
    showWelcome();
  } catch (e) {
    toast('Erro ao deletar: ' + e.message, 'error');
  }
}

// ─── Backlinks ────────────────────────────────────────────

function renderBacklinks(id) {
  const container = document.getElementById('backlinks-list');
  const name = id.split('/').pop();
  const backlinkers = allNotes.filter(n =>
    n.id !== id && (n.links || []).some(l => l === id || l === name)
  );
  if (backlinkers.length === 0) {
    container.innerHTML = '<span style="color:var(--text-muted);font-size:12px">Nenhuma nota aponta para esta.</span>';
    return;
  }
  container.innerHTML = backlinkers.map(n =>
    `<div class="backlink-item" onclick="openNote('${n.id}')">📄 ${n.title || n.name}</div>`
  ).join('');
}

// ─── View switching ───────────────────────────────────────

function switchView(view) {
  document.getElementById('tab-editor').classList.toggle('active', view === 'editor');
  document.getElementById('tab-graph').classList.toggle('active', view === 'graph');

  if (view === 'graph') {
    document.getElementById('view-welcome').classList.remove('active');
    document.getElementById('view-editor').classList.remove('active');
    document.getElementById('view-graph').classList.add('active');
    renderGraph();
  } else if (view === 'editor') {
    document.getElementById('view-graph').classList.remove('active');
    if (currentNoteId) {
      document.getElementById('view-welcome').classList.remove('active');
      document.getElementById('view-editor').classList.add('active');
    } else {
      showWelcome();
    }
  }
}

function showWelcome() {
  document.getElementById('view-welcome').classList.add('active');
  document.getElementById('view-editor').classList.remove('active');
  document.getElementById('view-graph').classList.remove('active');
}

// ─── New Note Modal ───────────────────────────────────────

function openNewNoteModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-name').value = '';
  setTimeout(() => document.getElementById('modal-name').focus(), 100);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.getElementById('modal-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createNote();
  if (e.key === 'Escape') closeModal();
});

async function createNote() {
  const folder = document.getElementById('modal-folder').value;
  const name = document.getElementById('modal-name').value.trim()
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '');
  if (!name) { toast('Dê um nome à nota', 'error'); return; }
  const id = folder ? `${folder}/${name}` : name;
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const content = `# ${title}\n\n#projeto\n\n## Resumo\n\n\n\n---\n*Criado: ${new Date().toLocaleDateString('pt-BR')}*\n`;
  try {
    await apiFetch('/notes', { method: 'POST', body: JSON.stringify({ id, content }) });
    closeModal();
    await loadNotes(true);
    openNote(id);
    toast('Nota criada! ✨', 'success');
  } catch (e) {
    toast('Erro ao criar: ' + e.message, 'error');
  }
}

// ─── Search ───────────────────────────────────────────────

document.getElementById('search-input').addEventListener('input', function () {
  clearTimeout(searchTimeout);
  const q = this.value.trim();
  if (!q) { closeSearch(); return; }
  searchTimeout = setTimeout(() => runSearch(q), 250);
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSearch(); document.getElementById('search-input').value = ''; }
});

async function runSearch(q) {
  try {
    const results = await apiFetch('/search?q=' + encodeURIComponent(q));
    const box = document.getElementById('search-results');
    if (results.length === 0) {
      box.innerHTML = '<div class="search-result-item" style="color:var(--text-muted)">Nenhum resultado encontrado</div>';
    } else {
      box.innerHTML = results.map(r => `
        <div class="search-result-item" onclick="openNote('${r.id}'); closeSearch(); document.getElementById('search-input').value='';">
          <div class="sri-title">${r.title || r.name}</div>
          <div class="sri-excerpt">${r.excerpt}</div>
        </div>
      `).join('');
    }
    box.classList.add('open');
  } catch {}
}

function closeSearch() {
  document.getElementById('search-results').classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (!document.getElementById('search-box').contains(e.target)) closeSearch();
});

// ─── Graph View (D3.js) ───────────────────────────────────

let graphSimulation = null;

async function renderGraph() {
  const svg = document.getElementById('graph-canvas');
  svg.innerHTML = '';

  const data = await apiFetch('/graph');
  if (!data.nodes.length) return;

  const W = svg.clientWidth, H = svg.clientHeight;

  const svgEl = d3.select('#graph-canvas')
    .attr('viewBox', [0, 0, W, H]);

  // Zoom
  const g = svgEl.append('g');
  svgEl.call(d3.zoom().scaleExtent([0.2, 4]).on('zoom', (e) => g.attr('transform', e.transform)));

  const colorMap = {
    projects: '#7c6af7',
    methodologies: '#22d3ee',
    index: '#f59e0b',
  };
  const getColor = (d) => colorMap[d.group] || '#a78bfa';

  // Links
  const link = g.append('g').selectAll('line')
    .data(data.links).join('line')
    .attr('stroke', 'rgba(255,255,255,0.08)')
    .attr('stroke-width', 1.5);

  // Nodes
  const node = g.append('g').selectAll('g')
    .data(data.nodes).join('g')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => { openNote(d.id); switchView('editor'); })
    .on('mouseover', (e, d) => {
      const tt = document.getElementById('graph-tooltip');
      document.getElementById('gt-title').textContent = d.name;
      document.getElementById('gt-tags').textContent = (d.tags || []).map(t => '#' + t).join(' ');
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 14) + 'px';
      tt.style.top  = (e.clientY - 10) + 'px';
    })
    .on('mousemove', (e) => {
      const tt = document.getElementById('graph-tooltip');
      tt.style.left = (e.clientX + 14) + 'px';
      tt.style.top  = (e.clientY - 10) + 'px';
    })
    .on('mouseout', () => { document.getElementById('graph-tooltip').style.display = 'none'; });

  // Degree for sizing
  const degree = {};
  for (const l of data.links) {
    degree[l.source] = (degree[l.source] || 0) + 1;
    degree[l.target] = (degree[l.target] || 0) + 1;
  }
  const radius = (d) => Math.max(8, Math.min(22, 8 + (degree[d.id] || 0) * 3));

  node.append('circle')
    .attr('r', d => radius(d))
    .attr('fill', d => getColor(d))
    .attr('stroke', 'rgba(255,255,255,0.2)')
    .attr('stroke-width', 1.5)
    .style('filter', d => `drop-shadow(0 0 6px ${getColor(d)}88)`);

  node.append('text')
    .attr('dy', d => radius(d) + 14)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11')
    .attr('fill', '#8888bb')
    .text(d => d.name.length > 20 ? d.name.slice(0, 18) + '…' : d.name);

  // Force simulation
  const sim = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => radius(d) + 20))
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  graphSimulation = sim;
}

// ─── Toast ────────────────────────────────────────────────

function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ─── Init ─────────────────────────────────────────────────

async function init() {
  await loadNotes();
  connectWS();
}

init();
