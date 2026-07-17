// 加载并显示首页数据
async function loadHomeData() {
    console.log('🏠 加载首页数据...');

    try {
        // 获取当前用户的个人数据
        const stats = await getStatistics(currentUserId);
        console.log('📊 首页统计数据:', stats);
        
        const totalIncome = stats?.total_income || 0;
        const totalExpense = stats?.total_expense || 0;
        const balance = totalIncome - totalExpense;
        
        const userStats = stats?.user_stats || { 
            Edward: { income: 0, expense: 0 }, 
            Bernice: { income: 0, expense: 0 } 
        };
        
        const edwardExpense = userStats.Edward?.expense || 0;
        const edwardIncome = userStats.Edward?.income || 0;
        const berniceExpense = userStats.Bernice?.expense || 0;
        const berniceIncome = userStats.Bernice?.income || 0;
        
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

            <div style="margin-bottom: 16px; font-weight: 600; color: var(--text-primary);">💰 家庭支出</div>
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

// 加载并显示统计页面数据
async function loadStatsData() {
    console.log('📊 加载统计数据...');

    try {
        // 获取当前用户的个人数据
        const stats = await getStatistics(currentUserId);
        console.log('统计数据:', stats);

        const totalExpense = stats?.total_expense || 0;
        const totalIncome = stats?.total_income || 0;
        const balance = totalIncome - totalExpense;
        const expenseByCategory = stats?.expense_by_category || {};
        const incomeByCategory = stats?.income_by_category || {};
        const userIncomeByCategory = stats?.user_income_by_category || { Edward: {}, Bernice: {} };
        const userExpenseByCategory = stats?.user_expense_by_category || { Edward: {}, Bernice: {} };

        // 生成支出分类HTML
        let categoryHTML = '';
        const categories = Object.entries(expenseByCategory);
        const maxAmount = Math.max(...categories.map(([_, amount]) => amount), 1);

        categories.forEach(([category, amount]) => {
            const percentage = (amount / maxAmount) * 100;
            categoryHTML += `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span>${category}</span>
                        <span style="font-weight: 600;">RM${amount.toFixed(2)}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
                    </div>
                </div>
            `;
        });

        const statsHTML = `
            <div class="page-title">📊 统计分析</div>

            <div style="background: #fff3cd; padding: 8px 12px; margin-bottom: 12px; border-radius: 4px; font-size: 12px; color: #664d03;">
                <strong>DEBUG:</strong> currentTimeRange = <strong>${currentTimeRange}</strong>
            </div>

            <div class="form-group">
                <label>时间范围</label>
                <select id="timeRangeSelect" onchange="handleTimeRangeChange(this.value)">
                    <option value="month" ${currentTimeRange === 'month' ? 'selected' : ''}>本月</option>
                    <option value="year" ${currentTimeRange === 'year' ? 'selected' : ''}>本年</option>
                    <option value="custom" ${currentTimeRange === 'custom' ? 'selected' : ''}>自定义</option>
                </select>
            </div>

            <div class="form-group" id="customDateRange" style="display: none;">
                <label>开始日期</label>
                <input type="date" id="startDate">
                <label style="margin-top: 12px;">结束日期</label>
                <input type="date" id="endDate">
                <button class="btn btn-secondary" style="margin-top: 12px; width: 100%;" onclick="applyCustomDateRange()">应用</button>
            </div>

            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">📅 每周开销详情</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="card" style="margin-bottom: 0;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">第1周</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                        <span>开销</span>
                        <span style="font-weight: 600;">RM0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>净开销</span>
                        <span style="font-weight: 600; color: #ef4444;">RM0.00</span>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 0;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">第2周</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                        <span>开销</span>
                        <span style="font-weight: 600;">RM0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>净开销</span>
                        <span style="font-weight: 600; color: #ef4444;">RM0.00</span>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 0;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">第3周</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                        <span>开销</span>
                        <span style="font-weight: 600;">RM0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>净开销</span>
                        <span style="font-weight: 600; color: #ef4444;">RM0.00</span>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 0;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">第4周</div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                        <span>开销</span>
                        <span style="font-weight: 600;">RM0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>净开销</span>
                        <span style="font-weight: 600; color: #ef4444;">RM0.00</span>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 16px; font-weight: 600; color: var(--text-primary);">📊 支出分类统计</div>
            <div class="card">
                ${categoryHTML || '<div style="text-align: center; color: var(--text-secondary);">暂无分类数据</div>'}
                <div style="border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">小计</span>
                    <span style="font-weight: 600; color: var(--primary);">RM${totalExpense.toFixed(2)}</span>
                </div>
            </div>

            ${currentUser === 'Edward' ? `
            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">💰 独立开销</div>
            <div class="card">
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span>🎰 博彩开销</span>
                        <span style="font-weight: 600;">RM${(expenseByCategory['🎰 赌博'] || 0).toFixed(2)}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${((expenseByCategory['🎰 赌博'] || 0) / totalExpense * 100) || 0}%; height: 100%; background: #ef4444;"></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span>🏠 房屋贷款</span>
                        <span style="font-weight: 600;">RM${(expenseByCategory['🏠 房屋贷款'] || 0).toFixed(2)}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${((expenseByCategory['🏠 房屋贷款'] || 0) / totalExpense * 100) || 0}%; height: 100%; background: #ef4444;"></div>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">小计</span>
                    <span style="font-weight: 600; color: #ef4444;">RM${((expenseByCategory['🎰 赌博'] || 0) + (expenseByCategory['🏠 房屋贷款'] || 0)).toFixed(2)}</span>
                </div>
            </div>
            ` : ''}

            <div style="margin-bottom: 16px; margin-top: 20px; font-weight: 600; color: var(--text-primary);">💵 独立收入</div>
            <div class="card">
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">${currentUser} 其他收入</div>
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
