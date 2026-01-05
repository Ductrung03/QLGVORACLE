/**
 * API Routes for Individual Other Work Operations
 * Sử dụng Oracle Package PKG_CONGTACKHAC
 *
 * - GET /api/other-work/[id]: Lấy thông tin công tác khác
 * - PUT /api/other-work/[id]: Cập nhật công tác khác
 * - DELETE /api/other-work/[id]: Xóa công tác khác
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/other-work/[id]
 * Lấy thông tin chi tiết công tác khác
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maCongTacKhac } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_CONGTACKHAC.SP_LAYTHEOMA',
      { p_macongtackhac: maCongTacKhac },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy công tác khác' },
        { status: 404 }
      );
    }

    const o = rows[0] as any;
    const otherWork = {
      maCongTacKhac: o.MACONGTACKHAC?.trim(),
      noiDungCongViec: o.NOIDUNGCONGVIEC || '',
      namHoc: o.NAMHOC || '',
      soLuong: o.SOLUONG,
      ghiChu: o.GHICHU || ''
    };

    return NextResponse.json(otherWork, { status: 200 });
  } catch (error) {
    console.error('Error fetching other work:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin công tác khác',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/other-work/[id]
 * Cập nhật công tác khác qua PKG_CONGTACKHAC.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maCongTacKhac } = await params;
    const body = await request.json();
    const { noiDungCongViec, namHoc, soLuong, ghiChu } = body;

    const { outBinds } = await executeProcedureFull('PKG_CONGTACKHAC.SP_SUA', {
      p_macongtackhac: { val: maCongTacKhac, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_noidungcongviec: { val: noiDungCongViec || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_soluong: { val: soLuong ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maCongTacKhac },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating other work:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật công tác khác',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/other-work/[id]
 * Xóa công tác khác qua PKG_CONGTACKHAC.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maCongTacKhac } = await params;

    const { outBinds } = await executeProcedureFull('PKG_CONGTACKHAC.SP_XOA', {
      p_macongtackhac: { val: maCongTacKhac, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maCongTacKhac },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting other work:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa công tác khác',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
