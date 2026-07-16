#!/usr/bin/env python3
"""
自动部署 - 无需任何用户输入
"""
import os
import subprocess
import sys
from pathlib import Path

# 获取脚本所在目录
script_dir = Path(__file__).parent.absolute()
os.chdir(script_dir)

print("=" * 70)
print("宝宝共享记账本 - 自动部署系统")
print("=" * 70)
print(f"\n项目目录: {script_dir}")

# 验证app.py存在并且内容正确
app_py = script_dir / "app.py"
if not app_py.exists():
    print("✗ 错误: 找不到 app.py")
    sys.exit(1)

with open(app_py, 'r', encoding='utf-8') as f:
    app_content = f.read()

# 验证代码结构
if '# 前端路由' not in app_content:
    print("✗ 错误: app.py 不包含前端路由")
    sys.exit(1)

if "if __name__ == '__main__'" not in app_content:
    print("✗ 错误: app.py 不包含主块")
    sys.exit(1)

print("✓ app.py 结构验证通过")

# 验证Git仓库
git_dir = script_dir / ".git"
if not git_dir.exists():
    print("✗ 错误: 这不是一个Git仓库")
    sys.exit(1)

print("✓ 确认这是一个Git仓库")

# 执行Git操作
try:
    print("\n" + "=" * 70)
    print("执行 Git 部署操作...")
    print("=" * 70)

    # 1. 检查状态
    result = subprocess.run(
        ['git', 'status', '--porcelain'],
        capture_output=True,
        text=True,
        cwd=str(script_dir)
    )

    if result.returncode != 0:
        print(f"✗ Git状态检查失败: {result.stderr}")
        sys.exit(1)

    # 2. 添加文件
    print("\n步骤 1: 添加 app.py...")
    result = subprocess.run(
        ['git', 'add', 'app.py'],
        capture_output=True,
        text=True,
        cwd=str(script_dir)
    )

    if result.returncode != 0:
        print(f"✗ 添加文件失败: {result.stderr}")
        sys.exit(1)
    print("✓ 已添加 app.py")

    # 3. 检查是否有待提交的更改
    result = subprocess.run(
        ['git', 'diff', '--cached', '--quiet'],
        cwd=str(script_dir)
    )

    if result.returncode == 0:
        print("\n✓ 没有新的更改需要提交")
        print("✓ 本地 app.py 已经与 GitHub 同步")
        print("\n检查 Render 部署状态...")
        print("访问: https://baby-expense-app-new-1.onrender.com/")
        sys.exit(0)

    # 4. 提交更改
    print("\n步骤 2: 提交更改...")
    result = subprocess.run(
        ['git', 'commit', '-m', 'Deploy: Sync app.py with correct code structure'],
        capture_output=True,
        text=True,
        cwd=str(script_dir)
    )

    if result.returncode != 0:
        print(f"✗ 提交失败: {result.stderr}")
        sys.exit(1)
    print("✓ 已提交: 'Deploy: Sync app.py with correct code structure'")

    # 5. 推送到GitHub
    print("\n步骤 3: 推送到 GitHub...")
    result = subprocess.run(
        ['git', 'push', 'origin', 'main'],
        capture_output=True,
        text=True,
        cwd=str(script_dir)
    )

    if result.returncode != 0:
        print(f"✗ 推送失败: {result.stderr}")
        sys.exit(1)
    print("✓ 已推送到 GitHub")

    print("\n" + "=" * 70)
    print("✓ 部署完成！")
    print("=" * 70)
    print("\n预期时间表:")
    print("  • 现在: 已推送到 GitHub")
    print("  • 1-2 分钟: Render 检测到新提交")
    print("  • 2-3 分钟: 开始构建")
    print("  • 3-5 分钟: 部署完成")
    print("\n✓ 请访问: https://baby-expense-app-new-1.onrender.com/")
    print("✓ 应该看到完整的前端界面（不是 JSON 错误）")
    print("\n")

except Exception as e:
    print(f"\n✗ 错误: {e}")
    sys.exit(1)
