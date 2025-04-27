const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Diretório onde serão salvas as sessões do WhatsApp
const SESSION_DIR = path.resolve(__dirname, './whatsapp_session');

// Garantir que o diretório de sessão existe
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// Inicializar o bot do WhatsApp
async function initWhatsAppBot() {
  try {
    // Iniciar o cliente do WhatsApp
    const client = await venom.create(
      'whatsapp-sender', // Nome da sessão
      (base64Qrimg, asciiQR, attempts, urlCode) => {
        // Callback de QR Code
        console.log('QR Code gerado! Escaneie para autenticar.');
        console.log(asciiQR); // QR Code em ASCII no console
        
        // Você também pode salvar a imagem do QR Code ou enviá-la para algum endpoint
        const qrcodePath = path.resolve(SESSION_DIR, 'last-qrcode.png');
        const matches = base64Qrimg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const data = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(qrcodePath, data);
          console.log(`QR Code salvo em: ${qrcodePath}`);
        }
      },
      (statusSession, session) => {
        // Callback de status da sessão
        console.log(`Status da sessão: ${statusSession}`);
        console.log(`Nome da sessão: ${session}`);
      },
      {
        folderNameToken: SESSION_DIR, // Local para armazenar tokens
        mkdirFolderToken: true, // Criar pasta se não existir
        headless: 'new', // Modo headless avançado
        devtools: false, // Não abrir devtools
        useChrome: true, // Usar Chrome em vez de Chromium
        debug: false, // Modo debug
        logQR: false, // Não registrar QR Code em logs
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ], // Argumentos do navegador para ambientes como o Render
        disableWelcome: true, // Desabilitar mensagem de boas-vindas
        autoClose: 60000, // Fechar após 60 segundos de inatividade
        createPathFileToken: true, // Criar arquivo de token
      }
    );

    // Configurar eventos do cliente
    client.onStateChange((state) => {
      console.log(`Estado do cliente mudou para: ${state}`);
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        client.useHere();
      }
    });

    client.onMessage((message) => {
      console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
      // Você pode adicionar lógica para responder mensagens aqui
    });

    console.log('WhatsApp bot iniciado e pronto para uso!');
    return client;
  } catch (error) {
    console.error('Erro ao iniciar o bot do WhatsApp:', error);
    throw error;
  }
}

module.exports = { initWhatsAppBot };