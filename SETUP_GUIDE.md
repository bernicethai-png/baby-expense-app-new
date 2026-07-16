# 🚀 前后端联调设置指南

## ⚠️ 常见问题：保存失败 "Load failed"

这个错误表示**前端无法连接到后端服务器**。

### 解决步骤：

#### 1️⃣ **确保后端服务器正在运行**

打开**终端/命令行**，运行：

```bash
cd /Users/bernice_thai/Library/Application\ Support/Claude/local-agent-mode-sessions/29bd4165-97ed-414f-bde1-d74063788a9e/127d4029-ec82-4870-90a6-9a43166f706e/local_2b1a86c1-1848-4bea-a22f-0ff215bd2fdd/outputs

# 安装依赖（第一次运行）
pip install -r requirements.txt

# 启动服务器
python app.py
```

**正常输出应该显示：**
```
启动 宝宝共享记账本 后端服务器...
服务器运行在 http://localhost:5000
数据库位置: instance/database.db
 * Running on http://0.0.0.0:5000
```

#### 2️⃣ **打开前端**

在浏览器中打开：
```
file:///Users/bernice_thai/Library/Application\ Support/Claude/local-agent-mode-sessions/29bd4165-97ed-414f-bde1-d74063788a9e/127d4029-ec82-4870-90a6-9a43166f706e/local_2b1a86c1-1848-4bea-a22f-0ff215bd2fdd/outputs/index.html
```

或者，更简单的方式：
- 在Finder中找到 `index.html` 文件
- 右键点击 → "打开方式" → 选择你的浏览器

#### 3️⃣ **打开浏览器开发者工具查看错误**

1. 在浏览器中按 `F12` 或 `右键 → 检查`
2. 点击 "Console" 标签
3. 尝试添加一条记录
4. 查看控制台输出，会显示详细的错误信息

#### 4️⃣ **测试服务器连接**

在浏览器地址栏输入：
```
http://localhost:5000/api/health
```

如果看到 `{"status":"ok","message":"服务器运行正常"}` 说明服务器正常运行。

### 🔧 故障排查

| 问题 | 解决方案 |
|-----|--------|
| `ModuleNotFoundError: No module named 'flask'` | 运行 `pip install -r requirements.txt` |
| `Address already in use` | 端口 5000 被占用，修改 app.py 最后一行的 port |
| `Failed to fetch` | 后端服务器没有运行，请先运行 `python app.py` |
| `CORS error` | 刷新浏览器，确保后端服务器正在运行 |

### ✅ 验证步骤

1. ✅ 终端显示"服务器运行在 http://localhost:5000"
2. ✅ 访问 http://localhost:5000/api/health 返回成功
3. ✅ 打开前端，打开开发者工具（F12）
4. ✅ 在"记账"页面填写数据并保存
5. ✅ Console 中应该显示详细的请求/响应日志

### 📝 注意事项

- 确保 Python 已安装（Python 3.7+）
- 确保两个终端窗口分开：一个运行后端，一个用于其他操作
- 不要关闭后端终端窗口，除非你想停止服务器

### 🆘 还是不行？

1. 在浏览器 Console 中截图错误信息
2. 在后端终端中截图启动信息
3. 告诉我这两个截图，我会帮助诊断
