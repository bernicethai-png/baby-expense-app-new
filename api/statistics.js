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

      let query = 'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1';
      const params = [];

      if (userId) {
        query += ' AND t.user_id = $' + (params.length + 1);
        params.push(userId);
      }

      const result = await client.query(query, params);
      const transactions = result.rows;

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

      return res.status(200).json({
        total_expense: totalExpense,
        total_income: totalIncome,
        balance: totalIncome - totalExpense,
        expense_by_category: expenseByCategory,
        income_by_category: incomeByCategory,
        user_expense_by_category: userExpenseByCategory,
        user_income_by_category: userIncomeByCategory
      });

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

module.exports = handler;
