//日记归档组件
import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ChevronDown, ChevronRight } from 'lucide-react';

export default function JournalArchive({ articles, onSelectArticle }) {
  const [archiveByMonth, setArchiveByMonth] = useState({});
  const [archiveByCategory, setArchiveByCategory] = useState({});
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState('month'); // 'month' 或 'category'

  // 按月份归档
  useEffect(() => {
    const byMonth = {};
    articles.forEach(article => {
      const date = new Date(article.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = [];
      }
      byMonth[monthKey].push(article);
    });
    setArchiveByMonth(byMonth);
  }, [articles]);

  // 按分类归档
  useEffect(() => {
    const byCategory = {};
    articles.forEach(article => {
      if (!byCategory[article.category]) {
        byCategory[article.category] = [];
      }
      byCategory[article.category].push(article);
    });
    setArchiveByCategory(byCategory);
  }, [articles]);

  // 切换月份展开/折叠
  const toggleMonth = (month) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // 切换分类展开/折叠
  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 格式化月份显示
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">📚 文章归档</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            按月份
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'category'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Tag size={16} className="inline mr-2" />
            按分类
          </button>
        </div>
      </div>

      {/* 按月份归档视图 */}
      {viewMode === 'month' && (
        <div className="space-y-2">
          {Object.keys(archiveByMonth)
            .sort()
            .reverse()
            .map(month => (
              <div key={month} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedMonths.has(month) ? (
                      <ChevronDown size={20} className="text-slate-600" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-600" />
                    )}
                    <span className="font-medium text-slate-800">
                      {formatMonth(month)}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({archiveByMonth[month].length} 篇)
                    </span>
                  </div>
                </button>
                
                {expandedMonths.has(month) && (
                  <div className="p-2 bg-white">
                    {archiveByMonth[month].map(article => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle(article)}
                        className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span>{article.category}</span>
                              <span>·</span>
                              <span>{article.date}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* 按分类归档视图 */}
      {viewMode === 'category' && (
        <div className="space-y-2">
          {Object.keys(archiveByCategory)
            .sort()
            .map(category => (
              <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedCategories.has(category) ? (
                      <ChevronDown size={20} className="text-slate-600" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-600" />
                    )}
                    <span className="font-medium text-slate-800">
                      {category}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({archiveByCategory[category].length} 篇)
                    </span>
                  </div>
                </button>
                
                {expandedCategories.has(category) && (
                  <div className="p-2 bg-white">
                    {archiveByCategory[category].map(article => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle(article)}
                        className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 mb-1">
                              {article.title}
                            </h4>
                            <div className="text-sm text-slate-500">
                              {article.date}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* 空状态 */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">还没有文章可以归档</p>
        </div>
      )}
    </div>
  );
}