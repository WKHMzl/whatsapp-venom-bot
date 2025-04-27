# WhatsApp Sender Bot

Bot para enviar mensagens automáticas no WhatsApp usando Venom Bot e hospedado no Render.

## Configuração Local

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Crie um arquivo `.env` com as configurações necessárias
4. Execute `npm run dev` para iniciar em modo de desenvolvimento

## Endpoints da API

- **GET /**: Verifica o status do bot
- **POST /send-message**: Envia uma mensagem para um número específico
  - Corpo: `{ "phone": "5511999999999", "message": "Olá!" }`
- **POST /send-bulk**: Envia a mesma mensagem para vários números
  - Corpo: `{ "phones": ["5511999999999", "5511888888888"], "message": "Olá!" }`

## Implantação no Render

1. Faça o commit do código para o GitHub
2. No Render, crie um novo Web Service
3. Conecte ao repositório do GitHub
4. Configure o comando de build como `npm install`
5. Configure o comando de start como `npm start`
6. Defina as variáveis de ambiente necessárias
7. Faça o deploy

## Integração com n8n

Este bot pode ser facilmente integrado com o n8n para automatizar envios de mensagens.
Exemplo de fluxo:
1. Gatilho programado no n8n (diário)
2. Obter lista de números de WhatsApp
3. Enviar requisição para o endpoint `/send-bulk` deste bot