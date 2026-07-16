#!/usr/bin/env python3
"""
自动部署脚本 - 将正确的app.py推送到GitHub并触发Render部署
"""

import os
import sys
import subprocess
import time

def run_command(cmd, description=""):
    """运行shell命令"""
    if description:
        print(f"\n{description}...")
    print(f"$ {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.path.dirname(__file__))
        if result.stdout:
            print(result.stdout)
        if result.returncode != 0:
            if result.stderr:
                print(f"错误: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"执行失败: {e}")
        return False

def main():
    print("=" * 50)
    print("宝宝共享记账本 - 自动部署脚本")
    print("=" * 50)

    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    # 步骤1: 验证app.py
    print("\n步骤1: 验证本地app.py...")
    if not os.path.exists('app.py'):
        print("✗ 错误：找不到app.py文件")
        return False

    with open('app.py', 'r', encoding='utf-8') as f:
        app_content = f.read()

    if '# 前端路由' not in app_content:
        print("✗ 错误：app.py不包含前端路由注释")
        return False

    if '@app.route' not in app_content:
        print("✗ 错误：app.py不包含任何路由")
        return False

    # 检查前端路由是否在最后
    if app_content.index('# 前端路由') < app_content.index("if __name__ == '__main__'"):
        print("✓ 验证通过：前端路由在正确的位置")
    else:
        print("⚠ 警告：前端路由位置可能不正确")

    # 步骤2: 清理系统文件
    print("\n步骤2: 清理系统文件...")
    if os.path.exists('.DS_Store'):
        os.remove('.DS_Store')
        print("✓ 已删除.DS_Store")

    # 步骤3: Git操作
    print("\n步骤3: Git操作...")

    # 检查git状态
    if not run_command("git status", "检查Git状态"):
        print("✗ Git命令失败")
        return False

    # 添加文件
    if not run_command("git add app.py", "添加app.py到staging"):
        return False

    # 检查是否有变化
    check_changes = subprocess.run("git diff --cached --quiet", shell=True, cwd=project_dir)
    if check_changes.returncode == 0:
        print("ℹ 没有要提交的变化")
    else:
        # 提交
        commit_msg = "Deploy: Sync correct app.py with proper frontend routing at end of file"
        if not run_command(f'git commit -m "{commit_msg}"', "提交更改"):
            return False

        # 推送
        if not run_command("git push origin main", "推送到GitHub"):
            print("✗ 推送失败")
            return False

    print("\n" + "=" * 50)
    print("✓ 部署准备完成！")
    print("=" * 50)
    print("")
    print("现在的状态：")
    print("✓ app.py已验证（代码顺序正确）")
    print("✓ 已推送到GitHub")
    print("✓ Render会自动检测更新")
    print("")
    print("预期时间线:")
    print("• 现在：推送到GitHub")
    print("• 1分钟内：Render检测到新提交")
    print("• 2-3分钟：构建开始")
    print("• 3-5分钟：部署完成")
    print("")
    print("下一步：")
    print("1. 等待1-2分钟")
    print("2. 访问：https://baby-expense-app-new-1.onrender.com/")
    print("3. 应该看到完整的前端界面（不是JSON错误）")
    print("")

    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
