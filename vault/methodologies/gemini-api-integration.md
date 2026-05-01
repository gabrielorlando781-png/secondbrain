# Metodologia: Integração com Gemini API

#metodologia #ia #gemini #python #javascript #api

## Visão Geral
A Gemini API do Google é a IA principal usada nos projetos de Gabriel. Usada tanto para conversação quanto para análise de imagem e automação inteligente.

## Setup Python

```python
import google.generativeai as genai

genai.configure(api_key="SUA_API_KEY")
model = genai.GenerativeModel('gemini-2.0-flash')

# Conversa simples
response = model.generate_content("Sua pergunta aqui")
print(response.text)

# Com histórico de chat
chat = model.start_chat(history=[])
response = chat.send_message("Mensagem")
```

## Setup JavaScript

```javascript
const { GoogleGenerativeAI } = await import('@google/generative-ai');
const genAI = new GoogleGenerativeAI('SUA_API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const result = await model.generateContent('Sua pergunta');
console.log(result.response.text());
```

## Modelos Disponíveis
| Modelo | Uso |
|--------|-----|
| `gemini-2.0-flash` | Respostas rápidas, uso geral |
| `gemini-1.5-pro` | Contexto longo, análise profunda |
| `gemini-1.5-flash` | Balance velocidade/qualidade |

## Análise de Imagem (Vision)
```python
import PIL.Image

img = PIL.Image.open("imagem.jpg")
response = model.generate_content(["Descreva esta imagem:", img])
```

## Boas Práticas
- Sempre incluir contexto do sistema no início do chat
- Manter histórico de conversa para continuidade
- Usar `temperature=0.7` para respostas criativas, `0.2` para código
- Tratar erros de quota (429) com retry exponencial

## Projetos que Usam Esta Metodologia
- [[projects/jarvis-voice-assistant]]
- [[projects/ai-mouse-assistant]]

---
*Criado: 2026-04-30 | API principal de IA nos projetos de Gabriel*
