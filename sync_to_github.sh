#!/bin/bash

cd "$(dirname "$0")" || exit 1

echo "=========================================="
echo "将本地正确的app.py推送到GitHub"
echo "=========================================="
echo ""

# 检查app.py中是否有前端路由
if grep -q "# 前端路由" app.py; then
    echo "✓ 确认：本地app.py包含正确的前端路由"
else
    echo "✗ 错误：本地app.py不包含前端路由"
    exit 1
fi

# 检查前端路由是否在最后
LINE_COUNT=$(wc -l < app.py)
LAST_ROUTE_LINE=$(grep -n "^@app.route" app.py | tail -1 | cut -d: -f1)

if [ "$LAST_ROUTE_LINE" -gt "240" ]; then
    echo "✓ 确认：前端路由在文件的后面（第 $LAST_ROUTE_LINE 行）"
else
    echo "✗ 错误：前端路由不在正确的位置"
    exit 1
fi

echo ""
echo "现在推送到GitHub..."
echo ""

# 清理
rm -f .DS_Store

# 添加并提交
git add .
git status

echo ""
echo "提交更改..."
git commit -m "Deploy: Sync correct app.py version with proper code order"

echo ""
echo "推送到GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ 成功推送到GitHub！"
    echo "=========================================="
    echo ""
    echo "Render会在1-5分钟内自动检测到更改并部署"
    echo "之后访问：https://baby-expense-app-new-1.onrender.com/"
    echo ""
else
    echo ""
    echo "推送失败，尝试硬重置..."
    git fetch origin
    git reset --hard origin/main
    cp app.py /tmp/app.py.correct
    git pull origin main
    cp /tmp/app.py.correct app.py
    git add app.py
    git commit -m "Deploy: Force sync correct app.py version"
    git push -f origin main

    if [ $? -eq 0 ]; then
        echo "✓ 已强制推送"
    else
        echo "✗ 推送仍然失败"
        exit 1
    fi
fi
