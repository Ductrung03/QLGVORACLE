/**
 * API Routes for Degree Management (Quản lý Học vị)
 * Sử dụng connection pool từ lib/oracle.ts
 *
 * GET /api/degrees/hocvi: Lấy danh sách học vị
 * POST /api/degrees/hocvi: Tạo học vị mới
 * PUT /api/degrees/hocvi: Cập nhật học vị
 * DELETE /api/degrees/hocvi?id=xxx: Xóa học vị
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

interface HocVi {
  MAHOCVI: string;
  TENHOCVI: string;
  NGAYNHAN: Date | null;
  MAGV: string | null;
}

/**
 * GET /api/degrees/hocvi
 * Lấy danh sách học vị (distinct theo tên)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maGV = searchParams.get('maGV');

    let sql: string;
    const binds: Record<string, any> = {};

    if (maGV) {
      // Lấy học vị của một GV cụ thể
      sql = `SELECT MAHOCVI, TENHOCVI, NGAYNHAN, MAGV
             FROM HOCVI
             WHERE TRIM(MAGV) = TRIM(:maGV)
             ORDER BY NGAYNHAN DESC`;
      binds.maGV = maGV;
    } else {
      // Lấy tất cả học vị distinct
      sql = `SELECT DISTINCT MAHOCVI, TENHOCVI
             FROM HOCVI
             ORDER BY TENHOCVI`;
    }

    const result = await executeQuery<HocVi>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        "TENHOCVI": { type: oracledb.STRING }
      }
    });

    const hocvi = (result.rows || []).map((row) => ({
      maHocVi: row.MAHOCVI?.trim(),
      tenHocVi: row.TENHOCVI || '',
      ngayNhan: row.NGAYNHAN || null,
      maGV: row.MAGV?.trim() || ''
    }));

    return NextResponse.json(hocvi, { status: 200 });
  } catch (error) {
    console.error('Error fetching hocvi:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách học vị',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/degrees/hocvi
 * Tạo/Gán học vị cho GV
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maHocVi, tenHocVi, ngayNhan, maGV } = body;

    if (!maHocVi || !tenHocVi) {
      return NextResponse.json(
        { error: 'Mã học vị và tên học vị là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra GV tồn tại nếu có
    if (maGV) {
      const checkGV = await executeQuery(
        `SELECT COUNT(*) as CNT FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(:maGV)`,
        { maGV },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if ((checkGV.rows as any)?.[0]?.CNT === 0) {
        return NextResponse.json(
          { error: 'Giáo viên không tồn tại' },
          { status: 400 }
        );
      }
    }

    await executeQuery(
      `INSERT INTO HOCVI (MAHOCVI, TENHOCVI, NGAYNHAN, MAGV)
       VALUES (:maHocVi, :tenHocVi, :ngayNhan, :maGV)`,
      {
        maHocVi: { val: maHocVi, type: oracledb.STRING },
        tenHocVi: { val: tenHocVi, type: oracledb.DB_TYPE_NVARCHAR },
        ngayNhan: { val: ngayNhan ? new Date(ngayNhan) : null, type: oracledb.DATE },
        maGV: { val: maGV || null, type: oracledb.STRING }
      }
    );

    return NextResponse.json(
      {
        message: 'Tạo học vị thành công',
        maHocVi: maHocVi
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hocvi:', error);

    if (error instanceof Error && error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Mã học vị đã tồn tại' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể tạo học vị',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/degrees/hocvi
 * Cập nhật học vị
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { maHocVi, tenHocVi, ngayNhan } = body;

    if (!maHocVi || !tenHocVi) {
      return NextResponse.json(
        { error: 'Mã học vị và tên học vị là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `UPDATE HOCVI
       SET TENHOCVI = :tenHocVi,
           NGAYNHAN = :ngayNhan
       WHERE TRIM(MAHOCVI) = TRIM(:maHocVi)`,
      {
        maHocVi: { val: maHocVi, type: oracledb.STRING },
        tenHocVi: { val: tenHocVi, type: oracledb.DB_TYPE_NVARCHAR },
        ngayNhan: { val: ngayNhan ? new Date(ngayNhan) : null, type: oracledb.DATE }
      }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy học vị' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cập nhật học vị thành công',
        maHocVi: maHocVi
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating hocvi:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật học vị',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/degrees/hocvi?id=xxx
 * Xóa học vị
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const maHocVi = url.searchParams.get('id');

    if (!maHocVi) {
      return NextResponse.json(
        { error: 'Mã học vị là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `DELETE FROM HOCVI WHERE TRIM(MAHOCVI) = TRIM(:maHocVi)`,
      { maHocVi }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy học vị' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Xóa học vị thành công',
        maHocVi: maHocVi
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting hocvi:', error);

    if (error instanceof Error && error.message.includes('ORA-02292')) {
      return NextResponse.json(
        { error: 'Không thể xóa học vị đang được sử dụng' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể xóa học vị',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
