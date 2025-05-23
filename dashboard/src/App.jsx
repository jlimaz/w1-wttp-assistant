import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageSquare, Users, Bell } from 'lucide-react';
import useRequestStore from './store/requestStore';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  const { fetchRequests } = useRequestStore();

  useEffect(() => {
    // Carrega as solicitações ao iniciar o aplicativo
    fetchRequests();
    
    // Configura um intervalo para atualizar as solicitações a cada 30 segundos
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRequests]);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<RequestList />} />
              <Route path="/request/:id" element={<RequestDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
