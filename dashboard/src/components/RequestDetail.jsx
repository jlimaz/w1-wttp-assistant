import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, MessageSquare, CheckCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import useRequestStore from '../store/requestStore';
import { cn } from '../lib/utils';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, isLoading, error, resolveRequest, sendMessage } = useRequestStore();
  const [request, setRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    // Encontra a solicitação pelo ID
    const foundRequest = requests.find(req => req.id === id);
    setRequest(foundRequest);
  }, [id, requests]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleResolve = async () => {
    await resolveRequest(id);
    // Atualiza o estado local após a resolução
    setRequest(prev => prev ? { ...prev, status: 'resolved', resolvedAt: new Date() } : null);
  };
  
  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    
    setIsSending(true);
    const success = await sendMessage(request.user, replyMessage);
    setIsSending(false);
    
    if (success) {
      setReplyMessage('');
      // Poderia adicionar a mensagem a um histórico local se necessário
    }
  };
  
  if (isLoading && !request) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Carregando detalhes da solicitação...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Erro ao carregar detalhes: {error}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </button>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>Solicitação não encontrada</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-md text-sm flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar para lista
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            Detalhes da Solicitação
          </h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              request.status === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            )}>
              {request.status === 'pending' ? (
                <Clock size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Solicitação #{request.id.substring(0, 8)}
              </h3>
              <p className="text-sm text-gray-500">
                De: {request.userName}
              </p>
            </div>
          </div>
          <div>
            <span className={cn(
              "px-3 py-1 text-sm font-medium rounded-full",
              request.status === 'pending' 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-green-100 text-green-800"
            )}>
              {request.status === 'pending' ? 'Pendente' : 'Resolvido'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-start mb-2">
            <User size={16} className="mt-1 mr-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              Recebido em {formatDate(request.timestamp)}
            </p>
          </div>
          <div className="flex items-start">
            <MessageSquare size={16} className="mt-1 mr-2 text-gray-400" />
            <p className="text-sm text-gray-700">
              {request.message}
            </p>
          </div>
        </div>
        
        {request.status === 'resolved' && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <CheckCircle size={16} className="mt-1 mr-2 text-green-500" />
              <div>
                <p className="text-sm text-gray-700">
                  Resolvido por {request.resolvedBy} em {formatDate(request.resolvedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Responder ao usuário
          </h4>
          <div className="flex">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Digite uma mensagem para o usuário..."
              className="flex-1 py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={request.status === 'resolved' || isSending}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyMessage.trim() || request.status === 'resolved' || isSending}
              className={cn(
                "px-4 py-2 rounded-r-md flex items-center",
                (!replyMessage.trim() || request.status === 'resolved' || isSending)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              {isSending ? (
                <Loader2 className="animate-spin mr-1" size={16} />
              ) : (
                <Send size={16} className="mr-1" />
              )}
              Enviar
            </button>
          </div>
        </div>
        
        {request.status === 'pending' && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              <CheckCircle size={16} className="mr-1" />
              Marcar como Resolvido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
