/**
 * API Routes for Individual Faculty Operations
 *
 * GET /api/faculties/[id]: Get faculty by ID
 * PUT /api/faculties/[id]: Update faculty
 * DELETE /api/faculties/[id]: Delete faculty
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';
import oracledb from 'oracledb';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/faculties/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await executeQuery(
      `SELECT
        K.MAKHOA,
        K.TENKHOA,
        K.DIACHI,
        K.MACHUNHIEMKHOA,
        GV.HOTEN as TENCHUNHIEM
      FROM KHOA K
      LEFT JOIN GIAOVIEN GV ON K.MACHUNHIEMKHOA = GV.MAGV
      WHERE TRIM(K.MAKHOA) = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy khoa' }, { status: 404 });
    }

    const faculty: any = result.rows[0];
    return NextResponse.json({
      maKhoa: faculty.MAKHOA?.trim(),
      tenKhoa: faculty.TENKHOA || '',
      diaChi: faculty.DIACHI || '',
      maChuNhiemKhoa: faculty.MACHUNHIEMKHOA?.trim() || '',
      tenChuNhiem: faculty.TENCHUNHIEM || ''
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/faculties/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tenKhoa, diaChi, maChuNhiemKhoa } = body;

    if (!tenKhoa) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: tenKhoa là bắt buộc' },
        { status: 400 }
      );
    }

    // Use DB_TYPE_NVARCHAR for Vietnamese text fields to ensure proper encoding
    const result = await executeQuery(
      `UPDATE KHOA
       SET TENKHOA = :tenKhoa,
           DIACHI = :diaChi,
           MACHUNHIEMKHOA = :maChuNhiemKhoa
       WHERE TRIM(MAKHOA) = :id`,
      {
        tenKhoa: { val: tenKhoa, type: oracledb.DB_TYPE_NVARCHAR },
        diaChi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR },
        maChuNhiemKhoa: { val: maChuNhiemKhoa || null, type: oracledb.STRING },
        id: { val: id, type: oracledb.STRING }
      }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Không tìm thấy khoa' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Cập nhật khoa thành công',
      rowsAffected: result.rowsAffected
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    return NextResponse.json(
      { error: 'Failed to update faculty', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faculties/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmedId = id.trim();

    // Check if faculty has departments
    const departmentCheck = await executeQuery(
      `SELECT COUNT(*) as DEPT_COUNT FROM BOMON WHERE TRIM(MAKHOA) = :id`,
      { id: trimmedId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const deptCount = departmentCheck.rows?.[0]?.DEPT_COUNT || 0;
    if (deptCount > 0) {
      return NextResponse.json(
        {
          error: 'Không thể xóa khoa',
          message: `Khoa này có ${deptCount} bộ môn. Vui lòng xóa hoặc chuyển các bộ môn trước khi xóa khoa.`
        },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `DELETE FROM KHOA WHERE TRIM(MAKHOA) = :id`,
      { id: trimmedId }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Không tìm thấy khoa' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Xóa khoa thành công',
      rowsAffected: result.rowsAffected
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);

    // Check for foreign key constraint violation
    if (error instanceof Error && error.message.includes('ORA-02292')) {
      return NextResponse.json(
        { error: 'Không thể xóa khoa vì còn bộ môn liên kết' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete faculty', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
