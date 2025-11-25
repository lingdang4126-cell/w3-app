import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Globe, Lock, Users, Share2 } from 'lucide-react';
import { ref, get, remove } from 'firebase/database';
import { database } from '../utils/firebase';

export default function MySharedDiaries({ articles, onEditShare, onClose }) {
  const [mySharedDiaries, setMySharedDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMySharedDiaries();
  }, [articles]);

  const loadMySharedDiaries = async () => {
    setIsLoading(true);
    try {
      // 从 localStorage 获取所有共享记录映射
      const sharedRecords = JSON.parse(localStorage.getItem('w3_shared_records') || '{}');
      const shared = [];

      // 对于每个共享的文章，从 Firebase 加载详细信息
      for (const [articleId, sharedId] of Object.entries(sharedRecords)) {
        try {
          const diaryRef = ref(database, `shared_diaries/${sharedId}`);
          const snapshot = await get(diaryRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            // 检查这个共享是否属于当前用户（通过 creatorId 是否等于文章 ID）
            if (data.creatorId === parseInt(articleId)) {
              shared.push({
                sharedId,
                articleId: parseInt(articleId),
                title: data.article?.title || '(无标题)',
                category: data.article?.category || '未分类',
                shareMode: data.shareMode || 'public',
                commentCount: Object.keys(data.comments || {}).length,
                createdAt: data.article?.date || new Date().toLocaleString('zh-CN'),
                article: data.article
              });
            }
          }
        } catch (error) {
          console.error(`Error loading shared diary ${sharedId}:`, error);
        }
      }

      setMySharedDiaries(shared);
    } catch (error) {
      console.error('Error loading my shared diaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSharedDiary = async (sharedId, articleId) => {
    if (!confirm('确定要删除这个共享吗？')) return;

    try {
      // 从 Firebase 删除
      const diaryRef = ref(database, `shared_diaries/${sharedId}`);
      await remove(diaryRef);

      // 从 localStorage 删除映射
      const sharedRecords = JSON.parse(localStorage.getItem('w3_shared_records') || '{}');
      delete sharedRecords[articleId];
      localStorage.setItem('w3_shared_records', JSON.stringify(sharedRecords));

      alert('✅ 共享已删除');
      setMySharedDiaries(prev => prev.filter(item => item.sharedId !== sharedId));
    } catch (error) {
      alert('❌ 删除失败：' + error.message);
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-6">
        <div className="text-center py-16">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-blue-500 border-r-transparent rounded-full"></div>
          <p className="text-slate-600 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">📤 我的共享日记</h2>
          <p className="text-slate-600">管理你所有的共享日记</p>
        </div>

        {mySharedDiaries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Share2 size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg mb-4">还没有共享任何日记</p>
            <p className="text-slate-500 text-sm">创建一篇日记后，在列表中选择"分享"即可共享给朋友们</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mySharedDiaries.map(shared => (
              <div key={shared.sharedId} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* 顶部 */}
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 border-b border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{shared.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          {shared.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                          shared.shareMode === 'public'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {shared.shareMode === 'public' ? (
                            <>
                              <Globe size={14} />
                              公开
                            </>
                          ) : (
                            <>
                              <Users size={14} />
                              朋友可见
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 内容摘要 */}
                <div className="p-4">
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <p className="text-slate-600 text-sm line-clamp-3">
                      {shared.article?.content || '(无内容)'}
                    </p>
                  </div>

                  {/* 统计信息 */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-slate-600">评论数</p>
                      <p className="text-xl font-bold text-blue-600">{shared.commentCount}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <p className="text-slate-600">创建时间</p>
                      <p className="text-xs font-semibold text-purple-600">{new Date(shared.createdAt).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* 共享码 */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                    <p className="text-xs text-slate-600 mb-2">共享码：</p>
                    <code className="text-xs font-mono text-slate-700 break-all">{shared.sharedId}</code>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const code = prompt('请输入要修改的共享码（用于查看）：', shared.sharedId);
                        if (code) {
                          onEditShare(shared.sharedId, shared.article);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Eye size={16} />
                      查看
                    </button>
                    <button
                      onClick={() => deleteSharedDiary(shared.sharedId, shared.articleId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
