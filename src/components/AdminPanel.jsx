import React, { useState, useEffect } from 'react';
import { Shield, Key, User, Copy, Check, Lock } from 'lucide-react';
import { setAsAdmin, getCurrentUser, ADMIN_ID, ADMIN_USERNAME, ADMIN_PASSWORD } from '../utils/user';

export default function AdminPanel({ onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSetAsAdmin = () => {
    // 验证账号密码
    if (loginUsername !== ADMIN_USERNAME) {
      setLoginError('❌ 账号错误');
      return;
    }
    if (loginPassword !== ADMIN_PASSWORD) {
      setLoginError('❌ 密码错误');
      return;
    }
    
    // 验证通过，设置为管理员
    setAsAdmin();
    setCurrentUser(getCurrentUser());
    setLoginError('');
    setLoginUsername('');
    setLoginPassword('');
    alert('✅ 已设置为管理员！\n\n你现在拥有管理员权限。');
  };

  const copyAdminId = () => {
    navigator.clipboard.writeText(ADMIN_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={28} />
              <h2 className="text-2xl font-bold">管理员面板</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 当前用户信息 */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-slate-600" />
              <h3 className="font-bold text-slate-800">当前用户信息</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">昵称：</span>
                <span className="font-medium text-slate-800">{currentUser?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">用户 ID：</span>
                <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300">
                  {currentUser?.userId}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">权限：</span>
                {currentUser?.isAdmin ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Shield size={14} />
                    管理员
                  </span>
                ) : (
                  <span className="text-slate-500">普通用户</span>
                )}
              </div>
            </div>
          </div>

          {/* 管理员 ID */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Key size={20} className="text-amber-600" />
              <h3 className="font-bold text-slate-800">管理员 ID</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 text-xs bg-white px-3 py-2 rounded border border-amber-300 font-mono break-all">
                {ADMIN_ID}
              </code>
              <button
                onClick={copyAdminId}
                className="p-2 bg-white hover:bg-amber-50 border border-amber-300 rounded transition-colors"
                title="复制管理员 ID"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-amber-600" />}
              </button>
            </div>
            <p className="text-xs text-amber-700">
              💡 保存此 ID，可在其他设备上手动设置管理员权限
            </p>
          </div>

          {/* 操作按钮 */}
          {!currentUser?.isAdmin ? (
            <div className="space-y-4">
              {/* 登录表单 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={20} className="text-slate-600" />
                  <h3 className="font-bold text-slate-800">管理员登录</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">账号</label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                      placeholder="请输入管理员账号"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">密码</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                      placeholder="请输入管理员密码"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSetAsAdmin()}
                    />
                  </div>
                  
                  {loginError && (
                    <p className="text-red-500 text-sm font-medium">{loginError}</p>
                  )}
                  
                  <button
                    onClick={handleSetAsAdmin}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Shield size={20} />
                    登录并设置为管理员
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 text-center">
                ⚠️ 仅管理员账号可以获取管理员权限
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <Shield size={20} />
                <span className="font-medium">你已经是管理员</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                你可以删除共享广场中的任何日记
              </p>
            </div>
          )}

          {/* 说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">权限说明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 管理员可以删除任何共享日记</li>
              <li>• 普通用户只能删除自己的共享</li>
              <li>• 管理员 ID 全局唯一</li>
              <li>• 可在多个设备上使用同一管理员 ID</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}