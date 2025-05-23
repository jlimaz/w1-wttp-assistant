import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import useRequestStore from '../store/requestStore';
import { cn } from '../lib/utils';

const RequestList = () => {
  const { requests, pendingRequests, isLoading, error, fetchRequests } = useRequestStore();
  const [filter, setFilter] = useState('pending'); // 'pending' ou 'all'
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  
  const displayRequests = filter === 'pending' ? pendingRequests : requests;
  
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
  
  const handleRequestClick = (id) => {
    navigate(`/request/${id}`);
  };
  
  if (isLoading && displayRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Carregando solicitações...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Erro ao carregar solicitações: {error}</p>
        <button 
          onClick={() => fetchRequests()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Solicitações de Atendimento Humano
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={cn(
                "px-3 py-1 text-sm rounded-md",
                filter === 'pending' 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1 text-sm rounded-md",
                filter === 'all' 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => fetchRequests()}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="Atualizar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {displayRequests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'pending' 
              ? 'Não há solicitações pendentes no momento.' 
              : 'Não há solicitações registradas.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {displayRequests.map((request) => (
            <li 
              key={request.id}
              onClick={() => handleRequestClick(request.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      request.status === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    )}>
                      {request.status === 'pending' ? (
                        <Clock size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-900">
                      Solicitação de {request.userName}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      request.status === 'pending' 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    )}>
                      {request.status === 'pending' ? 'Pendente' : 'Resolvido'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <MessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {request.message.length > 50 
                        ? `${request.message.substring(0, 50)}...` 
                        : request.message}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>
                      {formatDate(request.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestList;
