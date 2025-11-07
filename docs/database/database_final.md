# Cơ Sở Dữ Liệu Quản Lý Giáo Viên - Tài Liệu Đầy Đủ

## Thông Tin Kết Nối

### Database Connection Details
```
Database Type: Oracle 19c
Container Name: oracle19c
Host: 172.17.0.1
Port: 1521
Service Name: qlgvpdb
PDB Name: qlgvpdb
Instance: QLGV
Schema: LUCKYBOIZ
Username: LuckyBoiz
Password: 4
```

### Connection String
```
LuckyBoiz@//172.17.0.1:1521/qlgvpdb
```

### Environment Variables (.env)
```bash
# Oracle Database Configuration
DB_TYPE=oracle
DB_HOST=172.17.0.1
DB_PORT=1521
DB_SERVICE_NAME=qlgvpdb
DB_PDB_NAME=qlgvpdb
DB_INSTANCE=QLGV
DB_USERNAME=LuckyBoiz
DB_PASSWORD=4
DB_SCHEMA=LUCKYBOIZ

# Full Connection String
DATABASE_URL=oracle://LuckyBoiz:4@172.17.0.1:1521/qlgvpdb

# Docker Container
ORACLE_CONTAINER=oracle19c
```

### Node.js Connection Example
```javascript
const oracledb = require('oracledb');

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

// Connection Pool
const pool = await oracledb.createPool({
  ...dbConfig,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
});
```

---

## Tổng Quan Hệ Thống

### Thống Kê Cơ Sở Dữ Liệu

| Loại Object | Số Lượng | Ghi Chú |
|-------------|----------|---------|
| **Bảng Gốc** | 47 | Bảng dữ liệu chính của hệ thống |
| **Bảng Partitioned** | 5 | Tối ưu cho dữ liệu lớn theo thời gian |
| **Cluster Tables** | 2 | Tối ưu JOIN GIAOVIEN-BOMON |
| **JSON Tables** | 3 | Metadata linh hoạt |
| **Views** | 2 | Truy vấn phức tạp |
| **Materialized Views** | 2 | Báo cáo hiệu suất cao |
| **Stored Procedures** | 3 | Logic nghiệp vụ |
| **Indexes** | 15+ | Tối ưu truy vấn |
| **Triggers** | 3 | Auto-update timestamps |

### Kiến Trúc Dữ Liệu

```
┌─────────────────────────────────────────────────────────┐
│                    ORACLE 19C DATABASE                  │
├─────────────────────────────────────────────────────────┤
│  Container: oracle19c                                   │
│  Instance: QLGV                                         │
│  PDB: qlgvpdb                                          │
│  Schema: LUCKYBOIZ                                      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   CORE TABLES                           │
├─────────────────────────────────────────────────────────┤
│  • GIAOVIEN (Giáo viên)                               │
│  • BOMON (Bộ môn)                                     │
│  • KHOA (Khoa)                                        │
│  • CHITIETGIANGDAY (Chi tiết giảng dạy)               │
│  • TAINCKH (Tải nghiên cứu khoa học)                  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                OPTIMIZED TABLES                         │
├─────────────────────────────────────────────────────────┤
│  • GIAOVIEN_CLUSTERED (Cluster với BOMON)             │
│  • LICHSUDANGNHAP_PARTITIONED (Partition theo năm)     │
│  • CHITIETGIANGDAY_PARTITIONED (Partition theo năm học)│
│  • GIAOVIEN_METADATA_JSON (Metadata linh hoạt)        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              PERFORMANCE LAYER                          │
├─────────────────────────────────────────────────────────┤
│  • MV_BAOCAO_GIANGDAY_TONGHOP (50-100x nhanh hơn)     │
│  • MV_THONGKE_NCKH (Thống kê NCKH)                    │
│  • Bitmap Indexes (Low cardinality)                    │
│  • Function-based Indexes (Case insensitive)           │
└─────────────────────────────────────────────────────────┘
```

---

## Bảng Dữ Liệu Chính

### 1. GIAOVIEN - Thông Tin Giáo Viên

**Mô tả:** Bảng lưu trữ thông tin cơ bản của giáo viên

| Cột | Kiểu | Độ Dài | Null | Mô Tả |
|-----|------|--------|------|-------|
| MAGV | CHAR | 15 | N | Mã giáo viên (PK) |
| HOTEN | NVARCHAR2 | 200 | Y | Họ tên |
| NGAYSINH | DATE | 7 | Y | Ngày sinh |
| GIOITINH | NUMBER | 22 | Y | Giới tính (0=Nữ, 1=Nam) |
| QUEQUAN | NVARCHAR2 | 200 | Y | Quê quán |
| DIACHI | NVARCHAR2 | 200 | Y | Địa chỉ |
| SDT | NUMBER | 22 | Y | Số điện thoại |
| EMAIL | NVARCHAR2 | 200 | Y | Email |
| MABM | CHAR | 15 | Y | Mã bộ môn (FK → BOMON) |

**Indexes:**
- `PK_GIAOVIEN`: Primary key (MAGV)
- `IX_GIAOVIEN_EMAIL`: Tìm kiếm email
- `IX_GIAOVIEN_HOTEN`: Tìm kiếm họ tên
- `IDX_GIAOVIEN_GIOITINH_BMP`: Bitmap index cho giới tính
- `IDX_GIAOVIEN_HOTEN_UPPER`: Function-based index cho tìm kiếm không phân biệt hoa/thường

### 2. BOMON - Bộ Môn

**Mô tả:** Thông tin các bộ môn trong trường

| Cột | Kiểu | Độ Dài | Null | Mô Tả |
|-----|------|--------|------|-------|
| MABM | CHAR | 15 | N | Mã bộ môn (PK) |
| TENBM | NVARCHAR2 | 200 | Y | Tên bộ môn |
| DIACHI | NVARCHAR2 | 200 | Y | Địa chỉ |
| MAKHOA | CHAR | 15 | Y | Mã khoa (FK → KHOA) |
| MACHUNHIEMBM | CHAR | 15 | Y | Mã chủ nhiệm bộ môn |

### 3. KHOA - Khoa

**Mô tả:** Thông tin các khoa

| Cột | Kiểu | Độ Dài | Null | Mô Tả |
|-----|------|--------|------|-------|
| MAKHOA | CHAR | 15 | N | Mã khoa (PK) |
| TENKHOA | NVARCHAR2 | 200 | Y | Tên khoa |
| DIACHI | NVARCHAR2 | 200 | Y | Địa chỉ |
| SDT | NUMBER | 22 | Y | Số điện thoại |

### 4. CHITIETGIANGDAY - Chi Tiết Giảng Dạy

**Mô tả:** Chi tiết hoạt động giảng dạy của giáo viên

| Cột | Kiểu | Độ Dài | Null | Mô Tả |
|-----|------|--------|------|-------|
| MACHITIETGIANGDAY | CHAR | 15 | N | Mã chi tiết (PK) |
| SOTIET | NUMBER | 22 | Y | Số tiết |
| SOTIETQUYDOI | NUMBER | 22 | Y | Số tiết quy đổi |
| GHICHU | NVARCHAR2 | 400 | Y | Ghi chú |
| MAGV | CHAR | 15 | Y | Mã giáo viên (FK) |
| MATAIGIANGDAY | CHAR | 15 | Y | Mã tải giảng dạy (FK) |
| NOIDUNGGIANGDAY | NVARCHAR2 | 400 | Y | Nội dung giảng dạy |

**Partitioning:** Hash partitioning (4 partitions) cho hiệu suất

---

## Bảng Tối Ưu Hóa

### 1. GIAOVIEN_CLUSTERED & BOMON_CLUSTERED

**Mục đích:** Tối ưu hóa JOIN giữa GIAOVIEN và BOMON

**Cách hoạt động:**
```
┌─────────────────────────────────────────┐
│           CLUSTER STORAGE               │
├─────────────────────────────────────────┤
│ Block 1: [BM_CNTT, GV001, GV002, GV003]│
│ Block 2: [BM_TOAN, GV004, GV005]       │
│ Block 3: [BM_LY, GV006, GV007]         │
└─────────────────────────────────────────┘
```

**Lợi ích:**
- ✅ JOIN nhanh hơn 2-3x
- ✅ Giảm 40-60% I/O operations
- ✅ Tiết kiệm buffer cache

**Use case:**
```sql
-- Query này CỰC NHANH với cluster
SELECT gv.HOTEN, bm.TENBM, k.TENKHOA
FROM GIAOVIEN_CLUSTERED gv
JOIN BOMON_CLUSTERED bm ON gv.MABM = bm.MABM
JOIN KHOA k ON bm.MAKHOA = k.MAKHOA;
```

### 2. LICHSUDANGNHAP_PARTITIONED

**Mục đích:** Quản lý dữ liệu lịch sử đăng nhập theo thời gian

**Partitioning:** RANGE by year với INTERVAL
- `p_2023`: Dữ liệu < 2024-01-01
- `p_2024`: Dữ liệu 2024-01-01 đến < 2025-01-01
- `p_2025`: Dữ liệu từ 2025-01-01
- Auto-create partition mới mỗi năm

**Lợi ích:**
- ✅ Query theo thời gian nhanh 3-5x (partition pruning)
- ✅ Archive dữ liệu cũ cực nhanh (DROP PARTITION)
- ✅ Backup/restore theo năm

### 3. CHITIETGIANGDAY_PARTITIONED

**Mục đích:** Phân vùng dữ liệu giảng dạy theo năm học

**Partitioning:** LIST by NAMHOC
- `p_2022_2023`: Năm học 2022-2023
- `p_2023_2024`: Năm học 2023-2024
- `p_2024_2025`: Năm học 2024-2025
- `p_default`: Các năm học khác

**Use case:**
```sql
-- Chỉ quét partition 2024-2025
SELECT * FROM CHITIETGIANGDAY_PARTITIONED
WHERE NAMHOC = '2024-2025';
```

---

## JSON Support - Metadata Linh Hoạt

### 1. GIAOVIEN_METADATA_JSON

**Mục đích:** Lưu metadata mở rộng của giáo viên

| Cột | Kiểu | Mô Tả |
|-----|------|-------|
| MAGV | CHAR(15) | Mã giáo viên (PK, FK) |
| METADATA_TYPE | VARCHAR2(50) | Loại metadata (PK) |
| METADATA_JSON | CLOB | Dữ liệu JSON |
| CREATED_DATE | TIMESTAMP(6) | Ngày tạo |
| UPDATED_DATE | TIMESTAMP(6) | Ngày cập nhật (auto-update) |

**METADATA_TYPE Values:**
- `SKILLS`: Kỹ năng (technical, soft skills, languages)
- `CERTIFICATIONS`: Chứng chỉ
- `AWARDS`: Giải thưởng
- `PREFERENCES`: Tùy chọn cá nhân

**Ví dụ JSON:**
```json
{
  "technical_skills": ["Java", "Python", "Oracle", "Machine Learning"],
  "soft_skills": ["Presentation", "Team Management"],
  "languages": [
    {
      "language": "English",
      "level": "Fluent",
      "certificates": ["TOEIC 900"]
    }
  ]
}
```

**Query JSON:**
```sql
-- Tìm giáo viên biết Python
SELECT gv.HOTEN
FROM GIAOVIEN gv
JOIN GIAOVIEN_METADATA_JSON meta ON gv.MAGV = meta.MAGV
WHERE meta.METADATA_TYPE = 'SKILLS'
  AND JSON_EXISTS(meta.METADATA_JSON, '$.technical_skills[*]?(@ == "Python")');
```

### 2. SYSTEM_CONFIG_JSON

**Mục đích:** Cấu hình hệ thống linh hoạt

| Cột | Kiểu | Mô Tả |
|-----|------|-------|
| CONFIG_KEY | VARCHAR2(100) | Key cấu hình (PK) |
| CONFIG_CATEGORY | VARCHAR2(50) | Danh mục |
| CONFIG_VALUE | CLOB | Giá trị JSON |
| DESCRIPTION | NVARCHAR2(500) | Mô tả |
| IS_ACTIVE | NUMBER(1) | Trạng thái |

**Use cases:**
- Feature flags (enable/disable tính năng)
- Email templates
- Business rules
- UI configuration

**Ví dụ:**
```json
{
  "features": {
    "enable_online_grading": true,
    "enable_ai_assistant": {
      "enabled": true,
      "max_tokens": 1000
    }
  }
}
```

### 3. NCKH_DETAILS_JSON

**Mục đích:** Chi tiết mở rộng của công trình NCKH

**Ví dụ JSON:**
```json
{
  "title": "Ứng dụng Machine Learning trong giáo dục",
  "funding": {
    "source": "Quỹ KHCN quốc gia",
    "amount": 500000000,
    "currency": "VND"
  },
  "publications": [
    {
      "title": "Deep Learning for Student Performance",
      "journal": "IEEE Transactions",
      "impact_factor": 3.5,
      "citations": 15
    }
  ]
}
```

---

## Materialized Views - Báo Cáo Hiệu Suất Cao

### 1. MV_BAOCAO_GIANGDAY_TONGHOP

**Mục đích:** Báo cáo tổng hợp giảng dạy

**Performance:** 50-100x nhanh hơn view thông thường

**Cấu trúc:**
```sql
SELECT
    gv.MAGV,
    gv.HOTEN,
    bm.TENBM,
    k.TENKHOA,
    tgd.NAMHOC,
    COUNT(DISTINCT tgd.MATAIGIANGDAY) as SO_MON_HOC,
    SUM(ctgd.SOTIET) as TONG_SO_TIET,
    SUM(ctgd.SOTIETQUYDOI) as TONG_TIET_QUYDOI,
    AVG(tgd.SISO) as SO_SINH_VIEN_TB
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON gv.MABM = bm.MABM
LEFT JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
LEFT JOIN CHITIETGIANGDAY ctgd ON gv.MAGV = ctgd.MAGV
LEFT JOIN TAIGIANGDAY tgd ON ctgd.MATAIGIANGDAY = tgd.MATAIGIANGDAY
GROUP BY gv.MAGV, gv.HOTEN, bm.TENBM, k.TENKHOA, tgd.NAMHOC
```

**Use case:**
```sql
-- Query CỰC NHANH
SELECT * FROM MV_BAOCAO_GIANGDAY_TONGHOP
WHERE NAMHOC = '2024-2025'
ORDER BY TONG_SO_TIET DESC;
```

### 2. MV_THONGKE_NCKH

**Mục đích:** Thống kê nghiên cứu khoa học

**Use case:**
```sql
-- Top giáo viên có nhiều công trình
SELECT HOTEN, SO_CONG_TRINH, TONG_GIO_NCKH
FROM MV_THONGKE_NCKH
WHERE NAMHOC = '2024'
ORDER BY SO_CONG_TRINH DESC
FETCH FIRST 10 ROWS ONLY;
```

**Refresh Strategy:**
```sql
-- Manual refresh
EXEC sp_refresh_all_mv;

-- Schedule refresh (2 AM daily)
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name => 'REFRESH_MVs_DAILY',
    job_type => 'STORED_PROCEDURE',
    job_action => 'sp_refresh_all_mv',
    repeat_interval => 'FREQ=DAILY; BYHOUR=2',
    enabled => TRUE
  );
END;
```

---

## Stored Procedures

### 1. SP_GET_GIAOVIEN_FULL_INFO

**Mục đích:** Lấy thông tin đầy đủ giáo viên kèm JSON metadata

**Parameters:**
- `p_magv` (IN): Mã giáo viên
- `p_result` (OUT SYS_REFCURSOR): Kết quả

**Use case (Node.js):**
```javascript
const result = await connection.execute(
  `BEGIN sp_get_giaovien_full_info(:magv, :result); END;`,
  {
    magv: 'GV001',
    result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
  }
);
```

### 2. SP_REFRESH_ALL_MV

**Mục đích:** Refresh tất cả materialized views

### 3. SP_PARTITION_STATS

**Mục đích:** Thống kê chi tiết các partitions

---

## Indexes Tối Ưu

### 1. B-Tree Indexes (Thông Thường)

| Index | Table | Column | Use Case |
|-------|-------|--------|----------|
| IX_GIAOVIEN_EMAIL | GIAOVIEN | EMAIL | Tìm kiếm email |
| IX_GIAOVIEN_HOTEN | GIAOVIEN | HOTEN | Tìm kiếm họ tên |
| IX_NGUOIDUNG_TENDANGNHAP | NGUOIDUNG | TENDANGNHAP | Login |

### 2. Bitmap Indexes (Low Cardinality)

| Index | Table | Column | Distinct Values |
|-------|-------|--------|-----------------|
| IDX_GIAOVIEN_GIOITINH_BMP | GIAOVIEN | GIOITINH | 2 (Nam/Nữ) |

**Performance:** 10-100x nhanh hơn B-tree cho filter

### 3. Function-Based Indexes

| Index | Table | Expression | Use Case |
|-------|-------|------------|----------|
| IDX_GIAOVIEN_HOTEN_UPPER | GIAOVIEN | UPPER(HOTEN) | Tìm kiếm không phân biệt hoa/thường |
| IDX_NGUOIDUNG_TENDANGNHAP_UPPER | NGUOIDUNG | UPPER(TENDANGNHAP) | Login case-insensitive |

---

## Performance Summary

### Expected Improvements

| Feature | Improvement | Use Case |
|---------|-------------|----------|
| **Partition** | 3-5x faster | Query by time range |
| **Cluster** | 2-3x faster | GIAOVIEN-BOMON JOIN |
| **Materialized View** | 50-100x faster | Complex reports |
| **Bitmap Index** | 10-100x faster | Low-cardinality filters |
| **JSON Support** | Schema flexibility | New features without migration |

### Monitoring Queries

```sql
-- Check partition usage
SELECT partition_name, num_rows, blocks
FROM USER_TAB_PARTITIONS
WHERE table_name = 'LICHSUDANGNHAP_PARTITIONED';

-- Check MV freshness
SELECT mview_name, last_refresh_date, staleness
FROM USER_MVIEWS;

-- Check index usage
SELECT index_name, num_rows, distinct_keys
FROM USER_INDEXES
WHERE table_name = 'GIAOVIEN';
```

---

## Deployment Guide

### 1. Environment Setup

**Docker Command:**
```bash
# Start Oracle container
docker run -d --name oracle19c \
  -p 1521:1521 \
  -e ORACLE_SID=QLGV \
  -e ORACLE_PDB=qlgvpdb \
  -e ORACLE_PWD=4 \
  oracle/database:19.3.0-ee

# Connect to container
docker exec -it oracle19c bash
```

### 2. Database Connection Test

```sql
-- Test connection
sqlplus LuckyBoiz/4@//172.17.0.1:1521/qlgvpdb

-- Verify schema
SELECT table_name FROM user_tables ORDER BY table_name;

-- Check data
SELECT COUNT(*) FROM GIAOVIEN;
```

### 3. Application Configuration

**Next.js API Route:**
```javascript
// pages/api/teachers/[id].js
import oracledb from 'oracledb';

const dbConfig = {
  user: 'LuckyBoiz',
  password: '4',
  connectString: '172.17.0.1:1521/qlgvpdb'
};

export default async function handler(req, res) {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(
      `SELECT gv.*, bm.TENBM, k.TENKHOA
       FROM GIAOVIEN gv
       LEFT JOIN BOMON bm ON gv.MABM = bm.MABM
       LEFT JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
       WHERE gv.MAGV = :id`,
      [req.query.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
```

### 4. Backup Strategy

```bash
# Full backup
expdp LuckyBoiz/4@qlgvpdb DIRECTORY=backup_dir \
  DUMPFILE=qlgv_full_%U.dmp \
  PARALLEL=2 \
  COMPRESSION=ALL

# Incremental backup (daily)
expdp LuckyBoiz/4@qlgvpdb DIRECTORY=backup_dir \
  DUMPFILE=qlgv_inc_%U.dmp \
  FLASHBACK_TIME=SYSTIMESTAMP-1
```

---

## Troubleshooting

### Common Issues

**1. Connection Timeout**
```bash
# Check Oracle listener
lsnrctl status

# Check container network
docker inspect oracle19c | grep IPAddress
```

**2. PDB Not Open**
```sql
-- Check PDB status
SELECT name, open_mode FROM v$pdbs;

-- Open PDB if needed
ALTER PLUGGABLE DATABASE qlgvpdb OPEN;
```

**3. Performance Issues**
```sql
-- Update statistics
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('LUCKYBOIZ');

-- Check slow queries
SELECT sql_text, elapsed_time
FROM v$sql
WHERE elapsed_time > 1000000
ORDER BY elapsed_time DESC;
```

### Maintenance Tasks

**Daily:**
- Refresh materialized views
- Check alert log
- Monitor disk space

**Weekly:**
- Update statistics
- Check partition growth
- Review slow queries

**Monthly:**
- Archive old partitions
- Full backup
- Performance review

---

## Conclusion

Cơ sở dữ liệu Oracle 19c cho hệ thống Quản Lý Giáo Viên đã được tối ưu hóa với:

✅ **47 bảng dữ liệu** đầy đủ chức năng
✅ **Partitioning** cho dữ liệu lớn theo thời gian  
✅ **Cluster tables** tối ưu JOIN thường xuyên
✅ **JSON support** cho metadata linh hoạt
✅ **Materialized views** cho báo cáo nhanh
✅ **Indexes tối ưu** cho mọi use case
✅ **Stored procedures** cho logic phức tạp

**Performance Expected:**
- Truy vấn nhanh hơn 3-100x tùy use case
- Schema linh hoạt với JSON
- Dễ dàng scale và maintain
- Tương thích tốt với web applications

**Ready for Production!** 🚀

---

**Tác giả:** LuckyBoiz Team  
**Ngày:** 2025-10-31  
**Version:** Final 1.0

