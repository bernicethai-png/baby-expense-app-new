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
      const client = await getClient();

      if (req.method === 'GET') {
        // 获取交易列表
        const userId = req.query.user_id;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        let query = 'SELECT t.*, u.name as user_name FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1';
        const params = [];

        if (userId) {
          query += ' AND t.user_id = $' + (params.length + 1);
          params.push(userId);
        }
        if (startDate) {
          query += ' AND t.date >= $' + (params.length + 1);
          params.push(startDate);
        }
        if (endDate) {
          query += ' AND t.date <= $' + (params.length + 1);
          params.push(endDate);
        }
        query += ' ORDER BY t.date DESC';

        const result = await client.query(query, params);
        return res.status(200).json(result.rows);

      } else if (req.method === 'POST') {
        // 创建交易
        const { user_id, type, category, amount, date, note } = req.body;

        const result = await client.query(
          'INSERT INTO transactions (user_id, type, category, amount, date, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [user_id, type, category, parseFloat(amount), date, note || '']
        );

        return res.status(201).json({
          success: true,
          id: result.rows[0].id,
          message: '交易记录已保存'
        });

      } else if (req.method === 'PUT') {
        // 更新交易
        const { id, user_id, type, category, amount, date, note } = req.body;

        await client.query(
          'UPDATE transactions SET user_id=$1, type=$2, category=$3, amount=$4, date=$5, note=$6 WHERE id=$7',
          [user_id, type, category, parseFloat(amount), date, note || '', id]
        );

        return res.status(200).json({ success: true, message: '交易已更新' });

      } else if (req.method === 'DELETE') {
        // 删除交易
        const id = req.query.id;

        await client.query('DELETE FROM transactions WHERE id=$1', [id]);

        return res.status(200).json({ success: true, message: '交易已删除' });
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
