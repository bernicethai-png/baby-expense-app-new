// 当前筛选条件
let billsFilterState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
};

// 获取周数（1-5）
function getWeekNumber(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const dayDiff = Math.floor((new Date(year, month - 1, day) - monthStart) / (1000 * 60 * 60 * 24));
    return Math.min(5, Math.floor(dayDiff / 7) + 1);
}

// 生成filter UI
function renderBillsFilter() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 生成年份选项（过去5年和当前年）
    const years = [];
    for (let i = currentYear - 4; i <= currentYear + 1; i++) {
        years.push(i);
    }

    let filterHtml = `
        <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">
            <div>
                <label style="font-size: 12px; color: var(--text-secondary); margin-right: 8px; font-weight: 600;">年份</label>
                <select id="bills-year-filter" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 14px; background: white; cursor: pointer;" onchange="applyBillsFilter()">
    `;

    years.forEach(year => {
        const selected = year === billsFilterState.year ? 'selected' : '';
        filterHtml += `<option value="${year}" ${selected}>${year}年</option>`;
    });

    filterHtml += `
                </select>
            </div>
            <div>
                <label style="font-size: 12px; color: var(--text-secondary); margin-right: 8px; font-weight: 600;">月份</label>
                <select id="bills-month-filter" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 14px; background: white; cursor: pointer;" onchange="applyBillsFilter()">
    `;

    for (let m = 1; m <= 12; m++) {
        const selected = m === billsFilterState.month ? 'selected' : '';
        filterHtml += `<option value="${m}" ${selected}>${String(m).padStart(2, '0')}月</option>`;
    }

    filterHtml += `
                </select>
            </div>
            <button onclick="resetBillsFilter()" style="padding: 8px 16px; background: #94a3b8; color: white; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; margin-top: 20px;">重置</button>
        </div>
    `;

    return filterHtml;
}

// 应用筛选条件
function applyBillsFilter() {
    const yearSelect = document.getElementById('bills-year-filter');
    const monthSelect = document.getElementById('bills-month-filter');

    if (yearSelect && monthSelect) {
        billsFilterState.year = parseInt(yearSelect.value);
        billsFilterState.month = parseInt(monthSelect.value);
        loadBills();
    }
}

// 重置筛选
function resetBillsFilter() {
    const now = new Date();
    billsFilterState.year = now.getFullYear();
    billsFilterState.month = now.getMonth() + 1;
    const yearSelect = document.getElementById('bills-year-filter');
    const monthSelect = document.getElementById('bills-month-filter');
    if (yearSelect) yearSelect.value = billsFilterState.year;
    if (monthSelect) monthSelect.value = billsFilterState.month;
    loadBills();
}

// 加载并显示账单数据（表格视图）
async function loadBills() {
    console.log('正在加载账单数据...');

    try {
        // 从后端获取当前用户的交易
        const transactions = await getTransactions({ user_id: currentUserId });
        console.log('获取到的交易:', transactions);

        // 按照筛选条件过滤交易
        const filteredTransactions = transactions.filter(t => {
            const [year, month] = t.date.split('-').map(Number);
            return year === billsFilterState.year && month === billsFilterState.month;
        });

        // 生成filter UI
        let html = renderBillsFilter();

        if (!filteredTransactions || filteredTransactions.length === 0) {
            html += '<div style="text-align: center; padding: 40px; color: #64748b;">暂无交易记录</div>';
            document.getElementById('bills-container').innerHTML = html;
            return;
        }

        // 按周分组交易
        const groupedByWeek = {
            1: [], 2: [], 3: [], 4: [], 5: []
        };

        filteredTransactions.forEach(t => {
            const weekNum = getWeekNumber(t.date);
            groupedByWeek[weekNum].push(t);
        });

        // 生成表格视图
        html += `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">周数</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">日期范围</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">分类</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">说明</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">类型</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">金额</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">用户</th>
                            <th style="padding: 12px; text-align: center; font-weight: 600; color: var(--text-primary);">操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // 计算每周的开始和结束日期
        const year = billsFilterState.year;
        const month = billsFilterState.month;
        const firstDay = new Date(year, month - 1, 1);

        for (let week = 1; week <= 5; week++) {
            const weekStart = new Date(year, month - 1, 1 + (week - 1) * 7);
            const weekEnd = new Date(year, month - 1, 1 + week * 7 - 1);

            // 确保日期在当月内
            if (weekStart.getMonth() !== month - 1) continue;

            const weekTransactions = groupedByWeek[week];

            if (weekTransactions.length === 0) {
                continue;
            }

            const dateRangeStr = `${String(weekStart.getDate()).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

            // 计算周开销（只算expense）
            const weekExpense = weekTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            weekTransactions.forEach((t, index) => {
                const amountColor = t.type === 'expense' ? '#ef4444' : '#10b981';
                const amountSign = t.type === 'expense' ? '-' : '+';
                const typeLabel = t.type === 'expense' ? '支出' : '收入';
                const isFirstRow = index === 0;

                html += `
                    <tr style="border-bottom: 1px solid #e2e8f0; ${isFirstRow ? 'background: #f0f9ff;' : ''}">
                        ${isFirstRow ? `<td style="padding: 12px; font-weight: 600; color: var(--text-primary); background: #dbeafe;">第${week}周</td>` : '<td style="padding: 12px;"></td>'}
                        ${isFirstRow ? `<td style="padding: 12px; font-weight: 600; color: var(--text-primary); background: #dbeafe;">${dateRangeStr}号</td>` : '<td style="padding: 12px;"></td>'}
                        <td style="padding: 12px; color: var(--text-primary);">${t.category}</td>
                        <td style="padding: 12px; color: var(--text-secondary);">${t.note || '-'}</td>
                        <td style="padding: 12px; color: var(--text-secondary);">${typeLabel}</td>
                        <td style="padding: 12px; text-align: right; font-weight: 600; color: ${amountColor};">${amountSign}RM${parseFloat(t.amount).toFixed(2)}</td>
                        <td style="padding: 12px; color: var(--text-secondary);">${t.user_name}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 4px;" onclick="editBill(${t.id}, ${t.amount}, '${t.note}', 'loadBills')">编辑</button>
                            <button style="padding: 4px 8px; font-size: 11px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="deleteBill(${t.id}, 'loadBills')">删除</button>
                        </td>
                    </tr>
                `;
            });

            // 周汇总行
            html += `
                <tr style="background: #fef3c7; border-bottom: 2px solid #fcd34d; font-weight: 600;">
                    <td colspan="5" style="padding: 12px; text-align: right;">第${week}周小计：</td>
                    <td style="padding: 12px; text-align: right; color: #ef4444;">-RM${weekExpense.toFixed(2)}</td>
                    <td colspan="2" style="padding: 12px;"></td>
                </tr>
            `;
        }

        // 月度汇总
        const totalExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const balance = totalIncome - totalExpense;

        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <div style="display: flex; justify-content: space-around; gap: 16px;">
                    <div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">总支出</div>
                        <div style="font-size: 18px; font-weight: 600; color: #ef4444;">-RM${totalExpense.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">总收入</div>
                        <div style="font-size: 18px; font-weight: 600; color: #10b981;">+RM${totalIncome.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">结余</div>
                        <div style="font-size: 18px; font-weight: 600; color: ${balance >= 0 ? '#10b981' : '#ef4444'};">${balance >= 0 ? '+' : ''}RM${balance.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('bills-container').innerHTML = html;
    } catch (error) {
        console.error('加载账单失败:', error);
        document.getElementById('bills-container').innerHTML = '<div style="color: red;">加载失败，请重试</div>';
    }
}

// 页面加载时调用
window.addEventListener('load', () => {
    console.log('页面加载完成，加载账单数据');
    loadBills();
});
