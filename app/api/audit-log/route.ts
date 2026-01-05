/**
 * API Routes for Audit Log (Nhật ký thay đổi)
 * Sử dụng bảng NHATKYTHAYDOI (được populate tự động bởi triggers)
 *
 * - GET /api/audit-log: Lấy danh sách nhật ký thay đổi
 *
 * Query Params:
 * - tableName: Tên bảng (optional)
 * - action: Loại hành động INSERT/UPDATE/DELETE (optional)
 * - from: Từ ngày (optional, format: YYYY-MM-DD)
 * - to: Đến ngày (optional, format: YYYY-MM-DD)
 * - user: Người thực hiện (optional)
 * - limit: Số lượng records (default: 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle';

/**
 * GET /api/audit-log
 * Lấy danh sách nhật ký thay đổi từ bảng NHATKYTHAYDOI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const action = searchParams.get('action');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const user = searchParams.get('user');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Build WHERE clause
    const conditions: string[] = [];
    const binds: Record<string, any> = { limit };

    if (tableName) {
      conditions.push(`UPPER(TENBANG) = UPPER(:tableName)`);
      binds.tableName = tableName;
    }

    if (action) {
      conditions.push(`UPPER(HANHDONG) = UPPER(:action)`);
      binds.action = action;
    }

    if (fromDate) {
      conditions.push(`THOIGIAN >= TO_DATE(:fromDate, 'YYYY-MM-DD')`);
      binds.fromDate = fromDate;
    }

    if (toDate) {
      conditions.push(`THOIGIAN <= TO_DATE(:toDate, 'YYYY-MM-DD') + 1`);
      binds.toDate = toDate;
    }

    if (user) {
      conditions.push(`UPPER(NGUOITHUCHIEN) LIKE UPPER(:user)`);
      binds.user = `%${user}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        MANHATKY,
        TENBANG,
        HANHDONG,
        MAGIAOVIEN,
        THOIGIAN,
        NGUOITHUCHIEN,
        DULIEUMOI,
        DULIEUCU,
        GHICHU
      FROM NHATKYTHAYDOI
      ${whereClause}
      ORDER BY THOIGIAN DESC
      FETCH FIRST :limit ROWS ONLY
    `;

    const result = await executeQuery(sql, binds);
    const rows = result.rows || [];

    // Transform sang camelCase
    const auditLogs = rows.map((row: any) => ({
      maNhatKy: row.MANHATKY?.trim() || '',
      tenBang: row.TENBANG?.trim() || '',
      hanhDong: row.HANHDONG?.trim() || '',
      maGiaoVien: row.MAGIAOVIEN?.trim() || '',
      thoiGian: row.THOIGIAN,
      nguoiThucHien: row.NGUOITHUCHIEN?.trim() || '',
      duLieuMoi: row.DULIEUMOI || '',
      duLieuCu: row.DULIEUCU || '',
      ghiChu: row.GHICHU || ''
    }));

    return NextResponse.json({
      count: auditLogs.length,
      data: auditLogs
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy nhật ký thay đổi',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit-log/stats
 * Lấy thống kê nhật ký thay đổi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'stats') {
      // Thống kê theo bảng
      const sqlByTable = `
        SELECT
          TENBANG,
          COUNT(*) AS SO_THAY_DOI,
          SUM(CASE WHEN HANHDONG = 'INSERT' THEN 1 ELSE 0 END) AS SO_INSERT,
          SUM(CASE WHEN HANHDONG = 'UPDATE' THEN 1 ELSE 0 END) AS SO_UPDATE,
          SUM(CASE WHEN HANHDONG = 'DELETE' THEN 1 ELSE 0 END) AS SO_DELETE
        FROM NHATKYTHAYDOI
        GROUP BY TENBANG
        ORDER BY SO_THAY_DOI DESC
      `;

      const resultByTable = await executeQuery(sqlByTable);

      // Thống kê theo ngày (7 ngày gần nhất)
      const sqlByDate = `
        SELECT
          TRUNC(THOIGIAN) AS NGAY,
          COUNT(*) AS SO_THAY_DOI,
          SUM(CASE WHEN HANHDONG = 'INSERT' THEN 1 ELSE 0 END) AS SO_INSERT,
          SUM(CASE WHEN HANHDONG = 'UPDATE' THEN 1 ELSE 0 END) AS SO_UPDATE,
          SUM(CASE WHEN HANHDONG = 'DELETE' THEN 1 ELSE 0 END) AS SO_DELETE
        FROM NHATKYTHAYDOI
        WHERE THOIGIAN >= SYSDATE - 7
        GROUP BY TRUNC(THOIGIAN)
        ORDER BY NGAY DESC
      `;

      const resultByDate = await executeQuery(sqlByDate);

      // Thống kê theo người thực hiện
      const sqlByUser = `
        SELECT
          NGUOITHUCHIEN,
          COUNT(*) AS SO_THAY_DOI
        FROM NHATKYTHAYDOI
        GROUP BY NGUOITHUCHIEN
        ORDER BY SO_THAY_DOI DESC
        FETCH FIRST 10 ROWS ONLY
      `;

      const resultByUser = await executeQuery(sqlByUser);

      // Transform kết quả
      const byTable = (resultByTable.rows || []).map((row: any) => ({
        tenBang: row.TENBANG?.trim() || '',
        soThayDoi: row.SO_THAY_DOI,
        soInsert: row.SO_INSERT,
        soUpdate: row.SO_UPDATE,
        soDelete: row.SO_DELETE
      }));

      const byDate = (resultByDate.rows || []).map((row: any) => ({
        ngay: row.NGAY,
        soThayDoi: row.SO_THAY_DOI,
        soInsert: row.SO_INSERT,
        soUpdate: row.SO_UPDATE,
        soDelete: row.SO_DELETE
      }));

      const byUser = (resultByUser.rows || []).map((row: any) => ({
        nguoiThucHien: row.NGUOITHUCHIEN?.trim() || '',
        soThayDoi: row.SO_THAY_DOI
      }));

      return NextResponse.json({
        byTable,
        byDate,
        byUser
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Action không hợp lệ', validActions: ['stats'] },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error with audit log operation:', error);
    return NextResponse.json(
      {
        error: 'Lỗi thao tác nhật ký',
        message: error instanceof Error ? error.message : 'Lỗi không xác định'
      },
      { status: 500 }
    );
  }
}
