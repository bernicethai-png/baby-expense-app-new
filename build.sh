#!/bin/bash
set -e

# 升级 pip
pip install --upgrade pip setuptools wheel

# 安装依赖
pip install -r requirements.txt

# 清除 Python 缓存
find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo "Build complete - Dependencies installed with clean cache"
