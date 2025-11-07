import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// PUT - Cập nhật chức vụ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const body = await request.json();
    const { tenChucVu, moTa } = body;
    const maChucVu = params.id;

    if (!tenChucVu) {
      return NextResponse.json(
        { message: 'Tên chức vụ là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE CHUCVU
       SET TENCHUCVU = :tenChucVu, MOTA = :moTa
       WHERE MACHUCVU = :maChucVu`,
      {
        tenChucVu,
        moTa: moTa || null,
        maChucVu
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy chức vụ' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cập nhật chức vụ thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật chức vụ', error: error.message },
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

// DELETE - Xóa chức vụ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const maChucVu = params.id;

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `DELETE FROM CHUCVU WHERE MACHUCVU = :maChucVu`,
      { maChucVu },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy chức vụ' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa chức vụ thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 2292) {
      return NextResponse.json(
        { message: 'Không thể xóa chức vụ đang được sử dụng' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi xóa chức vụ', error: error.message },
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
