/**
 * API Routes for Faculty Management (Quản lý Khoa)
 *
 * GET /api/faculties: Retrieve all faculties
 * POST /api/faculties: Create a new faculty
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

interface Faculty {
  MAKHOA: string;
  TENKHOA: string;
  DIACHI?: string;
  MACHUNHIEMKHOA?: string;
}

/**
 * GET /api/faculties
 * Retrieve all faculties from the database
 */
export async function GET() {
  try {
    const result = await executeQuery<Faculty>(
      `SELECT
        K.MAKHOA,
        K.TENKHOA,
        K.DIACHI,
        K.MACHUNHIEMKHOA,
        GV.HOTEN as TENCHUNHIEM
      FROM KHOA K
      LEFT JOIN GIAOVIEN GV ON K.MACHUNHIEMKHOA = GV.MAGV
      ORDER BY K.MAKHOA`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const faculties = (result.rows || []).map((faculty: any) => ({
      maKhoa: faculty.MAKHOA?.trim(),
      tenKhoa: faculty.TENKHOA || '',
      diaChi: faculty.DIACHI || '',
      maChuNhiemKhoa: faculty.MACHUNHIEMKHOA?.trim() || '',
      tenChuNhiem: faculty.TENCHUNHIEM || ''
    }));

    return NextResponse.json(faculties, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch faculties',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faculties
 * Create a new faculty
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenKhoa, diaChi, maChuNhiemKhoa } = body;

    if (!tenKhoa) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: tenKhoa là bắt buộc' },
        { status: 400 }
      );
    }

    // Insert new faculty (MAKHOA will be auto-generated)
    // Use DB_TYPE_NVARCHAR for Vietnamese text fields to ensure proper encoding
    const result = await executeQuery(
      `INSERT INTO KHOA (TENKHOA, DIACHI, MACHUNHIEMKHOA)
       VALUES (:tenKhoa, :diaChi, :maChuNhiemKhoa)`,
      {
        tenKhoa: { val: tenKhoa, type: oracledb.DB_TYPE_NVARCHAR },
        diaChi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR },
        maChuNhiemKhoa: { val: maChuNhiemKhoa || null, type: oracledb.STRING }
      }
    );

    // Get the auto-generated MAKHOA
    const newFaculty = await executeQuery<{ MAKHOA: string }>(
      `SELECT MAKHOA FROM KHOA WHERE ROWID = (SELECT MAX(ROWID) FROM KHOA)`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const generatedMaKhoa = newFaculty.rows?.[0]?.MAKHOA?.trim() || null;

    return NextResponse.json(
      {
        message: 'Tạo khoa thành công',
        maKhoa: generatedMaKhoa,
        rowsAffected: result.rowsAffected
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating faculty:', error);

    if (error instanceof Error && error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Mã khoa đã tồn tại' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Không thể tạo khoa',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
