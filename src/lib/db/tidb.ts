// lib/db/tidb.ts
// TiDB Cloud adapter for TaskFlow
// MySQL-compatible connection pool

import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

let pool: Pool | null = null;

// Get or create connection pool
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.TIDB_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      // Fallback to individual env vars
      pool = mysql.createPool({
        host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'taskflow',
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
    } else {
      // Use connection string (TiDB Cloud provides this)
      pool = mysql.createPool(connectionString);
    }
  }
  
  return pool;
}

// Execute a query
export async function query<T extends RowDataPacket[]>(
  sql: string, 
  params?: any[]
): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

// Execute a query that returns a single row
export async function queryOne<T extends RowDataPacket>(
  sql: string, 
  params?: any[]
): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute an INSERT/UPDATE/DELETE
export async function execute(
  sql: string, 
  params?: any[]
): Promise<ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

// Get a connection from the pool (for transactions)
export async function getConnection(): Promise<PoolConnection> {
  const pool = getPool();
  return pool.getConnection();
}

// Run a transaction
export async function transaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Initialize database schema
export async function initializeSchema(): Promise<void> {
  await execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      team VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Todo',
      deadline DATETIME,
      progress INT DEFAULT 0,
      budget DECIMAL(15, 2) DEFAULT 0,
      revenue DECIMAL(15, 2) DEFAULT 0,
      margin DECIMAL(10, 2) DEFAULT 0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_team (team),
      INDEX idx_deadline (deadline)
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      project_id VARCHAR(255),
      title VARCHAR(500) NOT NULL,
      description TEXT,
      assignee VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Todo',
      priority VARCHAR(20) DEFAULT 'Medium',
      due_date DATETIME,
      estimated_hours DECIMAL(10, 2) DEFAULT 0,
      actual_hours DECIMAL(10, 2) DEFAULT 0,
      tags JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_project (project_id),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_assignee (assignee),
      INDEX idx_due_date (due_date),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);
}

export default {
  getPool,
  query,
  queryOne,
  execute,
  getConnection,
  transaction,
  closePool,
  initializeSchema,
};
