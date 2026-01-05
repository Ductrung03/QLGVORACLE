/**
 * API Routes for Guidance Management (Hướng dẫn)
 * Sử dụng Oracle Package PKG_HUONGDAN
 *
 * - GET /api/guidance: Lấy danh sách hướng dẫn
 * - POST /api/guidance: Thêm hướng dẫn mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/guidance
 * Lấy danh sách hướng dẫn từ PKG_HUONGDAN.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');
    const maHuongDan = searchParams.get('maHuongDan');
    const type = searchParams.get('type'); // 'loai' hoặc 'giaovien'

    let rows;

    if (type === 'loai') {
      // Lấy danh sách loại hình hướng dẫn
      rows = await executeProcedureWithCursor(
        'PKG_HUONGDAN.SP_LAYDS_LOAI',
        {},
        'p_cursor'
      );

      const types = rows.map((t: any) => ({
        maLoaiHinhHuongDan: t.MALOAIHINHHUONGDAN?.trim(),
        tenLoaiHinhHuongDan: t.TENLOAIHINHHUONGDAN || '',
        moTa: t.MOTA || ''
      }));

      return NextResponse.json(types, { status: 200 });
    }

    if (type === 'giaovien' && maHuongDan) {
      // Lấy danh sách giáo viên hướng dẫn
      rows = await executeProcedureWithCursor(
        'PKG_HUONGDAN.SP_LAYDS_GV',
        { p_mahuongdan: maHuongDan },
        'p_cursor'
      );

      const teachers = rows.map((t: any) => ({
        maThamGiaHuongDan: t.MATHAMGIAHUONGDAN?.trim(),
        maGV: t.MAGV?.trim(),
        hoTen: t.HOTEN || '',
        email: t.EMAIL || '',
        soGio: t.SOGIO,
        tenBM: t.TENBM || '',
        tenKhoa: t.TENKHOA || ''
      }));

      return NextResponse.json(teachers, { status: 200 });
    }

    if (maGV) {
      // Lấy chi tiết hướng dẫn theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_HUONGDAN.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách hướng dẫn
      rows = await executeProcedureWithCursor(
        'PKG_HUONGDAN.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const guidances = rows.map((g: any) => ({
      maHuongDan: g.MAHUONGDAN?.trim(),
      hoTenHocVien: g.HOTENHOCVIEN || '',
      lop: g.LOP || '',
      he: g.HE || '',
      namHoc: g.NAMHOC || '',
      tenDeTai: g.TENDETAI || '',
      soCBHD: g.SOCBHD,
      maLoaiHinhHuongDan: g.MALOAIHINHHUONGDAN?.trim() || '',
      tenLoaiHinhHuongDan: g.TENLOAIHINHHUONGDAN || '',
      soGVHuongDan: g.SO_GV_HUONGDAN,
      // Chi tiết hướng dẫn (khi lấy theo GV)
      maThamGiaHuongDan: g.MATHAMGIAHUONGDAN?.trim() || '',
      soGio: g.SOGIO
    }));

    return NextResponse.json(guidances, { status: 200 });
  } catch (error) {
    console.error('Error fetching guidances:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách hướng dẫn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guidance
 * Thêm hướng dẫn mới qua PKG_HUONGDAN.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hoTenHocVien, lop, he, namHoc, tenDeTai, soCBHD, maLoaiHinhHuongDan } = body;

    const { outBinds } = await executeProcedureFull('PKG_HUONGDAN.SP_THEM', {
      p_hotenhocvien: { val: hoTenHocVien || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_lop: { val: lop || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_he: { val: he || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_tendetai: { val: tenDeTai || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_socbhd: { val: soCBHD ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_maloaihinhhuongdan: { val: maLoaiHinhHuongDan || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_mahuongdan_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
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
        maHuongDan: outBinds.p_mahuongdan_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating guidance:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo hướng dẫn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
