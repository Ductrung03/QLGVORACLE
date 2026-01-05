/**
 * API Routes for Council Management (Hội đồng)
 * Sử dụng Oracle Package PKG_HOIDONG
 *
 * - GET /api/council: Lấy danh sách hội đồng
 * - POST /api/council: Thêm hội đồng mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedureWithCursor, executeProcedureFull } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/council
 * Lấy danh sách hội đồng từ PKG_HOIDONG.SP_LAYDS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');
    const maHoiDong = searchParams.get('maHoiDong');
    const type = searchParams.get('type'); // 'loai' hoặc 'thanhvien'

    let rows;

    if (type === 'loai') {
      // Lấy danh sách loại hội đồng
      rows = await executeProcedureWithCursor(
        'PKG_HOIDONG.SP_LAYDS_LOAI',
        {},
        'p_cursor'
      );

      const types = rows.map((t: any) => ({
        maLoaiHoiDong: t.MALOAIHOIDONG?.trim(),
        tenLoaiHoiDong: t.TENLOAIHOIDONG || '',
        moTa: t.MOTA || ''
      }));

      return NextResponse.json(types, { status: 200 });
    }

    if (type === 'thanhvien' && maHoiDong) {
      // Lấy danh sách thành viên hội đồng
      rows = await executeProcedureWithCursor(
        'PKG_HOIDONG.SP_LAYDS_THANHVIEN',
        { p_mahoidong: maHoiDong },
        'p_cursor'
      );

      const members = rows.map((m: any) => ({
        maThamGia: m.MATHAMGIA?.trim(),
        maGV: m.MAGV?.trim(),
        hoTen: m.HOTEN || '',
        email: m.EMAIL || '',
        soGio: m.SOGIO,
        tenBM: m.TENBM || '',
        tenKhoa: m.TENKHOA || ''
      }));

      return NextResponse.json(members, { status: 200 });
    }

    if (maGV) {
      // Lấy chi tiết tham gia hội đồng theo giáo viên
      rows = await executeProcedureWithCursor(
        'PKG_HOIDONG.SP_CHITIET_GV',
        {
          p_magv: maGV,
          p_namhoc: namHoc || null
        },
        'p_cursor'
      );
    } else {
      // Lấy danh sách hội đồng
      rows = await executeProcedureWithCursor(
        'PKG_HOIDONG.SP_LAYDS',
        { p_namhoc: namHoc || null },
        'p_cursor'
      );
    }

    // Transform sang camelCase
    const councils = rows.map((c: any) => ({
      maHoiDong: c.MAHOIDONG?.trim(),
      soLuong: c.SOLUONG,
      namHoc: c.NAMHOC || '',
      thoiGianBatDau: c.THOIGIANBATDAU,
      thoiGianKetThuc: c.THOIGIANKETTHUC,
      ghiChu: c.GHICHU || '',
      maLoaiHoiDong: c.MALOAIHOIDONG?.trim() || '',
      tenLoaiHoiDong: c.TENLOAIHOIDONG || '',
      soThanhVien: c.SO_THANHVIEN,
      // Chi tiết tham gia (khi lấy theo GV)
      maThamGia: c.MATHAMGIA?.trim() || '',
      soGio: c.SOGIO
    }));

    return NextResponse.json(councils, { status: 200 });
  } catch (error) {
    console.error('Error fetching councils:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách hội đồng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/council
 * Thêm hội đồng mới qua PKG_HOIDONG.SP_THEM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { soLuong, namHoc, thoiGianBatDau, thoiGianKetThuc, ghiChu, maLoaiHoiDong } = body;

    const { outBinds } = await executeProcedureFull('PKG_HOIDONG.SP_THEM', {
      p_soluong: { val: soLuong ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_namhoc: { val: namHoc || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_thoigianbatdau: { val: thoiGianBatDau ? new Date(thoiGianBatDau) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_thoigianketthuc: { val: thoiGianKetThuc ? new Date(thoiGianKetThuc) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_ghichu: { val: ghiChu || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_maloaihoidong: { val: maLoaiHoiDong || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_mahoidong_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
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
        maHoiDong: outBinds.p_mahoidong_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating council:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo hội đồng',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
