/**
 * Setup Auto-Increment for Teacher ID
 *
 * This script creates a sequence and trigger for auto-generating teacher IDs
 */

import oracledb from 'oracledb';

const config = {
  user: process.env.DB_USERNAME || 'LuckyBoiz',
  password: process.env.DB_PASSWORD || '4',
  connectString: `${process.env.DB_HOST || '172.17.0.1'}:${process.env.DB_PORT || '1521'}/${process.env.DB_SERVICE_NAME || 'qlgvpdb'}`,
};

async function setupAutoIncrement() {
  let connection;

  try {
    console.log('🔌 Connecting to Oracle Database...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Connected successfully!');

    // 1. Check current table structure
    console.log('\n📋 Checking GIAOVIEN table structure...');
    const tableInfo = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
       FROM USER_TAB_COLUMNS
       WHERE TABLE_NAME = 'GIAOVIEN'
       ORDER BY COLUMN_ID`
    );
    console.log('Table structure:', tableInfo.rows);

    // 2. Check if sequence exists
    console.log('\n🔍 Checking for existing sequence...');
    const seqCheck = await connection.execute(
      `SELECT SEQUENCE_NAME FROM USER_SEQUENCES WHERE SEQUENCE_NAME = 'SEQ_GIAOVIEN'`
    );

    if (seqCheck.rows && seqCheck.rows.length > 0) {
      console.log('⚠️  Sequence SEQ_GIAOVIEN already exists. Dropping...');
      await connection.execute(`DROP SEQUENCE SEQ_GIAOVIEN`);
    }

    // 3. Create sequence
    console.log('\n🔨 Creating sequence SEQ_GIAOVIEN...');
    await connection.execute(`
      CREATE SEQUENCE SEQ_GIAOVIEN
      START WITH 1
      INCREMENT BY 1
      NOMAXVALUE
      NOCYCLE
      CACHE 20
    `);
    console.log('✅ Sequence created successfully!');

    // 4. Check if trigger exists
    console.log('\n🔍 Checking for existing trigger...');
    const triggerCheck = await connection.execute(
      `SELECT TRIGGER_NAME FROM USER_TRIGGERS WHERE TRIGGER_NAME = 'TRG_GIAOVIEN_MAGV'`
    );

    if (triggerCheck.rows && triggerCheck.rows.length > 0) {
      console.log('⚠️  Trigger TRG_GIAOVIEN_MAGV already exists. Dropping...');
      await connection.execute(`DROP TRIGGER TRG_GIAOVIEN_MAGV`);
    }

    // 5. Create trigger for auto-generating MAGV
    console.log('\n🔨 Creating trigger TRG_GIAOVIEN_MAGV...');
    await connection.execute(`
      CREATE OR REPLACE TRIGGER TRG_GIAOVIEN_MAGV
      BEFORE INSERT ON GIAOVIEN
      FOR EACH ROW
      BEGIN
        IF :NEW.MAGV IS NULL THEN
          SELECT 'GV' || LPAD(SEQ_GIAOVIEN.NEXTVAL, 4, '0') INTO :NEW.MAGV FROM DUAL;
        END IF;
      END;
    `);
    console.log('✅ Trigger created successfully!');

    // 6. Create stored procedure for generating next teacher ID
    console.log('\n🔨 Creating stored procedure GET_NEXT_MAGV...');
    await connection.execute(`
      CREATE OR REPLACE PROCEDURE GET_NEXT_MAGV(
        p_magv OUT VARCHAR2
      ) AS
      BEGIN
        SELECT 'GV' || LPAD(SEQ_GIAOVIEN.NEXTVAL, 4, '0') INTO p_magv FROM DUAL;
      END;
    `);
    console.log('✅ Stored procedure created successfully!');

    // 7. Create function to get next teacher ID
    console.log('\n🔨 Creating function FN_GET_NEXT_MAGV...');
    await connection.execute(`
      CREATE OR REPLACE FUNCTION FN_GET_NEXT_MAGV
      RETURN VARCHAR2
      IS
        v_magv VARCHAR2(10);
      BEGIN
        SELECT 'GV' || LPAD(SEQ_GIAOVIEN.NEXTVAL, 4, '0') INTO v_magv FROM DUAL;
        RETURN v_magv;
      END;
    `);
    console.log('✅ Function created successfully!');

    // 8. Test the sequence
    console.log('\n🧪 Testing auto-increment...');
    const testResult = await connection.execute(`SELECT FN_GET_NEXT_MAGV() as NEXT_ID FROM DUAL`);
    console.log('Next teacher ID will be:', testResult.rows);

    // 9. Show current max MAGV
    console.log('\n📊 Current data in GIAOVIEN table...');
    const currentData = await connection.execute(
      `SELECT COUNT(*) as TOTAL_TEACHERS, MAX(MAGV) as MAX_MAGV FROM GIAOVIEN`
    );
    console.log('Current statistics:', currentData.rows);

    await connection.commit();
    console.log('\n✅ All changes committed successfully!');
    console.log('\n🎉 Setup completed! Auto-increment is now active for GIAOVIEN table.');
    console.log('\n📝 Summary:');
    console.log('  - Sequence: SEQ_GIAOVIEN');
    console.log('  - Trigger: TRG_GIAOVIEN_MAGV (auto-fills MAGV on INSERT)');
    console.log('  - Procedure: GET_NEXT_MAGV (call to get next ID)');
    console.log('  - Function: FN_GET_NEXT_MAGV (returns next ID)');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔌 Database connection closed.');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Run the setup
setupAutoIncrement()
  .then(() => {
    console.log('\n✨ Setup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup script failed:', error);
    process.exit(1);
  });
