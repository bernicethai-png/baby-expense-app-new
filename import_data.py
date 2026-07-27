#!/usr/bin/env python3
"""
宝宝记账本 - 数据导入脚本
直接从本地 SQLite 数据库导入数据到 Supabase PostgreSQL
"""

import sqlite3
import psycopg2
from urllib.parse import quote
import json

# 配置
SQLITE_DB = "instance/database.db"
PG_PASSWORD = "358561@Abcd"  # 需要替换为你的实际密码
PG_HOST = "db.cqqfssvcthbcuprbxvnn.supabase.co"
PG_USER = "postgres"
PG_DB = "postgres"

def main():
    print("=" * 70)
    print("🚀 宝宝记账本 - 数据导入工具")
    print("=" * 70)

    # 编码密码中的特殊字符
    encoded_password = quote(PG_PASSWORD, safe='')
    pg_conn_str = f"postgresql://{PG_USER}:{encoded_password}@{PG_HOST}:5432/{PG_DB}"

    try:
        # 连接到本地 SQLite 数据库
        print("\n1️⃣  正在连接到本地 SQLite 数据库...")
        sqlite_conn = sqlite3.connect(SQLITE_DB)
        sqlite_cursor = sqlite_conn.cursor()
        print("   ✅ SQLite 连接成功")

        # 连接到 Supabase PostgreSQL
        print("\n2️⃣  正在连接到 Supabase PostgreSQL...")
        pg_conn = psycopg2.connect(pg_conn_str)
        pg_cursor = pg_conn.cursor()
        print("   ✅ PostgreSQL 连接成功")

        # 导入 users
        print("\n3️⃣  导入 users 表...")
        sqlite_cursor.execute("SELECT id, name, email, created_at FROM users")
        users = sqlite_cursor.fetchall()

        imported_users = 0
        for user in users:
            user_id, name, email, created_at = user
            try:
                pg_cursor.execute(
                    "INSERT INTO users (id, name, email, created_at) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (user_id, name, email, created_at)
                )
                imported_users += 1
                print(f"   ✓ {name}")
            except Exception as e:
                print(f"   ⚠ {name}: {e}")

        print(f"   📊 共导入 {imported_users} 个用户")

        # 导入 categories
        print("\n4️⃣  导入 categories 表...")
        sqlite_cursor.execute("SELECT id, type, name, created_at FROM categories")
        categories = sqlite_cursor.fetchall()

        imported_categories = 0
        for category in categories:
            cat_id, cat_type, name, created_at = category
            try:
                pg_cursor.execute(
                    "INSERT INTO categories (id, type, name, created_at) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (cat_id, cat_type, name, created_at)
                )
                imported_categories += 1
                if imported_categories <= 5:
                    print(f"   ✓ {name}")
            except Exception as e:
                print(f"   ⚠ {name}: {e}")

        if imported_categories > 5:
            print(f"   ...")
        print(f"   📊 共导入 {imported_categories} 个分类")

        # 导入 transactions
        print("\n5️⃣  导入 transactions 表...")
        sqlite_cursor.execute(
            "SELECT id, user_id, type, category, amount, date, note, created_at, updated_at FROM transactions"
        )
        transactions = sqlite_cursor.fetchall()

        imported_transactions = 0
        for trans in transactions:
            trans_id, user_id, trans_type, category, amount, date, note, created_at, updated_at = trans
            try:
                pg_cursor.execute(
                    """INSERT INTO transactions (id, user_id, type, category, amount, date, note, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING""",
                    (trans_id, user_id, trans_type, category, amount, date, note, created_at, updated_at)
                )
                imported_transactions += 1
            except Exception as e:
                print(f"   ⚠ 交易 ID {trans_id}: {e}")

        print(f"   📊 共导入 {imported_transactions} 条交易记录")

        # 提交所有更改
        pg_conn.commit()

        print("\n" + "=" * 70)
        print("✅ 数据导入完成！")
        print("=" * 70)
        print(f"\n导入摘要:")
        print(f"  • Users:        {imported_users}")
        print(f"  • Categories:   {imported_categories}")
        print(f"  • Transactions: {imported_transactions}")
        print(f"\n现在可以访问 https://baby-expense-app-v3.vercel.app/ 查看数据")
        print("=" * 70)

        # 关闭连接
        sqlite_cursor.close()
        sqlite_conn.close()
        pg_cursor.close()
        pg_conn.close()

    except psycopg2.OperationalError as e:
        print(f"\n❌ PostgreSQL 连接失败:")
        print(f"   {e}")
        print(f"\n请检查:")
        print(f"   • 密码是否正确: {PG_PASSWORD[:5]}***")
        print(f"   • 主机是否可达: {PG_HOST}")
        print(f"   • 网络连接是否正常")
    except FileNotFoundError as e:
        print(f"\n❌ 找不到 SQLite 数据库文件:")
        print(f"   {SQLITE_DB}")
        print(f"\n请确保在项目根目录运行此脚本")
    except Exception as e:
        print(f"\n❌ 错误: {e}")

if __name__ == "__main__":
    main()
