// 加载并显示首页数据
async function loadHomeData() {
    console.log('🏠 加载首页数据...');

    try {
        // 获取全家（Edward + Bernice）本月的汇总数据，不按当前用户过滤
        const stats = await getStatistics();
        console.log('📊 首页统计数据:', stats);

        const totalIncome = stats?.total_income || 0;
        const totalExpense = stats?.total_expense || 0;
        const balance = totalIncome - totalExpense;

        const userExpenseByCategory = stats?.user_expense_by_category || { Edward: {}, Bernice: {} };
        const userIncomeByCategory = stats?.user_income_by_category || { Edward: {}, Bernice: {} };
        const weeklyExpense = stats?.weekly_expense || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const weeklyIncome = stats?.weekly_income || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const weeklyHTML = generateWeeklyExpenseHTML(weeklyExpense, weeklyIncome);

        const sumValues = (obj) => Object.values(obj || {}).reduce((sum, v) => sum + v, 0);

        const edwardExpense = sumValues(userExpenseByCategory.Edward);
        const edwardIncome = sumValues(userIncomeByCategory.Edward);
        const berniceExpense = sumValues(userExpenseByCategory.Bernice);
        const berniceIncome = sumValues(userIncomeByCategory.Bernice);
        
        console.log('💰 数据:', {
            totalIncome, totalExpense, balance,
            edwardExpense, edwardIncome, berniceExpense, berniceIncome
        });
        
        // 完全替换首页HTML
        const homeHTML = `
            <div class="page-title">📊 首页</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div class="card" style="margin-bottom: 0;">
                    <div class="card-label">本月收入</div>
                    <div class="card-value" style="color: var(--text-primary);">RM${totalIncome.toFixed(2)}</div>
                </div>

                <div class="card" style="margin-bottom: 0;">
                    <div class="card-label">本月支出</div>
                    <div class="card-value">RM${totalExpense.toFixed(2)}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-label">总开销</div>
                <div class="card-value" style="color: ${balance >= 0 ? 'var(--success)' : '#ef4444'};">RM${Math.abs(balance).toFixed(2)}</div>
                <div class="card-info">
                    <span>本月收入: RM${totalIncome.toFixed(2)}</span>
                    <span>本月支出: RM${totalExpense.toFixed(2)}</span>
                </div>
            </div>

            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">📅 每周开销详情</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                ${weeklyHTML}
            </div>

            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">💰 家庭支出</div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span>Edward 的支出</span>
                    <span style="font-weight: 600;">RM${edwardExpense.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Bernice 的支出</span>
                    <span style="font-weight: 600;">RM${berniceExpense.toFixed(2)}</span>
                </div>
            </div>

            <div style="margin-bottom: 16px; font-weight: 600; color: #1e293b;">💵 家庭收入</div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span>Edward 的收入</span>
                    <span style="font-weight: 600; color: var(--text-primary);">RM${edwardIncome.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Bernice 的收入</span>
                    <span style="font-weight: 600; color: var(--text-primary);">RM${berniceIncome.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
            homeScreen.innerHTML = homeHTML;
            console.log('✅ 首页数据已更新');
        }
    } catch (error) {
        console.error('❌ 加载首页数据失败:', error);
    }
}

// 页面加载后立即加载首页数据
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeData);
} else {
    loadHomeData();
}

// 切换到首页时也重新加载数据
const originalSwitchScreen = window.switchScreen;
window.switchScreen = function(screenId) {
    originalSwitchScreen(screenId);
    if (screenId === 'home') {
        loadHomeData();
    }
};

// 全局变量（currentTimeRange 已在 index.html 中声明）
let customStartDate = '';
let customEndDate = '';

// 获取统计数据（支持时间范围过滤）
async function getStatisticsWithTimeRange(userId, timeRange = 'month', startDate = '', endDate = '') {
    const params = new URLSearchParams({
        user_id: userId,
        time_range: timeRange
    });

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`/api/statistics?${params}`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
}

// 处理时间范围变化
async function handleTimeRangeChange(range) {
    console.log('📅 切换时间范围:', range);
    currentTimeRange = range;

    if (range === 'custom') {
        document.getElementById('customDateRange').style.display = 'block';
    } else {
        document.getElementById('customDateRange').style.display = 'none';
        await loadStatsData();
    }
}

// 应用自定义日期范围
async function applyCustomDateRange() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    if (!startDate || !endDate) {
        alert('请选择开始和结束日期');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('开始日期不能晚于结束日期');
        return;
    }

    customStartDate = startDate;
    customEndDate = endDate;
    await loadStatsData();
}

// 生成每周开销HTML
function generateWeeklyExpenseHTML(weeklyExpense, weeklyIncome) {
    const weeks = ['第1周', '第2周', '第3周', '第4周', '第5周'];
    let html = '';

    for (let i = 1; i <= 4; i++) {
        const expense = weeklyExpense[i] || 0;
        const income = weeklyIncome[i] || 0;
        const netExpense = income - expense;
        const color = netExpense >= 0 ? 'var(--success)' : '#ef4444';

        html += `
            <div class="card" style="margin-bottom: 0;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">${weeks[i-1]}</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                    <span>开销</span>
                    <span style="font-weight: 600;">RM${expense.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span>净开销</span>
                    <span style="font-weight: 600; color: ${color};">RM${netExpense.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    return html;
}

// 生成单一分类的逐月明细小表格（本年视图专用，独立呈现，不与其他分类合并）
function generateSingleCategoryMonthlyTable(monthlyCategoryTotals, categoryName, title) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let total = 0;
    let rows = '';

    for (let m = 1; m <= 12; m++) {
        const amount = (monthlyCategoryTotals && monthlyCategoryTotals[m] && monthlyCategoryTotals[m][categoryName]) || 0;
        total += amount;

        rows += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 5px 4px; font-weight: 600;">${months[m-1]}</td>
                <td style="padding: 5px 4px; text-align: right;">${amount > 0 ? 'RM' + amount.toFixed(2) : '-'}</td>
            </tr>
        `;
    }

    const avg = total / 12;

    return `
        <div class="card" style="flex: 1; min-width: 0;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="padding: 5px 4px; text-align: left;">Month</th>
                        <th style="padding: 5px 4px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr style="border-top: 2px solid var(--border); font-weight: 600;">
                        <td style="padding: 5px 4px;">Total</td>
                        <td style="padding: 5px 4px; text-align: right; color: var(--success);">RM${total.toFixed(2)}</td>
                    </tr>
                    <tr style="color: var(--text-secondary);">
                        <td style="padding: 5px 4px;">Avg/Month</td>
                        <td style="padding: 5px 4px; text-align: right; color: var(--primary);">RM${avg.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// 生成通用的逐月数值小表格（本年视图专用），传入 {1:金额,...,12:金额} 即可
function generateMonthlyValueTable(monthlyValues, title, options) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allowNegative = options && options.allowNegative;
    let total = 0;
    let rows = '';

    for (let m = 1; m <= 12; m++) {
        const amount = (monthlyValues && monthlyValues[m]) || 0;
        total += amount;
        const color = allowNegative ? (amount < 0 ? '#ef4444' : (amount > 0 ? 'var(--success)' : 'inherit')) : 'inherit';
        const display = amount !== 0 ? `RM${amount.toFixed(2)}` : '-';

        rows += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 5px 4px; font-weight: 600;">${months[m-1]}</td>
                <td style="padding: 5px 4px; text-align: right; color: ${color};">${display}</td>
            </tr>
        `;
    }

    const avg = total / 12;
    const totalColor = allowNegative ? (total < 0 ? '#ef4444' : 'var(--success)') : 'var(--success)';
    const avgColor = allowNegative ? (avg < 0 ? '#ef4444' : 'var(--primary)') : 'var(--primary)';

    return `
        <div class="card" style="flex: 1; min-width: 0;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="padding: 5px 4px; text-align: left;">Month</th>
                        <th style="padding: 5px 4px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr style="border-top: 2px solid var(--border); font-weight: 600;">
                        <td style="padding: 5px 4px;">Total</td>
                        <td style="padding: 5px 4px; text-align: right; color: ${totalColor};">RM${total.toFixed(2)}</td>
                    </tr>
                    <tr style="color: var(--text-secondary);">
                        <td style="padding: 5px 4px;">Avg/Month</td>
                        <td style="padding: 5px 4px; text-align: right; color: ${avgColor};">RM${avg.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// 生成支出分类逐月矩阵表格（本年视图专用）：行=月份，列=各支出分类，末尾含合计与平均
function generateExpenseCategoryMatrixTable(monthlyCategoryTotals, expenseCategoryNames) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (!expenseCategoryNames || expenseCategoryNames.length === 0) {
        return `
            <div class="card" style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">支出分类统计</div>
                <div style="font-size: 12px; color: var(--text-secondary);">暂无分类数据</div>
            </div>
        `;
    }

    const categoryTotals = {};
    expenseCategoryNames.forEach(cat => categoryTotals[cat] = 0);
    let grandTotal = 0;

    let rows = '';
    for (let m = 1; m <= 12; m++) {
        let monthTotal = 0;
        const cells = expenseCategoryNames.map(cat => {
            const amount = (monthlyCategoryTotals && monthlyCategoryTotals[m] && monthlyCategoryTotals[m][cat]) || 0;
            categoryTotals[cat] += amount;
            monthTotal += amount;
            return `<td style="padding: 5px 6px; text-align: right;">${amount > 0 ? 'RM' + amount.toFixed(2) : '-'}</td>`;
        }).join('');
        grandTotal += monthTotal;

        rows += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 5px 6px; font-weight: 600;">${months[m-1]}</td>
                ${cells}
                <td style="padding: 5px 6px; text-align: right; font-weight: 600;">RM${monthTotal.toFixed(2)}</td>
            </tr>
        `;
    }

    const totalCells = expenseCategoryNames.map(cat =>
        `<td style="padding: 5px 6px; text-align: right;">RM${categoryTotals[cat].toFixed(2)}</td>`
    ).join('');
    const avgCells = expenseCategoryNames.map(cat =>
        `<td style="padding: 5px 6px; text-align: right;">RM${(categoryTotals[cat] / 12).toFixed(2)}</td>`
    ).join('');
    const headerCells = expenseCategoryNames.map(cat =>
        `<th style="padding: 5px 6px; text-align: right; white-space: nowrap;">${cat}</th>`
    ).join('');

    return `
        <div class="card" style="flex: 1; min-width: 0;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">支出分类统计</div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border);">
                            <th style="padding: 5px 6px; text-align: left;">Month</th>
                            ${headerCells}
                            <th style="padding: 5px 6px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr style="border-top: 2px solid var(--border); font-weight: 600;">
                            <td style="padding: 5px 6px;">Total</td>
                            ${totalCells}
                            <td style="padding: 5px 6px; text-align: right; color: var(--success);">RM${grandTotal.toFixed(2)}</td>
                        </tr>
                        <tr style="color: var(--text-secondary);">
                            <td style="padding: 5px 6px;">Avg/Month</td>
                            ${avgCells}
                            <td style="padding: 5px 6px; text-align: right; color: var(--primary);">RM${(grandTotal / 12).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 生成 Edward 逐月薪水明细表格（本年视图专用，不含 Side Income）
// 同时返回每月"其他收入"(非薪水)数据，供旁边独立的 Side Income 表格使用
function generateMonthlyIncomeHTML(monthlyUserIncomeByCategory) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salaryKeys = ['WL Salary', 'HMSB Incentive', 'OJ Incentive', 'Lepas Incentive'];

    let totalWL = 0, totalHMSB = 0, totalOJ = 0, totalLepas = 0, totalAll = 0;
    let rows = '';
    const monthlyOtherIncome = {};

    for (let m = 1; m <= 12; m++) {
        const monthData = (monthlyUserIncomeByCategory && monthlyUserIncomeByCategory[m] && monthlyUserIncomeByCategory[m].Edward) || {};

        const wl = monthData['WL Salary'] || 0;
        const hmsb = monthData['HMSB Incentive'] || 0;
        const oj = monthData['OJ Incentive'] || 0;
        const lepas = monthData['Lepas Incentive'] || 0;
        const other = Object.entries(monthData)
            .filter(([category]) => !salaryKeys.includes(category))
            .reduce((sum, [, amount]) => sum + amount, 0);
        const monthTotal = wl + hmsb + oj + lepas;

        monthlyOtherIncome[m] = other;
        totalWL += wl; totalHMSB += hmsb; totalOJ += oj; totalLepas += lepas; totalAll += monthTotal;

        const fmt = (v) => v > 0 ? `RM${v.toFixed(2)}` : '-';

        rows += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 6px 4px; font-weight: 600;">${months[m-1]}</td>
                <td style="padding: 6px 4px; text-align: right;">${fmt(wl)}</td>
                <td style="padding: 6px 4px; text-align: right;">${fmt(hmsb)}</td>
                <td style="padding: 6px 4px; text-align: right;">${fmt(oj)}</td>
                <td style="padding: 6px 4px; text-align: right;">${fmt(lepas)}</td>
                <td style="padding: 6px 4px; text-align: right; font-weight: 600;">${fmt(monthTotal)}</td>
            </tr>
        `;
    }

    const avg = (v) => `RM${(v / 12).toFixed(2)}`;
    const fmtBold = (v) => v > 0 ? `RM${v.toFixed(2)}` : '-';

    const html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="padding: 6px 4px; text-align: left;">Month</th>
                        <th style="padding: 6px 4px; text-align: right;">WL Salary</th>
                        <th style="padding: 6px 4px; text-align: right;">HMSB</th>
                        <th style="padding: 6px 4px; text-align: right;">OJ</th>
                        <th style="padding: 6px 4px; text-align: right;">Lepas</th>
                        <th style="padding: 6px 4px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr style="border-top: 2px solid var(--border); font-weight: 600;">
                        <td style="padding: 6px 4px;">Final Total</td>
                        <td style="padding: 6px 4px; text-align: right;">${fmtBold(totalWL)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${fmtBold(totalHMSB)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${fmtBold(totalOJ)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${fmtBold(totalLepas)}</td>
                        <td style="padding: 6px 4px; text-align: right; color: var(--success);">${fmtBold(totalAll)}</td>
                    </tr>
                    <tr style="color: var(--text-secondary);">
                        <td style="padding: 6px 4px;">Average/Month</td>
                        <td style="padding: 6px 4px; text-align: right;">${avg(totalWL)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${avg(totalHMSB)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${avg(totalOJ)}</td>
                        <td style="padding: 6px 4px; text-align: right;">${avg(totalLepas)}</td>
                        <td style="padding: 6px 4px; text-align: right; color: var(--primary);">${avg(totalAll)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    return { html, monthlyOtherIncome };
}

// 加载并显示统计页面数据
async function loadStatsData() {
    // 统计页面固定按"本年"显示，不再提供时间范围切换
    currentTimeRange = 'year';
    console.log('📊 加载统计数据...', { timeRange: currentTimeRange, startDate: customStartDate, endDate: customEndDate });

    try {
        // 获取当前用户的个人数据
        const stats = await getStatisticsWithTimeRange(currentUserId, currentTimeRange, customStartDate, customEndDate);
        console.log('统计数据:', stats);

        const totalExpense = stats?.total_expense || 0;
        const totalIncome = stats?.total_income || 0;
        const balance = totalIncome - totalExpense;
        const expenseByCategory = stats?.expense_by_category || {};
        const incomeByCategory = stats?.income_by_category || {};
        const userIncomeByCategory = stats?.user_income_by_category || { Edward: {}, Bernice: {} };
        const userExpenseByCategory = stats?.user_expense_by_category || { Edward: {}, Bernice: {} };
        const monthlyUserIncomeByCategory = stats?.monthly_user_income_by_category || {};
        const monthlyCategoryTotals = stats?.monthly_category_totals || {};
        const monthlyExpenseTotal = stats?.monthly_expense_total || {};
        const currentYear = new Date().getFullYear();

        // 三个独立分类月度明细表格（房屋贷款 / 银行利息股息 / CP 500），本年视图专用，左中右并排
        const categoryTablesHTML = currentTimeRange === 'year' ? `
            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">📋 分类月度明细</div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${generateSingleCategoryMonthlyTable(monthlyCategoryTotals, '房屋贷款', '🏠 房屋贷款')}
                ${generateSingleCategoryMonthlyTable(monthlyCategoryTotals, '银行利息/股息', '🏦 银行利息/股息')}
                ${generateSingleCategoryMonthlyTable(monthlyCategoryTotals, 'CP 500', '💳 CP 500')}
            </div>
        ` : '';

        // 年度开销总表 + 每月盈亏表（左右并排）
        const yearExpenseAndPnlHTML = currentTimeRange === 'year' ? (() => {
            const monthlyPnl = {};
            for (let m = 1; m <= 12; m++) {
                const wl = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['WL Salary']) || 0;
                const hmsb = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['HMSB Incentive']) || 0;
                const oj = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['OJ Incentive']) || 0;
                const lepas = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['Lepas Incentive']) || 0;
                const mortgage = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['房屋贷款']) || 0;
                const cp500 = (monthlyCategoryTotals[m] && monthlyCategoryTotals[m]['CP 500']) || 0;
                const yearExpense = monthlyExpenseTotal[m] || 0;

                monthlyPnl[m] = (wl + hmsb + oj + lepas) - (mortgage + yearExpense) - cp500;
            }

            return `
                <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">📈 年度盈亏总览</div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${generateMonthlyValueTable(monthlyExpenseTotal, `📆 ${currentYear} Year Expenses (Include Side Income)`)}
                    ${generateMonthlyValueTable(monthlyPnl, `📈 ${currentYear} Monthly Profit and Loss`, { allowNegative: true })}
                </div>
            `;
        })() : '';

        // SleepyFace Studio Account + Borrow to Johnny（左右并排）
        const categoryDetailTablesHTML = currentTimeRange === 'year' ? `
            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">📊 分类统计明细</div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${generateSingleCategoryMonthlyTable(monthlyCategoryTotals, 'SleepyFace Studio Account', '🎨 SleepyFace Studio Account')}
                ${generateSingleCategoryMonthlyTable(monthlyCategoryTotals, '借贷', '🤝 Borrow to Johnny')}
            </div>
        ` : '';

        // Edward 逐月薪水表格 + 其"其他收入"数据（用于旁边独立的 Side Income 表格）
        const monthlyIncomeResult = (currentUser === 'Edward' && currentTimeRange === 'year')
            ? generateMonthlyIncomeHTML(monthlyUserIncomeByCategory)
            : null;

        // Side Income 独立表格（与 独立收入 卡片左右并排）
        const sideIncomeTableHTML = monthlyIncomeResult
            ? generateMonthlyValueTable(monthlyIncomeResult.monthlyOtherIncome, '💵 Side Income')
            : generateSingleCategoryMonthlyTable(monthlyCategoryTotals, 'Side Income', '💵 Side Income');

        const statsHTML = `
            <div class="page-title">📊 统计分析</div>

            ${categoryTablesHTML}

            ${yearExpenseAndPnlHTML}

            ${categoryDetailTablesHTML}

            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">💵 独立收入</div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;">
                <div class="card" style="flex: 1; min-width: 0;">
                ${monthlyIncomeResult ? `
                    ${monthlyIncomeResult.html}
                ` : `
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">${currentUser} Side Income</div>
                    ${Object.entries(currentUser === 'Edward' ? userIncomeByCategory.Edward || {} : userIncomeByCategory.Bernice || {})
                        .filter(([category]) => !['WL Salary', 'HMSB Incentive', 'OJ Incentive', 'Lepas Incentive'].includes(category))
                        .map(([category, amount]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                                <span>${category}</span>
                                <span style="font-weight: 600;">RM${amount.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    ${Object.entries(currentUser === 'Edward' ? userIncomeByCategory.Edward || {} : userIncomeByCategory.Bernice || {})
                        .filter(([category]) => !['WL Salary', 'HMSB Incentive', 'OJ Incentive', 'Lepas Incentive'].includes(category)).length === 0 ? '<div style="font-size: 12px; color: var(--text-secondary);">暂无数据</div>' : ''}
                </div>

                ${currentUser === 'Edward' ? `
                <div style="border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">💰 薪水小计 (WL/HMSB/OJ/Lepas)</div>
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                            <span>WL Salary</span>
                            <span style="font-weight: 600;">RM${(userIncomeByCategory.Edward['WL Salary'] || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                            <span>HMSB Incentive</span>
                            <span style="font-weight: 600;">RM${(userIncomeByCategory.Edward['HMSB Incentive'] || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                            <span>OJ Incentive</span>
                            <span style="font-weight: 600;">RM${(userIncomeByCategory.Edward['OJ Incentive'] || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px;">
                            <span>Lepas Incentive</span>
                            <span style="font-weight: 600;">RM${(userIncomeByCategory.Edward['Lepas Incentive'] || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--border); padding-top: 8px; display: flex; justify-content: space-between; font-weight: 600; color: var(--success);">
                        <span>小计</span>
                        <span>RM${(
                            (userIncomeByCategory.Edward['WL Salary'] || 0) +
                            (userIncomeByCategory.Edward['HMSB Incentive'] || 0) +
                            (userIncomeByCategory.Edward['OJ Incentive'] || 0) +
                            (userIncomeByCategory.Edward['Lepas Incentive'] || 0)
                        ).toFixed(2)}</span>
                    </div>
                </div>
                ` : ''}

                <div style="border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">总小计 (总计12个月)</span>
                    <span style="font-weight: 600; color: var(--success);">RM${totalIncome.toFixed(2)}</span>
                </div>
                ${currentTimeRange === 'year' ? `
                <div style="margin-top: 8px; display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="font-weight: 600; color: var(--text-secondary);">平均每月收入</span>
                    <span style="font-weight: 600; color: var(--primary);">RM${(totalIncome / 12).toFixed(2)}</span>
                </div>
                ` : ''}
                `}
                </div>
                ${sideIncomeTableHTML}
            </div>

        `;

        const statsScreen = document.getElementById('screen-stats');
        if (statsScreen) {
            statsScreen.innerHTML = statsHTML;
            console.log('✅ 统计页面已更新');
        }
    } catch (error) {
        console.error('❌ 加载统计数据失败:', error);
    }
}

// 页面加载后调用loadStatsData
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStatsData);
} else {
    loadStatsData();
}
