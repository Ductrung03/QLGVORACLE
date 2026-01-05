/**
 * API Routes for Statistics (Thống kê)
 * Sử dụng Oracle View V_THONGKE_TONG và PKG_THONGKE
 *
 * GET /api/statistics: Lấy thống kê tổng hợp
 * GET /api/statistics?type=khoa: Thống kê theo khoa
 * GET /api/statistics?type=bomon: Thống kê theo bộ môn
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeFunction } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * Interface cho V_THONGKE_TONG
 */
interface ThongKeTong {
  TONG_KHOA: number;
  TONG_BOMON: number;
  TONG_GIAOVIEN: number;
  SO_GV_NAM: number;
  SO_GV_NU: number;
  SO_GV_CO_HOCHAM: number;
  SO_TIENSI: number;
  SO_THACSI: number;
  SO_GV_CO_CHUCVU: number;
  TUOI_TRUNGBINH: number;
  NGAYSINH_LON_NHAT: Date;
  NGAYSINH_NHO_NHAT: Date;
}

/**
 * GET /api/statistics
 * Lấy thống kê tổng hợp hoặc theo loại
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Thống kê theo khoa
    if (type === 'khoa') {
      const result = await executeQuery(
        `SELECT * FROM V_KHOA_THONGKE ORDER BY TENKHOA`,
        {},
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          fetchInfo: {
            "TENKHOA": { type: oracledb.STRING },
            "DIACHI": { type: oracledb.STRING },
            "HOTEN_CHUNHIEM": { type: oracledb.STRING }
          }
        }
      );

      const khoaStats = (result.rows as any[] || []).map((k) => ({
        maKhoa: k.MAKHOA?.trim(),
        tenKhoa: k.TENKHOA || '',
        soBoMon: k.SO_BOMON || 0,
        soGiaoVien: k.SO_GIAOVIEN || 0,
        soGVCoHocHam: k.SO_GV_CO_HOCHAM || 0,
        soTienSi: k.SO_TIENSI || 0
      }));

      return NextResponse.json({
        type: 'khoa',
        data: khoaStats,
        total: khoaStats.length
      }, { status: 200 });
    }

    // Thống kê theo bộ môn
    if (type === 'bomon') {
      const result = await executeQuery(
        `SELECT * FROM V_BOMON_THONGKE ORDER BY TENBM`,
        {},
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
          fetchInfo: {
            "TENBM": { type: oracledb.STRING },
            "DIACHI": { type: oracledb.STRING },
            "TENKHOA": { type: oracledb.STRING },
            "HOTEN_CHUNHIEM": { type: oracledb.STRING }
          }
        }
      );

      const bomonStats = (result.rows as any[] || []).map((bm) => ({
        maBM: bm.MABM?.trim(),
        tenBM: bm.TENBM || '',
        tenKhoa: bm.TENKHOA || '',
        soGiaoVien: bm.SO_GIAOVIEN || 0,
        soGVCoHocHam: bm.SO_GV_CO_HOCHAM || 0,
        soTienSi: bm.SO_TIENSI || 0
      }));

      return NextResponse.json({
        type: 'bomon',
        data: bomonStats,
        total: bomonStats.length
      }, { status: 200 });
    }

    // Mặc định: Thống kê tổng hợp từ V_THONGKE_TONG
    const result = await executeQuery<ThongKeTong>(
      `SELECT * FROM V_THONGKE_TONG`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({
        error: 'Không có dữ liệu thống kê'
      }, { status: 404 });
    }

    const stats = result.rows[0];

    // Lấy thêm thống kê từ PKG_THONGKE Functions
    const tongGV = await executeFunction<number>('PKG_THONGKE.FN_TONG_GV', {});
    const tongKhoa = await executeFunction<number>('PKG_THONGKE.FN_TONG_KHOA', {});
    const tongBoMon = await executeFunction<number>('PKG_THONGKE.FN_TONG_BOMON', {});

    return NextResponse.json({
      type: 'tong',
      data: {
        tongKhoa: stats.TONG_KHOA || tongKhoa,
        tongBoMon: stats.TONG_BOMON || tongBoMon,
        tongGiaoVien: stats.TONG_GIAOVIEN || tongGV,
        soGVNam: stats.SO_GV_NAM || 0,
        soGVNu: stats.SO_GV_NU || 0,
        soGVCoHocHam: stats.SO_GV_CO_HOCHAM || 0,
        soTienSi: stats.SO_TIENSI || 0,
        soThacSi: stats.SO_THACSI || 0,
        soGVCoChucVu: stats.SO_GV_CO_CHUCVU || 0,
        tuoiTrungBinh: stats.TUOI_TRUNGBINH || 0,
        gvLonTuoiNhat: stats.NGAYSINH_LON_NHAT,
        gvNhoTuoiNhat: stats.NGAYSINH_NHO_NHAT,
        // Thêm các tỷ lệ
        tyLeNam: stats.TONG_GIAOVIEN > 0
          ? Math.round((stats.SO_GV_NAM / stats.TONG_GIAOVIEN) * 100)
          : 0,
        tyLeNu: stats.TONG_GIAOVIEN > 0
          ? Math.round((stats.SO_GV_NU / stats.TONG_GIAOVIEN) * 100)
          : 0,
        tyLeCoHocHam: stats.TONG_GIAOVIEN > 0
          ? Math.round((stats.SO_GV_CO_HOCHAM / stats.TONG_GIAOVIEN) * 100)
          : 0
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thống kê',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
