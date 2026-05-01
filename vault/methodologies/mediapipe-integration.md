# Metodologia: Integração MediaPipe em Projetos Web/Python

#metodologia #mediapipe #visao-computacional #gestos #python #javascript

## Visão Geral
MediaPipe é a biblioteca principal usada pelo Gabriel para projetos de visão computacional. Suporta Python e JavaScript (browser via CDN).

## Python — Setup Padrão

```python
import mediapipe as mp
import cv2

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)
    
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
    
    cv2.imshow('MediaPipe', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

## JavaScript (Browser) — Setup via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
```

```javascript
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({ maxNumHands: 2, minDetectionConfidence: 0.7 });
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => await hands.send({image: videoElement}),
  width: 1280, height: 720
});
camera.start();
```

## Landmarks de Referência (Mãos)
| ID | Ponto |
|----|-------|
| 4 | Ponta do polegar |
| 8 | Ponta do indicador |
| 12 | Ponta do médio |
| 16 | Ponta do anelar |
| 20 | Ponta do mínimo |
| 0 | Pulso |

## Detecção de Pinça
```python
def is_pinching(hand_landmarks, threshold=30):
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    dist = ((thumb_tip.x - index_tip.x)**2 + (thumb_tip.y - index_tip.y)**2)**0.5
    return dist * frame_width < threshold
```

## Quando Usar
- Controle de interfaces sem toque
- Jogos e apps interativos
- Assistentes visuais
- Arte generativa por gesto

## Projetos que Usam Esta Metodologia
- [[projects/handlines-gesture-control]]
- [[projects/spatial-builder-3d]]
- [[projects/facial-verification-system]]

---
*Criado: 2026-04-30 | Metodologia recorrente nos projetos de Gabriel*
