# 💰 宝宝记账本 - 数据导入解决方案

## 问题
你的本地 SQLite 数据库中有 13 条交易记录，但 Vercel 上的应用连接到空的 Supabase 数据库，导致显示 RM0.00。

## 原因
- **本地数据库**：`instance/database.db` (SQLite)
  - 包含 2 个用户、16 个分类、13 条交易记录
  
- **线上数据库**：Supabase PostgreSQL
  - 主机：db.cqqfssvcthbcuprbxvnn.supabase.co
  - 用户：postgres
  - 密码：358561@Abcd
  - **状态**：空（没有数据）

## 解决方案
已为你准备了完整的数据导入工具。

### 📦 提供的文件

| 文件 | 用途 |
|-----|------|
| `import_data.py` | Python 导入脚本（核心） |
| `run_import.sh` | macOS/Linux 一键运行脚本 |
| `run_import.bat` | Windows 一键运行脚本 |
| `IMPORT_QUICK_START.txt` | 快速开始指南 |
| `DATA_IMPORT_GUIDE.md` | 详细导入指南 |
| `import-data.json` | 导出的 JSON 数据（备用） |

### 🚀 使用方式（最简单）

#### 方式 1：macOS/Linux
```bash
cd /path/to/baby-expense-app-new
./run_import.sh
```

#### 方式 2：Windows
```bash
cd \path\to\baby-expense-app-new
run_import.bat
```

#### 方式 3：手动运行
```bash
pip install psycopg2-binary
python import_data.py
```

### ⚙️ 脚本做什么

1. **连接本地 SQLite** → 读取你已填入的数据
2. **连接 Supabase PostgreSQL** → 使用你提供的数据库凭据
3. **导入数据**：
   - 2 个用户 (Edward, Bernice)
   - 16 个分类 (伙食、杂费、房屋贷款等)
   - 13 条交易记录

### ✅ 导入后验证

运行脚本后，访问：
👉 **https://baby-expense-app-v3.vercel.app/**

验证清单：
- [ ] 首页显示月收入、月支出（数字不是 RM0.00）
- [ ] 账单页面显示 13 条交易
- [ ] 统计页面显示柱状图
- [ ] 可以切换用户（Edward/Bernice）
- [ ] 可以添加新交易

## 技术细节

### 导入脚本工作流程

```
import_data.py
    ↓
1. 检查 SQLite 数据库存在
    ↓
2. 连接 Supabase PostgreSQL（需要网络）
    ↓
3. 导入用户表 (users)
    ↓
4. 导入分类表 (categories)
    ↓
5. 导入交易表 (transactions)
    ↓
6. 提交事务 (commit)
```

### 关键特性

- ✅ **冲突处理**：如果 ID 已存在则跳过（使用 ON CONFLICT DO NOTHING）
- ✅ **时间戳保留**：保留原始的 created_at/updated_at
- ✅ **错误处理**：即使某条记录失败，继续处理其他记录
- ✅ **详细日志**：显示每个导入步骤的状态

### 数据库连接

```
PostgreSQL 连接字符串:
postgresql://postgres:358561@Abcd@db.cqqfssvcthbcuprbxvnn.supabase.co:5432/postgres

注意：密码中的 @ 会被 URL 编码为 %40
```

## 故障排除

### 网络错误
```
❌ could not translate host name
```
**解决**：检查网络连接。如果在国内，可能需要 VPN。

### Python 错误
```
❌ ModuleNotFoundError: No module named 'psycopg2'
```
**解决**：
```bash
pip install psycopg2-binary
```

### 权限错误
```
❌ PermissionError: [Errno 13] Permission denied
```
**解决**：确保 import_data.py 有读权限，数据库可写。

### 数据库错误
```
❌ FATAL: too many connections
```
**解决**：Supabase 连接池满。稍后重试。

## 下一步

### 部署新代码
我还创建了网页导入功能（需要 git push）。暂时先用 import_data.py 导入数据。

### 数据备份
导入完成后，可以保留 `instance/database.db` 作为本地备份。

### 日常使用
- 在网页上继续添加新交易
- 每月检查统计数据
- 定期导出数据备份（功能待开发）

## 常见问题

**Q: 为什么要导入数据？**
A: 本地 SQLite 和远程 Supabase 是两个独立的数据库。你在本地填入的数据需要同步到 Supabase，网页应用才能看到。

**Q: 导入会删除现有数据吗？**
A: 不会。脚本使用 ON CONFLICT DO NOTHING，只添加新数据，不修改现有数据。

**Q: 导入后还需要本地数据库吗？**
A: 不需要。可以保留作为备份，但应用已完全迁移到 Supabase。

**Q: 可以重复导入吗？**
A: 可以。相同 ID 的记录会被跳过，新记录会被添加。

**Q: 导入需要多长时间？**
A: 通常 < 5 秒（取决于网速）。

## 获取帮助

如果遇到问题，请提供：
1. 完整的错误消息
2. 运行的命令
3. Python 版本：`python --version`
4. psycopg2 版本：`pip show psycopg2-binary`
5. 网络连接状态

## 总结

✅ **已准备好**：import_data.py + 运行脚本
✅ **配置完成**：Supabase 连接字符串已配置
✅ **数据就绪**：13 条交易等待导入
⏳ **你的行动**：运行 run_import.sh 或 run_import.bat

**预计耗时**：5 分钟（包括安装依赖）

---

**最后更新**：2026-07-27 18:40
