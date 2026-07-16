#!/bin/bash

cd "$(dirname "$0")"

python3 deploy_now.py

echo ""
echo "按Enter键关闭此窗口..."
read
