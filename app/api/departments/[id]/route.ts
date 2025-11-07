/**
 * API Routes for Individual Department Management
 * 
 * GET /api/departments/[id]: Get department by ID
 * PUT /api/departments/[id]: Update department
 * DELETE /api/departments/[id]: Delete department
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

/**
 * GET /api/departments/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmedId = id.trim();

    const result = await executeQuery(
      `SELECT
        BM.MABM,
        BM.TENBM,
        BM.DIACHI,
        BM.MAKHOA,
        BM.MACHUNHIEMBM,
        K.TENKHOA,
        GV.HOTEN as TENCHUNHIEM
      FROM BOMON BM
      LEFT JOIN KHOA K ON BM.MAKHOA = K.MAKHOA
      LEFT JOIN GIAOVIEN GV ON BM.MACHUNHIEMBM = GV.MAGV
      WHERE TRIM(BM.MABM) = :id`,
      { id: trimmedId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bộ môn' },
        { status: 404 }
      );
    }

    const dept: any = result.rows[0];
    const department = {
      maBM: dept.MABM?.trim(),
      tenBM: dept.TENBM || '',
      diaChi: dept.DIACHI || '',
      maKhoa: dept.MAKHOA?.trim() || '',
      tenKhoa: dept.TENKHOA || '',
      maChuNhiemBM: dept.MACHUNHIEMBM?.trim() || '',
      tenChuNhiem: dept.TENCHUNHIEM || ''
    };

    return NextResponse.json(department, { status: 200 });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin bộ môn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/departments/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmedId = id.trim();
    const body = await request.json();
    const { TENBM, DIACHI, MAKHOA, MACHUNHIEMBM } = body;

    console.log('PUT Department - ID:', `"${trimmedId}"`, 'Length:', trimmedId.length);
    console.log('PUT Department - Body:', body);

    if (!TENBM) {
      return NextResponse.json(
        { error: 'Tên bộ môn là bắt buộc' },
        { status: 400 }
      );
    }

    // Use DB_TYPE_NVARCHAR for Vietnamese text fields to ensure proper encoding
    const result = await executeQuery(
      `UPDATE BOMON
       SET TENBM = :tenBM,
           DIACHI = :diaChi,
           MAKHOA = :maKhoa,
           MACHUNHIEMBM = :maChuNhiemBM
       WHERE TRIM(MABM) = :id`,
      {
        tenBM: { val: TENBM, type: oracledb.DB_TYPE_NVARCHAR },
        diaChi: { val: DIACHI || null, type: oracledb.DB_TYPE_NVARCHAR },
        maKhoa: { val: MAKHOA || null, type: oracledb.STRING },
        maChuNhiemBM: { val: MACHUNHIEMBM || null, type: oracledb.STRING },
        id: { val: trimmedId, type: oracledb.STRING }
      }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bộ môn để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cập nhật bộ môn thành công',
        rowsAffected: result.rowsAffected
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật bộ môn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/departments/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmedId = id.trim();

    // Check if department has teachers
    const teacherCheck = await executeQuery(
      `SELECT COUNT(*) as TEACHER_COUNT FROM GIAOVIEN WHERE TRIM(MABM) = :id`,
      { id: trimmedId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const teacherCount = teacherCheck.rows?.[0]?.TEACHER_COUNT || 0;
    if (teacherCount > 0) {
      return NextResponse.json(
        { 
          error: 'Không thể xóa bộ môn',
          message: `Bộ môn này có ${teacherCount} giáo viên. Vui lòng chuyển giáo viên sang bộ môn khác trước khi xóa.`
        },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `DELETE FROM BOMON WHERE TRIM(MABM) = :id`,
      { id: trimmedId }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bộ môn để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Xóa bộ môn thành công',
        rowsAffected: result.rowsAffected
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa bộ môn',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
