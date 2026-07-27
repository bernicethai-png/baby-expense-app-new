// 加载并显示账单数据
async function loadBills() {
    console.log('正在加载账单数据...');

    try {
        // 从后端获取当前用户的交易
        const transactions = await getTransactions({ user_id: currentUserId });
        console.log('获取到的交易:', transactions);
        
        if (!transactions || transactions.length === 0) {
            document.getElementById('bills-container').innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;">暂无交易记录</div>';
            return;
        }
        
        // 按日期分组交易
        const groupedByDate = {};
        transactions.forEach(t => {
            if (!groupedByDate[t.date]) {
                groupedByDate[t.date] = [];
            }
            groupedByDate[t.date].push(t);
        });
        
        // 按日期降序排列
        const sortedDates = Object.keys(groupedByDate).sort().reverse();
        
        // 生成HTML
        let html = '';
        sortedDates.forEach(date => {
            const dateObj = new Date(date + 'T00:00:00');
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
            const dateStr = date.substring(5).replace('-', '月') + '日';
            
            // 计算这一天的小计
            const dayTransactions = groupedByDate[date];
            const dayTotal = dayTransactions.reduce((sum, t) => {
                return sum + (t.type === 'expense' ? -t.amount : t.amount);
            }, 0);
            
            html += `
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">${dateStr} 周${dayOfWeek}</div>
                    <div style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">（小计${dayTotal >= 0 ? '+' : ''}RM${Math.abs(dayTotal).toFixed(2)}）</div>
                </div>
            `;
            
            // 添加这一天的交易项目
            dayTransactions.forEach(t => {
                const icon = t.type === 'expense' ? '🛒' : '💰';
                const amountColor = t.type === 'expense' ? 'var(--text-primary)' : 'var(--success)';
                const amountSign = t.type === 'expense' ? '-' : '+';

                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; flex: 1;">
                            <div style="font-size: 24px; margin-right: 12px;">${icon}</div>
                            <div>
                                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${t.category} - ${t.note || '记录'}</h4>
                                <p style="font-size: 12px; color: var(--text-secondary);">${t.created_at.substring(11, 16)} • ${t.user_name}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-weight: 600; color: ${amountColor};">${amountSign}RM${t.amount.toFixed(2)}</div>
                            <button style="padding: 4px 8px; font-size: 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="editBill(${t.id}, ${t.amount}, '${t.note}', 'loadBills')">编辑</button>
                            <button style="padding: 4px 8px; font-size: 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="deleteBill(${t.id}, 'loadBills')">删除</button>
                        </div>
                    </div>
                `;
            });
        });
        
        document.getElementById('bills-container').innerHTML = html;
    } catch (error) {
        console.error('加载账单失败:', error);
        document.getElementById('bills-container').innerHTML = '<div style="color: red;">加载失败，请重试</div>';
    }
}

// 注意：不在这里自动调用 loadBills()。
// 页面首次加载时，谁是当前用户（Edward/Bernice）要等 index.html 里的
// initializeUser() 从 URL 参数解析完 currentUserId 之后才能确定，
// 所以初次加载改由 initializeUser() 统一触发，避免用错默认用户的数据。
