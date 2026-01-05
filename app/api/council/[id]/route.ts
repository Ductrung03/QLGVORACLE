/**
 * API Routes for Individual Council Operations
 * Sử dụng Oracle Package PKG_HOIDONG
 *
 * - GET /api/council/[id]: Lấy thông tin hội đồng
 * - PUT /api/council/[id]: Cập nhật hội đồng
 * - DELETE /api/council/[id]: Xóa hội đồng
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/council/[id]
 * Lấy thông tin chi tiết hội đồng
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHoiDong } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_HOIDONG.SP_LAYTHEOMA',
      { p_mahoidong: maHoiDong },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy hội đồng' },
        { status: 404 }
      );
    }

    const c = rows[0] as any;
    const council = {
      maHoiDong: c.MAHOIDONG?.trim(),
      soLuong: c.SOLUONG,
      namHoc: c.NAMHOC || '',
      thoiGianBatDau: c.THOIGIANBATDAU,
      thoiGianKetThuc: c.THOIGIANKETTHUC,
      ghiChu: c.GHICHU || '',
      maLoaiHoiDong: c.MALOAIHOIDONG?.trim() || '',
      tenLoaiHoiDong: c.TENLOAIHOIDONG || ''
    };

    return NextResponse.json(council, { status: 200 });
  } catch (error) {
    console.error('Error fetching council:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin hội đồng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/council/[id]
 * Cập nhật hội đồng qua PKG_HOIDONG.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHoiDong } = await params;
    const body = await request.json();
    const { soLuong, namHoc, thoiGianBatDau, thoiGianKetThuc, ghiChu, maLoaiHoiDong } = body;

    const { outBinds } = await executeProcedureFull('PKG_HOIDONG.SP_SUA', {
      p_mahoidong: { val: maHoiDong, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_soluong: { val: soLuong ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_thoigianbatdau: { val: thoiGianBatDau ? new Date(thoiGianBatDau) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_thoigianketthuc: { val: thoiGianKetThuc ? new Date(thoiGianKetThuc) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_maloaihoidong: { val: maLoaiHoiDong || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maHoiDong },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating council:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật hội đồng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/council/[id]
 * Xóa hội đồng qua PKG_HOIDONG.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHoiDong } = await params;

    const { outBinds } = await executeProcedureFull('PKG_HOIDONG.SP_XOA', {
      p_mahoidong: { val: maHoiDong, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maHoiDong },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting council:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa hội đồng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
