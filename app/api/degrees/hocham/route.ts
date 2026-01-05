/**
 * API Routes for Academic Rank Management (Quản lý Học hàm)
 * Sử dụng connection pool từ lib/oracle.ts
 *
 * GET /api/degrees/hocham: Lấy danh sách học hàm
 * POST /api/degrees/hocham: Tạo học hàm mới
 * PUT /api/degrees/hocham: Cập nhật học hàm
 * DELETE /api/degrees/hocham?id=xxx: Xóa học hàm
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

interface HocHam {
  MAHOCHAM: string;
  TENHOCHAM: string;
  MADINHMUCNGHIENCUU: string | null;
  MADINHMUCGIANGDAY: string | null;
}

/**
 * GET /api/degrees/hocham
 * Lấy danh sách học hàm
 */
export async function GET() {
  try {
    const result = await executeQuery<HocHam>(
      `SELECT MAHOCHAM, TENHOCHAM, MADINHMUCNGHIENCUU, MADINHMUCGIANGDAY
       FROM HOCHAM
       ORDER BY MAHOCHAM`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          "TENHOCHAM": { type: oracledb.STRING }
        }
      }
    );

    const hocham = (result.rows || []).map((row) => ({
      maHocHam: row.MAHOCHAM?.trim(),
      tenHocHam: row.TENHOCHAM || '',
      maDinhMucNghienCuu: row.MADINHMUCNGHIENCUU?.trim() || '',
      maDinhMucGiangDay: row.MADINHMUCGIANGDAY?.trim() || ''
    }));

    return NextResponse.json(hocham, { status: 200 });
  } catch (error) {
    console.error('Error fetching hocham:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách học hàm',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/degrees/hocham
 * Tạo học hàm mới
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maHocHam, tenHocHam, maDinhMucNghienCuu, maDinhMucGiangDay } = body;

    if (!maHocHam || !tenHocHam) {
      return NextResponse.json(
        { error: 'Mã học hàm và tên học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra mã học hàm đã tồn tại
    const checkExist = await executeQuery(
      `SELECT COUNT(*) as CNT FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(:maHocHam)`,
      { maHocHam },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if ((checkExist.rows as any)?.[0]?.CNT > 0) {
      return NextResponse.json(
        { error: 'Mã học hàm đã tồn tại' },
        { status: 409 }
      );
    }

    await executeQuery(
      `INSERT INTO HOCHAM (MAHOCHAM, TENHOCHAM, MADINHMUCNGHIENCUU, MADINHMUCGIANGDAY)
       VALUES (:maHocHam, :tenHocHam, :maDinhMucNghienCuu, :maDinhMucGiangDay)`,
      {
        maHocHam: { val: maHocHam, type: oracledb.STRING },
        tenHocHam: { val: tenHocHam, type: oracledb.DB_TYPE_NVARCHAR },
        maDinhMucNghienCuu: { val: maDinhMucNghienCuu || null, type: oracledb.STRING },
        maDinhMucGiangDay: { val: maDinhMucGiangDay || null, type: oracledb.STRING }
      }
    );

    return NextResponse.json(
      {
        message: 'Tạo học hàm thành công',
        maHocHam: maHocHam
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hocham:', error);

    if (error instanceof Error && error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Mã học hàm đã tồn tại' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể tạo học hàm',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/degrees/hocham
 * Cập nhật học hàm
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { maHocHam, tenHocHam, maDinhMucNghienCuu, maDinhMucGiangDay } = body;

    if (!maHocHam || !tenHocHam) {
      return NextResponse.json(
        { error: 'Mã học hàm và tên học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `UPDATE HOCHAM
       SET TENHOCHAM = :tenHocHam,
           MADINHMUCNGHIENCUU = :maDinhMucNghienCuu,
           MADINHMUCGIANGDAY = :maDinhMucGiangDay
       WHERE TRIM(MAHOCHAM) = TRIM(:maHocHam)`,
      {
        maHocHam: { val: maHocHam, type: oracledb.STRING },
        tenHocHam: { val: tenHocHam, type: oracledb.DB_TYPE_NVARCHAR },
        maDinhMucNghienCuu: { val: maDinhMucNghienCuu || null, type: oracledb.STRING },
        maDinhMucGiangDay: { val: maDinhMucGiangDay || null, type: oracledb.STRING }
      }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy học hàm' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cập nhật học hàm thành công',
        maHocHam: maHocHam
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating hocham:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật học hàm',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/degrees/hocham?id=xxx
 * Xóa học hàm
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const maHocHam = url.searchParams.get('id');

    if (!maHocHam) {
      return NextResponse.json(
        { error: 'Mã học hàm là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra có đang được sử dụng không
    const checkUsage = await executeQuery(
      `SELECT COUNT(*) as CNT FROM LICHSUHOCHAM WHERE TRIM(MAHOCHAM) = TRIM(:maHocHam)`,
      { maHocHam },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if ((checkUsage.rows as any)?.[0]?.CNT > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa học hàm đang được sử dụng' },
        { status: 409 }
      );
    }

    const result = await executeQuery(
      `DELETE FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(:maHocHam)`,
      { maHocHam }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy học hàm' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Xóa học hàm thành công',
        maHocHam: maHocHam
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting hocham:', error);

    if (error instanceof Error && error.message.includes('ORA-02292')) {
      return NextResponse.json(
        { error: 'Không thể xóa học hàm đang được sử dụng' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể xóa học hàm',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
