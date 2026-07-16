#!/bin/bash

# 修复baby-expense-app-new项目中的app.py文件
# 这个脚本会用正确的版本替换有问题的app.py，并推送到GitHub

set -e  # 如果任何命令失败，脚本会停止

echo "=========================================="
echo "宝宝共享记账本 - 修复脚本"
echo "=========================================="

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "✓ 项目目录: $SCRIPT_DIR"

# 检查是否是Git仓库
if [ ! -d "$SCRIPT_DIR/.git" ]; then
    echo "✗ 错误: 这不是一个Git仓库"
    exit 1
fi

echo "✓ 确认这是一个Git仓库"

# 检查app_fixed.py是否存在
if [ ! -f "$SCRIPT_DIR/app_fixed.py" ]; then
    echo "✗ 错误: 找不到 app_fixed.py 文件"
    echo "请确保 app_fixed.py 文件在项目目录中"
    exit 1
fi

echo "✓ 找到 app_fixed.py 文件"

# 备份当前的app.py
if [ -f "$SCRIPT_DIR/app.py" ]; then
    cp "$SCRIPT_DIR/app.py" "$SCRIPT_DIR/app.py.backup"
    echo "✓ 已备份当前的 app.py 为 app.py.backup"
fi

# 复制正确的app.py
cp "$SCRIPT_DIR/app_fixed.py" "$SCRIPT_DIR/app.py"
echo "✓ 已用 app_fixed.py 的内容替换 app.py"

# 检查git状态
echo ""
echo "检查Git状态..."
git -C "$SCRIPT_DIR" status

# 提交更改
echo ""
echo "正在提交更改..."
git -C "$SCRIPT_DIR" add app.py
git -C "$SCRIPT_DIR" commit -m "Fix app.py - correct Flask setup with frontend routing at end of file"
echo "✓ 已成功提交更改"

# 推送到GitHub
echo ""
echo "正在推送到GitHub..."
git -C "$SCRIPT_DIR" push origin main
echo "✓ 已成功推送到GitHub"

echo ""
echo "=========================================="
echo "✓ 修复完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. Render 应该在几分钟内自动检测到更改并重新部署"
echo "2. 访问 https://baby-expense-app-new-1.onrender.com/ 来查看更新的应用"
echo "3. 应该看到前端界面而不是JSON错误"
echo ""
