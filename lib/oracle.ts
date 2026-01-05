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

/**
 * Execute a PL/SQL stored procedure with OUT parameters
 * @param procedureName - Tên procedure (VD: 'PKG_GIAOVIEN.SP_THEM')
 * @param binds - Parameters bao gồm IN và OUT
 * @returns Promise<oracledb.Result<any>>
 */
export async function executeProcedure(
  procedureName: string,
  binds: oracledb.BindParameters = {}
): Promise<oracledb.Result<any>> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    // Tạo PL/SQL block để gọi procedure
    const bindNames = Object.keys(binds);
    const paramList = bindNames.map(name => `:${name}`).join(', ');
    const plsql = `BEGIN ${procedureName}(${paramList}); END;`;

    const result = await connection.execute(plsql, binds);
    await connection.commit();

    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('✗ Error during rollback:', rollbackError);
      }
    }
    console.error('✗ Error executing procedure:', error);
    throw error;
  } finally {
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
 * Execute a PL/SQL function and return result
 * @param functionName - Tên function (VD: 'FN_DEM_GV_BOMON')
 * @param binds - Parameters
 * @returns Promise với giá trị trả về của function
 */
export async function executeFunction<T = any>(
  functionName: string,
  binds: oracledb.BindParameters = {},
  returnType: oracledb.DbType = oracledb.NUMBER
): Promise<T> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const bindNames = Object.keys(binds);
    const paramList = bindNames.length > 0
      ? bindNames.map(name => `:${name}`).join(', ')
      : '';

    const plsql = `BEGIN :result := ${functionName}(${paramList}); END;`;

    const allBinds = {
      ...binds,
      result: { dir: oracledb.BIND_OUT, type: returnType }
    };

    const result = await connection.execute(plsql, allBinds);

    return (result.outBinds as any).result as T;
  } catch (error) {
    console.error('✗ Error executing function:', error);
    throw error;
  } finally {
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
 * Execute a PL/SQL procedure that returns a REF CURSOR
 * @param procedureName - Tên procedure (VD: 'PKG_BOMON.SP_LAYDS')
 * @param inBinds - IN parameters
 * @param cursorName - Tên của OUT cursor parameter (default: 'p_cursor')
 * @returns Promise<T[]> - Mảng kết quả từ cursor
 */
export async function executeProcedureWithCursor<T = any>(
  procedureName: string,
  inBinds: Record<string, any> = {},
  cursorName: string = 'p_cursor'
): Promise<T[]> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    // Tạo danh sách tham số
    const bindNames = Object.keys(inBinds);
    const allParams = [...bindNames, cursorName];
    const paramList = allParams.map(name => `:${name}`).join(', ');
    const plsql = `BEGIN ${procedureName}(${paramList}); END;`;

    // Tạo binds với cursor output
    const allBinds: Record<string, any> = { ...inBinds };
    allBinds[cursorName] = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };

    const result = await connection.execute(plsql, allBinds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Lấy dữ liệu từ cursor
    const cursor = (result.outBinds as any)[cursorName];
    const rows: T[] = [];

    if (cursor) {
      let row;
      while ((row = await cursor.getRow())) {
        rows.push(row as T);
      }
      await cursor.close();
    }

    return rows;
  } catch (error) {
    console.error('✗ Error executing procedure with cursor:', error);
    throw error;
  } finally {
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
 * Execute a PL/SQL procedure with OUT parameters and optional cursor
 * @param procedureName - Tên procedure
 * @param binds - Tất cả parameters (IN và OUT)
 * @param cursorNames - Danh sách tên các cursor parameters
 * @returns Promise với outBinds và dữ liệu từ cursors
 */
export async function executeProcedureFull<T = any>(
  procedureName: string,
  binds: Record<string, any>,
  cursorNames: string[] = []
): Promise<{
  outBinds: Record<string, any>;
  cursors: Record<string, T[]>;
}> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const bindNames = Object.keys(binds);
    const paramList = bindNames.map(name => `:${name}`).join(', ');
    const plsql = `BEGIN ${procedureName}(${paramList}); END;`;

    const result = await connection.execute(plsql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    await connection.commit();

    // Extract cursor data
    const cursors: Record<string, T[]> = {};
    const outBinds = result.outBinds as Record<string, any>;

    for (const cursorName of cursorNames) {
      const cursor = outBinds[cursorName];
      if (cursor) {
        const rows: T[] = [];
        let row;
        while ((row = await cursor.getRow())) {
          rows.push(row as T);
        }
        await cursor.close();
        cursors[cursorName] = rows;
        delete outBinds[cursorName]; // Remove cursor from outBinds
      }
    }

    return { outBinds, cursors };
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('✗ Error during rollback:', rollbackError);
      }
    }
    console.error('✗ Error executing procedure full:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('✗ Error closing connection:', closeError);
      }
    }
  }
}

export default {
  initializePool,
  getConnection,
  executeQuery,
  executeTransaction,
  executeProcedure,
  executeFunction,
  executeProcedureWithCursor,
  executeProcedureFull,
  getPoolStatistics,
  closePool,
};
