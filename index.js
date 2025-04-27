const express = require('express');
const { initWhatsAppBot } = require('./whatsapp');
const cron = require('node-cron');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Criar servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Variável para armazenar a instância do cliente WhatsApp
let whatsappClient = null;

// Rota para verificar status do servidor
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'WhatsApp Sender Bot está rodando',
    botStatus: whatsappClient ? 'conectado' : 'desconectado'
  });
});

// Rota para receber um comando para enviar mensagem (útil para testes ou para o n8n chamar)
app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefone e mensagem são obrigatórios' 
      });
    }
    
    if (!whatsappClient) {
      return res.status(503).json({ 
        success: false, 
        message: 'WhatsApp bot não está conectado' 
      });
    }
    
    // Formatar número se necessário
    const formattedPhone = formatPhoneNumber(phone);
    
    // Enviar mensagem
    await whatsappClient.sendText(`${formattedPhone}@c.us`, message);
    
    return res.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem', 
      error: error.message 
    });
  }
});

// Rota para receber lista de números para enviar mensagens em lote
app.post('/send-bulk', async (req, res) => {
  try {
    const { phones, message } = req.body;
    
    if (!phones || !Array.isArray(phones) || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lista de telefones (array) e mensagem são obrigatórios' 
      });
    }
    
    if (!whatsappClient) {
      return res.status(503).json({ 
        success: false, 
        message: 'WhatsApp bot não está conectado' 
      });
    }
    
    // Preparar resposta para status de cada envio
    const results = [];
    
    // Enviar mensagens em sequência
    for (const phone of phones) {
      try {
        const formattedPhone = formatPhoneNumber(phone);
        await whatsappClient.sendText(`${formattedPhone}@c.us`, message);
        results.push({ phone, status: 'success' });
      } catch (err) {
        results.push({ phone, status: 'error', error: err.message });
      }
      
      // Aguardar um pequeno intervalo entre envios para evitar bloqueio
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return res.json({ 
      success: true, 
      message: 'Processo de envio em lote concluído', 
      results 
    });
  } catch (error) {
    console.error('Erro no envio em lote:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no processamento do envio em lote', 
      error: error.message 
    });
  }
});

// Função para formatar número de telefone
function formatPhoneNumber(phone) {
  // Remover caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Garantir que tenha o código do país (Brasil)
  if (!cleaned.startsWith('55')) {
    cleaned = `55${cleaned}`;
  }
  
  return cleaned;
}

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Inicializar o bot do WhatsApp
  initWhatsAppBot()
    .then(client => {
      whatsappClient = client;
      console.log('WhatsApp bot iniciado com sucesso');
    })
    .catch(err => {
      console.error('Erro ao iniciar WhatsApp bot:', err);
    });
});

// Exportar app para testes ou módulos externos
module.exports = app;