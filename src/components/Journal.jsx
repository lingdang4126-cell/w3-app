import React, { useState, useEffect } from 'react';

export default function Journal() {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('w3_journal');
    return saved ? JSON.parse(saved) : [];
  });

  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentArticle, setCurrentArticle] = useState({
    title: '',
    category: '学习',
    content: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // 保存到本地
  useEffect(() => {
    localStorage.setItem('w3_journal', JSON.stringify(articles));
  }, [articles]);

  // 创建新文章
  const createArticle = () => {
    setIsWriting(true);
    setEditingId(null);
    setCurrentArticle({ title: '', category: '学习', content: '' });
  };

  // 保存文章
  const saveArticle = () => {
    if (!currentArticle.title.trim() || !currentArticle.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    if (editingId) {
      setArticles(prev => prev.map(article => 
        article.id === editingId 
          ? { ...currentArticle, id: editingId, date: article.date }
          : article
      ));
    } else {
      const newArticle = {
        ...currentArticle,
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN')
      };
      setArticles(prev => [newArticle, ...prev]);
    }

    setIsWriting(false);
    setEditingId(null);
  };

  // 编辑文章
  const editArticle = (article) => {
    setIsWriting(true);
    setEditingId(article.id);
    setCurrentArticle(article);
  };

  // 删除文章
  const deleteArticle = (id) => {
    if (confirm('确定删除这篇文章吗？')) {
      setArticles(prev => prev.filter(article => article.id !== id));
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsWriting(false);
    setEditingId(null);
  };

  // 过滤文章
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 写作模式
  if (isWriting) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingId ? '✏️ 编辑文章' : '✨ 写新文章'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={saveArticle}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={cancelEdit}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={currentArticle.title}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入标题..."
              className="w-full text-2xl font-bold px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={currentArticle.category}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="学习">📚 学习</option>
              <option value="生活">🌈 生活</option>
              <option value="随笔">✍️ 随笔</option>
              <option value="技术">💻 技术</option>
              <option value="思考">💭 思考</option>
            </select>

            <textarea
              value={currentArticle.content}
              onChange={(e) => setCurrentArticle(prev => ({ ...prev, content: e.target.value }))}
              placeholder="开始写作...支持 Markdown 格式"
              className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        {/* 预览 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📄 预览</h3>
          <div className="prose max-w-none">
            <h1 className="text-2xl font-bold mb-2">{currentArticle.title || '未命名'}</h1>
            <p className="text-slate-600 text-sm mb-4">
              {currentArticle.category} · {new Date().toLocaleDateString('zh-CN')}
            </p>
            <div className="whitespace-pre-wrap text-slate-700">
              {currentArticle.content || '内容为空'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 列表模式
  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 搜索文章标题..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={createArticle}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>写文章</span>
          </button>
        </div>
        <div className="mt-4 text-slate-600 text-sm">
          共 {articles.length} 篇文章
        </div>
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
            <p className="text-slate-400 text-lg mb-4">📝 还没有文章</p>
            <button
              onClick={createArticle}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              写第一篇文章
            </button>
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{article.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>{article.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">
                    {article.content.substring(0, 150)}...
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editArticle(article)}
                    className="text-blue-500 hover:bg-blue-50 rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-500 hover:bg-red-50 rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}