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

      if (req.method === 'GET') {
        const result = await client.query('SELECT id, type, name FROM categories');
        return res.status(200).json(result.rows);

      } else if (req.method === 'POST') {
        const { type, name } = req.body;
        const result = await client.query(
          'INSERT INTO categories (type, name) VALUES ($1, $2) RETURNING id',
          [type, name]
        );
        return res.status(201).json({ success: true, id: result.rows[0].id, message: '分类已保存' });

      } else if (req.method === 'PUT') {
        const { id, type, name } = req.body;
        await client.query(
          'UPDATE categories SET type=$1, name=$2 WHERE id=$3',
          [type, name, id]
        );
        return res.status(200).json({ success: true, message: '分类已更新' });

      } else if (req.method === 'DELETE') {
        const id = req.query.id;
        await client.query('DELETE FROM categories WHERE id=$1', [id]);
        return res.status(200).json({ success: true, message: '分类已删除' });
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

module.exports = handler;
