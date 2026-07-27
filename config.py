import os

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # 部分服务商（包括 Neon）给出的连接串前缀是 postgres://，
    # 但 SQLAlchemy 2.0 要求 postgresql://
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_URI = DATABASE_URL
else:
    # 未配置 DATABASE_URL 时（本地开发），退回本地 SQLite 文件
    DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(DB_DIR, exist_ok=True)
    SQLALCHEMY_URI = 'sqlite:///' + os.path.join(DB_DIR, 'database.db')

class Config:
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
