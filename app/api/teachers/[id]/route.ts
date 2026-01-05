/**
 * API Routes for Individual Teacher Operations
 * Sử dụng Oracle Stored Procedures
 *
 * - GET /api/teachers/[id]: Lấy thông tin GV từ V_GIAOVIEN_CHITIET
 * - PUT /api/teachers/[id]: Cập nhật GV qua PKG_GIAOVIEN.SP_SUA
 * - DELETE /api/teachers/[id]: Xóa GV qua PKG_GIAOVIEN.SP_XOA
 */

import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';
import { executeQuery, executeProcedure } from '@/lib/oracle';

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
  MAKHOA: string | null;
  TENKHOA: string | null;
  MAHOCVI: string | null;
  TENHOCVI: string | null;
  MAHOCHAM: string | null;
  TENHOCHAM: string | null;
  MACHUCVU: string | null;
  TENCHUCVU: string | null;
}

/**
 * GET /api/teachers/[id]
 * Lấy thông tin chi tiết giáo viên từ V_GIAOVIEN_CHITIET
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maGV } = await params;

    const result = await executeQuery<TeacherView>(
      `SELECT * FROM V_GIAOVIEN_CHITIET WHERE TRIM(MAGV) = TRIM(:maGV)`,
      { maGV },
      {
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
      }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy giáo viên' },
        { status: 404 }
      );
    }

    const t = result.rows[0];
    const teacher = {
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
      maHocHam: t.MAHOCHAM?.trim() || '',
      tenHocHam: t.TENHOCHAM || '',
      maChucVu: t.MACHUCVU?.trim() || '',
      tenChucVu: t.TENCHUCVU || ''
    };

    return NextResponse.json(teacher, { status: 200 });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin giáo viên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/teachers/[id]
 * Cập nhật giáo viên qua PKG_GIAOVIEN.SP_SUA
 * Logic validation hoàn toàn trong Oracle SP
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maGV } = await params;
    const body = await request.json();
    const { hoTen, ngaySinh, gioiTinh, queQuan, diaChi, sdt, email, maBM } = body;

    // Gọi Stored Procedure PKG_GIAOVIEN.SP_SUA
    const result = await executeProcedure('PKG_GIAOVIEN.SP_SUA', {
      p_magv: { val: maGV, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_hoten: { val: hoTen || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_ngaysinh: { val: ngaySinh ? new Date(ngaySinh) : null, type: oracledb.DATE, dir: oracledb.BIND_IN },
      p_gioitinh: { val: gioiTinh ?? null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_quequan: { val: queQuan || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_diachi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_sdt: { val: sdt || null, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
      p_email: { val: email || null, type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_IN },
      p_mabm: { val: maBM || null, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    const outBinds = result.outBinds as {
      p_status: number;
      p_message: string;
    };

    // Kiểm tra kết quả từ Oracle
    if (outBinds.p_status !== 1) {
      let httpStatus = 400;
      if (outBinds.p_status === -2) httpStatus = 404; // GV không tồn tại
      if (outBinds.p_status === -3) httpStatus = 400; // Bộ môn không tồn tại
      if (outBinds.p_status === -5) httpStatus = 409; // Email đã tồn tại
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
        maGV: maGV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật giáo viên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers/[id]
 * Xóa giáo viên qua PKG_GIAOVIEN.SP_XOA
 * Logic kiểm tra ràng buộc trong Oracle SP
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maGV } = await params;

    // Gọi Stored Procedure PKG_GIAOVIEN.SP_XOA
    const result = await executeProcedure('PKG_GIAOVIEN.SP_XOA', {
      p_magv: { val: maGV, type: oracledb.STRING, dir: oracledb.BIND_IN },
      p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      p_message: { type: oracledb.DB_TYPE_NVARCHAR, dir: oracledb.BIND_OUT, maxSize: 500 }
    });

    const outBinds = result.outBinds as {
      p_status: number;
      p_message: string;
    };

    // Kiểm tra kết quả từ Oracle
    if (outBinds.p_status !== 1) {
      let httpStatus = 400;
      if (outBinds.p_status === -2) httpStatus = 404; // GV không tồn tại
      if (outBinds.p_status === -3 || outBinds.p_status === -4) httpStatus = 409; // GV đang là chủ nhiệm
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
        maGV: maGV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa giáo viên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
