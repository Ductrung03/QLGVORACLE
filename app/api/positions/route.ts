import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// GET - Lấy danh sách chức vụ
export async function GET() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT MACHUCVU, TENCHUCVU, MOTA
       FROM CHUCVU
       ORDER BY MACHUCVU`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const positions = (result.rows as any[]).map((row: any) => ({
      maChucVu: row.MACHUCVU,
      tenChucVu: row.TENCHUCVU,
      moTa: row.MOTA
    }));

    return NextResponse.json(positions);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách chức vụ', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// POST - Thêm chức vụ mới
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { maChucVu, tenChucVu, moTa } = body;

    // Validation
    if (!maChucVu || !tenChucVu) {
      return NextResponse.json(
        { message: 'Mã chức vụ và tên chức vụ là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO CHUCVU (MACHUCVU, TENCHUCVU, MOTA)
       VALUES (:maChucVu, :tenChucVu, :moTa)`,
      {
        maChucVu,
        tenChucVu,
        moTa: moTa || null
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      { message: 'Thêm chức vụ thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 1) {
      return NextResponse.json(
        { message: 'Mã chức vụ đã tồn tại' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi thêm chức vụ', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}
