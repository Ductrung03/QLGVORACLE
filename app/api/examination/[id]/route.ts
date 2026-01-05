/**
 * API Routes for Individual Examination Operations
 * Sử dụng Oracle Package PKG_KHAOTHI
 *
 * - GET /api/examination/[id]: Lấy thông tin khảo thí
 * - PUT /api/examination/[id]: Cập nhật khảo thí
 * - DELETE /api/examination/[id]: Xóa khảo thí
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/examination/[id]
 * Lấy thông tin chi tiết khảo thí
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiKhaoThi } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_KHAOTHI.SP_LAYTHEOMA',
      { p_mataikhaothi: maTaiKhaoThi },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy khảo thí' },
        { status: 404 }
      );
    }

    const e = rows[0] as any;
    const examination = {
      maTaiKhaoThi: e.MATAIKHAOTHI?.trim(),
      hocPhan: e.HOCPHAN || '',
      lop: e.LOP || '',
      namHoc: e.NAMHOC || '',
      ghiChu: e.GHICHU || '',
      maLoaiCongTacKhaoThi: e.MALOAICONGTACKHAOTHI?.trim() || '',
      tenLoaiCongTacKhaoThi: e.TENLOAICONGTACKHAOTHI || ''
    };

    return NextResponse.json(examination, { status: 200 });
  } catch (error) {
    console.error('Error fetching examination:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin khảo thí',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/examination/[id]
 * Cập nhật khảo thí qua PKG_KHAOTHI.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiKhaoThi } = await params;
    const body = await request.json();
    const { hocPhan, lop, namHoc, ghiChu, maLoaiCongTac } = body;

    const { outBinds } = await executeProcedureFull('PKG_KHAOTHI.SP_SUA', {
      p_mataikhaothi: { val: maTaiKhaoThi, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_hocphan: { val: hocPhan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_maloaicongtac: { val: maLoaiCongTac || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maTaiKhaoThi },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating examination:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật khảo thí',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/examination/[id]
 * Xóa khảo thí qua PKG_KHAOTHI.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiKhaoThi } = await params;

    const { outBinds } = await executeProcedureFull('PKG_KHAOTHI.SP_XOA', {
      p_mataikhaothi: { val: maTaiKhaoThi, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maTaiKhaoThi },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting examination:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa khảo thí',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
