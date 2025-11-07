/**
 * Oracle Database Connection Module
 *
 * This module manages the Oracle Database connection pool for the application.
 * It uses the node-oracledb driver to connect to the Oracle Database.
 *
 * Environment Variables Required:
 * - DB_USERNAME: Database username
 * - DB_PASSWORD: Database password
 * - DB_HOST: Database host
 * - DB_PORT: Database port
 * - DB_SERVICE_NAME: Database service name
 */

import oracledb from 'oracledb';

// Configure Oracle client settings
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // Return query results as objects
oracledb.autoCommit = false; // Disable auto-commit by default for transaction control
oracledb.fetchAsString = [ oracledb.CLOB ]; // Fetch CLOBs as strings
oracledb.maxRows = 0; // No row limit (fetch all rows)

// Set UTF-8 encoding for proper Vietnamese character support
// Use AL32UTF8 for proper Unicode support with NVARCHAR2
if (process.env.NLS_LANG === undefined) {
  process.env.NLS_LANG = 'AMERICAN_AMERICA.AL32UTF8';
}
process.env.NLS_NCHAR = 'AL32UTF8'; // Ensure NCHAR/NVARCHAR2 uses UTF-8

// Connection pool configuration
const poolConfig: oracledb.PoolAttributes = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
  poolMin: 2,          // Minimum number of connections in pool
  poolMax: 10,         // Maximum number of connections in pool
  poolIncrement: 1,    // Number of connections to add when pool is exhausted
  poolTimeout: 60,     // Idle time before connection is closed (seconds)
  queueTimeout: 60000, // Time to wait for a connection (milliseconds)
  enableStatistics: true, // Enable pool statistics
};

// Global pool instance
let pool: oracledb.Pool | null = null;

/**
 * Initialize the Oracle connection pool
 * This should be called once when the application starts
 * @returns Promise<oracledb.Pool>
 */
export async function initializePool(): Promise<oracledb.Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = await oracledb.createPool(poolConfig);
    console.log('✓ Oracle connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('✗ Error creating Oracle connection pool:', error);
    throw error;
  }
}

/**
 * Get a connection from the pool
 * @returns Promise<oracledb.Connection>
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    await initializePool();
  }

  try {
    const connection = await pool!.getConnection();
    return connection;
  } catch (error) {
    console.error('✗ Error getting connection from pool:', error);
    throw error;
  }
}

/**
 * Execute a query with automatic connection management
 * @param sql SQL query string
 * @param binds Bind parameters for the query
 * @param options Query execution options
 * @returns Promise<oracledb.Result<any>>
 */
export async function executeQuery<T = any>(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const result = await connection.execute<T>(sql, binds, options);

    // Auto-commit if the query modifies data
    if (sql.trim().toLowerCase().startsWith('insert') ||
        sql.trim().toLowerCase().startsWith('update') ||
        sql.trim().toLowerCase().startsWith('delete')) {
      await connection.commit();
    }

    return result;
  } catch (error) {
    // Rollback on error if connection exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('✗ Error during rollback:', rollbackError);
      }
    }
    console.error('✗ Error executing query:', error);
    throw error;
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('✗ Error closing connection:', closeError);
      }
    }
  }
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of query objects with sql, binds, and options
 * @returns Promise<oracledb.Result<any>[]>
 */
export async function executeTransaction(
  queries: Array<{
    sql: string;
    binds?: oracledb.BindParameters;
    options?: oracledb.ExecuteOptions;
  }>
): Promise<oracledb.Result<any>[]> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const results: oracledb.Result<any>[] = [];

    for (const query of queries) {
      const result = await connection.execute(
        query.sql,
        query.binds || {},
        query.options || {}
      );
      results.push(result);
    }

    // Commit all queries as a single transaction
    await connection.commit();
    return results;
  } catch (error) {
    // Rollback all queries on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('✗ Error during rollback:', rollbackError);
      }
    }
    console.error('✗ Error executing transaction:', error);
    throw error;
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('✗ Error closing connection:', closeError);
      }
    }
  }
}

/**
 * Get pool statistics
 * @returns Pool statistics or undefined
 */
export function getPoolStatistics() {
  return pool?.getStatistics();
}

/**
 * Close the connection pool
 * This should be called when the application is shutting down
 */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.close(10); // Wait up to 10 seconds for connections to close
      pool = null;
      console.log('✓ Oracle connection pool closed successfully');
    } catch (error) {
      console.error('✗ Error closing Oracle connection pool:', error);
      throw error;
    }
  }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing Oracle connection pool...');
    await closePool();
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing Oracle connection pool...');
    await closePool();
  });
}

export default {
  initializePool,
  getConnection,
  executeQuery,
  executeTransaction,
  getPoolStatistics,
  closePool,
};
