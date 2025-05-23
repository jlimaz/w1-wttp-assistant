import { create } from 'zustand';

// Store para gerenciar o estado das solicitações de atendimento humano
const useRequestStore = create((set) => ({
  // Estado inicial
  requests: [],
  pendingRequests: [],
  isLoading: false,
  error: null,
  
  // Ações
  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/api/requests');
      if (!response.ok) {
        throw new Error('Falha ao buscar solicitações');
      }
      const data = await response.json();
      set({ requests: data, pendingRequests: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchAllRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/api/requests/all');
      if (!response.ok) {
        throw new Error('Falha ao buscar todas as solicitações');
      }
      const data = await response.json();
      set({ requests: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  resolveRequest: async (id, resolvedBy = 'operador') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:3000/api/requests/resolve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolvedBy }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao resolver solicitação');
      }
      
      // Atualiza o estado local após resolução bem-sucedida
      set((state) => ({
        requests: state.requests.map(req => 
          req.id === id ? { ...req, status: 'resolved', resolvedBy, resolvedAt: new Date() } : req
        ),
        pendingRequests: state.pendingRequests.filter(req => req.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  sendMessage: async (to, message) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));

export default useRequestStore;
