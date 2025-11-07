import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// PUT - Cập nhật học phần
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const body = await request.json();
    const {
      tenHocPhan,
      siSo,
      he,
      lop,
      soTinChi,
      ghiChu,
      namHoc
    } = body;

    const maTaiGiangDay = params.id;

    if (!tenHocPhan || !namHoc) {
      return NextResponse.json(
        { message: 'Tên học phần và năm học là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE TAIGIANGDAY
       SET TENHOCPHAN = :tenHocPhan, SISO = :siSo, HE = :he, LOP = :lop,
           SOTINCHI = :soTinChi, GHICHU = :ghiChu, NAMHOC = :namHoc
       WHERE MATAIGIANGDAY = :maTaiGiangDay`,
      {
        tenHocPhan,
        siSo: siSo || null,
        he: he || null,
        lop: lop || null,
        soTinChi: soTinChi || null,
        ghiChu: ghiChu || null,
        namHoc,
        maTaiGiangDay
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học phần' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cập nhật học phần thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật học phần', error: error.message },
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

// DELETE - Xóa học phần
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const maTaiGiangDay = params.id;

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `DELETE FROM TAIGIANGDAY WHERE MATAIGIANGDAY = :maTaiGiangDay`,
      { maTaiGiangDay },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { message: 'Không tìm thấy học phần' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa học phần thành công' });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 2292) {
      return NextResponse.json(
        { message: 'Không thể xóa học phần đang được phân công giảng dạy' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi xóa học phần', error: error.message },
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
