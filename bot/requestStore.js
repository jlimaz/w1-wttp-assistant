/**
 * Módulo para gerenciamento de solicitações de atendimento humano
 * Implementa armazenamento em memória para MVP
 */

// Armazenamento em memória para solicitações de atendimento humano
const humanRequests = [];

/**
 * Adiciona uma nova solicitação de atendimento humano
 * @param {Object} request - Objeto contendo dados da solicitação
 * @param {string} request.user - Número de telefone do usuário (formato: 5511999999999@c.us)
 * @param {Date} request.timestamp - Data e hora da solicitação
 * @param {string} request.message - Mensagem enviada pelo usuário
 * @returns {string} ID da solicitação criada
 */
function addRequest(request) {
    const id = Date.now().toString(); // Usando timestamp como ID único
    const newRequest = {
        id,
        user: request.user,
        userName: extractUserName(request.user),
        timestamp: request.timestamp,
        message: request.message,
        status: 'pending', // pending, resolved
        resolvedAt: null,
        resolvedBy: null
    };
    
    humanRequests.push(newRequest);
    console.log(`📝 Nova solicitação de atendimento humano registrada: ${id}`);
    return id;
}

/**
 * Extrai o nome de usuário/número de telefone do formato WhatsApp
 * @param {string} user - ID do usuário no formato WhatsApp (5511999999999@c.us)
 * @returns {string} Número formatado para exibição
 */
function extractUserName(user) {
    // Remove o sufixo @c.us e formata o número
    const phoneNumber = user.split('@')[0];
    return phoneNumber;
}

/**
 * Obtém todas as solicitações pendentes
 * @returns {Array} Lista de solicitações pendentes
 */
function getPendingRequests() {
    return humanRequests.filter(req => req.status === 'pending');
}

/**
 * Obtém todas as solicitações (pendentes e resolvidas)
 * @returns {Array} Lista de todas as solicitações
 */
function getAllRequests() {
    return [...humanRequests];
}

/**
 * Marca uma solicitação como resolvida
 * @param {string} id - ID da solicitação
 * @param {string} resolvedBy - Identificação de quem resolveu (opcional)
 * @returns {boolean} true se a solicitação foi encontrada e atualizada, false caso contrário
 */
function resolveRequest(id, resolvedBy = 'operator') {
    const requestIndex = humanRequests.findIndex(req => req.id === id);
    
    if (requestIndex === -1) {
        return false;
    }
    
    humanRequests[requestIndex].status = 'resolved';
    humanRequests[requestIndex].resolvedAt = new Date();
    humanRequests[requestIndex].resolvedBy = resolvedBy;
    
    console.log(`✅ Solicitação ${id} marcada como resolvida por ${resolvedBy}`);
    return true;
}

/**
 * Obtém uma solicitação específica pelo ID
 * @param {string} id - ID da solicitação
 * @returns {Object|null} Objeto da solicitação ou null se não encontrada
 */
function getRequestById(id) {
    return humanRequests.find(req => req.id === id) || null;
}

module.exports = {
    addRequest,
    getPendingRequests,
    getAllRequests,
    resolveRequest,
    getRequestById
};
