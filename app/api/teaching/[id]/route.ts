/**
 * API Routes for Individual Teaching Operations
 * Sử dụng Oracle Package PKG_GIANGDAY
 *
 * - GET /api/teaching/[id]: Lấy thông tin tài giảng dạy
 * - PUT /api/teaching/[id]: Cập nhật tài giảng dạy
 * - DELETE /api/teaching/[id]: Xóa tài giảng dạy
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/teaching/[id]
 * Lấy thông tin chi tiết tài giảng dạy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiGiangDay } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_GIANGDAY.SP_LAYTHEOMA',
      { p_mataigiangday: maTaiGiangDay },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài giảng dạy' },
        { status: 404 }
      );
    }

    const t = rows[0] as any;
    const teaching = {
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
      maNgonNgu: t.MANGONNGU?.trim() || ''
    };

    return NextResponse.json(teaching, { status: 200 });
  } catch (error) {
    console.error('Error fetching teaching:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin tài giảng dạy',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/teaching/[id]
 * Cập nhật tài giảng dạy qua PKG_GIANGDAY.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiGiangDay } = await params;
    const body = await request.json();
    const { tenHocPhan, siSo, he, lop, soTinChi, ghiChu, namHoc } = body;

    const { outBinds } = await executeProcedureFull('PKG_GIANGDAY.SP_SUA', {
      p_mataigiangday: { val: maTaiGiangDay, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_tenhocphan: { val: tenHocPhan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_siso: { val: siSo ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_he: { val: he || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sotinchi: { val: soTinChi ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    if (outBinds.p_status !== 1) {
      const httpStatus = outBinds.p_status === -1 ? 404 : outBinds.p_status === -99 ? 500 : 400;
      return NextResponse.json(
        { error: outBinds.p_message, status: outBinds.p_status },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      { message: outBinds.p_message, maTaiGiangDay },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating teaching:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật tài giảng dạy',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teaching/[id]
 * Xóa tài giảng dạy qua PKG_GIANGDAY.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiGiangDay } = await params;

    const { outBinds } = await executeProcedureFull('PKG_GIANGDAY.SP_XOA', {
      p_mataigiangday: { val: maTaiGiangDay, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    if (outBinds.p_status !== 1) {
      const httpStatus = outBinds.p_status === -1 ? 404 : outBinds.p_status === -99 ? 500 : 400;
      return NextResponse.json(
        { error: outBinds.p_message, status: outBinds.p_status },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      { message: outBinds.p_message, maTaiGiangDay },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting teaching:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa tài giảng dạy',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
