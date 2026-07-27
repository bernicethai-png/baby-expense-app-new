# 数据导入指南

## 问题描述
你的本地 SQLite 数据库中有 11 条已填入的交易记录，但 Vercel 部署的应用连接到空的 Supabase PostgreSQL 数据库，所以显示 RM0.00。

## 解决方案

### 方法一：使用 Python 脚本直接导入（推荐）

这是最快最直接的方法。

#### 前置条件
- 已安装 Python 3.6+
- 已安装 psycopg2 库（PostgreSQL Python 驱动）

#### 步骤

1. **打开终端/命令行**，进入项目目录：
   ```bash
   cd /path/to/baby-expense-app-new
   ```

2. **安装 psycopg2**（如果尚未安装）：
   ```bash
   pip install psycopg2-binary
   ```

3. **编辑 `import_data.py`**，更新数据库密码（第 10 行）：
   ```python
   PG_PASSWORD = "358561@Abcd"  # 替换为你的实际密码
   ```

4. **运行导入脚本**：
   ```bash
   python3 import_data.py
   ```

5. **等待完成**。你应该看到类似如下输出：
   ```
   ======================================================================
   🚀 宝宝记账本 - 数据导入工具
   ======================================================================

   1️⃣  正在连接到本地 SQLite 数据库...
      ✅ SQLite 连接成功

   2️⃣  正在连接到 Supabase PostgreSQL...
      ✅ PostgreSQL 连接成功

   3️⃣  导入 users 表...
      ✓ Edward
      ✓ Bernice
      📊 共导入 2 个用户

   4️⃣  导入 categories 表...
      ✓ 伙食
      ✓ 杂费
      ...
      📊 共导入 16 个分类

   5️⃣  导入 transactions 表...
      📊 共导入 13 条交易记录

   ======================================================================
   ✅ 数据导入完成！
   ======================================================================

   导入摘要:
      • Users:        2
      • Categories:   16
      • Transactions: 13

   现在可以访问 https://baby-expense-app-v3.vercel.app/ 查看数据
   ```

### 方法二：使用浏览器导入（需要先部署更新）

如果 Python 脚本无法运行，可以等待我们将更新部署到 Vercel，然后使用网页上的"导入"按钮。

#### 步骤
1. 等待新代码部署到 Vercel
2. 访问 https://baby-expense-app-v3.vercel.app/
3. 点击用户栏的"📥 导入"按钮
4. 粘贴以下 JSON 数据...（这需要生成完整的 JSON，较为繁琐）

### 方法三：使用 Supabase Web Console

直接通过 Supabase 的 Web 界面插入数据（最繁琐，不推荐）。

## 数据备份

你的本地数据已保存在 `instance/database.db` 中。导入完成后，这个文件就不再需要了。

## 验证导入

导入完成后，访问 https://baby-expense-app-v3.vercel.app/ 应该能看到：

- **首页**：显示月收入、月支出、总余额（不再是 RM0.00）
- **账单**：显示所有已填入的交易记录
- **统计**：显示各类别的收入/支出明细和柱状图

## 故障排除

### 问题：ModuleNotFoundError: No module named 'psycopg2'

**解决**：安装 psycopg2
```bash
pip install psycopg2-binary
```

### 问题：psycopg2.OperationalError: could not translate host name

**解决**：网络连接问题或主机名错误。请检查：
- 网络连接是否正常
- 密码是否正确
- 主机名是否为 `db.cqqfssvcthbcuprbxvnn.supabase.co`

### 问题：FileNotFoundError: instance/database.db

**解决**：确保在项目根目录运行脚本。项目结构应为：
```
baby-expense-app-new/
├── instance/
│   └── database.db
├── api/
├── index.html
├── import_data.py
└── ...
```

## 下一步

导入完成后，你可以：

1. **继续使用应用**：在 https://baby-expense-app-v3.vercel.app/ 上添加新的交易记录
2. **查看统计**：在统计页面查看各月、各类别的数据汇总
3. **导出数据**：（功能待实现）定期备份数据

## 技术细节

- **本地数据库**：SQLite (`instance/database.db`)
  - 2 个用户：Edward, Bernice
  - 16 个分类（支出和收入）
  - 13 条交易记录

- **远程数据库**：Supabase PostgreSQL
  - 主机：db.cqqfssvcthbcuprbxvnn.supabase.co
  - 用户：postgres
  - 密码：358561@Abcd（需要 URL 编码中的 @）

- **导入脚本**：Python 3 with psycopg2
  - 支持冲突处理（如果 ID 已存在则跳过）
  - 保留原始时间戳

## 获取帮助

如有问题，请提供以下信息：
- 错误消息的完整文本
- 运行的命令
- 网络连接状态
- Python 和 psycopg2 的版本

---

**最后更新**：2026-07-27
