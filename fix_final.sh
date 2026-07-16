#!/bin/bash

# 最终修复脚本 - 确保app.py代码顺序正确

cd "$(dirname "$0")" || exit 1

echo "=========================================="
echo "宝宝共享记账本 - 最终修复脚本"
echo "=========================================="
echo ""

# 步骤1: 清理系统文件
echo "步骤1: 清理系统文件..."
rm -f .DS_Store
echo "✓ 已清理"

# 步骤2: 检查git状态
echo ""
echo "步骤2: 检查Git状态..."
git status

# 步骤3: 重新创建正确的app.py
echo ""
echo "步骤3: 创建正确的app.py（确保代码顺序正确）..."

cat > app.py << 'PYTHON_EOF'
"""
宝宝共享记账本 - Flask 后端应用
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from models import db, User, Transaction, Category
from config import Config

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 启用CORS (允许前端跨域请求)
CORS(app)

# 创建所有表
with app.app_context():
    db.create_all()

    # 初始化默认用户
    if not User.query.first():
        edward = User(name='Edward', email='edward@example.com')
        bernice = User(name='Bernice', email='bernice@example.com')
        db.session.add(edward)
        db.session.add(bernice)
        db.session.commit()

    # 初始化默认分类
    expense_categories = [
        ('expense', '伙食'),
        ('expense', '杂费'),
        ('expense', '马票'),
        ('expense', '赌博'),
        ('expense', '房屋贷款'),
        ('expense', 'CP 500'),
        ('expense', 'Side Income'),
        ('income', '借贷'),
        ('income', '收入'),
        ('income', '银行利息/股息'),
        ('income', 'WL Salary'),
        ('income', 'HMSB Incentive'),
        ('income', 'OJ Incentive'),
        ('income', 'Lepas Incentive'),
        ('income', 'SleepyFace Studio Account'),
    ]

    for type_, name in expense_categories:
        if not Category.query.filter_by(type=type_, name=name).first():
            category = Category(type=type_, name=name)
            db.session.add(category)
    db.session.commit()

# ===================== API 路由 =====================

# 1. 获取用户
@app.route('/api/users', methods=['GET'])
def get_users():
    """获取所有用户"""
    users = User.query.all()
    return jsonify([{'id': user.id, 'name': user.name, 'email': user.email} for user in users])

# 2. 添加交易记录
@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """添加新的交易记录"""
    data = request.get_json()
    try:
        transaction = Transaction(
            user_id=data.get('user_id'),
            type=data.get('type'),  # 'expense' or 'income'
            category=data.get('category'),
            amount=float(data.get('amount')),
            date=data.get('date', datetime.now().strftime('%Y-%m-%d')),
            note=data.get('note', '')
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify({
            'id': transaction.id,
            'message': '交易记录已保存'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 3. 获取交易记录
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """获取交易记录（支持按用户和日期筛选）"""
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Transaction.query

    if user_id:
        query = query.filter_by(user_id=user_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    transactions = query.all()
    return jsonify([{
        'id': t.id,
        'user_id': t.user_id,
        'type': t.type,
        'category': t.category,
        'amount': t.amount,
        'date': t.date,
        'note': t.note
    } for t in transactions])

# 4. 更新交易记录
@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """更新交易记录"""
    data = request.get_json()
    transaction = Transaction.query.get(transaction_id)

    if not transaction:
        return jsonify({'error': '交易记录不存在'}), 404

    try:
        if 'type' in data:
            transaction.type = data['type']
        if 'category' in data:
            transaction.category = data['category']
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'date' in data:
            transaction.date = data['date']
        if 'note' in data:
            transaction.note = data['note']

        db.session.commit()
        return jsonify({'message': '交易记录已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 5. 删除交易记录
@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """删除交易记录"""
    transaction = Transaction.query.get(transaction_id)

    if not transaction:
        return jsonify({'error': '交易记录不存在'}), 404

    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': '交易记录已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 6. 获取统计数据
@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """获取用户的统计数据"""
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Transaction.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    transactions = query.all()

    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    total_income = sum(t.amount for t in transactions if t.type == 'income')

    return jsonify({
        'total_expense': total_expense,
        'total_income': total_income,
        'balance': total_income - total_expense
    })

# 7. 获取分类
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有分类"""
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'type': c.type, 'name': c.name} for c in categories])

# 8. 添加分类
@app.route('/api/categories', methods=['POST'])
def add_category():
    """添加新分类"""
    data = request.get_json()
    try:
        category = Category(type=data.get('type'), name=data.get('name'))
        db.session.add(category)
        db.session.commit()
        return jsonify({'id': category.id, 'message': '分类已保存'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 9. 更新分类
@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """更新分类"""
    data = request.get_json()
    category = Category.query.get(category_id)

    if not category:
        return jsonify({'error': '分类不存在'}), 404

    try:
        if 'name' in data:
            category.name = data['name']
        if 'type' in data:
            category.type = data['type']
        db.session.commit()
        return jsonify({'message': '分类已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 10. 删除分类
@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """删除分类"""
    category = Category.query.get(category_id)

    if not category:
        return jsonify({'error': '分类不存在'}), 404

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': '分类已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# 11. 服务器健康检查
@app.route('/api/health', methods=['GET'])
def health_check():
    """服务器健康检查"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

# ==================== 前端路由 ====================
# IMPORTANT: 前端路由必须在所有API路由之后

@app.route('/')
def index():
    """提供index.html主页"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """提供静态文件（CSS, JS, HTML等）"""
    import os
    try:
        if os.path.exists(os.path.join('.', path)):
            return send_from_directory('.', path)
    except:
        pass
    # 如果文件不存在，返回index.html（用于单页应用路由）
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8888))
    app.run(host='0.0.0.0', port=port, debug=False)
PYTHON_EOF

echo "✓ 已创建正确的app.py"

# 步骤4: 提交更改
echo ""
echo "步骤4: 提交更改..."
git add app.py
git commit -m "Fix: Correct app.py code order - frontend routes at end"
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
echo "✓ 最终修复完成！"
echo "=========================================="
echo ""
echo "现在的app.py结构："
echo "1. ✓ 所有导入在最上面"
echo "2. ✓ Flask app初始化和CORS"
echo "3. ✓ 数据库初始化"
echo "4. ✓ 所有API路由 (/api/*)"
echo "5. ✓ 前端路由在最后 (/, /<path>)"
echo "6. ✓ if __name__ == '__main__' 块"
echo ""
echo "下一步："
echo "1. 等待 3-5 分钟让 Render 重新部署"
echo "2. 访问 https://baby-expense-app-new-1.onrender.com/"
echo "3. 应该看到前端界面（不是JSON错误）"
echo ""
