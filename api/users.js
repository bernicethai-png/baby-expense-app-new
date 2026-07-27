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
        const { data, error } = await supabase.from('users').select('id,name,email');

        if (error) throw error;

        return res.status(200).json(Array.isArray(data) ? data : []);
      }

    } catch (error) {
      console.error('❌ 错误:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

module.exports = handler;
