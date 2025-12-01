// 用户识别和权限管理

// 管理员账号和密码
export const ADMIN_USERNAME = 'admin626';
export const ADMIN_PASSWORD = 'hhxxttxs0626';

// 管理员 ID（你的唯一标识）
// 第一次运行时会生成，记得保存这个 ID！
export const ADMIN_ID = 'admin_w3_2025';

// 生成或获取用户唯一 ID
export const getUserId = () => {
  let userId = localStorage.getItem('w3_user_id');
  
  if (!userId) {
    // 生成新的用户 ID
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('w3_user_id', userId);
  }
  
  return userId;
};

// 检查是否为管理员
export const isAdmin = () => {
  const userId = getUserId();
  return userId === ADMIN_ID;
};

// 设置为管理员（仅在你的设备上运行一次）
export const setAsAdmin = () => {
  localStorage.setItem('w3_user_id', ADMIN_ID);
  console.log('✅ 已设置为管理员');
  console.log('管理员 ID:', ADMIN_ID);
};

// 检查是否有删除权限
export const canDelete = (authorId) => {
  const currentUserId = getUserId();
  
  // 管理员或作者本人可以删除
  return currentUserId === ADMIN_ID || currentUserId === authorId;
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const userId = getUserId();
  const username = localStorage.getItem('w3_username') || '匿名用户';
  const admin = isAdmin();
  
  return {
    userId,
    username,
    isAdmin: admin
  };
};