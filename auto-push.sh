#!/bin/bash
cd ~/Claude/Projects/baby-expense-app-new
rm -f .git/HEAD.lock .git/index.lock
git add .
git commit -m "Fix: Add user_name and created_at to API response"
git push origin main -f
echo "✅ 推送完成！Render 正在部署..."
