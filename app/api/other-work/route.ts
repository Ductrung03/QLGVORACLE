/**
 * API Routes for Other Work Management (Công tác khác)
 * Sử dụng Oracle Package PKG_CONGTACKHAC
 *
 * - GET /api/other-work: Lấy danh sách công tác khác
 * - POST /api/other-work: Thêm công tác khác mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/other-work
 * Lấy danh sách công tác khác từ PKG_CONGTACKHAC.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');

    let rows;

    if (maGV) {
      // Lấy chi tiết công tác khác theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_CONGTACKHAC.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách công tác khác
      rows = await executeProcedureWithCursor(
        'PKG_CONGTACKHAC.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const otherWorks = rows.map((o: any) => ({
      maCongTacKhac: o.MACONGTACKHAC?.trim(),
      noiDungCongViec: o.NOIDUNGCONGVIEC || '',
      namHoc: o.NAMHOC || '',
      soLuong: o.SOLUONG,
      ghiChu: o.GHICHU || '',
      soGVThamGia: o.SO_GV_THAMGIA,
      // Chi tiết công tác (khi lấy theo GV)
      maChiTietCongTacKhac: o.MACHITIETCONGTACKHAC?.trim() || '',
      vaiTro: o.VAITRO || ''
    }));

    return NextResponse.json(otherWorks, { status: 200 });
  } catch (error) {
    console.error('Error fetching other works:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách công tác khác',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/other-work
 * Thêm công tác khác mới qua PKG_CONGTACKHAC.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noiDungCongViec, namHoc, soLuong, ghiChu } = body;

    const { outBinds } = await executeProcedureFull('PKG_CONGTACKHAC.SP_THEM', {
      p_noidungcongviec: { val: noiDungCongViec || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_soluong: { val: soLuong ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_macongtackhac_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
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
        maCongTacKhac: outBinds.p_macongtackhac_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating other work:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo công tác khác',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
