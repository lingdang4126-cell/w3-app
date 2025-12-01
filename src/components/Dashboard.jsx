import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import AdminPanel from './AdminPanel';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    weekProgress: 0,
    completedTasks: 0,
    totalTasks: 0,
    articleCount: 0
  });

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const warroomData = localStorage.getItem('w3_warroom');
    if (warroomData) {
      const data = JSON.parse(warroomData);
      const completed = data.tasks.filter(t => t.done).length;
      const total = data.tasks.length;
      setStats(prev => ({
        ...prev,
        weekProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedTasks: completed,
        totalTasks: total
      }));
    }

    const journalData = localStorage.getItem('w3_journal');
    if (journalData) {
      const articles = JSON.parse(journalData);
      setStats(prev => ({
        ...prev,
        articleCount: articles.length
      }));
    }
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  const currentWeek = Math.ceil((new Date().getDate()) / 7);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">欢迎回来 👋</h2>
            <p className="text-slate-600">{today}</p>
            <p className="text-slate-500 text-sm mt-1">当前是第 {currentWeek} 周</p>
          </div>
          
          {/* 管理员按钮 */}
          <button
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 rounded-lg transition-all border border-amber-200"
            title="管理员设置"
          >
            <Shield size={18} />
            <span className="text-sm font-medium">管理员</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickCard 
          title="本周进度" 
          value={`${stats.weekProgress}%`}
          color="blue"
          onClick={() => onNavigate('warroom')}
        />
        <QuickCard 
          title="完成任务" 
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          color="green"
          onClick={() => onNavigate('warroom')}
        />
        <QuickCard 
          title="日记篇数" 
          value={`${stats.articleCount} 篇`}
          color="purple"
          onClick={() => onNavigate('journal')}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">快速操作</h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionButton label="📝 写日记" onClick={() => onNavigate('journal')} />
          <ActionButton label="🎯 本周任务" onClick={() => onNavigate('warroom')} />
          <ActionButton label="📊 导出周报" onClick={() => onNavigate('export')} />
          <ActionButton 
            label="💾 备份数据" 
            onClick={() => onNavigate('export')} 
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">💡 使用提示</h3>
        <ul className="space-y-2 text-slate-700 text-sm">
          <li>• 所有数据自动保存在浏览器本地，刷新不会丢失</li>
          <li>• 定期在"导出中心"备份数据到 JSON 文件</li>
          <li>• 支持导入他人分享的 JSON 模板</li>
          <li>• 点击右上角"管理员"设置管理权限</li>
        </ul>
      </div>

      {/* 管理员面板 */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}

function QuickCard({ title, value, color, onClick }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-400',
    green: 'from-green-500 to-emerald-400',
    purple: 'from-purple-500 to-pink-400'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-6 border border-slate-200 cursor-pointer hover:shadow-xl transition-all"
    >
      <p className="text-slate-600 text-sm mb-2">{title}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-50 hover:to-cyan-50 text-slate-700 rounded-lg py-3 px-4 font-medium transition-all hover:shadow-md"
    >
      {label}
    </button>
  );
}