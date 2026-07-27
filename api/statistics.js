const cors = require('cors');
const { getClient } = require('../lib/db');

const corsHandler = cors({ origin: '*' });

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  corsHandler(req, res, async () => {
    try {
      const client = await getClient();
      const userId = req.query.user_id;

      const pad = n => String(n).padStart(2, '0');
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      const monthEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      // 没有传 start_date/end_date 时默认用"本月"
      const isCustomRange = Boolean(req.query.start_date || req.query.end_date);
      const rangeStart = req.query.start_date || monthStart;
      const rangeEnd = req.query.end_date || monthEnd;

      const result = await client.query(
        'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.date >= $1 AND t.date <= $2',
        [rangeStart, rangeEnd]
      );
      const rangeTransactions = result.rows;
      const transactions = userId
        ? rangeTransactions.filter(t => String(t.user_id) === String(userId))
        : rangeTransactions;

      // 计算统计数据
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // 按分类统计
      const expenseByCategory = {};
      const incomeByCategory = {};
      const userExpenseByCategory = { Edward: {}, Bernice: {} };
      const userIncomeByCategory = { Edward: {}, Bernice: {} };

      for (const t of transactions) {
        if (t.type === 'expense') {
          expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + parseFloat(t.amount);
          if (t.user_name) {
            userExpenseByCategory[t.user_name] = userExpenseByCategory[t.user_name] || {};
            userExpenseByCategory[t.user_name][t.category] = (userExpenseByCategory[t.user_name][t.category] || 0) + parseFloat(t.amount);
          }
        } else {
          incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + parseFloat(t.amount);
          if (t.user_name) {
            userIncomeByCategory[t.user_name] = userIncomeByCategory[t.user_name] || {};
            userIncomeByCategory[t.user_name][t.category] = (userIncomeByCategory[t.user_name][t.category] || 0) + parseFloat(t.amount);
          }
        }
      }

      // 按用户统计（不受 user_id 参数影响，始终返回全家的数据用于对比）
      const userStats = { Edward: { income: 0, expense: 0 }, Bernice: { income: 0, expense: 0 } };
      for (const t of rangeTransactions) {
        if (!t.user_name) continue;
        if (!userStats[t.user_name]) userStats[t.user_name] = { income: 0, expense: 0 };
        const amt = parseFloat(t.amount);
        if (t.type === 'expense') userStats[t.user_name].expense += amt;
        else userStats[t.user_name].income += amt;
      }

      // 按周统计（本月分4周：1-7, 8-14, 15-21, 22-月末）
      // 只有在没有自定义日期范围（即真正是"本月"）时才有意义，
      // 否则跨月的日期会按"日"被错误地混在一起
      let weeklyStats = [];
      if (!isCustomRange) {
        const dayOfMonth = dateVal => {
          const s = dateVal instanceof Date ? dateVal.toISOString().slice(0, 10) : dateVal;
          if (typeof s !== 'string' || s.length < 10) return null;
          const day = parseInt(s.slice(8, 10), 10);
          return Number.isNaN(day) ? null : day;
        };
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const weekRanges = [[1, 7], [8, 14], [15, 21], [22, daysInMonth]];
        weeklyStats = weekRanges.map(([start, end], idx) => {
          const weekTs = transactions.filter(t => {
            const d = dayOfMonth(t.date);
            return d !== null && d >= start && d <= end;
          });
          const wExpense = weekTs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
          const wIncome = weekTs.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
          return { week: idx + 1, expense: wExpense, income: wIncome, net: wExpense - wIncome };
        });
      }

      return res.status(200).json({
        total_expense: totalExpense,
        total_income: totalIncome,
        balance: totalIncome - totalExpense,
        expense_by_category: expenseByCategory,
        income_by_category: incomeByCategory,
        user_stats: userStats,
        weekly_stats: weeklyStats,
        user_expense_by_category: userExpenseByCategory,
        user_income_by_category: userIncomeByCategory,
        month: rangeStart
      });

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

module.exports = handler;
