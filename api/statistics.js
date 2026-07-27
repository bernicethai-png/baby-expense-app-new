const cors = require('cors');

const corsHandler = cors({ origin: '*' });
const SUPABASE_URL = 'https://cqqfssvcthbcuprbxvnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWZzc3ZjdGhiY3VwcmJ4dm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzMDA3NTAsImV4cCI6MjAyMDg3Njc1MH0.qWPjt8X8N8Z7_z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0';

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  corsHandler(req, res, async () => {
    try {
      const userId = req.query.user_id;

      const pad = n => String(n).padStart(2, '0');
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      const monthEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const isCustomRange = Boolean(req.query.start_date || req.query.end_date);
      const rangeStart = req.query.start_date || monthStart;
      const rangeEnd = req.query.end_date || monthEnd;

      // 从 Supabase 获取交易数据
      let url = `${SUPABASE_URL}/rest/v1/transactions?select=*,users(name)&date=gte.${rangeStart}&date=lte.${rangeEnd}&order=date.desc`;

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      const allTransactions = await response.json();

      if (!Array.isArray(allTransactions)) {
        return res.status(200).json({
          totalIncome: 0,
          totalExpense: 0,
          expenseByCategory: {},
          incomeByCategory: {},
          userStats: { Edward: { income: 0, expense: 0 }, Bernice: { income: 0, expense: 0 } },
          weeklyStats: []
        });
      }

      // 格式化数据
      const rangeTransactions = allTransactions.map(t => ({
        ...t,
        user_name: t.users?.name || 'Unknown',
        amount: parseFloat(t.amount)
      }));

      const transactions = userId
        ? rangeTransactions.filter(t => String(t.user_id) === String(userId))
        : rangeTransactions;

      // 计算统计数据
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

      // 按分类统计
      const expenseByCategory = {};
      const incomeByCategory = {};
      const userExpenseByCategory = { Edward: {}, Bernice: {} };
      const userIncomeByCategory = { Edward: {}, Bernice: {} };

      for (const t of transactions) {
        if (t.type === 'expense') {
          expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
          if (t.user_name) {
            userExpenseByCategory[t.user_name] = userExpenseByCategory[t.user_name] || {};
            userExpenseByCategory[t.user_name][t.category] = (userExpenseByCategory[t.user_name][t.category] || 0) + t.amount;
          }
        } else {
          incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
          if (t.user_name) {
            userIncomeByCategory[t.user_name] = userIncomeByCategory[t.user_name] || {};
            userIncomeByCategory[t.user_name][t.category] = (userIncomeByCategory[t.user_name][t.category] || 0) + t.amount;
          }
        }
      }

      // 按用户统计
      const userStats = { Edward: { income: 0, expense: 0 }, Bernice: { income: 0, expense: 0 } };
      for (const t of rangeTransactions) {
        if (!t.user_name) continue;
        if (!userStats[t.user_name]) userStats[t.user_name] = { income: 0, expense: 0 };
        if (t.type === 'expense') userStats[t.user_name].expense += t.amount;
        else userStats[t.user_name].income += t.amount;
      }

      // 按周统计
      let weeklyStats = [];
      if (!isCustomRange) {
        const dayOfMonth = dateVal => {
          const s = dateVal instanceof Date ? dateVal.toISOString().slice(0, 10) : dateVal;
          if (typeof s !== 'string' || s.length < 10) return null;
          const day = parseInt(s.slice(8, 10), 10);
          return Number.isNaN(day) ? null : day;
        };

        for (let week = 1; week <= 4; week++) {
          const dayStart = (week - 1) * 7 + 1;
          const dayEnd = Math.min(week * 7, 31);
          const weekTransactions = transactions.filter(t => {
            const day = dayOfMonth(t.date);
            return day !== null && day >= dayStart && day <= dayEnd;
          });

          const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
          const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

          weeklyStats.push({
            week,
            dayRange: `${dayStart}-${dayEnd}`,
            income: weekIncome,
            expense: weekExpense,
            balance: weekIncome - weekExpense
          });
        }
      }

      return res.status(200).json({
        totalIncome,
        totalExpense,
        expenseByCategory,
        incomeByCategory,
        userExpenseByCategory,
        userIncomeByCategory,
        userStats,
        weeklyStats,
        transactionCount: transactions.length
      });

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
