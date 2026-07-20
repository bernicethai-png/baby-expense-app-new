#!/bin/bash
cd ~/Claude/Projects/baby-expense-app-new
rm -f .git/HEAD.lock .git/index.lock
git add load_home_stats.js
git commit -m "Remove DEBUG information box from statistics page"
git push origin main -f
echo "✅ 清理完成！应用已更新"
