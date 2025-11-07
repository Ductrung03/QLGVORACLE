// scripts/diagnose-encoding.js
const oracledb = require('oracledb');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Set NLS_LANG environment variable to ensure UTF-8
process.env.NLS_LANG = 'VIETNAMESE_VIETNAM.AL32UTF8';

// Set the output format to object for easier row access
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function diagnoseEncoding() {
  let connection;
  try {
    console.log('Attempting to connect to the database...');
    connection = await oracledb.getConnection({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
    });
    console.log('Database connection successful!');

    // 1. Check Database Character Set
    console.log('\n--- 1. Checking Database Character Set ---');
    const dbCharsetResult = await connection.execute(
      `SELECT parameter, value FROM nls_database_parameters WHERE parameter IN ('NLS_CHARACTERSET', 'NLS_NCHAR_CHARACTERSET')`
    );
    console.log('Database NLS Parameters:');
    console.table(dbCharsetResult.rows);
    const dbCharset = dbCharsetResult.rows.find(r => r.PARAMETER === 'NLS_CHARACTERSET').VALUE;
    if (dbCharset !== 'AL32UTF8') {
      console.warn(`\n⚠️ Warning: Database character set is ${dbCharset}, not AL32UTF8. This is a likely source of encoding issues.`);
    } else {
      console.log('✅ Database character set is AL32UTF8.');
    }

    // 2. Check Client-Side NLS_LANG
    console.log('\n--- 2. Checking Client-Side Environment ---');
    console.log(`Node.js process.env.NLS_LANG: ${process.env.NLS_LANG}`);
    if (process.env.NLS_LANG !== 'VIETNAMESE_VIETNAM.AL32UTF8') {
        console.warn(`\n⚠️ Warning: NLS_LANG is not set correctly for the client.`);
    } else {
        console.log('✅ Client NLS_LANG is correctly set.');
    }


    // 3. Test Data Insertion and Retrieval
    console.log('\n--- 3. Performing Live Data Test ---');
    const testTableName = 'ENCODING_TEST_TABLE';
    const testName = 'Nguyễn Văn An';
    const testId = Date.now();

    try {
      console.log(`Creating test table: ${testTableName}...`);
      await connection.execute(
        `CREATE TABLE ${testTableName} (id NUMBER, name NVARCHAR2(100))`
      );
      console.log('Test table created.');

      console.log(`Inserting test data: '${testName}'...`);
      await connection.execute(
        `INSERT INTO ${testTableName} (id, name) VALUES (:id, :name)`,
        { id: testId, name: testName },
        { autoCommit: true }
      );
      console.log('Test data inserted.');

      console.log('Retrieving test data...');
      const result = await connection.execute(
        `SELECT name FROM ${testTableName} WHERE id = :id`,
        { id: testId }
      );

      if (result.rows && result.rows.length > 0) {
        const retrievedName = result.rows[0].NAME;
        console.log(`Retrieved data: '${retrievedName}'`);

        if (retrievedName === testName) {
          console.log('✅ SUCCESS: Data was inserted and retrieved correctly!');
        } else {
          console.error('❌ FAILURE: Retrieved data does not match original data.');
          console.error(`Original: ${testName} (length: ${testName.length})`);
          console.error(`Retrieved: ${retrievedName} (length: ${retrievedName.length})`);
        }
      } else {
        console.error('❌ FAILURE: Could not retrieve test data.');
      }
    } finally {
      console.log(`Dropping test table: ${testTableName}...`);
      await connection.execute(`DROP TABLE ${testTableName}`);
      console.log('Test table dropped.');
    }

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\nConnection closed.');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

diagnoseEncoding();
