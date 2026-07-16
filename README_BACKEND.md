# 宝宝共享记账本 - 后端服务器

这是一个 Flask 后端应用，为前端提供 API 接口和数据库支持。

## 安装步骤

### 1. 安装依赖包
```bash
pip install -r requirements.txt
```

### 2. 运行服务器
```bash
python app.py
```

服务器将在 `http://localhost:5000` 运行

## API 接口

### 1. 获取所有用户
```
GET /api/users
```

### 2. 添加交易记录
```
POST /api/transactions
Content-Type: application/json

{
    "user_id": 1,
    "type": "expense",  // 或 "income"
    "category": "伙食",
    "amount": 50.00,
    "date": "2024-07-14",
    "note": "午饭"
}
```

### 3. 获取交易记录
```
GET /api/transactions
可选参数:
  - user_id: 用户ID
  - type: 交易类型 (expense/income)
  - date: 日期 (YYYY-MM-DD)

示例: /api/transactions?user_id=1&type=expense
```

### 4. 获取统计数据
```
GET /api/statistics
返回本月的统计信息:
  - total_income: 总收入
  - total_expense: 总支出
  - balance: 结余
  - expense_by_category: 按分类统计支出
  - user_stats: 按用户统计
```

### 5. 编辑交易记录
```
PUT /api/transactions/<transaction_id>
Content-Type: application/json

{
    "amount": 60.00,
    "category": "伙食",
    "note": "晚餐",
    "date": "2024-07-14"
}
```

### 6. 删除交易记录
```
DELETE /api/transactions/<transaction_id>
```

### 7. 获取所有分类
```
GET /api/categories
```

### 8. 健康检查
```
GET /api/health
```

## 数据库结构

### users 表
- id: 主键
- name: 用户名
- email: 邮箱
- created_at: 创建时间

### transactions 表
- id: 主键
- user_id: 用户ID
- type: 交易类型 (expense/income)
- category: 分类
- amount: 金额
- date: 日期
- note: 备注
- created_at: 创建时间
- updated_at: 更新时间

### categories 表
- id: 主键
- type: 分类类型 (expense/income)
- name: 分类名称
- created_at: 创建时间

## 默认用户

系统会自动创建两个默认用户:
- Edward (edward@example.com)
- Bernice (bernice@example.com)

## 默认分类

系统会自动创建以下分类:

**支出分类:**
- 伙食
- 杂费
- 马票
- 赌博
- 房屋贷款
- CP 500
- Side Income
- 借贷

**收入分类:**
- 收入
- 银行利息/股息
- WL Salary
- HMSB Incentive
- OJ Incentive
- Lepas Incentive
- SleepyFace Studio Account

## 前端集成

在前端的 JavaScript 中，使用以下代码调用 API:

```javascript
// 添加交易记录
fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        user_id: 1,
        type: 'expense',
        category: '伙食',
        amount: 50.00,
        date: '2024-07-14',
        note: '午饭'
    })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## 故障排查

### 数据库问题
如果遇到数据库问题，可以删除 `instance/database.db` 文件并重新运行应用，系统会自动创建新的数据库。

### CORS 错误
如果前端出现 CORS 错误，检查服务器是否正确启用了 CORS（已在 app.py 中配置）。

### 端口占用
如果 5000 端口被占用，可以修改 app.py 最后一行的 port 参数。
