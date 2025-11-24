import React, { useState } from 'react';
import { Home, Target, BookOpen, Download } from 'lucide-react';

// 导入组件
import Dashboard from './components/Dashboard';
import WarRoom from './components/WarRoom';
import Journal from './components/Journal';
import Export from './components/Export';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const pages = {
    dashboard: <Dashboard onNavigate={setCurrentPage} />,
    warroom: <WarRoom />,
    journal: <Journal />,
    export: <Export />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              W³ System
            </h1>
            <div className="flex gap-2">
              <NavButton 
                icon={<Home size={18} />} 
                label="首页" 
                active={currentPage === 'dashboard'}
                onClick={() => setCurrentPage('dashboard')}
              />
              <NavButton 
                icon={<Target size={18} />} 
                label="战室" 
                active={currentPage === 'warroom'}
                onClick={() => setCurrentPage('warroom')}
              />
              <NavButton 
                icon={<BookOpen size={18} />} 
                label="日记" 
                active={currentPage === 'journal'}
                onClick={() => setCurrentPage('journal')}
              />
              <NavButton 
                icon={<Download size={18} />} 
                label="导出" 
                active={currentPage === 'export'}
                onClick={() => setCurrentPage('export')}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pages[currentPage]}
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}