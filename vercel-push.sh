#!/bin/bash
cd ~/Claude/Projects/baby-expense-app-new
rm -f .git/HEAD.lock .git/index.lock

echo "🚀 准备迁移到 Vercel + Supabase..."
git add .
git commit -m "Migrate to Vercel Serverless + PostgreSQL/Supabase"
git push origin main

echo "✅ 推送完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 去 https://vercel.com 登录"
echo "2. 选择您的仓库并导入"
echo "3. 在项目设置中添加环境变量 DATABASE_URL"
echo "4. Vercel 会自动部署"
echo ""
echo "💡 提示：部署完成后，您的前端和 API 将在同一个 Vercel 域名上运行"
