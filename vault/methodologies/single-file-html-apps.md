# Metodologia: Apps HTML Single-File

#metodologia #html #javascript #portabilidade #single-file

## Visão Geral
Gabriel tem preferência por aplicativos HTML que funcionam como **arquivo único** — todo CSS, JS e HTML em um único `.html`. Isso garante máxima portabilidade, sem necessidade de servidor ou build.

## Estrutura Padrão

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nome do App</title>
  <style>
    /* === CSS === */
    :root {
      --primary: #00d4ff;
      --bg: #0a0a1a;
      --glass: rgba(255,255,255,0.05);
    }
    /* Glassmorphism padrão */
    .card {
      background: var(--glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
    }
  </style>
</head>
<body>
  <!-- HTML -->
  <script>
    // === JavaScript ===
  </script>
</body>
</html>
```

## CDNs Confiáveis Usadas
```
Three.js:     https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
MediaPipe:    https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js
D3.js:        https://d3js.org/d3.v7.min.js
Marked.js:    https://cdn.jsdelivr.net/npm/marked/marked.min.js
Highlight.js: https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
```

## Design System Padrão (Glassmorphism Dark)
- **Background**: `#0a0a1a` ou `#050510`
- **Accent**: `#00d4ff` (cyan) ou `#a855f7` (purple) ou `#22c55e` (green)
- **Glass card**: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(20px)`
- **Border**: `1px solid rgba(255,255,255,0.1)`
- **Font**: Inter, Outfit, ou JetBrains Mono (Google Fonts)
- **Border-radius**: 12–20px nos cards

## Limitações e Soluções
| Limitação | Solução |
|-----------|---------|
| Sem persistência | localStorage / IndexedDB |
| Sem servidor | Usar apenas CDNs ou APIs externas |
| Arquivos grandes (>5MB) | Considerar Vite/Next.js |
| Múltiplos arquivos | Inline tudo no HTML |

## Projetos que Seguem Este Padrão
- [[projects/spatial-builder-3d]]
- [[projects/facial-verification-system]]
- [[projects/handlines-gesture-control]]

---
*Criado: 2026-04-30 | Padrão preferido do Gabriel para demos e protótipos rápidos*
