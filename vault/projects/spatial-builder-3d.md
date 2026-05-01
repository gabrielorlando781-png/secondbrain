# Projeto: Spatial Builder 3D

#projeto #html #javascript #threejs #mediapipe #gestos #3d

## Resumo
Aplicativo HTML single-file para construção 3D de blocos em tempo real usando gestos das mãos. Interface holográfica com glassmorphism. Combina MediaPipe para rastreamento e Three.js para renderização 3D.

## Stack Técnica
- **Frontend**: HTML5 + CSS3 + JavaScript (single-file)
- **3D**: Three.js (renderização, raycasting, sombras)
- **Gestos**: MediaPipe Hands (browser via CDN)
- **UI**: Glassmorphism + tema holográfico cyan/azul
- **Storage**: localStorage para persistência de blocos

## Funcionalidades Implementadas
- Ghost block para preview de posicionamento
- Snap para grade 3D
- Rotação e escala por gestos
- Undo com histórico de ações
- Fallback para mouse/teclado
- Exportação de cena

## Decisões de Design
- Single-file HTML para máxima portabilidade
- Raycasting para detecção de superfícies de snap
- Grid snapping configurável (1x1x1 unidades)
- Câmera orbital com OrbitControls

## Lições Aprendidas
- MediaPipe no browser tem latência maior que Python — usar `requestAnimationFrame` otimizado
- Three.js instanced mesh para performance com muitos blocos
- localStorage limita a ~5MB — usar IndexedDB para cenas grandes

## Conexões
- [[methodologies/mediapipe-integration]]
- [[methodologies/single-file-html-apps]]
- [[projects/handlines-gesture-control]]

---
*Criado: 2026-04-30 | Projeto: Gabriel*
