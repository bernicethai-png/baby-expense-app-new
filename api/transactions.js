const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const corsHandler = cors({ origin: '*' });
const SUPABASE_URL = 'https://cqqfssvcthbcuprbxvnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWZzc3ZjdGhiY3VwcmJ4dm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzMDA3NTAsImV4cCI6MjAyMDg3Njc1MH0.qWPjt8X8N8Z7_z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  corsHandler(req, res, async () => {
    try {
      if (req.method === 'GET') {
        const userId = req.query.user_id;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        let query = supabase.from('transactions').select('*,users(name)').order('date', { ascending: false });

        if (userId) query = query.eq('user_id', userId);
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;

        if (error) throw error;

        const rows = Array.isArray(data) ? data.map(row => ({
          ...row,
          user_name: row.users?.name || 'Unknown',
          amount: parseFloat(row.amount),
          date: row.date
        })) : [];

        return res.status(200).json(rows);

      } else if (req.method === 'POST') {
        const { user_id, type, category, amount, date, note } = req.body;

        const { data, error } = await supabase.from('transactions').insert([{
          user_id,
          type,
          category,
          amount: parseFloat(amount),
          date,
          note: note || ''
        }]).select();

        if (error) throw error;

        return res.status(201).json({
          success: true,
          id: data?.[0]?.id,
          message: '交易记录已保存'
        });

      } else if (req.method === 'PUT') {
        const { id, ...updateData } = req.body;

        const { error } = await supabase.from('transactions').update(updateData).eq('id', id);

        if (error) throw error;

        return res.status(200).json({ success: true, message: '交易已更新' });

      } else if (req.method === 'DELETE') {
        const id = req.query.id;

        const { error } = await supabase.from('transactions').delete().eq('id', id);

        if (error) throw error;

        return res.status(200).json({ success: true, message: '交易已删除' });
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
}

module.exports = handler;
