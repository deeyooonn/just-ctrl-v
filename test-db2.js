const { Client } = require('pg');

const url = 'postgresql://postgres:6tSaZjGyMh2JWH@db.jfqoixislzflpkyoawwy.supabase.co:5432/postgres';

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    console.log('Connected successfully');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows);
  } catch (err) {
    console.error('Connection error', err);
  } finally {
    await client.end();
  }
}

test();
