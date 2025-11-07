import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// GET - Lấy danh sách học hàm
export async function GET() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT MAHOCHAM, TENHOCHAM, MOTA
       FROM HOCHAM
       ORDER BY MAHOCHAM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const hocham = (result.rows as any[]).map((row: any) => ({
      maHocHam: row.MAHOCHAM,
      tenHocHam: row.TENHOCHAM,
      moTa: row.MOTA
    }));

    return NextResponse.json(hocham);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách học hàm', error: error.message },
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

// POST - Thêm học hàm mới
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { maHocHam, tenHocHam, moTa } = body;

    if (!maHocHam || !tenHocHam) {
      return NextResponse.json(
        { message: 'Mã học hàm và tên học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO HOCHAM (MAHOCHAM, TENHOCHAM, MOTA)
       VALUES (:maHocHam, :tenHocHam, :moTa)`,
      {
        maHocHam,
        tenHocHam,
        moTa: moTa || null
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      { message: 'Thêm học hàm thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 1) {
      return NextResponse.json(
        { message: 'Mã học hàm đã tồn tại' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi thêm học hàm', error: error.message },
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

// PUT - Cập nhật học hàm
export async function PUT(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { maHocHam, tenHocHam, moTa } = body;

    if (!maHocHam || !tenHocHam) {
      return NextResponse.json(
        { message: 'Mã học hàm và tên học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE HOCHAM
       SET TENHOCHAM = :tenHocHam, MOTA = :moTa
       WHERE MAHOCHAM = :maHocHam`,
      {
        tenHocHam,
        moTa: moTa || null,
        maHocHam
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học hàm' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cập nhật học hàm thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật học hàm', error: error.message },
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

// DELETE - Xóa học hàm
export async function DELETE(request: NextRequest) {
  let connection;

  try {
    const url = new URL(request.url);
    const maHocHam = url.searchParams.get('id');

    if (!maHocHam) {
      return NextResponse.json(
        { message: 'Mã học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `DELETE FROM HOCHAM WHERE MAHOCHAM = :maHocHam`,
      { maHocHam },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học hàm' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa học hàm thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 2292) {
      return NextResponse.json(
        { message: 'Không thể xóa học hàm đang được sử dụng' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi xóa học hàm', error: error.message },
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
