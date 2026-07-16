#!/bin/bash

# 自动修复脚本 - 直接运行此脚本完成所有修复

cd "$(dirname "$0")" || exit 1

echo "=========================================="
echo "宝宝共享记账本 - 自动修复脚本"
echo "=========================================="
echo ""

# 步骤1: 清理系统文件
echo "步骤1: 清理系统文件..."
rm -f .DS_Store
echo "✓ 已清理"

# 步骤2: 拉取GitHub最新代码
echo ""
echo "步骤2: 从GitHub拉取最新代码..."
git pull origin main --rebase
if [ $? -ne 0 ]; then
    echo "✗ Pull失败，尝试硬重置..."
    git fetch origin
    git reset --hard origin/main
fi
echo "✓ 已拉取最新代码"

# 步骤3: 复制正确的app.py
echo ""
echo "步骤3: 替换app.py..."
if [ ! -f "app_fixed.py" ]; then
    echo "✗ 错误: 找不到 app_fixed.py"
    exit 1
fi
cp app_fixed.py app.py
echo "✓ 已替换app.py"

# 步骤4: 提交更改
echo ""
echo "步骤4: 提交更改..."
git add app.py
git commit -m "Fix app.py - correct Flask setup with frontend routing"
echo "✓ 已提交"

# 步骤5: 推送到GitHub
echo ""
echo "步骤5: 推送到GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✓ 已推送成功"
else
    echo "✗ 推送失败，尝试强制推送..."
    git push -f origin main
fi

echo ""
echo "=========================================="
echo "✓ 修复完成！"
echo "=========================================="
echo ""
echo "下一步:"
echo "1. 等待 3-5 分钟让 Render 重新部署"
echo "2. 访问 https://baby-expense-app-new-1.onrender.com/"
echo "3. 应该看到前端界面"
echo ""
