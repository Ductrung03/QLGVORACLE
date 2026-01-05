/**
 * API Routes for Position Management (Quản lý Chức vụ)
 * Sử dụng connection pool từ lib/oracle.ts
 *
 * GET /api/positions: Lấy danh sách chức vụ
 * POST /api/positions: Tạo chức vụ mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

interface Position {
  MACHUCVU: string;
  TENCHUCVU: string;
  MOTA: string | null;
  MADINHMUCMIENGIAM: string | null;
}

/**
 * GET /api/positions
 * Lấy danh sách chức vụ
 */
export async function GET() {
  try {
    const result = await executeQuery<Position>(
      `SELECT MACHUCVU, TENCHUCVU, MOTA, MADINHMUCMIENGIAM
       FROM CHUCVU
       ORDER BY MACHUCVU`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          "TENCHUCVU": { type: oracledb.STRING },
          "MOTA": { type: oracledb.STRING }
        }
      }
    );

    const positions = (result.rows || []).map((row) => ({
      maChucVu: row.MACHUCVU?.trim(),
      tenChucVu: row.TENCHUCVU || '',
      moTa: row.MOTA || '',
      maDinhMucMienGiam: row.MADINHMUCMIENGIAM?.trim() || ''
    }));

    return NextResponse.json(positions, { status: 200 });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách chức vụ',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/positions
 * Tạo chức vụ mới
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maChucVu, tenChucVu, moTa, maDinhMucMienGiam } = body;

    if (!maChucVu || !tenChucVu) {
      return NextResponse.json(
        { error: 'Mã chức vụ và tên chức vụ là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra mã chức vụ đã tồn tại
    const checkExist = await executeQuery(
      `SELECT COUNT(*) as CNT FROM CHUCVU WHERE TRIM(MACHUCVU) = TRIM(:maChucVu)`,
      { maChucVu },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if ((checkExist.rows as any)?.[0]?.CNT > 0) {
      return NextResponse.json(
        { error: 'Mã chức vụ đã tồn tại' },
        { status: 409 }
      );
    }

    await executeQuery(
      `INSERT INTO CHUCVU (MACHUCVU, TENCHUCVU, MOTA, MADINHMUCMIENGIAM)
       VALUES (:maChucVu, :tenChucVu, :moTa, :maDinhMucMienGiam)`,
      {
        maChucVu: { val: maChucVu, type: oracledb.STRING },
        tenChucVu: { val: tenChucVu, type: oracledb.DB_TYPE_NVARCHAR },
        moTa: { val: moTa || null, type: oracledb.DB_TYPE_NVARCHAR },
        maDinhMucMienGiam: { val: maDinhMucMienGiam || null, type: oracledb.STRING }
      }
    );

    return NextResponse.json(
      {
        message: 'Tạo chức vụ thành công',
        maChucVu: maChucVu
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating position:', error);

    if (error instanceof Error && error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Mã chức vụ đã tồn tại' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể tạo chức vụ',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
