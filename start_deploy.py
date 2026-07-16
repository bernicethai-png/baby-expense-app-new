#!/usr/bin/env python3
"""
启动部署脚本 - 直接执行所有必要的操作
"""

import os
import sys
import stat
import subprocess

def make_executable(filepath):
    """给文件添加可执行权限"""
    st = os.stat(filepath)
    os.chmod(filepath, st.st_mode | stat.S_IEXEC)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # 给.command文件添加可执行权限
    command_file = os.path.join(script_dir, '🚀-部署.command')
    if os.path.exists(command_file):
        make_executable(command_file)
        print(f"✓ 已给{command_file}添加可执行权限")

    # 执行deploy_now.py
    deploy_script = os.path.join(script_dir, 'deploy_now.py')
    if os.path.exists(deploy_script):
        print(f"\n执行部署脚本: {deploy_script}\n")
        os.system(f'cd "{script_dir}" && python3 deploy_now.py')
    else:
        print(f"✗ 找不到 {deploy_script}")
        return False

    return True

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)
