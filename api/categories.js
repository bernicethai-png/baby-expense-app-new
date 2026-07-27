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
        // 获取所有分类
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });

        const data = await response.json();
        return res.status(200).json(Array.isArray(data) ? data : []);

      } else if (req.method === 'POST') {
        // 创建分类
        const { type, name } = req.body;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ type, name })
        });

        const result = await response.json();
        return res.status(201).json({
          success: true,
          id: result[0]?.id,
          message: '分类已创建'
        });

      } else if (req.method === 'PUT') {
        // 更新分类
        const { id, ...updateData } = req.body;

        await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        return res.status(200).json({ success: true, message: '分类已更新' });

      } else if (req.method === 'DELETE') {
        // 删除分类
        const id = req.query.id;

        await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });

        return res.status(200).json({ success: true, message: '分类已删除' });
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
