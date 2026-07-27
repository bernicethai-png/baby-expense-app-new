#!/bin/bash

# 🚀 最终推送脚本 - 推送所有应用文件到 GitHub

cd "$(dirname "$0")"

echo "🔍 清理 git lock 文件..."
rm -f .git/index.lock
rm -f .git/HEAD.lock

echo "✅ Lock 文件已清理"
echo ""

echo "📋 当前项目文件："
ls -lh *.js *.html *.json *.md *.sh 2>/dev/null | awk '{print $9, "("$5")"}'

echo ""
echo "🔄 添加所有文件到 git..."
git add -A

echo ""
echo "📊 检查待提交的文件："
git status

echo ""
echo "💾 提交所有文件..."
git commit -m "feat: Add complete application with table view, month/year filter, and all JavaScript modules"

echo ""
echo "🚀 推送到 GitHub..."
git push origin main

echo ""
echo "✅ 推送完成！"
echo ""
echo "⏰ Vercel 会在 1-2 分钟内自动部署"
echo "🌐 访问: https://baby-expense-app-v3.vercel.app/"
echo ""
echo "📝 部署的文件:"
echo "  ✓ index.html (应用主入口)"
echo "  ✓ api.js (API 通信)"
echo "  ✓ load_bills.js (账单 + 月份过滤 + 表格视图)"
echo "  ✓ load_home_stats.js (首页 + 统计页)"
echo "  ✓ vercel.json (配置)"
