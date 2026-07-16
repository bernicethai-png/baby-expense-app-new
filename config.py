"""
Flask配置文件
"""
import os

class Config:
    """配置基类"""
    # SQLAlchemy配置 - 数据库放在当前文件夹
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask配置
    DEBUG = True
    JSON_SORT_KEYS = False
