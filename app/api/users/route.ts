/**
 * API Routes for User Management (Người dùng)
 * Sử dụng Oracle Package PKG_NGUOIDUNG
 *
 * - GET /api/users: Lấy danh sách người dùng
 * - POST /api/users: Thêm người dùng mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/users
 * Lấy danh sách người dùng từ PKG_NGUOIDUNG.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maNguoiDung = searchParams.get('maNguoiDung');
    const type = searchParams.get('type'); // 'nhom' hoặc 'quyen'

    let rows;

    if (maNguoiDung) {
      if (type === 'nhom') {
        // Lấy danh sách nhóm của người dùng
        rows = await executeProcedureWithCursor(
          'PKG_NGUOIDUNG.SP_LAYDS_NHOM',
          { p_manguoidung: maNguoiDung },
          'p_cursor'
        );

        const groups = rows.map((g: any) => ({
          maNhom: g.MANHOM?.trim(),
          tenNhom: g.TENNHOM || ''
        }));

        return NextResponse.json(groups, { status: 200 });
      }

      if (type === 'quyen') {
        // Lấy danh sách quyền của người dùng
        rows = await executeProcedureWithCursor(
          'PKG_NGUOIDUNG.SP_LAYDS_QUYEN',
          { p_manguoidung: maNguoiDung },
          'p_cursor'
        );

        const permissions = rows.map((p: any) => ({
          maQuyen: p.MAQUYEN?.trim(),
          tenQuyen: p.TENQUYEN || ''
        }));

        return NextResponse.json(permissions, { status: 200 });
      }

      // Lấy thông tin người dùng theo mã
      rows = await executeProcedureWithCursor(
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
    }

    // Lấy danh sách người dùng
    rows = await executeProcedureWithCursor(
      'PKG_NGUOIDUNG.SP_LAYDS',
      {},
      'p_cursor'
    );

    // Transform sang camelCase
    const users = rows.map((u: any) => ({
      maNguoiDung: u.MANGUOIDUNG?.trim(),
      tenDangNhap: u.TENDANGNHAP || '',
      maGV: u.MAGV?.trim() || '',
      hoTen: u.HOTEN || '',
      email: u.EMAIL || '',
      dsNhom: u.DS_NHOM || ''
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách người dùng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Thêm người dùng mới qua PKG_NGUOIDUNG.SP_THEM
 * Hoặc đăng nhập qua PKG_NGUOIDUNG.SP_DANGNHAP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      // Đăng nhập
      const { tenDangNhap, matKhau } = body;

      const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_DANGNHAP', {
        p_tendangnhap: { val: tenDangNhap || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
        p_matkhau: { val: matKhau || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
        p_manguoidung: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 50 },
        p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
      });

      if (outBinds.p_status !== 1) {
        const httpStatus = outBinds.p_status === -1 || outBinds.p_status === -2 ? 401 : 400;
        return NextResponse.json(
          { error: outBinds.p_message, status: outBinds.p_status },
          { status: httpStatus }
        );
      }

      return NextResponse.json(
        {
          message: outBinds.p_message,
          maNguoiDung: outBinds.p_manguoidung?.trim()
        },
        { status: 200 }
      );
    }

    if (action === 'changePassword') {
      // Đổi mật khẩu
      const { maNguoiDung, matKhauCu, matKhauMoi } = body;

      const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_DOI_MATKHAU', {
        p_manguoidung: { val: maNguoiDung, type: oracledb.STRING, dir: oracledb.BIND_IN },
        p_matkhaucu: { val: matKhauCu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
        p_matkhaumoi: { val: matKhauMoi || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
        p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
      });

      if (outBinds.p_status !== 1) {
        const httpStatus = outBinds.p_status === -1 ? 404 : outBinds.p_status === -2 ? 401 : 400;
        return NextResponse.json(
          { error: outBinds.p_message, status: outBinds.p_status },
          { status: httpStatus }
        );
      }

      return NextResponse.json(
        { message: outBinds.p_message },
        { status: 200 }
      );
    }

    if (action === 'assignGroup') {
      // Gán nhóm cho người dùng
      const { maNguoiDung, maNhom } = body;

      const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_GAN_NHOM', {
        p_manguoidung: { val: maNguoiDung, type: oracledb.STRING, dir: oracledb.BIND_IN },
        p_manhom: { val: maNhom, type: oracledb.STRING, dir: oracledb.BIND_IN },
        p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
      });

      if (outBinds.p_status !== 1) {
        const httpStatus = outBinds.p_status === -1 || outBinds.p_status === -2 ? 404 : 400;
        return NextResponse.json(
          { error: outBinds.p_message, status: outBinds.p_status },
          { status: httpStatus }
        );
      }

      return NextResponse.json(
        { message: outBinds.p_message },
        { status: 200 }
      );
    }

    if (action === 'removeGroup') {
      // Xóa người dùng khỏi nhóm
      const { maNguoiDung, maNhom } = body;

      const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_XOA_NHOM', {
        p_manguoidung: { val: maNguoiDung, type: oracledb.STRING, dir: oracledb.BIND_IN },
        p_manhom: { val: maNhom, type: oracledb.STRING, dir: oracledb.BIND_IN },
        p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
      });

      if (outBinds.p_status !== 1) {
        const httpStatus = outBinds.p_status === -1 ? 404 : 400;
        return NextResponse.json(
          { error: outBinds.p_message, status: outBinds.p_status },
          { status: httpStatus }
        );
      }

      return NextResponse.json(
        { message: outBinds.p_message },
        { status: 200 }
      );
    }

    // Thêm người dùng mới (action mặc định)
    const { tenDangNhap, matKhau, maGV } = body;

    const { outBinds } = await executeProcedureFull('PKG_NGUOIDUNG.SP_THEM', {
      p_tendangnhap: { val: tenDangNhap || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_matkhau: { val: matKhau || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_magv: { val: maGV || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_manguoidung_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 50 },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    if (outBinds.p_status !== 1) {
      const httpStatus = outBinds.p_status === -3 ? 409 : outBinds.p_status === -99 ? 500 : 400;
      return NextResponse.json(
        { error: outBinds.p_message, status: outBinds.p_status },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      {
        message: outBinds.p_message,
        maNguoiDung: outBinds.p_manguoidung_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error with user operation:', error);
    return NextResponse.json(
      {
        error: 'Lỗi thao tác người dùng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
