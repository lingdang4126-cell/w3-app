import React, { useState, useEffect } from 'react';
import { Globe, MessageCircle, RefreshCw, Eye, Filter, Trash2, Shield, Megaphone } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { database } from '../utils/firebase';
import { canDelete, isAdmin, getCurrentUser } from '../utils/user';
import Announcement from './Announcement';

// 默认分类（与 Journal 组件保持一致）
const DEFAULT_CATEGORIES = [
  { id: 'study', name: '学习', emoji: '📚', color: 'blue' },
  { id: 'life', name: '生活', emoji: '🌈', color: 'green' },
  { id: 'essay', name: '随笔', emoji: '✍️', color: 'purple' },
  { id: 'tech', name: '技术', emoji: '💻', color: 'cyan' },
  { id: 'thought', name: '思考', emoji: '💭', color: 'amber' },
];

export default function SharedPlaza({ onViewDiary }) {
  const [sharedDiaries, setSharedDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // 从 localStorage 读取分类
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('w3_journal_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const loadSharedDiaries = async () => {
    setIsLoading(true);
    try {
      const diariesRef = ref(database, 'shared_diaries');
      const snapshot = await get(diariesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const diariesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        
        diariesList.sort((a, b) => {
          const timeA = new Date(a.article.sharedAt).getTime();
          const timeB = new Date(b.article.sharedAt).getTime();
          return timeB - timeA;
        });
        
        setSharedDiaries(diariesList);
      } else {
        setSharedDiaries([]);
      }
    } catch (error) {
      console.error('加载失败:', error);
      // 更友好的错误处理，不使用 alert 阻断用户
      if (error.message?.includes('Permission denied')) {
        console.warn('Firebase 权限被拒绝，可能需要更新数据库规则');
      }
      setSharedDiaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSharedDiaries();
  }, []);

  // 删除共享日记
  const deleteDiary = async (diary, e) => {
    e.stopPropagation(); // 阻止触发查看详情

    // 权限检查
    if (!canDelete(diary.article.authorId)) {
      alert('⚠️ 你没有权限删除这篇日记');
      return;
    }

    const confirmMsg = isAdmin() 
      ? `🛡️ 管理员操作\n\n确定要删除《${diary.article.title}》吗？\n作者：${diary.article.author}` 
      : `确定要删除你的日记《${diary.article.title}》吗？`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setIsLoading(true);

    try {
      const diaryRef = ref(database, `shared_diaries/${diary.id}`);
      await remove(diaryRef);
      
      alert('✅ 删除成功');
      await loadSharedDiaries(); // 重新加载列表
    } catch (error) {
      alert('❌ 删除失败：' + error.message);
      console.error('删除失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDiaries = filterCategory === 'all'
    ? sharedDiaries
    : sharedDiaries.filter(diary => diary.article.category === filterCategory);

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
      {/* 公告弹窗 */}
      {showAnnouncement && (
        <Announcement onClose={() => setShowAnnouncement(false)} />
      )}

      {/* 公告入口按钮 */}
      <button
        onClick={() => setShowAnnouncement(true)}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl p-4 flex items-center justify-between transition-all shadow-md hover:shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Megaphone size={24} />
          <span className="font-bold text-lg">📢 公告中心</span>
        </div>
        <span className="text-white/80 text-sm">点击查看最新公告 →</span>
      </button>

      {/* 管理员标识 */}
      {currentUser?.isAdmin && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Shield size={20} className="text-amber-600" />
            <span className="font-medium">管理员模式</span>
            <span className="text-sm text-amber-600">· 你可以删除任何共享日记</span>
          </div>
        </div>
      )}

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
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.name)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterCategory === category.name
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 日记列表 */}
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
            const hasDeletePermission = canDelete(diary.article.authorId);
            
            return (
              <div
                key={diary.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all cursor-pointer relative"
                onClick={() => onViewDiary(diary.id)}
              >
                {/* 删除按钮 */}
                {hasDeletePermission && (
                  <button
                    onClick={(e) => deleteDiary(diary, e)}
                    className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title={isAdmin() ? '管理员删除' : '删除我的分享'}
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                {/* 文章信息 */}
                <div className="mb-4 pr-12">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                    {diary.article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-3 flex-wrap">
                    <span>{diary.article.category}</span>
                    <span>·</span>
                    <span>by {diary.article.author}</span>
                    {isAdmin() && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 flex items-center gap-1">
                          <Shield size={12} />
                          管理员可见
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatTime(diary.article.sharedAt)}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 text-sm">
                    {diary.article.content.substring(0, 100)}...
                  </p>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{diary.comments ? Object.keys(diary.comments).length : 0} 评论</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    <Eye size={16} />
                    查看详情
                  </button>
                </div>

                {/* 共享模式标签 */}
                <div className="mt-3 flex items-center gap-2">
                  {diary.article.shareMode === 'public' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      <Globe size={12} />
                      公开分享
                    </span>
                  )}
                  {hasDeletePermission && !isAdmin() && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      我的分享
                    </span>
                  )}
                </div>
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