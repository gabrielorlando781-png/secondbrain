# Sentinela — Detector de Sonolência

Sistema de monitoramento em tempo real projetado para aumentar a segurança de motoristas e operadores de máquinas, identificando sinais de fadiga através de visão computacional.

## 🚀 Status: Em Desenvolvimento (Fase de Integração)
- [x] Configuração inicial do ambiente (Vite + React)
- [x] Implementação do Face Mesh com MediaPipe
- [x] Cálculo de eye-tracking para detecção de piscadas
- [x] Lógica de detecção de sono (olhos fechados por > N segundos)
- [/] Integração de alarme sonoro
- [ ] Publicação do dashboard de controle

## 🛠️ Tecnologias
- **Frontend:** React + Vite
- **Visão Computacional:** MediaPipe Face Mesh
- **Lógica:** JavaScript (análise de coordenadas faciais)
- **Estética:** Glassmorphism e Dark Mode premium

## 🧠 Aprendizados Relevantes
- A precisão da detecção depende da iluminação e da calibração inicial dos pontos dos olhos.
- O uso de `requestAnimationFrame` é crucial para manter a performance em dispositivos móveis.

---
**Links:** [[mediapipe-integration]] | [[universal-memory-sync]]
**Tags:** #computervision #safety #ai #react
