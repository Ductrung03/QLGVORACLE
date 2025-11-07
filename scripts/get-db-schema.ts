import { config } from 'dotenv';
import { executeQuery } from '../lib/oracle';

// Load environment variables
config({ path: '.env.local' });

async function getDbSchema() {
  try {
    // Get all tables
    const tables = await executeQuery(`
      SELECT table_name FROM user_tables ORDER BY table_name
    `);

    console.log('\n=== DATABASE TABLES ===\n');
    if (tables.rows) {
      for (const row of tables.rows as any[]) {
        console.log(`- ${row.TABLE_NAME}`);
      }
    }

    // Get table details
    if (tables.rows) {
      for (const row of tables.rows as any[]) {
        const tableName = row.TABLE_NAME;
        console.log(`\n=== ${tableName} ===`);

        const columns = await executeQuery(`
          SELECT column_name, data_type, data_length, nullable
          FROM user_tab_columns
          WHERE table_name = :tableName
          ORDER BY column_id
        `, { tableName });

        if (columns.rows) {
          for (const col of columns.rows as any[]) {
            console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.DATA_LENGTH ? `(${col.DATA_LENGTH})` : ''}) ${col.NULLABLE === 'N' ? 'NOT NULL' : 'NULL'}`);
          }
        }

        // Get sample data count
        const count = await executeQuery(`SELECT COUNT(*) as CNT FROM ${tableName}`);
        console.log(`  Total rows: ${(count.rows as any[])?.[0]?.CNT || 0}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getDbSchema();
