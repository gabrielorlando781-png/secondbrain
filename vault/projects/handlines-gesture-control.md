# Projeto: HandLines — Controle por Gestos

#projeto #python #mediapipe #gestos #visao-computacional

## Resumo
Sistema de controle por gestos das mãos usando MediaPipe, com funcionalidade de desenho por pinça, quadriláteros com duas mãos, e comandos de voz integrados. Interface com HUD em português.

## Stack Técnica
- **Linguagem**: Python
- **Visão Computacional**: MediaPipe Hands (21 landmarks por mão)
- **Interface**: OpenCV (janela de câmera com HUD overlay)
- **Gestos**: Detecção de pinça (thumb + index distance)
- **Voz**: SpeechRecognition para comando "desative a música"

## Funcionalidades Implementadas
- Pinch-to-draw persistente (estado de linha congelada)
- Desenho de quadriláteros com duas mãos
- Clear-all com palmas abertas ou tecla 'C'
- HUD com estados de gestos em português
- Bionic hand visual overlay (desativado na versão final)
- Face ID para login (desativado por solicitação)

## Gestos Mapeados
| Gesto | Ação |
|-------|------|
| Pinça (1 mão) | Iniciar/manter linha de desenho |
| Abrir palma | Limpar tela |
| Pinça (2 mãos) | Definir quadrilátero |
| Tecla C | Limpar tela |

## Decisões de Design
- Usar state machine para persistência de desenho (não apenas detecção em frame)
- Threshold de distância de pinça: ~30px para ativação
- MediaPipe com `min_detection_confidence=0.7` para estabilidade

## Conexões
- [[methodologies/mediapipe-integration]]
- [[projects/spatial-builder-3d]]

---
*Criado: 2026-04-30 | Projeto: Gabriel*
