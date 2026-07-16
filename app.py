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

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

with app.app_context():
    db.create_all()
    if not User.query.first():
        edward = User(name='Edward', email='edward@example.com')
        bernice = User(name='Bernice', email='bernice@example.com')
        db.session.add(edward)
        db.session.add(bernice)
        db.session.commit()
    
    if not Category.query.first():
        categories = [
            ('expense', '伙食'), ('expense', '杂费'), ('expense', '马票'),
            ('expense', '赌博'), ('expense', '房屋贷款'), ('expense', 'CP 500'),
            ('expense', 'Side Income'), ('income', '借贷'), ('income', '收入'),
            ('income', '银行利息/股息'), ('income', 'WL Salary'),
            ('income', 'HMSB Incentive'), ('income', 'OJ Incentive'),
            ('income', 'Lepas Incentive'), ('income', 'SleepyFace Studio Account'),
        ]
        for type_, name in categories:
            if not Category.query.filter_by(type=type_, name=name).first():
                db.session.add(Category(type=type_, name=name))
        db.session.commit()

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'name': u.name, 'email': u.email} for u in users])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    try:
        t = Transaction(user_id=data.get('user_id'), type=data.get('type'),
            category=data.get('category'), amount=float(data.get('amount')),
            date=data.get('date', datetime.now().strftime('%Y-%m-%d')), note=data.get('note', ''))
        db.session.add(t)
        db.session.commit()
        return jsonify({'id': t.id, 'message': '交易记录已保存'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
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
    return jsonify([{'id': t.id, 'user_id': t.user_id, 'type': t.type,
        'category': t.category, 'amount': t.amount, 'date': t.date, 'note': t.note} for t in query.all()])

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    user_id = request.args.get('user_id')
    query = Transaction.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    transactions = query.all()
    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    return jsonify({'total_expense': total_expense, 'total_income': total_income, 'balance': total_income - total_expense})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify([{'id': c.id, 'type': c.type, 'name': c.name} for c in Category.query.all()])

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    try:
        c = Category(type=data.get('type'), name=data.get('name'))
        db.session.add(c)
        db.session.commit()
        return jsonify({'id': c.id, 'message': '分类已保存'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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
