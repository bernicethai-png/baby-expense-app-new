#!/bin/bash
cd ~/Claude/Projects/baby-expense-app-new
rm -f .git/HEAD.lock .git/index.lock
git add app.py
git commit -m "Fix: Add category breakdown data to statistics endpoint"
git push origin main -f
echo "✅ 修复完成！Render 正在部署..."
