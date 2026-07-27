// 直接在浏览器中使用 Supabase 客户端库
// 从 CDN 引入 Supabase 库

const SUPABASE_URL = 'https://cqqfssvcthbcuprbxvnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWZzc3ZjdGhiY3VwcmJ4dm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUzMDA3NTAsImV4cCI6MjAyMDg3Njc1MH0.qWPjt8X8N8Z7_z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0_Z0';

let supabaseClient = null;

async function initSupabase() {
  if (!supabaseClient) {
    // 动态加载 Supabase 库
    if (!window.supabase) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/dist/main.iife.js';
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

async function getUsers() {
  const client = await initSupabase();
  const { data, error } = await client.from('users').select('*');
  if (error) throw error;
  return data || [];
}

async function getTransactions(filters) {
  const client = await initSupabase();
  let query = client.from('transactions').select('*,users(name)').order('date', { ascending: false });

  if (filters) {
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.start_date) query = query.gte('date', filters.start_date);
    if (filters.end_date) query = query.lte('date', filters.end_date);
  }

  const { data, error } = await query;
  if (error) throw error;

  return Array.isArray(data) ? data.map(row => ({
    ...row,
    user_name: row.users?.name || 'Unknown',
    amount: parseFloat(row.amount),
    date: row.date
  })) : [];
}

async function addTransactionAPI(data) {
  const client = await initSupabase();
  const { data: result, error } = await client.from('transactions').insert([{
    user_id: data.user_id,
    type: data.type,
    category: data.category,
    amount: parseFloat(data.amount),
    date: data.date,
    note: data.note || ''
  }]).select();

  if (error) throw error;
  return { success: true, id: result?.[0]?.id, message: '交易记录已保存' };
}

async function updateTransaction(transactionId, updateData) {
  const client = await initSupabase();
  const { error } = await client.from('transactions').update(updateData).eq('id', transactionId);
  if (error) throw error;
  return { success: true, message: '交易已更新' };
}

async function deleteTransaction(transactionId) {
  const client = await initSupabase();
  const { error } = await client.from('transactions').delete().eq('id', transactionId);
  if (error) throw error;
  return { success: true, message: '交易已删除' };
}

async function getStatistics(userId, dateRange) {
  const client = await initSupabase();

  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const monthEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const isCustomRange = Boolean(dateRange && (dateRange.start_date || dateRange.end_date));
  const rangeStart = dateRange?.start_date || monthStart;
  const rangeEnd = dateRange?.end_date || monthEnd;

  let query = client.from('transactions').select('*,users(name)').gte('date', rangeStart).lte('date', rangeEnd).order('date', { ascending: false });

  const { data: allTransactions, error } = await query;
  if (error) throw error;

  if (!Array.isArray(allTransactions)) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      expenseByCategory: {},
      incomeByCategory: {},
      userStats: { Edward: { income: 0, expense: 0 }, Bernice: { income: 0, expense: 0 } },
      weeklyStats: []
    };
  }

  const rangeTransactions = allTransactions.map(t => ({
    ...t,
    user_name: t.users?.name || 'Unknown',
    amount: parseFloat(t.amount)
  }));

  const transactions = userId
    ? rangeTransactions.filter(t => String(t.user_id) === String(userId))
    : rangeTransactions;

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const expenseByCategory = {};
  const incomeByCategory = {};
  const userExpenseByCategory = { Edward: {}, Bernice: {} };
  const userIncomeByCategory = { Edward: {}, Bernice: {} };

  for (const t of transactions) {
    if (t.type === 'expense') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      if (t.user_name) {
        userExpenseByCategory[t.user_name] = userExpenseByCategory[t.user_name] || {};
        userExpenseByCategory[t.user_name][t.category] = (userExpenseByCategory[t.user_name][t.category] || 0) + t.amount;
      }
    } else {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      if (t.user_name) {
        userIncomeByCategory[t.user_name] = userIncomeByCategory[t.user_name] || {};
        userIncomeByCategory[t.user_name][t.category] = (userIncomeByCategory[t.user_name][t.category] || 0) + t.amount;
      }
    }
  }

  const userStats = { Edward: { income: 0, expense: 0 }, Bernice: { income: 0, expense: 0 } };
  for (const t of rangeTransactions) {
    if (!t.user_name) continue;
    if (!userStats[t.user_name]) userStats[t.user_name] = { income: 0, expense: 0 };
    if (t.type === 'expense') userStats[t.user_name].expense += t.amount;
    else userStats[t.user_name].income += t.amount;
  }

  let weeklyStats = [];
  if (!isCustomRange) {
    const dayOfMonth = dateVal => {
      const s = dateVal instanceof Date ? dateVal.toISOString().slice(0, 10) : dateVal;
      if (typeof s !== 'string' || s.length < 10) return null;
      const day = parseInt(s.slice(8, 10), 10);
      return Number.isNaN(day) ? null : day;
    };

    for (let week = 1; week <= 4; week++) {
      const dayStart = (week - 1) * 7 + 1;
      const dayEnd = Math.min(week * 7, 31);
      const weekTransactions = transactions.filter(t => {
        const day = dayOfMonth(t.date);
        return day !== null && day >= dayStart && day <= dayEnd;
      });

      const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

      weeklyStats.push({
        week,
        dayRange: `${dayStart}-${dayEnd}`,
        income: weekIncome,
        expense: weekExpense,
        balance: weekIncome - weekExpense
      });
    }
  }

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    expense_by_category: expenseByCategory,
    income_by_category: incomeByCategory,
    user_expense_by_category: userExpenseByCategory,
    user_income_by_category: userIncomeByCategory,
    user_stats: userStats,
    weekly_stats: weeklyStats,
    transaction_count: transactions.length,
    // 兼容驼峰式命名
    totalIncome,
    totalExpense,
    expenseByCategory,
    incomeByCategory,
    userExpenseByCategory,
    userIncomeByCategory,
    userStats,
    weeklyStats,
    transactionCount: transactions.length
  };
}

async function getCategories() {
  const client = await initSupabase();
  const { data, error } = await client.from('categories').select('*');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function addCategoryAPI(type, name) {
  const client = await initSupabase();
  const { data, error } = await client.from('categories').insert([{ type, name }]).select();
  if (error) throw error;
  return { success: true, id: data?.[0]?.id, message: '分类已创建' };
}
