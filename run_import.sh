#!/bin/bash

# 宝宝记账本 - 一键数据导入脚本 (macOS/Linux)

set -e

echo "========================================================================"
echo "💰 宝宝记账本 - 数据导入工具"
echo "========================================================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python 3"
    echo "请先安装 Python 3：https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python 已安装"

# 检查并安装 psycopg2
echo "检查 psycopg2..."
if ! python3 -c "import psycopg2" 2>/dev/null; then
    echo "📦 正在安装 psycopg2..."
    pip3 install psycopg2-binary
    echo "✅ psycopg2 已安装"
else
    echo "✅ psycopg2 已安装"
fi

echo ""
echo "开始导入数据..."
echo "========================================================================"

python3 import_data.py

echo ""
echo "========================================================================"
echo "✅ 导入完成！"
echo "请访问 https://baby-expense-app-v3.vercel.app/ 查看数据"
echo "========================================================================"
