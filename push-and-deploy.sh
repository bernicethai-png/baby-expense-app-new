#!/bin/bash

# 自动推送代码到GitHub并触发Render部署
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 开始推送代码到GitHub..."
echo "当前目录: $(pwd)"

# 设置Git配置以支持GitHub推送
export GIT_TERMINAL_PROMPT=0

git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功！"
    echo "⏳ Render 正在部署新版本，请在 1-2 分钟后刷新应用..."
    echo ""
    echo "如果1-2分钟后刷新应用还看不到新功能，请访问Render Dashboard手动redeploy:"
    echo "https://dashboard.render.com"
else
    echo "❌ 推送失败，请检查网络连接或GitHub凭证"
    exit 1
fi
