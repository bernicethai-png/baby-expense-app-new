@echo off
REM 宝宝记账本 - 一键数据导入脚本 (Windows)

echo.
echo ========================================================================
echo 💰 宝宝记账本 - 数据导入工具
echo ========================================================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 Python
    echo 请先安装 Python：https://www.python.org/downloads/
    echo 安装时请选择 "Add Python to PATH"
    pause
    exit /b 1
)

echo ✅ Python 已安装

REM 检查并安装 psycopg2
echo 检查 psycopg2...
python -c "import psycopg2" >nul 2>&1
if errorlevel 1 (
    echo 📦 正在安装 psycopg2...
    pip install psycopg2-binary
    echo ✅ psycopg2 已安装
) else (
    echo ✅ psycopg2 已安装
)

echo.
echo 开始导入数据...
echo ========================================================================

python import_data.py

echo.
echo ========================================================================
echo ✅ 导入完成！
echo 请访问 https://baby-expense-app-v3.vercel.app/ 查看数据
echo ========================================================================
pause
