import React, { useState } from 'react';

export default function Export() {
  const [exportStatus, setExportStatus] = useState('');

  // 导出 JSON
  const exportJSON = () => {
    try {
      const warroom = localStorage.getItem('w3_warroom');
      const journal = localStorage.getItem('w3_journal');
      
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        warroom: warroom ? JSON.parse(warroom) : null,
        journal: journal ? JSON.parse(journal) : []
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `w3_backup_${Date.now()}.json`;
      a.click();
      
      setExportStatus('✅ JSON 导出成功！');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('❌ 导出失败：' + error.message);
    }
  };

  // 导出 Markdown
  const exportMarkdown = () => {
    try {
      const warroom = localStorage.getItem('w3_warroom');
      const journal = localStorage.getItem('w3_journal');
      
      let md = '# W³ 数据导出\n\n';
      md += `导出时间：${new Date().toLocaleString('zh-CN')}\n\n`;
      
      if (warroom) {
        const data = JSON.parse(warroom);
        md += `## 📅 周战室 - ${data.title}\n\n`;
        md += `### 本周目标\n\n`;
        data.goals.forEach(goal => {
          md += `- ${goal}\n`;
        });
        md += `\n### 任务列表\n\n`;
        data.tasks.forEach(task => {
          md += `- [${task.done ? 'x' : ' '}] ${task.title} (专注度: ${task.effort}/10)\n`;
        });
        md += '\n';
      }

      if (journal) {
        const articles = JSON.parse(journal);
        md += `## 📓 日记文章 (共 ${articles.length} 篇)\n\n`;
        articles.forEach(article => {
          md += `### ${article.title}\n\n`;
          md += `**分类**: ${article.category} | **日期**: ${article.date}\n\n`;
          md += `${article.content}\n\n---\n\n`;
        });
      }

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `w3_export_${Date.now()}.md`;
      a.click();
      
      setExportStatus('✅ Markdown 导出成功！');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('❌ 导出失败：' + error.message);
    }
  };

  // 导入 JSON
  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.warroom) {
          localStorage.setItem('w3_warroom', JSON.stringify(data.warroom));
        }
        if (data.journal) {
          localStorage.setItem('w3_journal', JSON.stringify(data.journal));
        }
        
        setExportStatus('✅ 导入成功！请刷新页面查看');
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setExportStatus('❌ 导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  // 清空数据
  const clearAllData = () => {
    if (confirm('⚠️ 确定要清空所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('w3_warroom');
      localStorage.removeItem('w3_journal');
      setExportStatus('✅ 数据已清空！');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // 计算数据大小
  const calculateDataSize = () => {
    const warroom = localStorage.getItem('w3_warroom') || '';
    const journal = localStorage.getItem('w3_journal') || '';
    const totalBytes = new Blob([warroom, journal]).size;
    return (totalBytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="space-y-6">
      {/* 状态提示 */}
      {exportStatus && (
        <div className={`bg-white rounded-2xl shadow-lg p-4 border-l-4 ${
          exportStatus.includes('✅') ? 'border-green-500' : 'border-red-500'
        }`}>
          <p className="text-slate-800 font-medium">{exportStatus}</p>
        </div>
      )}

      {/* 数据统计 */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">📊 数据统计</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-white/80 text-sm">数据大小</p>
            <p className="text-2xl font-bold">{calculateDataSize()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-white/80 text-sm">存储位置</p>
            <p className="text-lg font-bold">浏览器本地</p>
          </div>
        </div>
      </div>

      {/* 导出选项 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">📤 导出数据</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExportCard
            icon="📄"
            title="导出 JSON"
            description="完整备份，可重新导入"
            onClick={exportJSON}
            buttonText="下载 JSON"
            buttonColor="blue"
          />
          <ExportCard
            icon="📝"
            title="导出 Markdown"
            description="纯文本格式，易于阅读"
            onClick={exportMarkdown}
            buttonText="下载 MD"
            buttonColor="green"
          />
        </div>
      </div>

      {/* 导入数据 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">📥 导入数据</h3>
        <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
          <label className="flex flex-col items-center cursor-pointer">
            <span className="text-4xl mb-2">📁</span>
            <span className="text-slate-600 mb-2">点击选择 JSON 文件导入</span>
            <input
              type="file"
              accept=".json"
              onChange={importJSON}
              className="hidden"
            />
            <span className="text-sm text-slate-400">支持 W³ 导出的 JSON 文件</span>
          </label>
        </div>
      </div>

      {/* 危险操作 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ 危险操作</h3>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-slate-700 mb-4">清空所有数据将删除战室和日记的所有内容，且无法恢复。</p>
          <button
            onClick={clearAllData}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            清空所有数据
          </button>
        </div>
      </div>
    </div>
  );
}

// 导出卡片组件
function ExportCard({ icon, title, description, onClick, buttonText, buttonColor }) {
  const colors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600'
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        className={`w-full ${colors[buttonColor]} text-white py-2 rounded-lg transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  );
}