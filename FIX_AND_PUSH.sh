#!/bin/bash

# 🔧 修复 Git Lock 文件并推送所有文件

cd "$(dirname "$0")"

echo "🔍 清理 git lock 文件..."
rm -f .git/index.lock
rm -f .git/HEAD.lock

echo "📋 检查当前状态..."
git status

echo ""
echo "📂 本地文件列表..."
ls -la *.js *.html *.json 2>/dev/null | grep -v "^total"

echo ""
echo "🔄 添加所有文件到 git..."
git add -A

echo ""
echo "📝 显示将要提交的文件..."
git status

echo ""
echo "💾 提交更改..."
git commit -m "feat: Add all application files (index.html, api.js, load_bills.js, load_home_stats.js and other modules)"

echo ""
echo "🚀 推送到 GitHub..."
git push origin main

echo ""
echo "✅ 完成！"
echo ""
echo "Vercel 会自动检测到新提交并重新部署。"
echo "请等待 2-3 分钟，然后访问 https://baby-expense-app-v3.vercel.app/ 查看更新。"
