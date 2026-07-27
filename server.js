// 简单的 Express 服务器，直接连接 Supabase
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Supabase 配置
const SUPABASE_URL = 'https://cqqfssvcthbcuprbxvnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWZzc3ZjdGhiY3VwcmJ4dm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzMDA3NTAsImV4cCI6MjAyMDg3Njc1MH0.qWPjt8X8N8Z7_z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// API 路由

// 获取交易数据
app.get('/api/transactions', async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;

    let query = supabase
      .from('transactions')
      .select('*, users(name)')
      .order('date', { ascending: false });

    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);
    if (user_id) query = query.eq('user_id', user_id);

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取统计数据
app.get('/api/statistics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('transactions')
      .select('*,users(name)');

    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);

    const { data, error } = await query;

    if (error) throw error;

    // 计算统计
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};
    const incomeByCategory = {};

    data?.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'expense') {
        totalExpense += amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amount;
      } else {
        totalIncome += amount;
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amount;
      }
    });

    res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      expense_by_category: expenseByCategory,
      income_by_category: incomeByCategory
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取分类
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加交易
app.post('/api/transactions', async (req, res) => {
  try {
    const { user_id, type, category, amount, date, note } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ user_id, type, category, amount, date, note }])
      .select();

    if (error) throw error;

    res.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});
