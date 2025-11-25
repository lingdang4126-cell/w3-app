# W³ System v2.0 - 个人知识管理系统

![Version](https://img.shields.io/badge/version-2.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)

> 一个功能完整的个人知识管理工具，集周战室、日记博客、数据导出、日记归档和跨平台日记分享于一身。

## 🌟 在线演示

- **生产环境**：https://w3-app-khaki.vercel.app/
- **开发版本**：https://w3-app.vercel.app/

> 💡 提示：如在中国大陆访问困难，请使用科学上网工具

---

## ✨ 核心功能

### 📅 周战室（War Room）
- 📌 自定义本周标题和主题
- 🎯 目标设定与管理
- ✅ 任务清单（待做、进行中、完成）
- 📊 自动计算完成率
- ⭐ 专注度评分（1-10 分）
- 📈 进度追踪可视化

### 📓 日记博客（Journal）
- ✍️ **富文本编辑**：Markdown 格式支持
- 🏷️ **分类管理**：学习、生活、技术、随笔、思考
- 🔍 **智能搜索**：按标题/内容搜索
- 📅 **日期管理**：自动记录写作日期
- 🎨 **实时预览**：即时看到排版效果
- ✏️ **编辑/删除**：灵活管理文章

### 📂 日记归档（Archive）
- 📆 **按月份归档**：自动按年月分组
- 🏷️ **按分类归档**：快速查看同类文章
- 📁 **可折叠视图**：节省屏幕空间
- 🔗 **快速导航**：点击直接跳转编辑

### 💬 共享广场（Shared Plaza）
- 🌍 **浏览公开日记**：发现朋友的精彩日记
- 📊 **日记统计**：显示评论数和分类
- 🔍 **分类筛选**：按学习/生活/技术等过滤
- 🔄 **实时更新**：自动刷新显示最新内容

### 🔗 共享日记（Shared Diary）
- 📤 **创建共享**：一键生成共享码
- 🔒 **共享模式**：
  - 🌐 所有人可见（任何人都能访问）
  - 🔐 朋友可见（需要共享码）
- 💬 **实时评论**：多人协作评论，自动同步
- 👥 **昵称系统**：每人可设置自己的昵称
- 📱 **跨平台访问**：朋友无需注册账号
- 🗑️ **删除级联**：删除个人日记时自动删除共享副本
- 📋 **共享管理**：在"我的共享"页面查看和管理所有共享日记

### 📋 我的共享（My Shared Diaries）
- 👀 **查看共享列表**：显示用户创建的所有共享日记
- 📊 **共享统计**：显示评论数、分享模式、创建时间
- 🔍 **快速预览**：内容摘要展示
- 📋 **管理功能**：查看共享码或删除不需要的共享
- 🎯 **清晰的UI**：卡片式布局展示每个共享的详细信息

### 📤 导出中心（Export）
- 📥 **导出 JSON**：完整备份所有数据
- 📄 **导出 Markdown**：易读的文档格式
- 💾 **导入 JSON**：数据恢复与迁移
- 🗑️ **清空数据**：谨慎操作（可撤销）

---

## 🔧 技术架构

### 前端技术栈
- **框架**：React 18 + Hooks
- **构建**：Vite 5
- **样式**：Tailwind CSS 3
- **图标**：Lucide React
- **状态**：localStorage（本地存储）

### 后端服务
- **数据库**：Firebase Realtime Database
- **认证**：Firebase（暂未启用）
- **部署**：Vercel

### 数据存储
- **个人数据**：localStorage（完全本地）
- **共享数据**：Firebase Realtime Database（云端）

---

## 🚀 快速开始

### 前置要求
- Node.js >= 16.x
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/lingdang4126-cell/w3-app.git
cd w3-app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 访问 http://localhost:5173
```

### 构建生产版本

```bash
npm run build

# 构建完成后，文件在 dist/ 目录中
```

---

## 📂 项目结构

```
w3-app/
├── public/
│   └── index.html                      # HTML 模板
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx               # 首页仪表板
│   │   ├── WarRoom.jsx                 # 周战室
│   │   ├── Journal.jsx                 # 日记主组件
│   │   ├── JournalArchive.jsx          # 日记归档
│   │   ├── SharedDiary.jsx             # 共享日记（创建/查看/评论）
│   │   ├── SharedPlaza.jsx             # 共享广场
│   │   └── Export.jsx                  # 数据导出
│   ├── utils/
│   │   └── firebase.js                 # Firebase 配置
│   ├── App.jsx                         # 主应用组件
│   ├── main.jsx                        # 应用入口
│   ├── App.css                         # 应用样式
│   └── index.css                       # 全局样式
├── package.json                        # 依赖配置
├── vite.config.js                      # Vite 配置
├── tailwind.config.js                  # Tailwind 配置
├── eslint.config.js                    # ESLint 配置
├── changelog.md                        # 更新日志
└── README.md                           # 本文件
```

---

## 📊 功能对比表

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 周战室 | ✅ | ✅ |
| 日记博客 | ✅ | ✅ |
| 数据导出 | ✅ | ✅ |
| 日记归档 | ❌ | ✅ |
| 共享日记 | ❌ | ✅ |
| 实时评论 | ❌ | ✅ |
| 共享广场 | ❌ | ✅ |
| Firebase 集成 | ❌ | ✅ |
| 跨平台访问 | ❌ | ✅ |

---

## 💾 数据安全说明

### 本地数据（localStorage）
- 📍 完全存储在用户浏览器中
- 🔒 不会上传到任何服务器
- 📱 不同浏览器/设备数据独立
- 💡 清空浏览器缓存会丢失数据（建议定期导出备份）

### 云端数据（Firebase）
- ☁️ 仅存储用户主动分享的日记
- 🔐 个人日记永远不会上传
- 🌍 共享日记公开存储（当前测试模式）
- ⚠️ 建议朋友分享时谨慎，避免分享敏感内容

### 备份建议
1. 定期使用导出功能保存 JSON 备份
2. 本地保存备份文件
3. 云盘或 GitHub 中保存重要数据

---

## 🔐 Firebase 配置

### 免费额度（每月）
| 指标 | 限制 | 当前使用 |
|------|------|--------|
| 存储空间 | 1 GB | < 0.1 MB |
| 数据下载 | 10 GB | < 1 MB |
| 数据上传 | 10 GB | < 100 KB |
| 同时连接 | 100 个 | 1-10 个 |

**结论**：完全免费 ✅

### 升级条件
仅当以下条件达到时才需要付费：
- 数据存储 > 100 MB
- 月下载量 > 10 GB
- 同时在线用户 > 100
- 需要高级安全功能

---

## 🎯 使用指南

### 1️⃣ 首次使用
1. 打开应用首页（Dashboard）
2. 查看功能导航
3. 选择要使用的功能

### 2️⃣ 周战室使用
```
1. 点击"周战室"
2. 输入本周标题
3. 添加目标和任务
4. 更新任务状态
5. 调整专注度评分
```

### 3️⃣ 写日记
```
1. 点击"日记"
2. 点击"写新文章"
3. 填写标题、选择分类
4. 用 Markdown 编辑内容
5. 点击"保存"
```

### 4️⃣ 分享日记
```
1. 在日记列表找到要分享的文章
2. 点击"分享"按钮
3. 设置昵称
4. 选择共享模式（所有人/朋友）
5. 复制共享码发给朋友
```

### 5️⃣ 查看他人日记
```
1. 点击"共享广场"
2. 浏览公开分享的日记
3. 点击感兴趣的日记查看详情
4. 发表评论
```

### 6️⃣ 导出数据
```
1. 点击"导出"
2. 选择导出格式（JSON/Markdown）
3. 文件会自动下载
```

---

## 🔄 更新日志

### v2.0.1 (2025-11-25)
- ✅ 修复 Firebase 导入路径错误
- ✅ 实现 localStorage 持久化存储
- ✅ 完善共享广场组件
- ✅ 实现双模式共享日记（创建和查看）
- ✅ 支持查看他人日记和实时评论

### v2.0.0 (2025-11-25)
- ✨ 新增日记归档功能
- ✨ 新增共享日记系统（Firebase）
- ✨ 新增共享广场（浏览公开日记）
- ✨ 新增实时评论功能
- 🔧 集成 Firebase Realtime Database

### v1.0.0 (2025-01-14)
- 🎉 初始版本发布
- 📅 周战室功能
- 📓 日记博客功能
- 📤 数据导出功能
- 💾 本地存储

详见 [changelog.md](./changelog.md)

---

## 🛣️ 开发路线图

### 即将实现
- [ ] 共享日记过期时间设置
- [ ] 删除/编辑评论功能
- [ ] 用户认证系统（可选）
- [ ] 查看在线用户功能

### 未来计划
- [ ] 图片上传功能
- [ ] PDF 导出
- [ ] 搜索功能优化
- [ ] 深色模式
- [ ] 移动端适配优化

---

## 🤝 贡献指南

欢迎贡献！请按以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## ⚙️ 开发命令

```bash
# 开发模式（带热重载）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码质量检查
npm run lint

# 修复代码问题
npm run lint -- --fix
```

---

## 🔗 相关链接

- 🐙 **GitHub**: https://github.com/lingdang4126-cell/w3-app
- 🚀 **在线演示**: https://w3-app-khaki.vercel.app/
- 📱 **Vercel 项目**: https://vercel.com/dashboard
- 🔥 **Firebase 项目**: https://console.firebase.google.com/

---

## 📝 许可证

本项目采用 MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

**lymoon_铃铛**
- GitHub: [@lingdang4126-cell](https://github.com/lingdang4126-cell)
- 项目: [W³ System](https://github.com/lingdang4126-cell/w3-app)

---

## 🙏 致谢

- 感谢 [Claude](https://claude.ai/) 提供的技术支持和代码优化
- 感谢 [React](https://react.dev/) 社区
- 感谢 [Firebase](https://firebase.google.com/) 提供的后端服务
- 感谢 [Vercel](https://vercel.com/) 提供的部署平台
- 感谢所有使用和反馈的用户 ❤️

---

## 📧 反馈与支持

如有问题或建议，欢迎：
- 在 GitHub 上提出 [Issue](https://github.com/lingdang4126-cell/w3-app/issues)
- 提交 [Pull Request](https://github.com/lingdang4126-cell/w3-app/pulls)
- 或直接联系开发者

---

**祝您使用愉快！** 🎉


