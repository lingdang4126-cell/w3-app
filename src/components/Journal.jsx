import React, { useState, useEffect } from 'react';
import { Share2, Globe, Plus, X, Tag, FolderOpen, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import JournalArchive from './JournalArchive';
import SharedDiary from './SharedDiary';
import SharedPlaza from './SharedPlaza';
import MarkdownEditor from './MarkdownEditor';

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'study', name: '学习', emoji: '📚', color: 'blue' },
  { id: 'life', name: '生活', emoji: '🌈', color: 'green' },
  { id: 'essay', name: '随笔', emoji: '✍️', color: 'purple' },
  { id: 'tech', name: '技术', emoji: '💻', color: 'cyan' },
  { id: 'thought', name: '思考', emoji: '💭', color: 'amber' },
];

// 颜色映射
const COLOR_MAP = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-50' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', hover: 'hover:bg-green-50' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-50' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', hover: 'hover:bg-cyan-50' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', hover: 'hover:bg-amber-50' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', hover: 'hover:bg-red-50' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', hover: 'hover:bg-pink-50' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', hover: 'hover:bg-indigo-50' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', hover: 'hover:bg-teal-50' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', hover: 'hover:bg-orange-50' },
};

const AVAILABLE_COLORS = Object.keys(COLOR_MAP);

export default function Journal() {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('w3_journal');
    return saved ? JSON.parse(saved) : [];
  });

  // 自定义分类
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('w3_journal_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentArticle, setCurrentArticle] = useState({
    title: '',
    category: '学习',
    content: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sharingArticle, setSharingArticle] = useState(null);
  const [viewingSharedId, setViewingSharedId] = useState(null);
  
  // 分类筛选和管理
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📁');
  const [newCategoryColor, setNewCategoryColor] = useState('blue');

  useEffect(() => {
    localStorage.setItem('w3_journal', JSON.stringify(articles));
  }, [articles]);

  // 保存分类到 localStorage
  useEffect(() => {
    localStorage.setItem('w3_journal_categories', JSON.stringify(categories));
  }, [categories]);

  // 添加新分类
  const addCategory = () => {
    if (!newCategoryName.trim()) {
      alert('分类名称不能为空');
      return;
    }
    if (categories.find(c => c.name === newCategoryName.trim())) {
      alert('分类名称已存在');
      return;
    }
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      emoji: newCategoryEmoji,
      color: newCategoryColor,
    };
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryEmoji('📁');
    setNewCategoryColor('blue');
  };

  // 删除分类
  const deleteCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // 检查是否有文章使用该分类
    const articlesUsingCategory = articles.filter(a => a.category === category.name);
    if (articlesUsingCategory.length > 0) {
      if (!confirm(`该分类下有 ${articlesUsingCategory.length} 篇文章，删除后这些文章将变为"未分类"，确定删除吗？`)) {
        return;
      }
      // 将这些文章标记为未分类
      setArticles(prev => prev.map(a => 
        a.category === category.name ? { ...a, category: '未分类' } : a
      ));
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    if (selectedCategory === category.name) {
      setSelectedCategory('all');
    }
  };

  // 获取分类的样式
  const getCategoryStyle = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    if (category && COLOR_MAP[category.color]) {
      return COLOR_MAP[category.color];
    }
    return COLOR_MAP.blue;
  };

  // 获取分类的 emoji
  const getCategoryEmoji = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.emoji || '📁';
  };

  const createArticle = () => {
    setIsWriting(true);
    setEditingId(null);
    setCurrentArticle({ title: '', category: '学习', content: '' });
  };

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
        date: new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      };
      setArticles(prev => [newArticle, ...prev]);
    }

    setIsWriting(false);
    setEditingId(null);
    setViewMode('list');
  };

  const editArticle = (article) => {
    setIsWriting(true);
    setEditingId(article.id);
    setCurrentArticle(article);
  };

  const deleteArticle = (id) => {
    if (confirm('确定删除这篇文章吗？')) {
      setArticles(prev => prev.filter(article => article.id !== id));
    }
  };

  const cancelEdit = () => {
    setIsWriting(false);
    setEditingId(null);
  };

  const shareArticle = (article) => {
    setSharingArticle(article);
  };

  const viewSharedDiary = (sharedId) => {
    setViewingSharedId(sharedId);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 分类管理弹窗
  const CategoryManager = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={24} />
            管理分类
          </h3>
          <button
            onClick={() => setShowCategoryManager(false)}
            className="text-slate-500 hover:text-slate-700 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* 添加新分类 */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">添加新分类</h4>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-slate-600 mb-1">名称</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="分类名称"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs text-slate-600 mb-1">图标</label>
              <input
                type="text"
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
                placeholder="📁"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs text-slate-600 mb-1">颜色</label>
              <select
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <button
              onClick={addCategory}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <Plus size={18} />
              添加
            </button>
          </div>
        </div>

        {/* 分类列表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">现有分类</h4>
          {categories.map(category => {
            const style = COLOR_MAP[category.color] || COLOR_MAP.blue;
            const articleCount = articles.filter(a => a.category === category.name).length;
            return (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${style.border} ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <span className={`font-medium ${style.text}`}>{category.name}</span>
                  <span className="text-xs text-slate-500">({articleCount} 篇)</span>
                </div>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title="删除分类"
                >
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 左侧分类侧边栏
  const CategorySidebar = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FolderOpen size={20} />
          分类
        </h3>
        <button
          onClick={() => setShowCategoryManager(true)}
          className="text-slate-500 hover:text-blue-500 p-1 rounded transition-colors"
          title="管理分类"
        >
          <Settings size={18} />
        </button>
      </div>
      
      <div className="space-y-1">
        {/* 全部分类 */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>📋</span>
            <span>全部</span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedCategory === 'all' ? 'bg-white/20' : 'bg-slate-200'
          }`}>
            {articles.length}
          </span>
        </button>

        {/* 分类列表 */}
        {categories.map(category => {
          const count = articles.filter(a => a.category === category.name).length;
          const style = COLOR_MAP[category.color] || COLOR_MAP.blue;
          const isSelected = selectedCategory === category.name;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                isSelected
                  ? `${style.bg} ${style.text} font-medium`
                  : `hover:bg-slate-100 text-slate-700`
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isSelected ? 'bg-white/50' : 'bg-slate-200'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
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
            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                标题
              </label>
              <input
                type="text"
                value={currentArticle.title}
                onChange={(e) => setCurrentArticle(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入标题..."
                className="w-full text-2xl font-bold px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 分类选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                分类
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const style = COLOR_MAP[category.color] || COLOR_MAP.blue;
                  const isSelected = currentArticle.category === category.name;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCurrentArticle(prev => ({ ...prev, category: category.name }))}
                      className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                        isSelected
                          ? `${style.bg} ${style.text} ${style.border} ring-2 ring-offset-1 ring-${category.color}-400`
                          : `border-slate-300 text-slate-600 hover:border-slate-400`
                      }`}
                    >
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCategoryManager(true)}
                  className="px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>新分类</span>
                </button>
              </div>
            </div>

            {/* Markdown 编辑器 */}
            <MarkdownEditor
              value={currentArticle.content}
              onChange={(newContent) => setCurrentArticle(prev => ({ ...prev, content: newContent }))}
              showPreview={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // 列表/归档/广场模式
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            列表视图
          </button>
          <button
            onClick={() => setViewMode('archive')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'archive'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            归档视图
          </button>
          <button
            onClick={() => setViewMode('plaza')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'plaza'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Globe size={18} />
            共享广场
          </button>
          <span className="text-slate-600 text-sm ml-auto">
            {selectedCategory === 'all' 
              ? `共 ${articles.length} 篇文章` 
              : `${selectedCategory}: ${filteredArticles.length} / ${articles.length} 篇`}
          </span>
        </div>
      </div>

      {/* 分类管理弹窗 */}
      {showCategoryManager && <CategoryManager />}

      {viewMode === 'archive' && (
        <JournalArchive articles={articles} onSelectArticle={editArticle} />
      )}

      {viewMode === 'plaza' && (
        <SharedPlaza onViewDiary={viewSharedDiary} />
      )}

      {viewMode === 'list' && (
        <div className="flex gap-6">
          {/* 左侧分类侧边栏 */}
          <div className="w-56 flex-shrink-0">
            <CategorySidebar />
          </div>
          
          {/* 右侧文章列表 */}
          <div className="flex-1 space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
                <p className="text-slate-400 text-lg mb-4">
                  {selectedCategory === 'all' ? '📝 还没有文章' : `📂 "${selectedCategory}" 分类下暂无文章`}
                </p>
                <button
                  onClick={createArticle}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  写第一篇文章
                </button>
              </div>
            ) : (
              filteredArticles.map(article => {
                const categoryStyle = getCategoryStyle(article.category);
                return (
                  <div key={article.id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{article.title}</h3>
                        <div className="flex items-center gap-3 text-sm mb-3">
                          <span className={`px-2 py-1 rounded-lg ${categoryStyle.bg} ${categoryStyle.text} flex items-center gap-1`}>
                            <span>{getCategoryEmoji(article.category)}</span>
                            <span>{article.category}</span>
                          </span>
                          <span className="text-slate-500">{article.date}</span>
                        </div>
                        {/* Markdown 预览 */}
                        <div className="prose prose-sm max-w-none text-slate-600 line-clamp-3">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // 简化预览渲染
                              h1: ({children}) => <span className="font-bold">{children} </span>,
                              h2: ({children}) => <span className="font-bold">{children} </span>,
                              h3: ({children}) => <span className="font-semibold">{children} </span>,
                              p: ({children}) => <span>{children} </span>,
                              ul: ({children}) => <span>{children}</span>,
                              ol: ({children}) => <span>{children}</span>,
                              li: ({children}) => <span>• {children} </span>,
                              code: ({children}) => <code className="bg-slate-100 px-1 rounded">{children}</code>,
                              strong: ({children}) => <strong>{children}</strong>,
                              em: ({children}) => <em>{children}</em>,
                            }}
                          >
                            {article.content.substring(0, 200)}
                          </ReactMarkdown>
                          {article.content.length > 200 && <span className="text-slate-400">...</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => shareArticle(article)}
                          className="text-green-500 hover:bg-green-50 rounded-lg px-4 py-2 text-sm transition-colors flex items-center gap-1"
                          title="分享给朋友"
                        >
                          <Share2 size={16} />
                          分享
                        </button>
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
                );
              })
            )}
          </div>
        </div>
      )}

      {sharingArticle && (
        <SharedDiary
          article={sharingArticle}
          onClose={() => setSharingArticle(null)}
        />
      )}

      {viewingSharedId && (
        <SharedDiary
          sharedId={viewingSharedId}
          onClose={() => setViewingSharedId(null)}
        />
      )}
    </div>
  );
}