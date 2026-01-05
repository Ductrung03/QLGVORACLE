/**
 * API Routes for Teaching Management
 * Sử dụng Oracle Package PKG_GIANGDAY
 *
 * - GET /api/teaching: Lấy danh sách tài giảng dạy
 * - POST /api/teaching: Thêm tài giảng dạy mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/teaching
 * Lấy danh sách tài giảng dạy từ PKG_GIANGDAY.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');

    let rows;

    if (maGV) {
      // Lấy chi tiết giảng dạy theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_GIANGDAY.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách tài giảng dạy
      rows = await executeProcedureWithCursor(
        'PKG_GIANGDAY.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const teachings = rows.map((t: any) => ({
      maTaiGiangDay: t.MATAIGIANGDAY?.trim(),
      tenHocPhan: t.TENHOCPHAN || '',
      siSo: t.SISO,
      he: t.HE || '',
      lop: t.LOP || '',
      soTinChi: t.SOTINCHI,
      ghiChu: t.GHICHU || '',
      namHoc: t.NAMHOC || '',
      maDoiTuong: t.MADOITUONG?.trim() || '',
      maThoiGian: t.MATHOIGIAN?.trim() || '',
      maNgonNgu: t.MANGONNGU?.trim() || '',
      soGVPhanCong: t.SO_GV_PHANCONG,
      tongSoTiet: t.TONG_SOTIET,
      // Chi tiết giảng dạy (khi lấy theo GV)
      maChiTietGiangDay: t.MACHITIETGIANGDAY?.trim() || '',
      soTiet: t.SOTIET,
      soTietQuyDoi: t.SOTIETQUYDOI,
      noiDungGiangDay: t.NOIDUNGGIANGDAY || ''
    }));

    return NextResponse.json(teachings, { status: 200 });
  } catch (error) {
    console.error('Error fetching teachings:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách giảng dạy',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teaching
 * Thêm tài giảng dạy mới qua PKG_GIANGDAY.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenHocPhan, siSo, he, lop, soTinChi, ghiChu, namHoc,
      maDoiTuong, maThoiGian, maNgonNgu
    } = body;

    const { outBinds } = await executeProcedureFull('PKG_GIANGDAY.SP_THEM', {
      p_tenhocphan: { val: tenHocPhan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_siso: { val: siSo ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_he: { val: he || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sotinchi: { val: soTinChi ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_madoituong: { val: maDoiTuong || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_mathoigian: { val: maThoiGian || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_mangonngu: { val: maNgonNgu || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_matgd_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    if (outBinds.p_status !== 1) {
      const httpStatus = outBinds.p_status === -99 ? 500 : 400;
      return NextResponse.json(
        { error: outBinds.p_message, status: outBinds.p_status },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      {
        message: outBinds.p_message,
        maTaiGiangDay: outBinds.p_matgd_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating teaching:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo tài giảng dạy',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
