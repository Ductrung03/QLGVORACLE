import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';

export async function GET() {
  try {
    // Get all tables
    const tables = await executeQuery(`
      SELECT table_name FROM user_tables ORDER BY table_name
    `);

    const schema: any = {};

    if (tables.rows) {
      for (const row of tables.rows as any[]) {
        const tableName = row.TABLE_NAME;

        const columns = await executeQuery(`
          SELECT column_name, data_type, data_length, nullable
          FROM user_tab_columns
          WHERE table_name = :tableName
          ORDER BY column_id
        `, { tableName });

        const count = await executeQuery(`SELECT COUNT(*) as CNT FROM ${tableName}`);

        schema[tableName] = {
          columns: columns.rows || [],
          rowCount: (count.rows as any[])?.[0]?.CNT || 0
        };
      }
    }

    return NextResponse.json(schema, { status: 200 });
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
