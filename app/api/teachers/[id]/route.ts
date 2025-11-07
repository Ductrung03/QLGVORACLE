/**
 * API Routes for Individual Teacher Operations
 *
 * This module handles HTTP requests for specific teacher operations:
 * - PUT /api/teachers/[id]: Update an existing teacher
 * - DELETE /api/teachers/[id]: Delete a teacher
 */

import { NextRequest, NextResponse } from 'next/server';
import oracledb from 'oracledb';
import { executeQuery } from '@/lib/oracle';

/**
 * Teacher type definition
 */
interface Teacher {
  MAGV: string;
  HOTEN: string;
  NGAYSINH?: Date;
  GIOITINH?: number;
  QUEQUAN?: string;
  DIACHI?: string;
  SDT?: number;
  EMAIL: string;
  MABM?: string;
}

/**
 * PUT /api/teachers/[id]
 * Update an existing teacher in the database
 *
 * @param request - Next.js request object containing updated teacher data
 * @param context - Route context containing the teacher ID parameter
 * @returns JSON response with update status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maGV } = await params;

    // Parse request body
    const body = await request.json();
    const { hoTen, ngaySinh, gioiTinh, queQuan, diaChi, sdt, email, maBM } = body;

    // Validate required fields
    if (!hoTen) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: hoTen là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Định dạng email không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Check if teacher exists (using TRIM to handle whitespace)
    const checkResult = await executeQuery<Teacher>(
      `SELECT MAGV FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(:maGV)`,
      { maGV },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy giáo viên' },
        { status: 404 }
      );
    }

    // Update teacher in database (using TRIM to handle whitespace)
    // Use DB_TYPE_NVARCHAR for Vietnamese text fields to ensure proper encoding
    const updateResult = await executeQuery(
      `UPDATE GIAOVIEN
       SET HOTEN = :hoTen,
           NGAYSINH = TO_DATE(:ngaySinh, 'YYYY-MM-DD'),
           GIOITINH = :gioiTinh,
           QUEQUAN = :queQuan,
           DIACHI = :diaChi,
           SDT = :sdt,
           EMAIL = :email,
           MABM = :maBM
       WHERE TRIM(MAGV) = TRIM(:maGV)`,
      {
        maGV: { val: maGV, type: oracledb.STRING },
        hoTen: { val: hoTen, type: oracledb.DB_TYPE_NVARCHAR },
        ngaySinh: ngaySinh || null,
        gioiTinh: gioiTinh || null,
        queQuan: { val: queQuan || null, type: oracledb.DB_TYPE_NVARCHAR },
        diaChi: { val: diaChi || null, type: oracledb.DB_TYPE_NVARCHAR },
        sdt: sdt || null,
        email: { val: email || null, type: oracledb.DB_TYPE_NVARCHAR },
        maBM: { val: maBM || null, type: oracledb.STRING }
      }
    );

    // Check if any rows were affected
    if (updateResult.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không thể cập nhật giáo viên' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cập nhật giáo viên thành công',
        maGV: maGV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating teacher:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('ORA-00001')) {
      return NextResponse.json(
        { error: 'Mã giáo viên đã tồn tại' },
        { status: 409 }
      );
    }

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
 * Delete a teacher from the database
 *
 * @param request - Next.js request object
 * @param context - Route context containing the teacher ID parameter
 * @returns JSON response with deletion status
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maGV } = await params;

    // Check if teacher exists (using TRIM to handle whitespace)
    const checkResult = await executeQuery<Teacher>(
      `SELECT MAGV FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(:maGV)`,
      { maGV },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy giáo viên' },
        { status: 404 }
      );
    }

    // Delete teacher from database (using TRIM to handle whitespace)
    const deleteResult = await executeQuery(
      `DELETE FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(:maGV)`,
      { maGV }
    );

    // Check if any rows were affected
    if (deleteResult.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Không thể xóa giáo viên' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Xóa giáo viên thành công',
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
