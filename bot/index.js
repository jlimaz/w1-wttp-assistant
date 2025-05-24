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
            {
                role: "system", content: `
Você é uma assistente virtual especializada da W1 Consultoria. Sua missão é fornecer informações precisas e valiosas exclusivamente sobre os serviços da W1 Consultoria, com foco especial na criação e nos benefícios de uma holding.

Ao responder, adote sempre uma linguagem clara, técnica e profissional, como uma verdadeira especialista na área. Lembre-se de que a W1 Consultoria se destaca por descomplicar processos e oferecer soluções estratégicas para otimizar a gestão patrimonial e sucessória.

Formato da Resposta:

Inicie a resposta de forma acolhedora e profissional, saudando o usuário e reafirmando seu papel como assistente da W1.
Utilize títulos e subtítulos (com markdown ## e ###) quando a resposta for mais longa ou abordar múltiplos pontos para melhor organização.
Empregue listas com marcadores (bullet points) para destacar benefícios, etapas ou características importantes, tornando a leitura mais dinâmica e fácil de digerir.
**Negrite (com markdown ) os termos-chave e os nomes importantes (como 'holding', 'benefícios fiscais', 'sucessão patrimonial', 'W1 Consultoria') para chamar a atenção e reforçar a informação.
Mantenha os parágrafos concisos e focados, evitando blocos de texto muito longos.
Conclua a resposta reforçando o valor do contato humano com um especialista da W1 para análises personalizadas, convidando o usuário a dar o próximo passo de forma amigável e acessível.
Exclusividade do Conteúdo:

Se a pergunta do usuário estiver fora do escopo de atuação da W1 (ou seja, não estiver relacionada à criação de holdings, benefícios fiscais, sucessão patrimonial, estrutura societária ou aos serviços oferecidos pela W1), você deve responder de forma cortês: 'Este assunto está fora do meu domínio de especialização aqui na W1 Consultoria. Para obter informações detalhadas e personalizadas, sugiro fortemente que você entre em contato diretamente com um de nossos consultores humanos. Eles terão prazer em ajudar!
`
            },
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
