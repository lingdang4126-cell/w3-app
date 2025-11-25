import React, { useState, useEffect } from 'react';
import { Share2, MessageCircle, Copy, Check, Globe, Lock, Trash2 } from 'lucide-react';
import { ref, set, get, push, onValue, off, remove } from 'firebase/database';
import { database } from '../utils/firebase';

export default function SharedDiary({ article, sharedId: initialSharedId, onClose }) {
  const [sharedId, setSharedId] = useState(initialSharedId || null);
  const [viewingMode, setViewingMode] = useState(initialSharedId ? 'viewing' : 'creating');
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [shareMode, setShareMode] = useState('public');
  const [viewingArticle, setViewingArticle] = useState(null);

  // 从本地获取用户名
  useEffect(() => {
    const savedUsername = localStorage.getItem('w3_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // 初始化时加载查看的文章
  useEffect(() => {
    if (initialSharedId && !viewingArticle) {
      loadSharedDiary(initialSharedId);
    }
  }, [initialSharedId]);

  // 实时监听评论
  useEffect(() => {
    if (!sharedId) return;

    const commentsRef = ref(database, `shared_diaries/${sharedId}/comments`);
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        commentsList.sort((a, b) => a.timestamp - b.timestamp);
        setComments(commentsList);
      } else {
        setComments([]);
      }
    });

    return () => off(commentsRef);
  }, [sharedId]);

  // 加载共享日记
  const loadSharedDiary = async (diaryId) => {
    setIsLoading(true);
    try {
      const diaryRef = ref(database, `shared_diaries/${diaryId}`);
      const snapshot = await get(diaryRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setViewingArticle(data.article);
        setSharedId(diaryId);
        setViewingMode('viewing');
      } else {
        alert('❌ 日记不存在或已被删除');
      }
    } catch (error) {
      alert('❌ 加载失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成共享ID
  const generateSharedId = () => {
    return 'diary_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // 创建共享日记
  const createSharedDiary = async () => {
    if (!username.trim()) {
      alert('请先设置你的昵称');
      return;
    }

    localStorage.setItem('w3_username', username);
    setIsLoading(true);
    const newSharedId = generateSharedId();

    try {
      const sharedData = {
        article: {
          ...article,
          author: username,
          sharedAt: new Date().toISOString(),
          shareMode: shareMode
        },
        comments: {},
        creatorId: article.id // 保存原文章ID，便于后续删除
      };

      const diaryRef = ref(database, `shared_diaries/${newSharedId}`);
      await set(diaryRef, sharedData);
      
      // 在本地存储中记录共享ID，便于删除同步
      const sharedRecords = JSON.parse(localStorage.getItem('w3_shared_records') || '{}');
      sharedRecords[article.id] = newSharedId;
      localStorage.setItem('w3_shared_records', JSON.stringify(sharedRecords));
      
      setSharedId(newSharedId);
      setViewingMode('viewing');
      alert('✅ 共享创建成功！');
    } catch (error) {
      alert('❌ 创建失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加入共享日记
  const joinSharedDiary = async () => {
    if (!joinCode.trim()) {
      alert('请输入共享码');
      return;
    }

    if (!username.trim()) {
      alert('请先设置你的昵称');
      return;
    }

    localStorage.setItem('w3_username', username);
    setIsLoading(true);

    try {
      const diaryRef = ref(database, `shared_diaries/${joinCode}`);
      const snapshot = await get(diaryRef);
      
      if (!snapshot.exists()) {
        alert('❌ 共享码无效或已过期');
        return;
      }

      const data = snapshot.val();
      setViewingArticle(data.article);
      setSharedId(joinCode);
      setViewingMode('viewing');
      alert('✅ 加入成功！');
    } catch (error) {
      alert('❌ 加入失败：' + error.message);
      console.error('Firebase error:', error);
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
      const commentsRef = ref(database, `shared_diaries/${sharedId}/comments`);
      const newCommentRef = push(commentsRef);
      
      await set(newCommentRef, {
        author: username,
        content: newComment,
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN')
      });

      setNewComment('');
    } catch (error) {
      alert('❌ 评论失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制共享码
  const copySharedCode = () => {
    navigator.clipboard.writeText(sharedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 删除共享日记
  const deleteSharedDiary = async () => {
    setIsLoading(true);

    try {
      // 从 Firebase 删除共享日记
      const diaryRef = ref(database, `shared_diaries/${sharedId}`);
      await remove(diaryRef);

      // 从 localStorage 删除映射记录
      const sharedRecords = JSON.parse(localStorage.getItem('w3_shared_records') || '{}');
      // 找到对应的 article ID 并删除
      Object.keys(sharedRecords).forEach(key => {
        if (sharedRecords[key] === sharedId) {
          delete sharedRecords[key];
        }
      });
      localStorage.setItem('w3_shared_records', JSON.stringify(sharedRecords));

      alert('✅ 共享已删除');
      onClose();
    } catch (error) {
      alert('❌ 删除失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayArticle = viewingArticle || article;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Share2 className="text-blue-500" />
              {viewingMode === 'viewing' && initialSharedId ? '日记详情' : '共享日记'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 创建模式 */}
          {viewingMode === 'creating' && !sharedId && (
            <>
              {/* 设置昵称 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  你的昵称
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入你的昵称..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 创建共享 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">📤 分享这篇日记</h3>
                <p className="text-slate-600 text-sm mb-4">创建共享后，朋友可以通过共享码查看和评论</p>

                {/* 共享模式选择 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">共享模式</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShareMode('public')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        shareMode === 'public'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Globe className={`mx-auto mb-1 ${shareMode === 'public' ? 'text-blue-500' : 'text-slate-400'}`} size={20} />
                      <div className="text-sm font-medium">所有人可见</div>
                      <div className="text-xs text-slate-500">任何人都能看</div>
                    </button>
                    <button
                      onClick={() => setShareMode('friends')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        shareMode === 'friends'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Lock className={`mx-auto mb-1 ${shareMode === 'friends' ? 'text-purple-500' : 'text-slate-400'}`} size={20} />
                      <div className="text-sm font-medium">朋友可见</div>
                      <div className="text-xs text-slate-500">需要共享码</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={createSharedDiary}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 font-medium"
                >
                  {isLoading ? '创建中...' : '创建共享'}
                </button>
              </div>

              {/* 加入共享 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">📥 加入朋友的日记</h3>
                <p className="text-slate-600 text-sm mb-4">输入朋友分享的共享码</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="粘贴共享码..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={joinSharedDiary}
                    disabled={isLoading}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-300"
                  >
                    {isLoading ? '加入中...' : '加入'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 查看模式 */}
          {viewingMode === 'viewing' && (
            <>
              {/* 设置昵称 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">你的昵称</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入你的昵称..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 共享码 */}
              {sharedId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">共享码</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copySharedCode}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {copied ? (
                          <>
                            <Check size={16} />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            复制
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这个共享吗？')) {
                            deleteSharedDiary();
                          }
                        }}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        删除
                      </button>
                    </div>
                  </div>
                  <code className="block bg-white px-4 py-2 rounded border border-slate-300 text-sm font-mono break-all">
                    {sharedId}
                  </code>
                </div>
              )}

              {/* 文章展示 */}
              {displayArticle && (
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {displayArticle.title || '(无标题)'}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-4 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {displayArticle.category || '未分类'}
                    </span>
                    <span>作者：{displayArticle.author || '匿名'}</span>
                    <span>·</span>
                    <span>{new Date(displayArticle.sharedAt || new Date()).toLocaleString('zh-CN')}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {displayArticle.content || '(无内容)'}
                    </p>
                  </div>
                </div>
              )}

              {/* 评论区 */}
              <div className="border border-slate-200 rounded-lg">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-medium">
                  <MessageCircle size={18} />
                  评论 ({comments.length})
                </div>

                {/* 评论列表 */}
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">还没有评论，来说点什么吧~</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-slate-800">{comment.author}</span>
                          <span className="text-xs text-slate-500">{comment.date}</span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* 添加评论 */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                      placeholder="写下你的评论..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addComment}
                      disabled={isLoading}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
