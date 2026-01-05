/**
 * API Routes for Reports (Báo cáo)
 * Sử dụng Oracle Views và Materialized Views
 *
 * - GET /api/reports: Lấy báo cáo tổng hợp theo loại
 *
 * Query Params:
 * - type: 'teaching' | 'research' | 'examination' | 'council' | 'guidance' | 'other-work' | 'summary-teacher' | 'summary-department' | 'summary-faculty'
 * - namHoc: Năm học (optional)
 * - maGV: Mã giáo viên (optional)
 * - maBM: Mã bộ môn (optional)
 * - maKhoa: Mã khoa (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';

/**
 * GET /api/reports
 * Lấy báo cáo từ Views dựa theo type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary-teacher';
    const namHoc = searchParams.get('namHoc');
    const maGV = searchParams.get('maGV');
    const maBM = searchParams.get('maBM');
    const maKhoa = searchParams.get('maKhoa');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let sql = '';
    let binds: Record<string, any> = {};
    let whereClause: { sql: string; binds: Record<string, any> } = { sql: '', binds: {} };

    switch (type) {
      case 'teaching':
        // Báo cáo giảng dạy chi tiết từ V_GIANGDAY_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MACHITIETGIANGDAY,
            SOTIET,
            SOTIETQUYDOI,
            GHICHU_CHITIET,
            NOIDUNGGIANGDAY,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MATAIGIANGDAY,
            TENHOCPHAN,
            SISO,
            HE,
            LOP,
            SOTINCHI,
            NAMHOC,
            GHICHU_TAI
          FROM V_GIANGDAY_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'research':
        // Báo cáo NCKH chi tiết từ V_NCKH_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MACHITIETNCKH,
            VAITRO,
            SOGIO,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MATAINCKH,
            TENCONGTRINHKHOAHOC,
            NAMHOC,
            SOTACGIA,
            MALOAINCKH,
            TENLOAINCKH
          FROM V_NCKH_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'examination':
        // Báo cáo khảo thí chi tiết từ V_KHAOTHI_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MACHITIETTAIKHAOTHI,
            SOBAI,
            SOGIOQUYCHUAN,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MATAIKHAOTHI,
            HOCPHAN,
            LOP,
            NAMHOC,
            GHICHU,
            MALOAICONGTACKHAOTHI,
            TENLOAICONGTACKHAOTHI
          FROM V_KHAOTHI_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'council':
        // Báo cáo hội đồng chi tiết từ V_HOIDONG_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MATHAMGIA,
            SOGIO,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MAHOIDONG,
            SOLUONG,
            NAMHOC,
            THOIGIANBATDAU,
            THOIGIANKETTHUC,
            GHICHU,
            MALOAIHOIDONG,
            TENLOAIHOIDONG
          FROM V_HOIDONG_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'guidance':
        // Báo cáo hướng dẫn chi tiết từ V_HUONGDAN_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MATHAMGIAHUONGDAN,
            SOGIO,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MAHUONGDAN,
            HOTENHOCVIEN,
            LOP,
            HE,
            NAMHOC,
            TENDETAI,
            SOCBHD,
            MALOAIHINHHUONGDAN,
            TENLOAIHINHHUONGDAN
          FROM V_HUONGDAN_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'other-work':
        // Báo cáo công tác khác chi tiết từ V_CONGTACKHAC_CHITIET
        whereClause = buildWhereClause(namHoc, maGV, maBM, maKhoa, 'NAMHOC', 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MACHITIETCONGTACKHAC,
            VAITRO,
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MACONGTACKHAC,
            NOIDUNGCONGVIEC,
            NAMHOC,
            SOLUONG,
            GHICHU
          FROM V_CONGTACKHAC_CHITIET
          ${whereClause.sql}
          ORDER BY NAMHOC DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'summary-teacher':
        // Báo cáo tổng hợp theo giáo viên từ V_TONGHOP_GIAOVIEN
        whereClause = buildWhereClause(null, maGV, maBM, maKhoa, null, 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MAGV,
            HOTEN,
            EMAIL,
            NGAYSINH,
            GIOITINH,
            DIENTHOAI,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            SO_GIANGDAY,
            SO_NCKH,
            SO_KHAOTHI,
            SO_HOIDONG,
            SO_HUONGDAN,
            SO_CONGTACKHAC,
            TONG_HOATDONG
          FROM V_TONGHOP_GIAOVIEN
          ${whereClause.sql}
          ORDER BY TONG_HOATDONG DESC, HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'summary-department':
        // Báo cáo tổng hợp theo bộ môn từ V_TONGHOP_BOMON
        whereClause = buildWhereClause(null, null, maBM, maKhoa, null, null, 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            SO_GIAOVIEN,
            SO_GIANGDAY,
            SO_NCKH,
            SO_KHAOTHI,
            SO_HOIDONG,
            SO_HUONGDAN,
            SO_CONGTACKHAC,
            TONG_HOATDONG
          FROM V_TONGHOP_BOMON
          ${whereClause.sql}
          ORDER BY TONG_HOATDONG DESC, TENBM
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'summary-faculty':
        // Báo cáo tổng hợp theo khoa từ V_TONGHOP_KHOA
        whereClause = buildWhereClause(null, null, null, maKhoa, null, null, null, 'MAKHOA');
        sql = `
          SELECT
            MAKHOA,
            TENKHOA,
            SO_BOMON,
            SO_GIAOVIEN,
            SO_GIANGDAY,
            SO_NCKH,
            SO_KHAOTHI,
            SO_HOIDONG,
            SO_HUONGDAN,
            SO_CONGTACKHAC,
            TONG_HOATDONG
          FROM V_TONGHOP_KHOA
          ${whereClause.sql}
          ORDER BY TONG_HOATDONG DESC, TENKHOA
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'history-position':
        // Lịch sử chức vụ từ V_LICHSU_CHUCVU
        whereClause = buildWhereClause(null, maGV, null, null, null, 'MAGV', null, null);
        sql = `
          SELECT
            MALICHSU,
            MAGV,
            HOTEN,
            MACHUCVU,
            TENCHUCVU,
            THOIGIANNHANCHUCVU,
            THOIGIANKETTHUC,
            GHICHU
          FROM V_LICHSU_CHUCVU
          ${whereClause.sql}
          ORDER BY THOIGIANNHANCHUCVU DESC
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'history-academic-rank':
        // Lịch sử học hàm từ V_LICHSU_HOCHAM
        whereClause = buildWhereClause(null, maGV, null, null, null, 'MAGV', null, null);
        sql = `
          SELECT
            MALICHSU,
            MAGV,
            HOTEN,
            MAHOCHAM,
            TENHOCHAM,
            NGAYNHAN,
            GHICHU
          FROM V_LICHSU_HOCHAM
          ${whereClause.sql}
          ORDER BY NGAYNHAN DESC
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      case 'teacher-degree':
        // Học vị giáo viên từ V_HOCVI_GIAOVIEN
        whereClause = buildWhereClause(null, maGV, maBM, maKhoa, null, 'MAGV', 'MABM', 'MAKHOA');
        sql = `
          SELECT
            MAGV,
            HOTEN,
            EMAIL,
            MABM,
            TENBM,
            MAKHOA,
            TENKHOA,
            MAHOCVI,
            TENHOCVI
          FROM V_HOCVI_GIAOVIEN
          ${whereClause.sql}
          ORDER BY HOTEN
          FETCH FIRST :limit ROWS ONLY
        `;
        binds = { ...whereClause.binds, limit };
        break;

      default:
        return NextResponse.json(
          { error: 'Loại báo cáo không hợp lệ', validTypes: ['teaching', 'research', 'examination', 'council', 'guidance', 'other-work', 'summary-teacher', 'summary-department', 'summary-faculty', 'history-position', 'history-academic-rank', 'teacher-degree'] },
          { status: 400 }
        );
    }

    const result = await executeQuery(sql, binds);
    const rows = result.rows || [];

    // Transform rows sang camelCase
    const data = rows.map((row: any) => transformToCamelCase(row));

    return NextResponse.json({
      type,
      count: data.length,
      data
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy báo cáo',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to build WHERE clause
 */
function buildWhereClause(
  namHoc: string | null,
  maGV: string | null,
  maBM: string | null,
  maKhoa: string | null,
  namHocCol: string | null,
  maGVCol: string | null,
  maBMCol: string | null,
  maKhoaCol: string | null
): { sql: string; binds: Record<string, any> } {
  const conditions: string[] = [];
  const binds: Record<string, any> = {};

  if (namHoc && namHocCol) {
    conditions.push(`${namHocCol} = :namHoc`);
    binds.namHoc = namHoc;
  }

  if (maGV && maGVCol) {
    conditions.push(`TRIM(${maGVCol}) = :maGV`);
    binds.maGV = maGV;
  }

  if (maBM && maBMCol) {
    conditions.push(`TRIM(${maBMCol}) = :maBM`);
    binds.maBM = maBM;
  }

  if (maKhoa && maKhoaCol) {
    conditions.push(`TRIM(${maKhoaCol}) = :maKhoa`);
    binds.maKhoa = maKhoa;
  }

  const sql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { sql, binds };
}

/**
 * Helper function to transform Oracle column names to camelCase
 */
function transformToCamelCase(row: any): any {
  const result: any = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = row[key];
    
    // Trim string values
    if (typeof value === 'string') {
      value = value.trim();
    }
    
    result[camelKey] = value;
  }
  return result;
}
