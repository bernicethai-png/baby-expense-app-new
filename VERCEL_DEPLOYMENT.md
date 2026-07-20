# ✅ Vercel + Supabase 部署指南

## 📝 已经准备好的文件：
- `package.json` - Node.js依赖
- `vercel.json` - Vercel配置
- `lib/db.js` - 数据库连接
- `api/transactions.js` - 交易API
- `api/statistics.js` - 统计API
- `api/categories.js` - 分类API
- `api/users.js` - 用户API

## 🚀 部署步骤：

### 第 1 步：Git 推送
```bash
cd ~/Claude/Projects/baby-expense-app-new
git add .
git commit -m "Migrate to Vercel + Supabase"
git push origin main
```

### 第 2 步：连接 Vercel
1. 去 https://vercel.com 注册（用GitHub账号）
2. 点击 "New Project"
3. 选择您的 GitHub 仓库
4. 点击 "Import"

### 第 3 步：设置环境变量
1. 在 Vercel 项目设置中，找到 "Environment Variables"
2. 添加变量 `DATABASE_URL`
3. 值为您的 Supabase 连接字符串：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.cqqfssvcthbcuprbxvnn.supabase.co:5432/postgres
   ```
4. 点击保存

### 第 4 步：部署
- Vercel 会自动部署
- 您的前端将在 `https://your-project.vercel.app` 运行

### 第 5 步：更新前端 API 地址
在 `index.html` 中，更改：
```javascript
// 旧地址：
const API_BASE_URL = 'http://localhost:3000/api';

// 新地址：
const API_BASE_URL = 'https://your-project.vercel.app/api';
```

## 🔗 API 端点
- `GET /api/transactions?user_id=1` - 获取交易
- `POST /api/transactions` - 创建交易
- `GET /api/statistics?user_id=1` - 获取统计
- `GET /api/categories` - 获取分类
- `POST /api/categories` - 创建分类
- `GET /api/users` - 获取用户

## ✨ 完成！
您的应用现在部署在 Vercel 上，数据存储在 Supabase PostgreSQL 上。
