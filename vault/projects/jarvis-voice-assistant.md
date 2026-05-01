# Projeto: JARVIS — Assistente de Voz com IA

#projeto #python #ia #gemini #voz #automação

## Resumo
Assistente de voz inteligente com nome "JARVIS", integrado ao Gemini API para responder perguntas complexas e executar automações no sistema operacional Windows.

## Stack Técnica
- **Linguagem**: Python
- **IA**: Google Gemini API (gemini-2.0-flash)
- **Reconhecimento de Voz**: SpeechRecognition + PyAudio
- **Síntese de Voz**: pyttsx3 / gTTS
- **Automação**: pyautogui, subprocess, webbrowser
- **GUI**: Tkinter (HUD minimalista)

## Funcionalidades Implementadas
- Reconhecimento de voz em português BR
- Protocolo "3-8-5" de segurança para navegação (evitar abrir múltiplas abas)
- Co-processador Gemini para perguntas abertas
- Integração com YouTube (abrir vídeos por voz)
- Login automatizado em portais (Sala do Futuro)
- Detecção de face para ativação (anti-spoofing)

## Decisões de Design
- Comando de wake word antes de ações críticas
- Fallback para Gemini quando comando não é reconhecido
- Protocolo de segurança para evitar spam de janelas do navegador

## Lições Aprendidas
- PyAudio pode ter problemas de instalação no Windows — usar `pipwin install pyaudio`
- Gemini API tem limite de contexto; manter conversas curtas
- Reconhecimento de voz em PT-BR: usar `language='pt-BR'` no SpeechRecognition

## Conexões
- [[methodologies/gemini-api-integration]]
- [[projects/ai-mouse-assistant]]

---
*Criado: 2026-04-30 | Projeto: Gabriel*
