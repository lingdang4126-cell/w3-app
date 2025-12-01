import React, { useState, useEffect } from 'react';
import { Share2, MessageCircle, Copy, Check, Globe, Lock } from 'lucide-react';
import { ref, set, get, push, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { getUserId } from '../utils/user';

export default function SharedDiary({ article, sharedId: propSharedId, onClose }) {
  const [sharedId, setSharedId] = useState(propSharedId || null);
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [shareMode, setShareMode] = useState('public');
  const [articleData, setArticleData] = useState(article || null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('w3_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (propSharedId) {
      loadSharedDiary(propSharedId);
    }
  }, [propSharedId]);

  const loadSharedDiary = async (id) => {
    setIsLoading(true);
    try {
      const diaryRef = ref(database, `shared_diaries/${id}`);
      const snapshot = await get(diaryRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setArticleData(data.article);
        setSharedId(id);
      }
    } catch (error) {
      alert('❌ 加载失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const generateSharedId = () => {
    return 'diary_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const createSharedDiary = async () => {
    if (!username.trim()) {
      alert('请先设置你的昵称');
      return;
    }

    localStorage.setItem('w3_username', username);
    setIsLoading(true);
    const newSharedId = generateSharedId();

    try {
      const currentUserId = getUserId(); // 获取当前用户 ID

      const sharedData = {
        article: {
          ...articleData,
          author: username,
          authorId: currentUserId, // 记录作者 ID
          sharedAt: new Date().toISOString(),
          shareMode: shareMode
        },
        comments: {}
      };

      const diaryRef = ref(database, `shared_diaries/${newSharedId}`);
      await set(diaryRef, sharedData);
      
      setSharedId(newSharedId);
      alert('✅ 共享创建成功！');
    } catch (error) {
      alert('❌ 创建失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setArticleData(data.article);
      setSharedId(joinCode);
      alert('✅ 加入成功！');
    } catch (error) {
      alert('❌ 加入失败：' + error.message);
      console.error('Firebase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const currentUserId = getUserId(); // 获取当前用户 ID

      const commentsRef = ref(database, `shared_diaries/${sharedId}/comments`);
      const newCommentRef = push(commentsRef);
      
      await set(newCommentRef, {
        author: username,
        authorId: currentUserId, // 记录评论者 ID
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

  const copySharedCode = () => {
    navigator.clipboard.writeText(sharedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Share2 className="text-blue-500" />
              {propSharedId ? '共享日记' : '分享日记'}
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
          {!sharedId && !propSharedId && (
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
          )}

          {!sharedId && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  📤 分享这篇日记
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  创建共享后，朋友可以通过共享码或共享广场查看和评论
                </p>

                <div className="mb-4 space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    共享模式
                  </label>
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
                      <div className="text-sm font-medium text-slate-700">所有人可见</div>
                      <div className="text-xs text-slate-500">出现在共享广场</div>
                    </button>
                    <button
                      onClick={() => setShareMode('private')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        shareMode === 'private'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Lock className={`mx-auto mb-1 ${shareMode === 'private' ? 'text-purple-500' : 'text-slate-400'}`} size={20} />
                      <div className="text-sm font-medium text-slate-700">朋友可见</div>
                      <div className="text-xs text-slate-500">仅通过共享码</div>
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

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  📥 加入朋友的日记
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  输入朋友分享的共享码
                </p>
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
            </div>
          )}

          {sharedId && articleData && (
            <div className="space-y-6">
              {!propSharedId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      共享码（分享给朋友）
                    </label>
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
                  </div>
                  <code className="block bg-white px-4 py-2 rounded border border-slate-300 text-sm font-mono break-all">
                    {sharedId}
                  </code>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {articleData.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  作者：{articleData.author} · {articleData.date}
                </p>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {articleData.content}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <MessageCircle size={18} />
                    评论 ({comments.length})
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    实时同步
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">
                      还没有评论，来说点什么吧~
                    </p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-slate-800">
                            {comment.author}
                          </span>
                          <span className="text-xs text-slate-500">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-200">
                  {username ? (
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
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="输入你的昵称后可以评论..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 提示：评论会实时同步，所有人都能立即看到最新内容
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}