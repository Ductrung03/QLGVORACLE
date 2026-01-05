/**
 * API Routes for Research Management (NCKH)
 * Sử dụng Oracle Package PKG_NCKH
 *
 * - GET /api/research: Lấy danh sách nghiên cứu khoa học
 * - POST /api/research: Thêm nghiên cứu mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/research
 * Lấy danh sách NCKH từ PKG_NCKH.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');

    let rows;

    if (maGV) {
      // Lấy chi tiết NCKH theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_NCKH.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách NCKH
      rows = await executeProcedureWithCursor(
        'PKG_NCKH.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const researches = rows.map((r: any) => ({
      maTaiNCKH: r.MATAINCKH?.trim(),
      tenCongTrinhKhoaHoc: r.TENCONGTRINHKHOAHOC || '',
      namHoc: r.NAMHOC || '',
      soTacGia: r.SOTACGIA,
      maLoaiNCKH: r.MALOAINCKH?.trim() || '',
      tenLoaiNCKH: r.TENLOAINCKH || '',
      soThanhVien: r.SO_THANHVIEN,
      tongSoGio: r.TONG_SOGIO,
      // Chi tiết NCKH (khi lấy theo GV)
      maChiTietNCKH: r.MACHITIETNCKH?.trim() || '',
      vaiTro: r.VAITRO || '',
      soGio: r.SOGIO
    }));

    return NextResponse.json(researches, { status: 200 });
  } catch (error) {
    console.error('Error fetching researches:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách nghiên cứu khoa học',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research
 * Thêm NCKH mới qua PKG_NCKH.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenCongTrinhKhoaHoc, namHoc, soTacGia, maLoaiNCKH } = body;

    const { outBinds } = await executeProcedureFull('PKG_NCKH.SP_THEM', {
      p_tencongtrinhkh: { val: tenCongTrinhKhoaHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sotacgia: { val: soTacGia ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_maloainckh: { val: maLoaiNCKH || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_matainckh_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
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
        maTaiNCKH: outBinds.p_matainckh_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating research:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo nghiên cứu khoa học',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
