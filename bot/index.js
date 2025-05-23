require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const requestStore = require('./requestStore');

const app = express();
const port = 3000;

// Middleware para JSON e CORS
app.use(express.json());
app.use(cors());

// Inicializa cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Exibe QR Code no terminal
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Confirmação de conexão
client.on('ready', () => {
    console.log('✅ Cliente WhatsApp conectado!');
});

// Lógica de resposta de mensagens
client.on('message', async message => {
    const userMessage = message.body.trim().toLowerCase();

    console.log(`📩 Mensagem recebida: ${userMessage}`);

    if (userMessage.includes('humano')) {
        message.reply('🔁 Sua solicitação foi enviada para um de nossos operadores. Por favor, aguarde.');
        
        // Registra a solicitação no armazenamento
        requestStore.addRequest({
            user: message.from,
            timestamp: new Date(),
            message: message.body
        });
        
        return;
    }

    try {
        const aiResponse = await sendMessageToAI(userMessage);
        await message.reply(aiResponse);
    } catch (err) {
        console.error('❌ Erro ao obter resposta da IA:', err);
        await message.reply('⚠️ Ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.');
    }
});

// Função para enviar mensagem à IA via OpenRouter
async function sendMessageToAI(userMessage) {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: process.env.OPENROUTER_MODEL,
        messages: [
            { role: "system", content: "Você é um assistente virtual especializado da W1 Consultoria. Sua função é responder exclusivamente sobre temas relacionados à W1 Consultoria, com foco especial nos benefícios da criação de uma holding e como a W1 pode ajudar nesse processo. Fale sempre como uma especialista da área, utilizando uma linguagem clara, técnica e profissional. Se a pergunta do usuário estiver fora do escopo de atuação da W1 ou não estiver relacionada à criação de holdings, benefícios fiscais, sucessão patrimonial, estrutura societária ou serviços oferecidos pela W1, você deve informar que esse assunto está fora do seu domínio e sugerir que o usuário entre em contato com um consultor humano da W1 para mais informações.  Sempre incentive o contato com um especialista humano da W1 para casos específicos ou aprofundados." },
            { role: "user", content: userMessage }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const aiMessage = response.data.choices[0].message.content.trim();
    console.log('🤖 Resposta da IA:', aiMessage);
    return aiMessage;
}

// API Endpoints para gerenciamento de solicitações de atendimento humano

// Listar todas as solicitações pendentes
app.get('/api/requests', (req, res) => {
    const pendingRequests = requestStore.getPendingRequests();
    res.json(pendingRequests);
});

// Listar todas as solicitações (pendentes e resolvidas)
app.get('/api/requests/all', (req, res) => {
    const allRequests = requestStore.getAllRequests();
    res.json(allRequests);
});

// Obter detalhes de uma solicitação específica
app.get('/api/requests/:id', (req, res) => {
    const request = requestStore.getRequestById(req.params.id);
    
    if (!request) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    
    res.json(request);
});

// Marcar solicitação como resolvida
app.post('/api/requests/resolve/:id', (req, res) => {
    const { resolvedBy } = req.body;
    const success = requestStore.resolveRequest(req.params.id, resolvedBy);
    
    if (!success) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    
    res.json({ success: true, message: 'Solicitação marcada como resolvida' });
});

// Rota para enviar mensagem de resposta ao usuário (opcional)
app.post('/api/send-message', async (req, res) => {
    const { to, message } = req.body;
    
    if (!to || !message) {
        return res.status(400).json({ error: 'Destinatário e mensagem são obrigatórios' });
    }
    
    try {
        await client.sendMessage(to, message);
        res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// Rota raiz para verificação de status
app.get('/', (req, res) => {
    res.send('🤖 Bot WhatsApp + IA rodando com sistema de escalação para atendimento humano!');
});

// Inicia servidor Express
app.listen(port, () => {
    console.log(`🚀 Servidor rodando: http://localhost:${port}`);
});

// Inicializa cliente WhatsApp
client.initialize();
