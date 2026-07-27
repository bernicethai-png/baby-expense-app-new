#!/bin/bash

# 🔧 完全清理和修复 Git 问题

echo "🔍 正在修复 Git 问题..."

# 1. 杀死所有 git 进程
echo "🛑 停止所有 git 进程..."
pkill -f "git|code" || true
sleep 1

# 2. 清理 lock 文件
echo "🧹 清理 lock 文件..."
rm -f .git/index.lock
rm -f .git/HEAD.lock
rm -f .git/objects/*.lock

# 3. 移除嵌套的 git 仓库
echo "🗑️ 移除嵌套的 git 仓库..."
if [ -d "baby-expense-app-new/.git" ]; then
  echo "  发现嵌套仓库：baby-expense-app-new/.git"
  rm -rf baby-expense-app-new/.git
  git rm --cached baby-expense-app-new -r || true
fi

# 4. 检查状态
echo ""
echo "📋 Git 状态："
git status

echo ""
echo "📂 本地文件列表："
find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec ls -lh {} \;

echo ""
echo "✅ 清理完成！"
echo ""
echo "现在可以执行以下命令提交文件："
echo ""
echo "  git add -A"
echo "  git commit -m \"feat: Add all application files\""
echo "  git push origin main"
