import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// GET - Lấy danh sách học phần
export async function GET() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT MATAIGIANGDAY, TENHOCPHAN, SISO, HE, LOP, SOTINCHI, GHICHU, NAMHOC,
              MADOITUONG, MATHOIGIAN, MANGONNGU
       FROM TAIGIANGDAY
       ORDER BY NAMHOC DESC, TENHOCPHAN`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const courses = (result.rows as any[]).map((row: any) => ({
      maTaiGiangDay: row.MATAIGIANGDAY,
      tenHocPhan: row.TENHOCPHAN,
      siSo: row.SISO,
      he: row.HE,
      lop: row.LOP,
      soTinChi: row.SOTINCHI,
      ghiChu: row.GHICHU,
      namHoc: row.NAMHOC,
      maDoiTuong: row.MADOITUONG,
      maThoiGian: row.MATHOIGIAN,
      maNgonNgu: row.MANGONNGU
    }));

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi lấy danh sách học phần', error: error.message },
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

// POST - Thêm học phần mới
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const {
      maTaiGiangDay,
      tenHocPhan,
      siSo,
      he,
      lop,
      soTinChi,
      ghiChu,
      namHoc,
      maDoiTuong,
      maThoiGian,
      maNgonNgu
    } = body;

    if (!maTaiGiangDay || !tenHocPhan || !namHoc) {
      return NextResponse.json(
        { message: 'Mã tài giảng dạy, tên học phần và năm học là bắt buộc' },
        { status: 400 }
      );
    }

    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO TAIGIANGDAY
       (MATAIGIANGDAY, TENHOCPHAN, SISO, HE, LOP, SOTINCHI, GHICHU, NAMHOC,
        MADOITUONG, MATHOIGIAN, MANGONNGU)
       VALUES (:maTaiGiangDay, :tenHocPhan, :siSo, :he, :lop, :soTinChi, :ghiChu, :namHoc,
        :maDoiTuong, :maThoiGian, :maNgonNgu)`,
      {
        maTaiGiangDay,
        tenHocPhan,
        siSo: siSo || null,
        he: he || null,
        lop: lop || null,
        soTinChi: soTinChi || null,
        ghiChu: ghiChu || null,
        namHoc,
        maDoiTuong: maDoiTuong || null,
        maThoiGian: maThoiGian || null,
        maNgonNgu: maNgonNgu || null
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      { message: 'Thêm học phần thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.errorNum === 1) {
      return NextResponse.json(
        { message: 'Mã tài giảng dạy đã tồn tại' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Lỗi khi thêm học phần', error: error.message },
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
