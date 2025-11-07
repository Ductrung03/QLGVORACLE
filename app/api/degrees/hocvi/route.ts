import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// GET - Lấy danh sách học vị
export async function GET() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT MAHOCVI, TENHOCVI, MOTA
       FROM HOCVI
       ORDER BY MAHOCVI`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const hocvi = (result.rows as any[]).map((row: any) => ({
      maHocVi: row.MAHOCVI,
      tenHocVi: row.TENHOCVI,
      moTa: row.MOTA
    }));

    return NextResponse.json(hocvi);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách học vị', error: error.message },
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

// POST - Thêm học vị mới
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { maHocVi, tenHocVi, moTa } = body;

    if (!maHocVi || !tenHocVi) {
      return NextResponse.json(
        { message: 'Mã học vị và tên học vị là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO HOCVI (MAHOCVI, TENHOCVI, MOTA)
       VALUES (:maHocVi, :tenHocVi, :moTa)`,
      {
        maHocVi,
        tenHocVi,
        moTa: moTa || null
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      { message: 'Thêm học vị thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 1) {
      return NextResponse.json(
        { message: 'Mã học vị đã tồn tại' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi thêm học vị', error: error.message },
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

// PUT - Cập nhật học vị
export async function PUT(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { maHocVi, tenHocVi, moTa } = body;

    if (!maHocVi || !tenHocVi) {
      return NextResponse.json(
        { message: 'Mã học vị và tên học vị là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE HOCVI
       SET TENHOCVI = :tenHocVi, MOTA = :moTa
       WHERE MAHOCVI = :maHocVi`,
      {
        tenHocVi,
        moTa: moTa || null,
        maHocVi
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học vị' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cập nhật học vị thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật học vị', error: error.message },
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

// DELETE - Xóa học vị
export async function DELETE(request: NextRequest) {
  let connection;

  try {
    const url = new URL(request.url);
    const maHocVi = url.searchParams.get('id');

    if (!maHocVi) {
      return NextResponse.json(
        { message: 'Mã học vị là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `DELETE FROM HOCVI WHERE MAHOCVI = :maHocVi`,
      { maHocVi },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học vị' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa học vị thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 2292) {
      return NextResponse.json(
        { message: 'Không thể xóa học vị đang được sử dụng' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi xóa học vị', error: error.message },
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
