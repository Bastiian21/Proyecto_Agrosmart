const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.stack);
  } else {

    const res = await client.query('SELECT current_database()');
    console.log(`✅ Conectado REALMENTE a la base de datos: ${res.rows[0].current_database}`);
    release();
  }
});

module.exports = pool;