import tkinter as tk
from tkinter import ttk, messagebox
import tkinter.font as tkFont

class AccountingApp:
    """家庭共享记账应用 - Day 1 基础版"""

    def __init__(self, root):
        self.root = root
        self.root.title("💰 家庭记账本")
        self.root.geometry("800x600")

        # 配色方案（蓝色主题）
        self.colors = {
            "primary": "#1e40af",      # 深蓝
            "primary_light": "#3b82f6", # 浅蓝
            "surface": "#f8fafc",      # 背景
            "surface_card": "#ffffff", # 卡片白
            "text_primary": "#1e293b", # 深色文字
            "text_secondary": "#64748b", # 灰色文字
            "border": "#e2e8f0",       # 边框
            "success": "#10b981",      # 成功绿
            "danger": "#ef4444"        # 错误红
        }

        # 设置窗口背景色
        self.root.configure(bg=self.colors["surface"])

        # 创建主框架
        self.main_frame = tk.Frame(self.root, bg=self.colors["surface"])
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # 创建内容区域（顶部，给屏幕显示）
        self.content_frame = tk.Frame(self.main_frame, bg=self.colors["surface"])
        self.content_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)

        # 创建屏幕字典
        self.screens = {}
        self.current_screen = None

        # 初始化所有屏幕
        self._create_screens()

        # 创建底部导航栏
        self._create_bottom_nav()

        # 默认显示首页
        self.show_screen("home")

    def _create_screens(self):
        """创建所有屏幕"""
        screen_names = {
            "home": "首页",
            "add": "记账",
            "bills": "账单",
            "stats": "统计",
            "category": "分类"
        }

        for key, name in screen_names.items():
            # 为每个屏幕创建一个主框架
            frame = tk.Frame(self.content_frame, bg=self.colors["surface"])
            frame.pack(fill=tk.BOTH, expand=True)

            # 添加屏幕内容
            if key == "home":
                self._setup_home_screen(frame)
            elif key == "add":
                self._setup_add_screen(frame)
            elif key == "bills":
                self._setup_bills_screen(frame)
            elif key == "stats":
                self._setup_stats_screen(frame)
            elif key == "category":
                self._setup_category_screen(frame)

            # 保存屏幕
            self.screens[key] = frame

    def _setup_home_screen(self, frame):
        """首页"""
        # 标题
        header = tk.Frame(frame, bg=self.colors["primary"], height=80)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_font = tkFont.Font(family="Helvetica", size=18, weight="bold")
        title = tk.Label(
            header,
            text="💰 家庭记账本",
            font=title_font,
            bg=self.colors["primary"],
            fg="white"
        )
        title.pack(pady=15)

        # 内容区
        content = tk.Frame(frame, bg=self.colors["surface"])
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        # 统计卡片
        stat_font = tkFont.Font(family="Helvetica", size=12)
        stat_value_font = tkFont.Font(family="Helvetica", size=24, weight="bold")

        card = tk.Frame(content, bg=self.colors["surface_card"], relief=tk.FLAT)
        card.pack(fill=tk.X, pady=10)

        # 添加边框
        card.configure(highlightbackground=self.colors["border"], highlightthickness=1)

        tk.Label(
            card,
            text="本月支出",
            font=stat_font,
            bg=self.colors["surface_card"],
            fg=self.colors["text_secondary"]
        ).pack(pady=(15, 5), padx=15)

        tk.Label(
            card,
            text="¥2,560",
            font=stat_value_font,
            bg=self.colors["surface_card"],
            fg=self.colors["text_primary"]
        ).pack(pady=5, padx=15)

        # 预算信息
        info_font = tkFont.Font(family="Helvetica", size=11)
        info_frame = tk.Frame(card, bg=self.colors["surface_card"])
        info_frame.pack(fill=tk.X, padx=15, pady=(10, 15))

        tk.Label(
            info_frame,
            text="预算: ¥5,000",
            font=info_font,
            bg=self.colors["surface_card"],
            fg=self.colors["text_secondary"]
        ).pack(side=tk.LEFT)

        tk.Label(
            info_frame,
            text="剩余: ¥2,440",
            font=info_font,
            bg=self.colors["surface_card"],
            fg=self.colors["text_secondary"]
        ).pack(side=tk.RIGHT)

        # 统计标题
        tk.Label(
            content,
            text="📊 本月分类统计",
            font=tkFont.Font(family="Helvetica", size=12, weight="bold"),
            bg=self.colors["surface"],
            fg=self.colors["text_primary"]
        ).pack(anchor=tk.W, pady=(20, 10))

        # 模拟图表（简单版）
        chart_frame = tk.Frame(content, bg=self.colors["surface_card"], height=200)
        chart_frame.pack(fill=tk.X, pady=10)
        chart_frame.configure(highlightbackground=self.colors["border"], highlightthickness=1)

        tk.Label(
            chart_frame,
            text="[饼图将在 Day 2 添加]\n\n食品: 43%  交通: 22%  娱乐: 35%",
            font=tkFont.Font(family="Helvetica", size=11),
            bg=self.colors["surface_card"],
            fg=self.colors["text_secondary"],
            pady=30
        ).pack(fill=tk.BOTH, expand=True)

    def _setup_add_screen(self, frame):
        """记账屏幕"""
        header = tk.Frame(frame, bg=self.colors["primary"], height=80)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_font = tkFont.Font(family="Helvetica", size=18, weight="bold")
        tk.Label(
            header,
            text="➕ 添加记账",
            font=title_font,
            bg=self.colors["primary"],
            fg="white"
        ).pack(pady=15)

        content = tk.Frame(frame, bg=self.colors["surface"])
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        # 表单字体
        label_font = tkFont.Font(family="Helvetica", size=11, weight="bold")
        entry_font = tkFont.Font(family="Helvetica", size=10)

        # 分类
        tk.Label(
            content,
            text="分类",
            font=label_font,
            bg=self.colors["surface"],
            fg=self.colors["text_primary"]
        ).pack(anchor=tk.W, pady=(15, 5))

        category_var = tk.StringVar(value="食品")
        category_combo = ttk.Combobox(
            content,
            textvariable=category_var,
            values=["🍽️ 食品", "🚗 交通", "🎬 娱乐", "📚 学习", "🏥 医疗"],
            state="readonly",
            width=30
        )
        category_combo.pack(fill=tk.X, pady=(0, 15))
        self._style_combobox(category_combo)

        # 金额
        tk.Label(
            content,
            text="金额",
            font=label_font,
            bg=self.colors["surface"],
            fg=self.colors["text_primary"]
        ).pack(anchor=tk.W, pady=(15, 5))

        amount_entry = tk.Entry(content, font=entry_font, width=30)
        amount_entry.pack(fill=tk.X, pady=(0, 15))
        amount_entry.configure(
            bg=self.colors["surface_card"],
            fg=self.colors["text_primary"],
            relief=tk.FLAT,
            bd=1,
            highlightbackground=self.colors["border"],
            highlightthickness=1
        )

        # 备注
        tk.Label(
            content,
            text="备注（可选）",
            font=label_font,
            bg=self.colors["surface"],
            fg=self.colors["text_primary"]
        ).pack(anchor=tk.W, pady=(15, 5))

        note_entry = tk.Entry(content, font=entry_font, width=30)
        note_entry.pack(fill=tk.X, pady=(0, 20))
        note_entry.configure(
            bg=self.colors["surface_card"],
            fg=self.colors["text_primary"],
            relief=tk.FLAT,
            bd=1,
            highlightbackground=self.colors["border"],
            highlightthickness=1
        )

        # 保存按钮
        save_btn = tk.Button(
            content,
            text="保存",
            font=tkFont.Font(family="Helvetica", size=12, weight="bold"),
            bg=self.colors["primary"],
            fg="white",
            relief=tk.FLAT,
            padx=20,
            pady=10,
            cursor="hand2",
            command=lambda: messagebox.showinfo("提示", "保存功能将在 Day 2 实现")
        )
        save_btn.pack(pady=20)

    def _setup_bills_screen(self, frame):
        """账单屏幕"""
        header = tk.Frame(frame, bg=self.colors["primary"], height=80)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_font = tkFont.Font(family="Helvetica", size=18, weight="bold")
        tk.Label(
            header,
            text="📝 账单流水",
            font=title_font,
            bg=self.colors["primary"],
            fg="white"
        ).pack(pady=15)

        content = tk.Frame(frame, bg=self.colors["surface"])
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        tk.Label(
            content,
            text="[账单列表将在 Day 2 添加]\n\n今天的支出：\n🍽️ 早餐 -¥30\n🚗 地铁 -¥5\n☕ 咖啡 -¥25",
            font=tkFont.Font(family="Helvetica", size=11),
            bg=self.colors["surface"],
            fg=self.colors["text_secondary"],
            pady=50
        ).pack(fill=tk.BOTH, expand=True)

    def _setup_stats_screen(self, frame):
        """统计屏幕"""
        header = tk.Frame(frame, bg=self.colors["primary"], height=80)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_font = tkFont.Font(family="Helvetica", size=18, weight="bold")
        tk.Label(
            header,
            text="📊 统计分析",
            font=title_font,
            bg=self.colors["primary"],
            fg="white"
        ).pack(pady=15)

        content = tk.Frame(frame, bg=self.colors["surface"])
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        tk.Label(
            content,
            text="[图表分析将在 Day 3 添加]\n\n本月支出统计：\n食品：¥1,100 (43%)\n交通：¥560 (22%)\n娱乐：¥900 (35%)",
            font=tkFont.Font(family="Helvetica", size=11),
            bg=self.colors["surface"],
            fg=self.colors["text_secondary"],
            pady=50
        ).pack(fill=tk.BOTH, expand=True)

    def _setup_category_screen(self, frame):
        """分类屏幕"""
        header = tk.Frame(frame, bg=self.colors["primary"], height=80)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_font = tkFont.Font(family="Helvetica", size=18, weight="bold")
        tk.Label(
            header,
            text="🏷️ 分类管理",
            font=title_font,
            bg=self.colors["primary"],
            fg="white"
        ).pack(pady=15)

        content = tk.Frame(frame, bg=self.colors["surface"])
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        tk.Label(
            content,
            text="[分类管理将在 Day 5 添加]\n\n默认分类：\n🍽️ 食品\n🚗 交通\n🎬 娱乐\n📚 学习",
            font=tkFont.Font(family="Helvetica", size=11),
            bg=self.colors["surface"],
            fg=self.colors["text_secondary"],
            pady=50
        ).pack(fill=tk.BOTH, expand=True)

    def _create_bottom_nav(self):
        """创建底部导航栏"""
        nav_frame = tk.Frame(self.main_frame, bg=self.colors["surface_card"], height=70)
        nav_frame.pack(fill=tk.X, side=tk.BOTTOM, padx=0, pady=0)
        nav_frame.configure(highlightbackground=self.colors["border"], highlightthickness=1)

        nav_items = [
            ("🏠", "首页", "home"),
            ("➕", "记账", "add"),
            ("📝", "账单", "bills"),
            ("📊", "统计", "stats"),
            ("🏷️", "分类", "category")
        ]

        self.nav_buttons = {}

        for emoji, text, screen_key in nav_items:
            btn_frame = tk.Frame(nav_frame, bg=self.colors["surface_card"], cursor="hand2")
            btn_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=8)

            btn_label = tk.Label(
                btn_frame,
                text=f"{emoji}\n{text}",
                font=tkFont.Font(family="Helvetica", size=9),
                bg=self.colors["surface_card"],
                fg=self.colors["text_secondary"],
                cursor="hand2"
            )
            btn_label.pack(fill=tk.BOTH, expand=True)

            # 绑定点击事件
            btn_label.bind("<Button-1>", lambda e, key=screen_key: self.show_screen(key))

            self.nav_buttons[screen_key] = {
                "frame": btn_frame,
                "label": btn_label
            }

    def show_screen(self, screen_key):
        """显示指定屏幕"""
        # 隐藏所有屏幕
        for key, frame in self.screens.items():
            frame.pack_forget()

        # 显示选中的屏幕
        self.screens[screen_key].pack(fill=tk.BOTH, expand=True)

        # 更新导航栏样式
        self._update_nav_style(screen_key)

        self.current_screen = screen_key

    def _update_nav_style(self, active_key):
        """更新导航栏样式"""
        for key, buttons in self.nav_buttons.items():
            if key == active_key:
                # 激活状态
                buttons["frame"].configure(bg=self.colors["primary_light"])
                buttons["label"].configure(
                    bg=self.colors["primary_light"],
                    fg="white"
                )
            else:
                # 非激活状态
                buttons["frame"].configure(bg=self.colors["surface_card"])
                buttons["label"].configure(
                    bg=self.colors["surface_card"],
                    fg=self.colors["text_secondary"]
                )

    def _style_combobox(self, combobox):
        """样式化 Combobox"""
        combobox.configure(
            fieldbackground=self.colors["surface_card"],
            background=self.colors["surface_card"],
            foreground=self.colors["text_primary"]
        )


if __name__ == "__main__":
    root = tk.Tk()
    app = AccountingApp(root)
    root.mainloop()
