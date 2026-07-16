#!/bin/bash

# 宝宝共享记账本 - 推送到GitHub脚本

echo "=========================================="
echo "  宝宝共享记账本 - 推送到GitHub"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "📁 项目目录: $PROJECT_DIR"
echo ""

# 检查git状态
echo "📋 检查Git状态..."
git status

echo ""
echo "🚀 推送到GitHub..."
git push -f origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📊 提交信息："
    git log --oneline -1
    echo ""
    echo "⏳ 预期时间表："
    echo "   • 现在: 已推送到GitHub"
    echo "   • 1-2分钟: Render检测到新提交"
    echo "   • 2-3分钟: 开始构建"
    echo "   • 3-5分钟: 部署完成"
    echo ""
    echo "🌐 访问应用："
    echo "   https://baby-expense-app-new-1.onrender.com/"
    echo ""
    echo "✅ 应该看到完整的前端界面（不是JSON错误）"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查网络连接"
    exit 1
fi
