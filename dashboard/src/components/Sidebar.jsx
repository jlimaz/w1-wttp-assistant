import React from 'react';
import { Menu, MessageSquare, Users, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
  return (
    <div className="bg-gray-900 text-white w-16 md:w-64 flex flex-col h-full">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <span className="hidden md:block text-xl font-bold">W1 Dashboard</span>
        <Menu className="md:hidden" size={24} />
      </div>
      
      <nav className="flex-1 mt-6">
        <SidebarItem icon={<MessageSquare size={20} />} text="Solicitações" active />
        <SidebarItem icon={<Users size={20} />} text="Operadores" />
        <SidebarItem icon={<Settings size={20} />} text="Configurações" />
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">OP</span>
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium">Operador</p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active }) => {
  return (
    <div 
      className={cn(
        "flex items-center px-4 py-3 cursor-pointer transition-colors",
        active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
      )}
    >
      {icon}
      <span className="ml-3 hidden md:block">{text}</span>
      {active && <div className="w-1 h-8 bg-blue-500 absolute right-0 rounded-l-md"></div>}
    </div>
  );
};

export default Sidebar;
