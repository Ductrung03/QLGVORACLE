/**
 * API Routes for Examination Management (Khảo thí)
 * Sử dụng Oracle Package PKG_KHAOTHI
 *
 * - GET /api/examination: Lấy danh sách khảo thí
 * - POST /api/examination: Thêm khảo thí mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/examination
 * Lấy danh sách khảo thí từ PKG_KHAOTHI.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');
    const type = searchParams.get('type'); // 'loai' để lấy danh sách loại khảo thí

    let rows;

    if (type === 'loai') {
      // Lấy danh sách loại công tác khảo thí
      rows = await executeProcedureWithCursor(
        'PKG_KHAOTHI.SP_LAYDS_LOAI',
        {},
        'p_cursor'
      );

      const types = rows.map((t: any) => ({
        maLoaiCongTacKhaoThi: t.MALOAICONGTACKHAOTHI?.trim(),
        tenLoaiCongTacKhaoThi: t.TENLOAICONGTACKHAOTHI || '',
        moTa: t.MOTA || ''
      }));

      return NextResponse.json(types, { status: 200 });
    }

    if (maGV) {
      // Lấy chi tiết khảo thí theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_KHAOTHI.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách khảo thí
      rows = await executeProcedureWithCursor(
        'PKG_KHAOTHI.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const examinations = rows.map((e: any) => ({
      maTaiKhaoThi: e.MATAIKHAOTHI?.trim(),
      hocPhan: e.HOCPHAN || '',
      lop: e.LOP || '',
      namHoc: e.NAMHOC || '',
      ghiChu: e.GHICHU || '',
      maLoaiCongTacKhaoThi: e.MALOAICONGTACKHAOTHI?.trim() || '',
      tenLoaiCongTacKhaoThi: e.TENLOAICONGTACKHAOTHI || '',
      soGVPhanCong: e.SO_GV_PHANCONG,
      tongSoBai: e.TONG_SOBAI,
      // Chi tiết khảo thí (khi lấy theo GV)
      maChiTietTaiKhaoThi: e.MACHITIETTAIKHAOTHI?.trim() || '',
      soBai: e.SOBAI,
      soGioQuyChua: e.SOGIOQUYCHUAN
    }));

    return NextResponse.json(examinations, { status: 200 });
  } catch (error) {
    console.error('Error fetching examinations:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách khảo thí',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/examination
 * Thêm khảo thí mới qua PKG_KHAOTHI.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hocPhan, lop, namHoc, ghiChu, maLoaiCongTac } = body;

    const { outBinds } = await executeProcedureFull('PKG_KHAOTHI.SP_THEM', {
      p_hocphan: { val: hocPhan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_maloaicongtac: { val: maLoaiCongTac || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_mataikhaothi_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
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
        maTaiKhaoThi: outBinds.p_mataikhaothi_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating examination:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo khảo thí',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
