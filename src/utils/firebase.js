import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyBu9fu2fu2cXTTd4_vu6ddzNgu819-ggmU",
  authDomain: "w3-app-c1464.firebaseapp.com",
  databaseURL: "https://w3-app-c1464-default-rtdb.firebaseio.com",
  projectId: "w3-app-c1464",
  storageBucket: "w3-app-c1464.firebasestorage.app",
  messagingSenderId: "173028311342",
  appId: "1:173028311342:web:3a8971abf7b04bc84bfabf",
  measurementId: "G-PBQQSZB08M"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化数据库
export const database = getDatabase(app);

export default app;