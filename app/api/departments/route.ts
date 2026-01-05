/**
 * API Routes for Department Management (Quản lý Bộ môn)
 * Sử dụng Oracle Package PKG_BOMON
 *
 * GET /api/departments: Lấy danh sách bộ môn từ PKG_BOMON.SP_LAYDS
 * POST /api/departments: Tạo bộ môn mới qua PKG_BOMON.SP_THEM
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * Interface cho dữ liệu từ V_BOMON_THONGKE
 */
interface DepartmentView {
  MABM: string;
  TENBM: string;
  DIACHI: string | null;
  MAKHOA: string | null;
  TENKHOA: string | null;
  MACHUNHIEMBM: string | null;
  HOTEN_CHUNHIEM: string | null;
  SO_GIAOVIEN: number;
  SO_GV_CO_HOCHAM: number;
  SO_TIENSI: number;
}

/**
 * GET /api/departments
 * Lấy danh sách bộ môn từ PKG_BOMON.SP_LAYDS
 */
export async function GET() {
  try {
    // Gọi PKG_BOMON.SP_LAYDS để lấy danh sách bộ môn
    const rows = await executeProcedureWithCursor<DepartmentView>(
      'PKG_BOMON.SP_LAYDS',
      {},
      'p_cursor'
    );

    const departments = rows.map((dept) => ({
      maBM: dept.MABM?.trim(),
      tenBM: dept.TENBM || '',
      diaChi: dept.DIACHI || '',
      maKhoa: dept.MAKHOA?.trim() || '',
      tenKhoa: dept.TENKHOA || '',
      maChuNhiemBM: dept.MACHUNHIEMBM?.trim() || '',
      tenChuNhiem: dept.HOTEN_CHUNHIEM || '',
      soGiaoVien: dept.SO_GIAOVIEN || 0,
      soGVCoHocHam: dept.SO_GV_CO_HOCHAM || 0,
      soTienSi: dept.SO_TIENSI || 0
    }));

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách bộ môn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/departments
 * Tạo bộ môn mới qua PKG_BOMON.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenBM, diaChi, maKhoa, maChuNhiemBM } = body;

    if (!tenBM) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: tenBM là bắt buộc' },
        { status: 400 }
      );
    }

    // Gọi PKG_BOMON.SP_THEM để thêm bộ môn mới
    const result = await executeProcedureFull(
      'PKG_BOMON.SP_THEM',
      {
        p_tenbm: { val: tenBM, type: oracledb.DB_TYPE_NVARCHAR },
        p_diachi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR },
        p_makhoa: { val: maKhoa || null, type: oracledb.STRING },
        p_machunhiem: { val: maChuNhiemBM || null, type: oracledb.STRING },
        p_mabm_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 15 },
        p_status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.DB_TYPE_NVARCHAR, maxSize: 500 }
      }
    );

    const { p_mabm_out, p_status, p_message } = result.outBinds;

    if (p_status !== 1) {
      return NextResponse.json(
        { error: p_message || 'Không thể tạo bộ môn' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: p_message || 'Tạo bộ môn thành công',
        maBM: p_mabm_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo bộ môn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
