import sql from 'mssql';

// Global pool variable to maintain connection across hot reloads in dev
// and warm starts in Vercel Serverless
let pool: sql.ConnectionPool | null = null;

export const getDb = async () => {
  // Return existing pool if connected
  if (pool) {
    if (pool.connected) {
      return pool;
    }
    // If pool exists but disconnected, try to connect again
    await pool.connect();
    return pool;
  }

  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    // Configure connection using the connection string directly
    // Ensure your connection string includes: 
    // sqlserver://user:pass@host:1433?database=db&encrypt=true
    pool = await sql.connect(connectionString);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected SQL Pool Error:', err);
      pool = null; 
    });

    return pool;
  } catch (err) {
    console.error('Database Connection Failed:', err);
    throw err;
  }
};