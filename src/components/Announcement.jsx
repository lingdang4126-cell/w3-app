import React, { useState, useEffect } from 'react';
import { Megaphone, Send, X, MessageCircle, Trash2, Shield } from 'lucide-react';
import { ref, set, get, push, remove, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { isAdmin, getCurrentUser } from '../utils/user';

export default function Announcement({ onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const currentUser = getCurrentUser();

  // 从 localStorage 获取用户名
  useEffect(() => {
    const savedUsername = localStorage.getItem('w3_username') || currentUser.username || '匿名用户';
    setUsername(savedUsername);
  }, []);

  // 加载公告列表
  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const announcementsRef = ref(database, 'announcements');
      const snapshot = await get(announcementsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        
        // 按时间倒序排列
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(list);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('加载公告失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // 实时监听选中公告的评论
  useEffect(() => {
    if (!selectedAnnouncement) return;

    const commentsRef = ref(database, `announcements/${selectedAnnouncement.id}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const commentsList = Object.entries(commentsData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        commentsList.sort((a, b) => a.timestamp - b.timestamp);
        setSelectedAnnouncement(prev => ({
          ...prev,
          comments: commentsList
        }));
      }
    });

    return () => off(commentsRef);
  }, [selectedAnnouncement?.id]);

  // 发布公告
  const publishAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('请填写公告标题和内容');
      return;
    }

    if (!isAdmin()) {
      alert('⚠️ 只有管理员可以发布公告');
      return;
    }

    setIsLoading(true);
    try {
      const announcementsRef = ref(database, 'announcements');
      const newRef = push(announcementsRef);
      
      await set(newRef, {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        author: username,
        authorId: currentUser.userId,
        createdAt: new Date().toISOString(),
        comments: {}
      });

      setNewAnnouncement({ title: '', content: '' });
      alert('✅ 公告发布成功！');
      await loadAnnouncements();
    } catch (error) {
      alert('❌ 发布失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除公告
  const deleteAnnouncement = async (announcementId, e) => {
    e?.stopPropagation();
    
    if (!isAdmin()) {
      alert('⚠️ 只有管理员可以删除公告');
      return;
    }

    if (!confirm('确定要删除这条公告吗？')) return;

    setIsLoading(true);
    try {
      const announcementRef = ref(database, `announcements/${announcementId}`);
      await remove(announcementRef);
      
      alert('✅ 公告已删除');
      setSelectedAnnouncement(null);
      await loadAnnouncements();
    } catch (error) {
      alert('❌ 删除失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加评论
  const addComment = async () => {
    if (!newComment.trim()) {
      alert('评论不能为空');
      return;
    }

    if (!username.trim()) {
      alert('请先设置你的昵称');
      return;
    }

    setIsLoading(true);
    try {
      const commentsRef = ref(database, `announcements/${selectedAnnouncement.id}/comments`);
      const newCommentRef = push(commentsRef);
      
      await set(newCommentRef, {
        author: username,
        authorId: currentUser.userId,
        content: newComment,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN')
      });

      setNewComment('');
    } catch (error) {
      alert('❌ 评论失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone size={28} />
              <div>
                <h2 className="text-2xl font-bold">公告中心</h2>
                <p className="text-white/80 text-sm">查看最新公告和通知</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 管理员发布区 */}
          {isAdmin() && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-amber-600" />
                <h3 className="font-bold text-amber-800">发布新公告</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="公告标题..."
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="公告内容..."
                  rows={3}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <button
                  onClick={publishAnnouncement}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  发布公告
                </button>
              </div>
            </div>
          )}

          {/* 公告列表 */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Megaphone size={20} className="text-amber-600" />
              公告列表
            </h3>

            {isLoading && announcements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">加载中...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
                <p>暂无公告</p>
              </div>
            ) : (
              announcements.map(announcement => (
                <div
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <span className="text-amber-500">📢</span>
                        {announcement.title}
                      </h4>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>管理员 · {announcement.author}</span>
                        <span>·</span>
                        <span>{formatTime(announcement.createdAt)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {Object.keys(announcement.comments || {}).length} 评论
                        </span>
                      </div>
                    </div>
                    {isAdmin() && (
                      <button
                        onClick={(e) => deleteAnnouncement(announcement.id, e)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除公告"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 公告详情弹窗 */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* 详情头部 */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-amber-500">📢</span>
                    {selectedAnnouncement.title}
                  </h3>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="text-slate-400 hover:text-slate-600 text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  管理员 · {selectedAnnouncement.author} · {formatTime(selectedAnnouncement.createdAt)}
                </div>
              </div>

              {/* 详情内容 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>

                {/* 评论区 */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <MessageCircle size={18} />
                    评论 ({(selectedAnnouncement.comments || []).length})
                  </h4>

                  {/* 评论列表 */}
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {(!selectedAnnouncement.comments || selectedAnnouncement.comments.length === 0) ? (
                      <p className="text-center text-slate-400 py-4 text-sm">还没有评论</p>
                    ) : (
                      (Array.isArray(selectedAnnouncement.comments) ? selectedAnnouncement.comments : []).map(comment => (
                        <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-800 text-sm">{comment.author}</span>
                            <span className="text-xs text-slate-500">{comment.date}</span>
                          </div>
                          <p className="text-slate-600 text-sm">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 添加评论 */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        localStorage.setItem('w3_username', e.target.value);
                      }}
                      placeholder="你的昵称"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addComment()}
                        placeholder="写下你的评论..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={addComment}
                        disabled={isLoading}
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
