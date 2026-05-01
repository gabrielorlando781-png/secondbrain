const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');

const app = express();
const PORT = 3737;
const VAULT_DIR = path.join(__dirname, 'vault');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRelativePath(fullPath) {
  return path.relative(VAULT_DIR, fullPath).replace(/\\/g, '/');
}

function getAllNotes() {
  const notes = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const relativePath = getRelativePath(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const stats = fs.statSync(fullPath);
        notes.push({
          id: relativePath.replace('.md', ''),
          path: relativePath,
          name: path.basename(entry.name, '.md'),
          content,
          modified: stats.mtime,
          created: stats.birthtime,
        });
      }
    }
  }
  walk(VAULT_DIR);
  return notes;
}

function extractLinks(content) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].replace(/\//g, path.sep));
  }
  return links;
}

function extractTags(content) {
  const regex = /#([a-zA-Z0-9_\-áéíóúàèìòùãõâêîôûçÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ]+)/g;
  const tags = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return [...new Set(tags)];
}

function getTitle(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : fallback;
}

// ─── API Routes ──────────────────────────────────────────────────────────────

// GET /api/notes — listar todas as notas
app.get('/api/notes', (req, res) => {
  try {
    const notes = getAllNotes().map(n => ({
      id: n.id,
      path: n.path,
      name: n.name,
      title: getTitle(n.content, n.name),
      tags: extractTags(n.content),
      links: extractLinks(n.content),
      modified: n.modified,
      created: n.created,
      excerpt: n.content.slice(0, 200).replace(/^#.+\n/, '').trim(),
    }));
    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/notes/:id — ler nota específica
app.get('/api/notes/*', (req, res) => {
  try {
    const id = req.params[0];
    const filePath = path.join(VAULT_DIR, id + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Nota não encontrada' });
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    res.json({
      id,
      path: id + '.md',
      name: path.basename(id),
      title: getTitle(content, path.basename(id)),
      content,
      tags: extractTags(content),
      links: extractLinks(content),
      modified: stats.mtime,
      created: stats.birthtime,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/notes — criar nova nota
app.post('/api/notes', (req, res) => {
  try {
    const { id, content } = req.body;
    if (!id || !content) return res.status(400).json({ error: 'id e content são obrigatórios' });
    const filePath = path.join(VAULT_DIR, id + '.md');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/notes/:id — atualizar nota
app.put('/api/notes/*', (req, res) => {
  try {
    const id = req.params[0];
    const { content } = req.body;
    const filePath = path.join(VAULT_DIR, id + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Nota não encontrada' });
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/notes/:id — deletar nota
app.delete('/api/notes/*', (req, res) => {
  try {
    const id = req.params[0];
    const filePath = path.join(VAULT_DIR, id + '.md');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Nota não encontrada' });
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/graph — dados do grafo
app.get('/api/graph', (req, res) => {
  try {
    const notes = getAllNotes();
    const nodes = notes.map(n => ({
      id: n.id,
      name: getTitle(n.content, n.name),
      tags: extractTags(n.content),
      group: n.id.split('/')[0],
    }));
    const links = [];
    for (const note of notes) {
      const noteLinks = extractLinks(note.content);
      for (const link of noteLinks) {
        const target = notes.find(n => n.id === link || n.name === link);
        if (target) {
          links.push({ source: note.id, target: target.id });
        }
      }
    }
    res.json({ nodes, links });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/search?q=... — busca full-text
app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.json([]);
    const notes = getAllNotes();
    const results = notes
      .filter(n => n.content.toLowerCase().includes(q) || n.name.toLowerCase().includes(q))
      .map(n => ({
        id: n.id,
        name: n.name,
        title: getTitle(n.content, n.name),
        excerpt: (() => {
          const idx = n.content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 60);
          return n.content.slice(start, idx + 120).replace(/\n/g, ' ');
        })(),
      }));
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── HTTP Server ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`\n🧠 Second Brain rodando em http://localhost:${PORT}`);
    console.log(`📁 Vault: ${VAULT_DIR}\n`);
  });

  // ─── WebSocket (live reload quando arquivos mudam) ────────────────────────────

  const wss = new WebSocketServer({ server });
  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  function broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const client of clients) {
      if (client.readyState === 1) client.send(data);
    }
  }

  chokidar.watch(VAULT_DIR, { ignoreInitial: true }).on('all', (event, filePath) => {
    if (filePath.endsWith('.md')) {
      broadcast({ type: 'vault-change', event, path: getRelativePath(filePath) });
    }
  });
}

module.exports = app;
