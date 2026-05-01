# Universal Memory Sync (Arquitetura Antigravity)

Esta nota descreve como o **Second Brain** foi transformado em uma ferramenta universal que sincroniza conhecimentos entre diferentes projetos através da IA.

## 🏗️ Arquitetura
A conexão entre a IA (Antigravity) e o usuário (Gabriel) agora opera em uma estrutura de três camadas:

1.  **Local (IDE):** Onde o código é escrito e as memórias são geradas via Antigravity.
2.  **Sincronização (Git/OneDrive):** Garante que os arquivos `.md` sejam persistidos e versionados.
3.  **Acesso Universal (Vercel):** Interface web para consulta das notas em qualquer dispositivo.

## 🔄 Fluxo de Memória
Sempre que um novo projeto é iniciado ou uma feature importante é concluída, a IA realiza o seguinte processo:
1.  **Destilação:** Identifica os padrões técnicos e decisões de design.
2.  **Registro:** Grava uma nota no `vault/projects/` ou `vault/methodologies/`.
3.  **Conexão:** Atualiza o `index.md` e o grafo de conhecimento.

## 💡 Como Usar
*   Para registrar uma memória: Basta dizer à IA *"Gere uma memória sobre isso"*.
*   Para consultar: Acesse o site do Second Brain ou peça à IA *"O que aprendemos no projeto X?"*.

---
**Links:** [[index]] | [[sentinela-drowsiness-detection]]
**Tags:** #architecture #productivity #ai-workflow
