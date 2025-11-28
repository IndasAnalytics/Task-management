import sql from 'mssql';

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

let pool: sql.ConnectionPool | null = null;

export const getDb = async () => {
  if (pool) return pool;
  try {
    pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    console.error('Database Connection Failed', err);
    throw err;
  }
};