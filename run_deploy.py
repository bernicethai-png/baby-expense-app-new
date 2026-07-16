#!/usr/bin/env python3
"""
直接执行部署 - 这个脚本会自动处理所有git操作
"""

import os
import sys
import subprocess
import time

def main():
    # 改变到项目目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print("=" * 60)
    print("宝宝共享记账本 - 自动部署程序")
    print("=" * 60)
    print(f"\n项目目录: {os.getcwd()}")
    print(f"当前时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # 验证app.py存在
    if not os.path.exists('app.py'):
        print("\n✗ 错误: 找不到 app.py")
        return False

    print("\n✓ 找到 app.py")

    # 检查app.py的内容
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()

    if '# 前端路由' not in content:
        print("✗ 错误: app.py不包含前端路由")
        return False

    # 检查代码顺序
    app_index = content.find('app = Flask')
    frontend_index = content.find('# 前端路由')
    main_index = content.find("if __name__ == '__main__'")

    if not (app_index < frontend_index < main_index):
        print("✗ 错误: 代码顺序不正确")
        return False

    print("✓ app.py格式验证通过")

    # 检查git是否初始化
    if not os.path.exists('.git'):
        print("✗ 错误: 这不是一个git仓库")
        return False

    print("✓ 这是一个git仓库")

    # 清理系统文件
    if os.path.exists('.DS_Store'):
        os.remove('.DS_Store')
        print("✓ 已清理 .DS_Store")

    # 执行git操作
    print("\n" + "-" * 60)
    print("执行 Git 操作...")
    print("-" * 60)

    try:
        # 查看git状态
        result = subprocess.run(['git', 'status', '--short'], capture_output=True, text=True, check=True)
        if result.stdout:
            print("\n待提交的变化:")
            print(result.stdout)
        else:
            print("\n✓ 工作目录干净，没有待提交的变化")
            print("✓ app.py 已经是最新的版本")

        # 添加app.py
        subprocess.run(['git', 'add', 'app.py'], capture_output=True, check=True)
        print("✓ 已添加 app.py")

        # 检查是否有需要提交的变化
        result = subprocess.run(['git', 'diff', '--cached', '--quiet'], capture_output=True)

        if result.returncode != 0:
            # 有变化，执行提交
            commit_msg = "Deploy: Sync correct app.py with proper code order"
            subprocess.run(['git', 'commit', '-m', commit_msg], capture_output=True, check=True)
            print(f"✓ 已提交: '{commit_msg}'")

            # 推送到GitHub
            result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ 已推送到 GitHub")
            else:
                print("✗ 推送失败:")
                print(result.stderr)
                return False
        else:
            print("✓ 没有新的变化需要提交")
            print("  本地app.py已经与GitHub同步")

        print("\n" + "=" * 60)
        print("✓ 部署完成!")
        print("=" * 60)
        print("\n预期时间表:")
        print("  • 1-2 分钟: Render 检测到新提交")
        print("  • 2-3 分钟: 开始构建")
        print("  • 3-5 分钟: 部署完成")
        print("\n✓ 请访问: https://baby-expense-app-new-1.onrender.com/")
        print("✓ 应该看到完整的前端界面（不是 JSON 错误）")
        print("\n")

        return True

    except subprocess.CalledProcessError as e:
        print(f"\n✗ Git 操作失败:")
        print(f"  错误: {e}")
        return False
    except Exception as e:
        print(f"\n✗ 发生错误: {e}")
        return False

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n操作被中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n未预期的错误: {e}")
        sys.exit(1)
