/**
 * API Routes for Faculty Management (Quản lý Khoa)
 * Sử dụng Oracle Package PKG_KHOA
 *
 * GET /api/faculties: Lấy danh sách khoa từ PKG_KHOA.SP_LAYDS
 * POST /api/faculties: Tạo khoa mới qua PKG_KHOA.SP_THEM
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * Interface cho dữ liệu từ V_KHOA_THONGKE
 */
interface FacultyView {
  MAKHOA: string;
  TENKHOA: string;
  DIACHI: string | null;
  MACHUNHIEMKHOA: string | null;
  HOTEN_CHUNHIEM: string | null;
  SO_BOMON: number;
  SO_GIAOVIEN: number;
  SO_GV_CO_HOCHAM: number;
  SO_TIENSI: number;
}

/**
 * GET /api/faculties
 * Lấy danh sách khoa từ PKG_KHOA.SP_LAYDS
 */
export async function GET() {
  try {
    // Gọi PKG_KHOA.SP_LAYDS để lấy danh sách khoa
    const rows = await executeProcedureWithCursor<FacultyView>(
      'PKG_KHOA.SP_LAYDS',
      {},
      'p_cursor'
    );

    const faculties = rows.map((faculty) => ({
      maKhoa: faculty.MAKHOA?.trim(),
      tenKhoa: faculty.TENKHOA || '',
      diaChi: faculty.DIACHI || '',
      maChuNhiemKhoa: faculty.MACHUNHIEMKHOA?.trim() || '',
      tenChuNhiem: faculty.HOTEN_CHUNHIEM || '',
      soBoMon: faculty.SO_BOMON || 0,
      soGiaoVien: faculty.SO_GIAOVIEN || 0,
      soGVCoHocHam: faculty.SO_GV_CO_HOCHAM || 0,
      soTienSi: faculty.SO_TIENSI || 0
    }));

    return NextResponse.json(faculties, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách khoa',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faculties
 * Tạo khoa mới qua PKG_KHOA.SP_THEM
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

    // Gọi PKG_KHOA.SP_THEM để thêm khoa mới
    const result = await executeProcedureFull(
      'PKG_KHOA.SP_THEM',
      {
        p_tenkhoa: { val: tenKhoa, type: oracledb.DB_TYPE_NVARCHAR },
        p_diachi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR },
        p_machunhiem: { val: maChuNhiemKhoa || null, type: oracledb.STRING },
        p_makhoa_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 15 },
        p_status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.DB_TYPE_NVARCHAR, maxSize: 500 }
      }
    );

    const { p_makhoa_out, p_status, p_message } = result.outBinds;

    if (p_status !== 1) {
      return NextResponse.json(
        { error: p_message || 'Không thể tạo khoa' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: p_message || 'Tạo khoa thành công',
        maKhoa: p_makhoa_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo khoa',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
