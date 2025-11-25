import React, { useState, useEffect } from 'react';
import { Globe, Users, MessageCircle, RefreshCw, Eye, Filter } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { database } from '../utils/firebase';

export default function SharedPlaza({ onViewDiary }) {
  const [sharedDiaries, setSharedDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState(null);

  // 加载所有共享日记
  const loadSharedDiaries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('开始加载共享日记...');
      const diariesRef = ref(database, 'shared_diaries');
      const snapshot = await get(diariesRef);
      
      console.log('获取快照完成，数据存在:', snapshot.exists());
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('原始数据:', data);
        
        const diariesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        
        console.log('处理后的日记列表:', diariesList);
        
        // 按分享时间排序（最新的在前）
        diariesList.sort((a, b) => {
          const timeA = new Date(a.article?.sharedAt || 0).getTime();
          const timeB = new Date(b.article?.sharedAt || 0).getTime();
          return timeB - timeA;
        });
        
        setSharedDiaries(diariesList);
      } else {
        console.log('没有共享日记数据');
        setSharedDiaries([]);
      }
    } catch (error) {
      console.error('加载失败详细信息:', error);
      setError(error.message);
      setSharedDiaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    console.log('组件已挂载，开始加载共享日记');
    loadSharedDiaries();
  }, []);

  // 过滤日记
  const filteredDiaries = filterCategory === 'all'
    ? sharedDiaries
    : sharedDiaries.filter(diary => diary.article.category === filterCategory);

  // 格式化时间
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe size={28} />
              共享广场
            </h2>
            <p className="text-white/90 text-sm mt-1">
              发现大家分享的精彩日记
            </p>
          </div>
          <button
            onClick={loadSharedDiaries}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>

        {/* 分类筛选 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} />
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterCategory('学习')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === '学习'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            📚 学习
          </button>
          <button
            onClick={() => setFilterCategory('生活')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === '生活'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            🌈 生活
          </button>
          <button
            onClick={() => setFilterCategory('技术')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === '技术'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            💻 技术
          </button>
          <button
            onClick={() => setFilterCategory('随笔')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === '随笔'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            ✍️ 随笔
          </button>
          <button
            onClick={() => setFilterCategory('思考')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === '思考'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            💭 思考
          </button>
        </div>
      </div>

      {/* 日记列表 */}
      {error && (
        <div className="bg-red-50 rounded-2xl shadow-lg p-6 border border-red-200">
          <p className="text-red-700 font-medium">❌ 加载失败：{error}</p>
          <p className="text-red-600 text-sm mt-2">请打开浏览器开发者工具（F12）查看详细错误信息</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
          <RefreshCw size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600">加载中...</p>
        </div>
      ) : filteredDiaries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
          <Globe size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400 text-lg mb-2">还没有共享日记</p>
          <p className="text-slate-500 text-sm">成为第一个分享的人吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDiaries.map(diary => {
            // 安全获取数据，防止 undefined
            const article = diary.article || {};
            const title = article.title || '(无标题)';
            const category = article.category || '未分类';
            const author = article.author || '匿名';
            const sharedAt = article.sharedAt || new Date().toISOString();
            const content = article.content || '';
            const commentCount = diary.comments ? Object.keys(diary.comments).length : 0;
            
            return (
              <div
                key={diary.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => onViewDiary(diary.id)}
              >
                {/* 文章信息 */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                    <span>{category}</span>
                    <span>·</span>
                    <span>by {author}</span>
                    <span>·</span>
                    <span>{formatTime(sharedAt)}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 text-sm">
                    {content.length > 0 ? content.substring(0, 100) + '...' : '(无内容)'}
                  </p>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{commentCount} 评论</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    <Eye size={16} />
                    查看详情
                  </button>
                </div>

                {/* 共享模式标签 */}
                {article.shareMode === 'public' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                      <Globe size={12} />
                      所有人可见
                    </span>
                  </div>
                )}
                {article.shareMode === 'friends' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      <Users size={12} />
                      朋友可见
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 统计信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 共有 <strong>{sharedDiaries.length}</strong> 篇共享日记
          {filterCategory !== 'all' && ` · 当前显示 <strong>${filteredDiaries.length}</strong> 篇`}
        </p>
      </div>
    </div>
  );
}