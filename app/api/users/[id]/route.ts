/**
 * API Routes for Individual User Operations
 * Sử dụng Oracle Package PKG_NGUOIDUNG
 *
 * - GET /api/users/[id]: Lấy thông tin người dùng
 * - PUT /api/users/[id]: Cập nhật người dùng
 * - DELETE /api/users/[id]: Xóa người dùng
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/users/[id]
 * Lấy thông tin chi tiết người dùng
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maNguoiDung } = await params;

    const rows = await executeProcedureWithCursor(
      'PKG_NGUOIDUNG.SP_LAYTHEOMA',
      { p_manguoidung: maNguoiDung },
      'p_cursor'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    const u = rows[0] as any;
    const user = {
      maNguoiDung: u.MANGUOIDUNG?.trim(),
      tenDangNhap: u.TENDANGNHAP || '',
      maGV: u.MAGV?.trim() || '',
      hoTen: u.HOTEN || '',
      email: u.EMAIL || ''
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin người dùng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Cập nhật người dùng qua PKG_NGUOIDUNG.SP_SUA
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maNguoiDung } = await params;
    const body = await request.json();
    const { tenDangNhap, maGV } = body;

    const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_SUA', {
      p_manguoidung: { val: maNguoiDung, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_tendangnhap: { val: tenDangNhap || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_magv: { val: maGV || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    if (outBinds.p_status !== 1) {
      const httpStatus = outBinds.p_status === -1 ? 404 : outBinds.p_status === -2 ? 409 : 400;
      return NextResponse.json(
        { error: outBinds.p_message, status: outBinds.p_status },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      { message: outBinds.p_message, maNguoiDung },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật người dùng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Xóa người dùng qua PKG_NGUOIDUNG.SP_XOA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maNguoiDung } = await params;

    const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_XOA', {
      p_manguoidung: { val: maNguoiDung, type: oracledb.STRING, dir: oracledb.BIND_IN },
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
      { message: outBinds.p_message, maNguoiDung },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa người dùng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
