const { Client } = require('pg');

let client;

async function getClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
  }
  return client;
}

async function initDb() {
  const client = await getClient();

  try {
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
      )
    `);

    // 创建分类表
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    // 创建交易表
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 初始化用户数据
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (userCount.rows[0].count === 0) {
      await client.query("INSERT INTO users (name, email) VALUES ('Edward', 'edward@example.com')");
      await client.query("INSERT INTO users (name, email) VALUES ('Bernice', 'bernice@example.com')");
    }

    // 初始化分类数据
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    if (categoryCount.rows[0].count === 0) {
      const categories = [
        ('expense', '伙食'),
        ('expense', '杂费'),
        ('expense', '马票'),
        ('expense', '赌博'),
        ('expense', '房屋贷款'),
        ('expense', 'CP 500'),
        ('expense', 'Side Income'),
        ('income', '借贷'),
        ('income', '收入'),
        ('income', '银行利息/股息'),
        ('income', 'WL Salary'),
        ('income', 'HMSB Incentive'),
        ('income', 'OJ Incentive'),
        ('income', 'Lepas Incentive'),
        ('income', 'SleepyFace Studio Account')
      ];

      for (const [type, name] of categories) {
        await client.query('INSERT INTO categories (type, name) VALUES ($1, $2)', [type, name]);
      }
    }

    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

module.exports = { getClient, initDb };
