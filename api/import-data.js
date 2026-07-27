const cors = require('cors');
const { getClient } = require('../lib/db');

const corsHandler = cors({ origin: '*' });

async function handler(req, res) {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: '仅支持 POST 方法' });
      }

      const { users, categories, transactions } = req.body;

      if (!users || !Array.isArray(users) || !categories || !Array.isArray(categories) || !transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ success: false, error: '请提供 users, categories, transactions 数组' });
      }

      const client = await getClient();

      let importedUsers = 0;
      let importedCategories = 0;
      let importedTransactions = 0;

      // 导入用户
      for (const user of users) {
        try {
          await client.query(
            'INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [user.id, user.name, user.email, user.created_at]
          );
          importedUsers++;
        } catch (err) {
          console.error('导入用户失败:', err);
        }
      }

      // 导入分类
      for (const category of categories) {
        try {
          await client.query(
            'INSERT INTO categories (id, type, name, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [category.id, category.type, category.name, category.created_at]
          );
          importedCategories++;
        } catch (err) {
          console.error('导入分类失败:', err);
        }
      }

      // 导入交易
      for (const transaction of transactions) {
        try {
          await client.query(
            'INSERT INTO transactions (id, user_id, type, category, amount, date, note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
            [transaction.id, transaction.user_id, transaction.type, transaction.category, transaction.amount, transaction.date, transaction.note, transaction.created_at, transaction.updated_at]
          );
          importedTransactions++;
        } catch (err) {
          console.error('导入交易失败:', err);
        }
      }

      return res.status(200).json({
        success: true,
        message: '数据导入完成',
        imported: {
          users: importedUsers,
          categories: importedCategories,
          transactions: importedTransactions
        }
      });

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
