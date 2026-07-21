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
                const timeRange = req.query.time_range || 'month';
                const startDate = req.query.start_date;
                const endDate = req.query.end_date;

          const now = new Date();
                let dateStart, dateEnd;

          if (timeRange === 'month') {
                    dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          } else if (timeRange === 'year') {
                    dateStart = new Date(now.getFullYear(), 0, 1);
                    dateEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          } else if (timeRange === 'custom' && startDate && endDate) {
                    dateStart = new Date(startDate);
                    dateEnd = new Date(endDate);
                    dateEnd.setHours(23, 59, 59);
          } else {
                    dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          }

          let query = 'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.created_at >= $1 AND t.created_at <= $2';
                const params = [dateStart, dateEnd];

          if (userId) {
                    query += ' AND t.user_id = $' + (params.length + 1);
                    params.push(userId);
          }

          query += ' ORDER BY t.created_at ASC';

          const result = await client.query(query, params);
                const transactions = result.rows;

          const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);

          const expenseByCategory = {};
                const incomeByCategory = {};
                const userExpenseByCategory = { Edward: {}, Bernice: {} };
                const userIncomeByCategory = { Edward: {}, Bernice: {} };

          const weeklyExpense = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                const weeklyIncome = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

          for (const t of transactions) {
                    const transDate = new Date(t.created_at);

                  const monthStart = new Date(transDate.getFullYear(), transDate.getMonth(), 1);
                    const dayDiff = Math.floor((transDate - monthStart) / (1000 * 60 * 60 * 24));
                    const weekNum = Math.min(5, Math.floor(dayDiff / 7) + 1);

                  const amount = parseFloat(t.amount);

                  if (t.type === 'expense') {
                              expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amount;
                              weeklyExpense[weekNum] = (weeklyExpense[weekNum] || 0) + amount;
                              if (t.user_name) {
                                            userExpenseByCategory[t.user_name] = userExpenseByCategory[t.user_name] || {};
                                            userExpenseByCategory[t.user_name][t.category] = (userExpenseByCategory[t.user_name][t.category] || 0) + amount;
                              }
                  } else {
                              incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amount;
                              weeklyIncome[weekNum] = (weeklyIncome[weekNum] || 0) + amount;
                              if (t.user_name) {
                                            userIncomeByCategory[t.user_name] = userIncomeByCategory[t.user_name] || {};
                                            userIncomeByCategory[t.user_name][t.category] = (userIncomeByCategory[t.user_name][t.category] || 0) + amount;
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
                    user_income_by_category: userIncomeByCategory,
                    weekly_expense: weeklyExpense,
                    weekly_income: weeklyIncome,
                    time_range: timeRange
          });

        } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: error.message });
        }
  });
}

module.exports = handler;
