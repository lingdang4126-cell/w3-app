import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 初始化全局存储对象 - 使用 localStorage 实现持久化
window.storage = {
  set: function(key, value, isTemp = false) {
    return new Promise((resolve) => {
      try {
        const storageKey = `w3_${key}`;
        localStorage.setItem(storageKey, value);
        console.log('存储成功:', storageKey);
        resolve();
      } catch (error) {
        console.error('存储失败:', error);
        resolve();
      }
    });
  },
  
  get: function(key, isTemp = false) {
    return new Promise((resolve) => {
      try {
        const storageKey = `w3_${key}`;
        const value = localStorage.getItem(storageKey);
        
        if (value) {
          console.log('读取成功:', storageKey);
          resolve({ value });
        } else {
          console.log('未找到:', storageKey);
          resolve(null);
        }
      } catch (error) {
        console.error('读取失败:', error);
        resolve(null);
      }
    });
  },
  
  remove: function(key, isTemp = false) {
    return new Promise((resolve) => {
      try {
        const storageKey = `w3_${key}`;
        localStorage.removeItem(storageKey);
        resolve();
      } catch (error) {
        console.error('删除失败:', error);
        resolve();
      }
    });
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)