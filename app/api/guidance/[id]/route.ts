/**
 * API Routes for Individual Guidance Operations
 * Sử dụng Oracle Package PKG_HUONGDAN
 *
 * - GET /api/guidance/[id]: Lấy thông tin hướng dẫn
 * - PUT /api/guidance/[id]: Cập nhật hướng dẫn
 * - DELETE /api/guidance/[id]: Xóa hướng dẫn
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/guidance/[id]
 * Lấy thông tin chi tiết hướng dẫn
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHuongDan } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_HUONGDAN.SP_LAYTHEOMA',
      { p_mahuongdan: maHuongDan },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy hướng dẫn' },
        { status: 404 }
      );
    }

    const g = rows[0] as any;
    const guidance = {
      maHuongDan: g.MAHUONGDAN?.trim(),
      hoTenHocVien: g.HOTENHOCVIEN || '',
      lop: g.LOP || '',
      he: g.HE || '',
      namHoc: g.NAMHOC || '',
      tenDeTai: g.TENDETAI || '',
      soCBHD: g.SOCBHD,
      maLoaiHinhHuongDan: g.MALOAIHINHHUONGDAN?.trim() || '',
      tenLoaiHinhHuongDan: g.TENLOAIHINHHUONGDAN || ''
    };

    return NextResponse.json(guidance, { status: 200 });
  } catch (error) {
    console.error('Error fetching guidance:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin hướng dẫn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/guidance/[id]
 * Cập nhật hướng dẫn qua PKG_HUONGDAN.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHuongDan } = await params;
    const body = await request.json();
    const { hoTenHocVien, lop, he, namHoc, tenDeTai, soCBHD, maLoaiHinhHuongDan } = body;

    const { outBinds } = await executeProcedureFull('PKG_HUONGDAN.SP_SUA', {
      p_mahuongdan: { val: maHuongDan, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_hotenhocvien: { val: hoTenHocVien || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_he: { val: he || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_tendetai: { val: tenDeTai || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_socbhd: { val: soCBHD ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_maloaihinhhuongdan: { val: maLoaiHinhHuongDan || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maHuongDan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating guidance:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật hướng dẫn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guidance/[id]
 * Xóa hướng dẫn qua PKG_HUONGDAN.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maHuongDan } = await params;

    const { outBinds } = await executeProcedureFull('PKG_HUONGDAN.SP_XOA', {
      p_mahuongdan: { val: maHuongDan, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maHuongDan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting guidance:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa hướng dẫn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
