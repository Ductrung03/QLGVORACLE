/**
 * API Routes for Teacher Management
 * Sử dụng Oracle Views và Stored Procedures
 *
 * - GET /api/teachers: Lấy danh sách GV từ V_GIAOVIEN_CHITIET
 * - POST /api/teachers: Thêm GV qua PKG_GIAOVIEN.SP_THEM
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeProcedure } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * Interface cho dữ liệu từ V_GIAOVIEN_CHITIET
 */
interface TeacherView {
  MAGV: string;
  HOTEN: string;
  NGAYSINH: Date | null;
  GIOITINH: number | null;
  GIOITINH_TEXT: string;
  TUOI: number | null;
  QUEQUAN: string | null;
  DIACHI: string | null;
  SDT: number | null;
  EMAIL: string | null;
  MABM: string | null;
  TENBM: string | null;
  DIACHI_BM: string | null;
  MAKHOA: string | null;
  TENKHOA: string | null;
  DIACHI_KHOA: string | null;
  MAHOCVI: string | null;
  TENHOCVI: string | null;
  NGAYNHAN_HOCVI: Date | null;
  MAHOCHAM: string | null;
  TENHOCHAM: string | null;
  NGAYNHAN_HOCHAM: Date | null;
  MACHUCVU: string | null;
  TENCHUCVU: string | null;
}

/**
 * GET /api/teachers
 * Lấy danh sách giáo viên từ V_GIAOVIEN_CHITIET
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maBM = searchParams.get('maBM');
    const maKhoa = searchParams.get('maKhoa');
    const keyword = searchParams.get('keyword');

    // Xây dựng query với điều kiện lọc
    let sql = `SELECT * FROM V_GIAOVIEN_CHITIET WHERE 1=1`;
    const binds: Record<string, any> = {};

    if (maBM) {
      sql += ` AND TRIM(MABM) = TRIM(:maBM)`;
      binds.maBM = maBM;
    }

    if (maKhoa) {
      sql += ` AND TRIM(MAKHOA) = TRIM(:maKhoa)`;
      binds.maKhoa = maKhoa;
    }

    if (keyword) {
      sql += ` AND (UPPER(HOTEN) LIKE '%' || UPPER(:keyword) || '%' OR UPPER(EMAIL) LIKE '%' || UPPER(:keyword) || '%')`;
      binds.keyword = keyword;
    }

    sql += ` ORDER BY HOTEN`;

    const result = await executeQuery<TeacherView>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        "HOTEN": { type: oracledb.STRING },
        "QUEQUAN": { type: oracledb.STRING },
        "DIACHI": { type: oracledb.STRING },
        "EMAIL": { type: oracledb.STRING },
        "TENBM": { type: oracledb.STRING },
        "TENKHOA": { type: oracledb.STRING },
        "TENHOCVI": { type: oracledb.STRING },
        "TENHOCHAM": { type: oracledb.STRING },
        "TENCHUCVU": { type: oracledb.STRING },
        "GIOITINH_TEXT": { type: oracledb.STRING }
      }
    });

    // Transform sang camelCase
    const teachers = (result.rows || []).map((t) => ({
      maGV: t.MAGV?.trim(),
      hoTen: t.HOTEN || '',
      ngaySinh: t.NGAYSINH,
      gioiTinh: t.GIOITINH,
      gioiTinhText: t.GIOITINH_TEXT || '',
      tuoi: t.TUOI,
      queQuan: t.QUEQUAN || '',
      diaChi: t.DIACHI || '',
      sdt: t.SDT,
      email: t.EMAIL || '',
      maBM: t.MABM?.trim() || '',
      tenBM: t.TENBM || '',
      maKhoa: t.MAKHOA?.trim() || '',
      tenKhoa: t.TENKHOA || '',
      maHocVi: t.MAHOCVI?.trim() || '',
      tenHocVi: t.TENHOCVI || '',
      ngayNhanHocVi: t.NGAYNHAN_HOCVI,
      maHocHam: t.MAHOCHAM?.trim() || '',
      tenHocHam: t.TENHOCHAM || '',
      ngayNhanHocHam: t.NGAYNHAN_HOCHAM,
      maChucVu: t.MACHUCVU?.trim() || '',
      tenChucVu: t.TENCHUCVU || ''
    }));

    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy danh sách giáo viên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers
 * Thêm giáo viên mới qua PKG_GIAOVIEN.SP_THEM
 * Logic validation hoàn toàn trong Oracle SP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hoTen, ngaySinh, gioiTinh, queQuan, diaChi, sdt, email, maBM } = body;

    // Gọi Stored Procedure PKG_GIAOVIEN.SP_THEM
    const result = await executeProcedure('PKG_GIAOVIEN.SP_THEM', {
      p_hoten: { val: hoTen || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_ngaysinh: { val: ngaySinh ? new Date(ngaySinh) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_gioitinh: { val: gioiTinh ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_quequan: { val: queQuan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_diachi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sdt: { val: sdt || null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_email: { val: email || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_mabm: { val: maBM || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_magv_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 15 },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    const outBinds = result.outBinds as {
      p_magv_out: string;
      p_status: number;
      p_message: string;
    };

    // Kiểm tra kết quả từ Oracle
    if (outBinds.p_status !== 1) {
      // Map status code sang HTTP status
      let httpStatus = 400;
      if (outBinds.p_status === -2) httpStatus = 400; // Bộ môn không tồn tại
      if (outBinds.p_status === -4) httpStatus = 409; // Email đã tồn tại
      if (outBinds.p_status === -99) httpStatus = 500; // Lỗi hệ thống

      return NextResponse.json(
        {
          error: outBinds.p_message,
          status: outBinds.p_status
        },
        { status: httpStatus }
      );
    }

    return NextResponse.json(
      {
        message: outBinds.p_message,
        maGV: outBinds.p_magv_out?.trim()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      {
        error: 'Không thể tạo giáo viên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
