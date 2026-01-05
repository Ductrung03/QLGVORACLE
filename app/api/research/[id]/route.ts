/**
 * API Routes for Individual Research Operations
 * Sử dụng Oracle Package PKG_NCKH
 *
 * - GET /api/research/[id]: Lấy thông tin NCKH
 * - PUT /api/research/[id]: Cập nhật NCKH
 * - DELETE /api/research/[id]: Xóa NCKH
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/research/[id]
 * Lấy thông tin chi tiết NCKH
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiNCKH } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_NCKH.SP_LAYTHEOMA',
      { p_matainckh: maTaiNCKH },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy nghiên cứu khoa học' },
        { status: 404 }
      );
    }

    const r = rows[0] as any;
    const research = {
      maTaiNCKH: r.MATAINCKH?.trim(),
      tenCongTrinhKhoaHoc: r.TENCONGTRINHKHOAHOC || '',
      namHoc: r.NAMHOC || '',
      soTacGia: r.SOTACGIA,
      maLoaiNCKH: r.MALOAINCKH?.trim() || '',
      tenLoaiNCKH: r.TENLOAINCKH || ''
    };

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin nghiên cứu khoa học',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/research/[id]
 * Cập nhật NCKH qua PKG_NCKH.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiNCKH } = await params;
    const body = await request.json();
    const { tenCongTrinhKhoaHoc, namHoc, soTacGia, maLoaiNCKH } = body;

    const { outBinds } = await executeProcedureFull('PKG_NCKH.SP_SUA', {
      p_matainckh: { val: maTaiNCKH, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_tencongtrinhkh: { val: tenCongTrinhKhoaHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sotacgia: { val: soTacGia ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_maloainckh: { val: maLoaiNCKH || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maTaiNCKH },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating research:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật nghiên cứu khoa học',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/[id]
 * Xóa NCKH qua PKG_NCKH.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maTaiNCKH } = await params;

    const { outBinds } = await executeProcedureFull('PKG_NCKH.SP_XOA', {
      p_matainckh: { val: maTaiNCKH, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maTaiNCKH },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting research:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa nghiên cứu khoa học',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
