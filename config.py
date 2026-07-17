import os

# 如果挂载了 Render Persistent Disk（挂载路径 /var/data），数据库文件存在磁盘上，
# 不会因为重新部署而丢失；否则退回到本地 instance/ 目录（本地开发用）。
if os.path.isdir('/var/data'):
    DB_DIR = '/var/data'
else:
    DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(DB_DIR, exist_ok=True)

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(DB_DIR, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
