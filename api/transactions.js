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
      if (req.method === 'GET') {
        // 使用 Supabase REST API 获取交易数据
        const userId = req.query.user_id;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        let url = `${SUPABASE_URL}/rest/v1/transactions?select=*,users(name)`;

        if (userId) {
          url += `&user_id=eq.${userId}`;
        }
        if (startDate) {
          url += `&date=gte.${startDate}`;
        }
        if (endDate) {
          url += `&date=lte.${endDate}`;
        }
        url += '&order=date.desc';

        const response = await fetch(url, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });

        const data = await response.json();

        // 格式化响应数据
        const rows = Array.isArray(data) ? data.map(row => ({
          ...row,
          user_name: row.users?.name || 'Unknown',
          amount: parseFloat(row.amount),
          date: row.date
        })) : [];

        return res.status(200).json(rows);

      } else if (req.method === 'POST') {
        // 创建交易
        const { user_id, type, category, amount, date, note } = req.body;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id,
            type,
            category,
            amount: parseFloat(amount),
            date,
            note: note || ''
          })
        });

        const result = await response.json();
        return res.status(201).json({
          success: true,
          id: result[0]?.id,
          message: '交易记录已保存'
        });

      } else if (req.method === 'PUT') {
        // 更新交易
        const { id, ...updateData } = req.body;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        return res.status(200).json({ success: true, message: '交易已更新' });

      } else if (req.method === 'DELETE') {
        // 删除交易
        const id = req.query.id;

        await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });

        return res.status(200).json({ success: true, message: '交易已删除' });
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
