from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os
from models import db, User, Transaction, Category
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()
    if not User.query.first():
        db.session.add(User(name='Edward', email='edward@example.com'))
        db.session.add(User(name='Bernice', email='bernice@example.com'))
        db.session.commit()
    if not Category.query.first():
        for t, n in [('expense','伙食'),('expense','杂费'),('expense','马票'),('expense','赌博'),('expense','房屋贷款'),('expense','CP 500'),('expense','Side Income'),('income','借贷'),('income','收入'),('income','银行利息/股息'),('income','WL Salary'),('income','HMSB Incentive'),('income','OJ Incentive'),('income','Lepas Incentive'),('income','SleepyFace Studio Account')]:
            if not Category.query.filter_by(type=t, name=n).first():
                db.session.add(Category(type=t, name=n))
        db.session.commit()

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify([{'id': u.id, 'name': u.name, 'email': u.email} for u in User.query.all()])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    try:
        data = request.get_json()
        t = Transaction(user_id=data.get('user_id'), type=data.get('type'), category=data.get('category'), amount=float(data.get('amount')), date=data.get('date', datetime.now().strftime('%Y-%m-%d')), note=data.get('note', ''))
        db.session.add(t)
        db.session.commit()
        return jsonify({'success': True, 'id': t.id, 'message': '交易记录已保存'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    t = Transaction.query.get(transaction_id)
    if not t:
        return jsonify({'success': False, 'error': '记录不存在'}), 404
    try:
        data = request.get_json()
        if 'amount' in data: t.amount = float(data['amount'])
        if 'category' in data: t.category = data['category']
        if 'note' in data: t.note = data['note']
        if 'date' in data: t.date = data['date']
        db.session.commit()
        return jsonify({'success': True, 'message': '记录已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    t = Transaction.query.get(transaction_id)
    if not t:
        return jsonify({'success': False, 'error': '记录不存在'}), 404
    try:
        db.session.delete(t)
        db.session.commit()
        return jsonify({'success': True, 'message': '记录已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    user_id, start_date, end_date = request.args.get('user_id'), request.args.get('start_date'), request.args.get('end_date')
    q = Transaction.query
    if user_id: q = q.filter_by(user_id=user_id)
    if start_date: q = q.filter(Transaction.date >= start_date)
    if end_date: q = q.filter(Transaction.date <= end_date)
    return jsonify([{'id': t.id, 'user_id': t.user_id, 'user_name': t.user.name, 'type': t.type, 'category': t.category, 'amount': t.amount, 'date': t.date, 'note': t.note, 'created_at': t.created_at.isoformat()} for t in q.all()])

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """获取本月统计数据"""
    user_id = request.args.get('user_id', type=int)

    today = datetime.now()
    month_start = today.replace(day=1).strftime('%Y-%m-%d')
    month_end = today.strftime('%Y-%m-%d')

    q = Transaction.query.filter(Transaction.date >= month_start, Transaction.date <= month_end)
    if user_id: q = q.filter_by(user_id=user_id)
    ts = q.all()

    total_expense = sum(t.amount for t in ts if t.type == 'expense')
    total_income = sum(t.amount for t in ts if t.type == 'income')

    expense_by_category = {}
    income_by_category = {}
    for t in ts:
        target = expense_by_category if t.type == 'expense' else income_by_category
        target[t.category] = target.get(t.category, 0) + t.amount

    user_stats = {}
    user_income_by_category = {}
    user_expense_by_category = {}
    for user in User.query.all():
        user_ts = Transaction.query.filter(
            Transaction.date >= month_start,
            Transaction.date <= month_end,
            Transaction.user_id == user.id
        ).all()
        user_stats[user.name] = {
            'income': sum(t.amount for t in user_ts if t.type == 'income'),
            'expense': sum(t.amount for t in user_ts if t.type == 'expense'),
        }
        income_cat, expense_cat = {}, {}
        for t in user_ts:
            target = expense_cat if t.type == 'expense' else income_cat
            target[t.category] = target.get(t.category, 0) + t.amount
        user_income_by_category[user.name] = income_cat
        user_expense_by_category[user.name] = expense_cat

    return jsonify({
        'total_expense': total_expense,
        'total_income': total_income,
        'balance': total_income - total_expense,
        'expense_by_category': expense_by_category,
        'income_by_category': income_by_category,
        'user_stats': user_stats,
        'user_income_by_category': user_income_by_category,
        'user_expense_by_category': user_expense_by_category,
        'month': month_start
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify([{'id': c.id, 'type': c.type, 'name': c.name} for c in Category.query.all()])

@app.route('/api/categories', methods=['POST'])
def add_category():
    try:
        data = request.get_json()
        c = Category(type=data.get('type'), name=data.get('name'))
        db.session.add(c)
        db.session.commit()
        return jsonify({'success': True, 'id': c.id, 'message': '分类已保存'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    c = Category.query.get(category_id)
    if not c:
        return jsonify({'success': False, 'error': '分类不存在'}), 404
    try:
        data = request.get_json()
        if 'name' in data: c.name = data['name']
        db.session.commit()
        return jsonify({'success': True, 'message': '分类已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    c = Category.query.get(category_id)
    if not c:
        return jsonify({'success': False, 'error': '分类不存在'}), 404
    try:
        db.session.delete(c)
        db.session.commit()
        return jsonify({'success': True, 'message': '分类已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '未找到请求的资源'}), 404

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        if os.path.exists(os.path.join('.', path)):
            return send_from_directory('.', path)
    except:
        pass
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8888))
    app.run(host='0.0.0.0', port=port, debug=False)
