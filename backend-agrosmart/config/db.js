const { Pool } = require('pg');
require('dotenv').config();

const ssl = process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };

const esServerless = Boolean(process.env.VERCEL);

const conexion = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool({
  ...conexion,
  ssl,
  max: Number(process.env.DB_POOL_MAX) || (esServerless ? 2 : 10),
});

pool.on('error', (err) => {
  console.error('🚨 Error inesperado en el pool de PostgreSQL:', err.message);
});

if (!esServerless) {
  pool.connect(async (err, client, release) => {
    if (err) {
      console.error('❌ Error conectando a PostgreSQL:', err.stack);
    } else {
      const res = await client.query('SELECT current_database()');
      console.log(`✅ Conectado REALMENTE a la base de datos: ${res.rows[0].current_database}`);
      release();
    }
  });
}

module.exports = pool;
