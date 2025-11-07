# Sơ Đồ Cơ Sở Dữ Liệu - Hệ Thống Quản Lý Giáo Viên

**Database:** Oracle 19c
**Schema:** LUCKYBOIZ
**Service:** qlgvpdb
**Ngày cập nhật:** 2025-10-23

---

## Mục Lục

### 📋 [Bảng Dữ Liệu (Tables)](#bảng-dữ-liệu-tables)
#### Bảng Gốc (Original Tables)
- [BOMON](#bomon) - Quản lý Bộ Môn
- [CHITIETCONGTACKHAC](#chitietcongtackhac) - Chi Tiết Công Tác Khác
- [CHITIETGIANGDAY](#chitietgiangday) - Chi Tiết Giảng Dạy (Partitioned - HASH)
- [CHITIETNCKH](#chitietnckh) - Chi Tiết Nghiên Cứu Khoa Học
- [CHITIETTAIKHAOTHI](#chitiettaikhaothi) - Chi Tiết Tải Khảo Thí
- [CHUCVU](#chucvu) - Chức Vụ
- [CONGTACKHAC](#congtackhac) - Công Tác Khác
- [DINHMUCGIANGDAY](#dinhmucgiangday) - Định Mức Giảng Dạy
- [DINHMUCMIENGIAM](#dinhmucmiengiam) - Định Mức Miễn Giảm
- [DINHMUCNGHIENCUU](#dinhmucnghiencuu) - Định Mức Nghiên Cứu
- [DOITUONGGIANGDAY](#doituonggiangday) - Đối Tượng Giảng Dạy
- [GIAOVIEN](#giaovien) - Giáo Viên
- [HOCHAM](#hocham) - Học Hàm
- [HOCVI](#hocvi) - Học Vị
- [KHOA](#khoa) - Khoa
- [LICHSUCHUCVU](#lichsuchucvu) - Lịch Sử Chức Vụ
- [LICHSUDANGNHAP](#lichsudangnhap) - Lịch Sử Đăng Nhập (Partitioned - RANGE theo THÁNG)
- [LICHSUHOCHAM](#lichsuhocham) - Lịch Sử Học Hàm
- [LOAICONGTACKHAOTHI](#loaicongtackhaothi) - Loại Công Tác Khảo Thí
- [LOAIHINHHUONGDAN](#loaihinhhuongdan) - Loại Hình Hướng Dẫn
- [LOAIHOIDONG](#loaihoidong) - Loại Hội Đồng
- [LOAINCKH](#loainckh) - Loại Nghiên Cứu Khoa Học
- [LYLICHKHOAHOC](#lylichkhoahoc) - Lý Lịch Khoa Học
- [NGONNGUGIANGDAY](#ngonngugiangday) - Ngôn Ngữ Giảng Dạy
- [NGUOIDUNG](#nguoidung) - Người Dùng
- [NGUOIDUNG_NHOM](#nguoidung_nhom) - Người Dùng - Nhóm
- [NHATKYTHAYDOI](#nhatkythaydoi) - Nhật Ký Thay Đổi (Partitioned - RANGE theo THÁNG)
- [NHOMNGUOIDUNG](#nhomnguoidung) - Nhóm Người Dùng
- [NHOM_QUYEN](#nhom_quyen) - Nhóm - Quyền
- [QUANHAM](#quanham) - Quân Hàm
- [QUYDOIGIOCHUANNCKH](#quydoigiochuannckh) - Quy Đổi Giờ Chuẩn NCKH
- [QUYEN](#quyen) - Quyền
- [SEQUENCEGENERATOR](#sequencegenerator) - Sequence Generator
- [TAIGIANGDAY](#taigiangday) - Tải Giảng Dạy (Partitioned - HASH)
- [TAIHOIDONG](#taihoidong) - Tải Hội Đồng
- [TAIHUONGDAN](#taihuongdan) - Tải Hướng Dẫn
- [TAIKHAOTHI](#taikhaothi) - Tải Khảo Thí
- [TAINCKH](#tainckh) - Tải Nghiên Cứu Khoa Học
- [THAMGIA](#thamgia) - Tham Gia
- [THAMGIAHUONGDAN](#thamgiahuongdan) - Tham Gia Hướng Dẫn
- [THOIGIANGIANGDAY](#thoigiangiangday) - Thời Gian Giảng Dạy

#### ⚡ Bảng Tối Ưu Hóa (Optimized Tables)
- [BOMON_CLUSTERED](#bomon_clustered) - Bộ Môn (Clustered với GIAOVIEN)
- [GIAOVIEN_CLUSTERED](#giaovien_clustered) - Giáo Viên (Clustered với BOMON)
- [CHITIETGIANGDAY_PARTITIONED](#chitietgiangday_partitioned) - Chi Tiết Giảng Dạy (Partitioned - LIST theo NĂM HỌC)
- [LICHSUDANGNHAP_PARTITIONED](#lichsudangnhap_partitioned) - Lịch Sử Đăng Nhập (Partitioned - RANGE theo NĂM)
- [NHATKYTHAYDOI_PARTITIONED](#nhatkythaydoi_partitioned) - Nhật Ký Thay Đổi (Partitioned - RANGE theo QUÝ)

#### 📄 Bảng JSON (JSON Tables)
- [GIAOVIEN_METADATA_JSON](#giaovien_metadata_json) - Metadata Giáo Viên (Skills, Certs, Awards)
- [SYSTEM_CONFIG_JSON](#system_config_json) - Cấu Hình Hệ Thống
- [NCKH_DETAILS_JSON](#nckh_details_json) - Chi Tiết Nghiên Cứu Mở Rộng

### 👁️ [Views & Materialized Views](#views--materialized-views)
- [V_BAOCAO_GIANGDAY](#v_baocao_giangday) - View Báo Cáo Giảng Dạy
- [V_GIAOVIEN_TONGHOP](#v_giaovien_tonghop) - View Tổng Hợp Giáo Viên
- [MV_BAOCAO_GIANGDAY_TONGHOP](#mv_baocao_giangday_tonghop) - Materialized View Báo Cáo Giảng Dạy
- [MV_THONGKE_NCKH](#mv_thongke_nckh) - Materialized View Thống Kê NCKH

### 🔧 [Stored Procedures](#stored-procedures)
- [SP_GET_GIAOVIEN_FULL_INFO](#sp_get_giaovien_full_info) - Lấy Thông Tin Đầy Đủ Giáo Viên
- [SP_REFRESH_ALL_MV](#sp_refresh_all_mv) - Refresh Tất Cả Materialized Views
- [SP_PARTITION_STATS](#sp_partition_stats) - Thống Kê Partitions

### 📊 [Indexes](#indexes)
- [Function-Based Indexes](#function-based-indexes)
- [Bitmap Indexes](#bitmap-indexes)
- [B-Tree Indexes](#b-tree-indexes)

### 🔐 [Triggers](#triggers)
- [Auto Update Triggers](#auto-update-triggers)

---

## Tổng Quan Hệ Thống

### Thống Kê Cơ Sở Dữ Liệu

| Loại Object | Số Lượng | Ghi Chú |
|-------------|----------|---------|
| **Bảng Gốc** | 47 | Bảng dữ liệu chính của hệ thống |
| **Bảng Partitioned** | 5 | LICHSUDANGNHAP, NHATKYTHAYDOI, CHITIETGIANGDAY, TAIGIANGDAY, và các bảng _PARTITIONED |
| **Cluster Tables** | 2 | GIAOVIEN_CLUSTERED, BOMON_CLUSTERED |
| **JSON Tables** | 3 | GIAOVIEN_METADATA_JSON, SYSTEM_CONFIG_JSON, NCKH_DETAILS_JSON |
| **Views** | 2 | V_BAOCAO_GIANGDAY, V_GIAOVIEN_TONGHOP |
| **Materialized Views** | 2 | MV_BAOCAO_GIANGDAY_TONGHOP, MV_THONGKE_NCKH |
| **Stored Procedures** | 3 | sp_get_giaovien_full_info, sp_refresh_all_mv, sp_partition_stats |
| **Triggers** | 3 | Auto-update timestamps cho JSON tables |

---

## Bảng Dữ Liệu (Tables)

### BOMON
**Mô tả:** Quản lý thông tin bộ môn

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MABM | CHAR | 15 | N | Mã bộ môn (Primary Key) |
| TENBM | NVARCHAR2 | 200 | Y | Tên bộ môn |
| DIACHI | NVARCHAR2 | 200 | Y | Địa chỉ |
| MAKHOA | CHAR | 15 | Y | Mã khoa (Foreign Key → KHOA) |
| MACHUNHIEMBM | CHAR | 15 | Y | Mã chủ nhiệm bộ môn |

**Ràng buộc**
| Tên | Loại | Cột | Tham Chiếu |
|-----|------|-----|------------|
| PK_BOMON | Primary Key | MABM | |
| FK_BOMON_KHOA | Foreign Key | MAKHOA | KHOA(MAKHOA) |

---

### BOMON_CLUSTERED
**Mô tả:** Bảng bộ môn tối ưu hóa - được cluster với GIAOVIEN_CLUSTERED

**Đặc điểm:**
- ✅ **Cluster với GIAOVIEN:** Lưu cùng block vật lý với giáo viên cùng bộ môn
- ✅ **JOIN nhanh hơn 2-3x:** Khi truy vấn GIAOVIEN-BOMON
- ✅ **Tiết kiệm I/O:** Giảm số lần đọc disk

**Cấu trúc:** Giống BOMON

**Cluster Key:** MABM
**Cluster Name:** GIAOVIEN_BOMON_CLUSTER
**Cluster Size:** 2048 bytes

---

### CHITIETCONGTACKHAC
**Mô tả:** Chi tiết công tác khác của giáo viên

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MACHITIETCONGTACKHAC | CHAR | 15 | N |
| VAITRO | NVARCHAR2 | 200 | Y |
| MAGV | CHAR | 15 | Y |
| MACONGTACKHAC | CHAR | 15 | Y |

**Ràng buộc**
| Tên | Loại | Cột | Tham Chiếu |
|-----|------|-----|------------|
| PK_CHITIETCONGTACKHAC | Primary Key | MACHITIETCONGTACKHAC | |
| FK_CHITIETCONGTACKHAC_GV | Foreign Key | MAGV | GIAOVIEN(MAGV) |
| FK_CHITIETCONGTACKHAC_CONGTAC | Foreign Key | MACONGTACKHAC | CONGTACKHAC(MACONGTACKHAC) |

---

### CHITIETGIANGDAY
**Mô tả:** Chi tiết giảng dạy của giáo viên (Bảng gốc - **Partitioned HASH**)

**🔥 Partitioning:** HASH - 4 partitions

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MACHITIETGIANGDAY | CHAR | 15 | N | Mã chi tiết giảng dạy |
| SOTIET | NUMBER | 22 | Y | Số tiết |
| SOTIETQUYDOI | NUMBER | 22 | Y | Số tiết quy đổi |
| GHICHU | NVARCHAR2 | 400 | Y | Ghi chú |
| MAGV | CHAR | 15 | Y | Mã giáo viên |
| MATAIGIANGDAY | CHAR | 15 | Y | Mã tải giảng dạy |
| NOIDUNGGIANGDAY | NVARCHAR2 | 400 | Y | Nội dung giảng dạy |

---

### CHITIETGIANGDAY_PARTITIONED
**Mô tả:** Chi tiết giảng dạy - Phiên bản tối ưu (**Partitioned LIST theo NĂM HỌC**)

**🔥 Partitioning:** LIST by NAMHOC
- **p_2022_2023:** Dữ liệu năm học 2022-2023
- **p_2023_2024:** Dữ liệu năm học 2023-2024
- **p_2024_2025:** Dữ liệu năm học 2024-2025
- **p_2025_2026:** Dữ liệu năm học 2025-2026
- **p_default:** Các năm học khác

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MACHITIETGIANGDAY | CHAR | 15 | N | Mã chi tiết (PK) |
| SOTIET | NUMBER | 22 | Y | Số tiết |
| SOTIETQUYDOI | NUMBER | 22 | Y | Số tiết quy đổi |
| GHICHU | NVARCHAR2 | 400 | Y | Ghi chú |
| MAGV | CHAR | 15 | Y | Mã giáo viên |
| MATAIGIANGDAY | CHAR | 15 | Y | Mã tải giảng dạy |
| NOIDUNGGIANGDAY | NVARCHAR2 | 400 | Y | Nội dung |
| NAMHOC | VARCHAR2 | 40 | N | Năm học (Partition Key) |

**Lợi ích:**
- ✅ Truy vấn nhanh theo năm học (partition pruning)
- ✅ Dễ dàng so sánh dữ liệu giữa các năm
- ✅ Backup/restore theo năm học

---

### CHITIETNCKH
**Mô tả:** Chi tiết nghiên cứu khoa học của giáo viên

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MACHITIETNCKH | CHAR | 15 | N |
| VAITRO | NVARCHAR2 | 200 | Y |
| MAGV | CHAR | 15 | Y |
| MATAINCKH | CHAR | 15 | Y |
| SOGIO | NUMBER | 22 | Y |

**Ràng buộc**
| Tên | Loại | Cột | Tham Chiếu |
|-----|------|-----|------------|
| PK_CHITIETNCKH | Primary Key | MACHITIETNCKH | |
| FK_CHITIETNCKH_GV | Foreign Key | MAGV | GIAOVIEN(MAGV) |
| FK_CHITIETNCKH_TAI | Foreign Key | MATAINCKH | TAINCKH(MATAINCKH) |

---

### CHITIETTAIKHAOTHI
**Mô tả:** Chi tiết tải khảo thí của giáo viên

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MACHITIETTAIKHAOTHI | CHAR | 15 | N |
| SOBAI | NUMBER | 22 | Y |
| SOGIOQUYCHUAN | NUMBER | 22 | Y |
| MAGV | CHAR | 15 | Y |
| MATAIKHAOTHI | CHAR | 15 | Y |

---

### GIAOVIEN
**Mô tả:** Thông tin giáo viên

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MAGV | CHAR | 15 | N | Mã giáo viên (PK) |
| HOTEN | NVARCHAR2 | 200 | Y | Họ tên |
| NGAYSINH | DATE | 7 | Y | Ngày sinh |
| GIOITINH | NUMBER | 22 | Y | Giới tính (0=Nữ, 1=Nam) |
| QUEQUAN | NVARCHAR2 | 200 | Y | Quê quán |
| DIACHI | NVARCHAR2 | 200 | Y | Địa chỉ |
| SDT | NUMBER | 22 | Y | Số điện thoại |
| EMAIL | NVARCHAR2 | 200 | Y | Email |
| MABM | CHAR | 15 | Y | Mã bộ môn (FK) |

**Indexes**
| Tên Index | Loại | Cột | Mô Tả |
|-----------|------|-----|-------|
| PK_GIAOVIEN | Unique | MAGV | Primary key |
| IX_GIAOVIEN_EMAIL | Non-unique | EMAIL | Tìm kiếm email |
| IX_GIAOVIEN_HOTEN | Non-unique | HOTEN | Tìm kiếm họ tên |
| IX_GIAOVIEN_MABM | Non-unique | MABM | JOIN với BOMON |
| IDX_GIAOVIEN_GIOITINH_BMP | Bitmap | GIOITINH | Filter theo giới tính (rất nhanh) |
| IDX_GIAOVIEN_HOTEN_UPPER | Function-based | UPPER(HOTEN) | Tìm kiếm không phân biệt hoa/thường |

---

### GIAOVIEN_CLUSTERED
**Mô tả:** Bảng giáo viên tối ưu hóa - được cluster với BOMON_CLUSTERED

**Đặc điểm:**
- ✅ **Cluster với BOMON:** Giáo viên cùng bộ môn lưu gần nhau
- ✅ **JOIN cực nhanh:** Đọc 1 lần có cả giáo viên và bộ môn
- ✅ **Giảm 40-60% I/O** khi JOIN

**Cấu trúc:** Giống GIAOVIEN

**Use Case:**
```sql
-- Query này CỰC NHANH với cluster
SELECT gv.HOTEN, bm.TENBM, k.TENKHOA
FROM GIAOVIEN_CLUSTERED gv
JOIN BOMON_CLUSTERED bm ON gv.MABM = bm.MABM
JOIN KHOA k ON bm.MAKHOA = k.MAKHOA;
```

---

### GIAOVIEN_METADATA_JSON
**Mô tả:** Metadata mở rộng của giáo viên dưới dạng JSON

**💡 Tại sao cần JSON Table?**
- ✅ Thêm thông tin mới không cần ALTER TABLE
- ✅ Lưu dữ liệu linh hoạt (skills, certificates, awards, preferences)
- ✅ Zero downtime khi thay đổi schema
- ✅ Tương thích tốt với REST API

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MAGV | CHAR | 15 | N | Mã giáo viên (PK, FK) |
| METADATA_TYPE | VARCHAR2 | 50 | N | Loại metadata (PK) |
| METADATA_JSON | CLOB | 4000 | Y | Dữ liệu JSON |
| CREATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày tạo |
| UPDATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày cập nhật (auto-update by trigger) |

**METADATA_TYPE Values:**
- **SKILLS:** Kỹ năng (technical_skills, soft_skills, languages)
- **CERTIFICATIONS:** Chứng chỉ
- **AWARDS:** Giải thưởng
- **PREFERENCES:** Tùy chọn cá nhân

**Ví dụ JSON:**
```json
{
  "technical_skills": ["Java", "Python", "Oracle", "Machine Learning"],
  "soft_skills": ["Presentation", "Team Management"],
  "languages": [
    {"language": "English", "level": "Fluent", "certificates": ["TOEIC 900"]},
    {"language": "Japanese", "level": "Intermediate", "certificates": ["JLPT N2"]}
  ]
}
```

**Trigger:**
- `trg_update_gv_metadata_date`: Tự động cập nhật UPDATED_DATE khi UPDATE

---

### LICHSUDANGNHAP
**Mô tả:** Lịch sử đăng nhập (Bảng gốc - **Partitioned RANGE theo THÁNG**)

**🔥 Partitioning:** RANGE by THOIDIEMDANGNHAP (INTERVAL 1 MONTH)
- Tự động tạo partition mới mỗi tháng
- Partition names: P_202401, P_202402, ...

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MALICHSU | VARCHAR2 | 50 | N |
| THOIDIEMDANGNHAP | TIMESTAMP(6) | 11 | N |
| THOIDIEMDANGXUAT | TIMESTAMP(6) | 11 | Y |
| MANGUOIDUNG | VARCHAR2 | 50 | Y |

---

### LICHSUDANGNHAP_PARTITIONED
**Mô tả:** Lịch sử đăng nhập - Phiên bản tối ưu (**Partitioned RANGE theo NĂM**)

**🔥 Partitioning:** RANGE by THOIDIEMDANGNHAP (INTERVAL 1 YEAR)
- **p_2023:** Dữ liệu < 2024-01-01
- **p_2024:** Dữ liệu từ 2024-01-01 đến < 2025-01-01
- **p_2025:** Dữ liệu từ 2025-01-01 đến < 2026-01-01
- **Auto-create:** Partition mới tự động tạo khi có dữ liệu năm mới

**Cột:** Giống LICHSUDANGNHAP

**Lợi ích:**
- ✅ Query nhanh 3-5x khi filter theo thời gian
- ✅ Archive dữ liệu cũ cực nhanh (DROP PARTITION)
- ✅ Backup/restore theo năm
- ✅ Partition pruning tự động

**Use Case:**
```sql
-- Chỉ quét partition 2024
SELECT * FROM LICHSUDANGNHAP_PARTITIONED
WHERE THOIDIEMDANGNHAP >= TIMESTAMP '2024-01-01 00:00:00'
  AND THOIDIEMDANGNHAP < TIMESTAMP '2025-01-01 00:00:00';

-- Xóa dữ liệu 2023 cực nhanh (< 1 giây)
ALTER TABLE LICHSUDANGNHAP_PARTITIONED DROP PARTITION p_2023;
```

---

### NHATKYTHAYDOI
**Mô tả:** Nhật ký thay đổi (Bảng gốc - **Partitioned RANGE theo THÁNG**)

**🔥 Partitioning:** RANGE by THOIGIANTHAYDOI (INTERVAL 1 MONTH)

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MANHATKY | VARCHAR2 | 50 | N |
| MALICHSU | VARCHAR2 | 50 | Y |
| THOIGIANTHAYDOI | TIMESTAMP(6) | 11 | N |
| NOIDUNGTHAYDOI | NVARCHAR2 | 510 | Y |
| THONGTINCU | NVARCHAR2 | 510 | Y |
| THONGTINMOI | NVARCHAR2 | 510 | Y |

---

### NHATKYTHAYDOI_PARTITIONED
**Mô tả:** Nhật ký thay đổi - Phiên bản tối ưu (**Partitioned RANGE theo QUÝ**)

**🔥 Partitioning:** RANGE by THOIGIANTHAYDOI (INTERVAL 3 MONTHS)
- **p_2024_q1:** Quý 1/2024 (< 2024-04-01)
- **p_2024_q2:** Quý 2/2024 (< 2024-07-01)
- **p_2024_q3:** Quý 3/2024 (< 2024-10-01)
- **p_2024_q4:** Quý 4/2024 (< 2025-01-01)
- **Auto-create:** Partition mới tự động tạo mỗi 3 tháng

**Cột:** Giống NHATKYTHAYDOI

**Lợi ích:**
- ✅ Audit log tăng rất nhanh → partition giúp quản lý tốt
- ✅ Query gần đây (30 ngày) cực nhanh
- ✅ Archive theo quý
- ✅ Compliance: Lưu log 2-5 năm dễ dàng

---

### NGUOIDUNG
**Mô tả:** Thông tin người dùng hệ thống

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MANGUOIDUNG | VARCHAR2 | 50 | N |
| TENDANGNHAP | NVARCHAR2 | 200 | Y |
| MATKHAU | NVARCHAR2 | 200 | Y |
| MAGV | CHAR | 15 | Y |

**Indexes**
| Tên Index | Loại | Cột |
|-----------|------|-----|
| PK_NGUOIDUNG | Unique | MANGUOIDUNG |
| IX_NGUOIDUNG_TENDANGNHAP | Non-unique | TENDANGNHAP |
| IDX_NGUOIDUNG_TENDANGNHAP_UPPER | Function-based | UPPER(TENDANGNHAP) |

---

### NCKH_DETAILS_JSON
**Mô tả:** Chi tiết mở rộng của công trình NCKH dưới dạng JSON

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| MATAINCKH | CHAR | 15 | N | Mã tải NCKH (PK, FK) |
| RESEARCH_DETAILS | CLOB | 4000 | Y | Chi tiết nghiên cứu JSON |
| CREATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày tạo |
| UPDATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày cập nhật |

**Ví dụ JSON:**
```json
{
  "title": "Ứng dụng Machine Learning trong giáo dục",
  "abstract": "Nghiên cứu đề xuất...",
  "keywords": ["Machine Learning", "Education", "Data Mining"],
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
  ],
  "collaborators": [
    {"name": "Trường ĐH ABC", "country": "Vietnam"}
  ]
}
```

---

### SYSTEM_CONFIG_JSON
**Mô tả:** Cấu hình hệ thống dạng JSON

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null | Mô Tả |
|----------|--------------|--------|---------------|-------|
| CONFIG_KEY | VARCHAR2 | 100 | N | Key cấu hình (PK) |
| CONFIG_CATEGORY | VARCHAR2 | 50 | N | Danh mục |
| CONFIG_VALUE | CLOB | 4000 | Y | Giá trị JSON |
| DESCRIPTION | NVARCHAR2 | 500 | Y | Mô tả |
| IS_ACTIVE | NUMBER | 1 | Y | Trạng thái (0/1) |
| CREATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày tạo |
| UPDATED_DATE | TIMESTAMP(6) | 11 | Y | Ngày cập nhật |

**Indexes**
| Tên Index | Loại | Cột |
|-----------|------|-----|
| PK_SYSTEM_CONFIG_JSON | Unique | CONFIG_KEY |
| IDX_CONFIG_CATEGORY | Non-unique | CONFIG_CATEGORY |

**Use Cases:**
- Feature flags (enable/disable tính năng)
- Email templates
- Business rules
- UI configuration

**Ví dụ:**
```json
{
  "enable_online_grading": true,
  "enable_ai_assistant": {
    "enabled": true,
    "max_tokens": 1000
  },
  "maintenance_mode": false
}
```

---

### TAIGIANGDAY
**Mô tả:** Tải giảng dạy (Bảng gốc - **Partitioned HASH**)

**🔥 Partitioning:** HASH - 8 partitions

**Cột**
| Tên Cột | Kiểu Dữ Liệu | Độ Dài | Cho Phép Null |
|----------|--------------|--------|---------------|
| MATAIGIANGDAY | CHAR | 15 | N |
| TENHOCPHAN | NVARCHAR2 | 200 | Y |
| SISO | NUMBER | 22 | Y |
| HE | NVARCHAR2 | 40 | Y |
| LOP | NVARCHAR2 | 40 | Y |
| SOTINCHI | NUMBER | 22 | Y |
| GHICHU | NVARCHAR2 | 400 | Y |
| NAMHOC | NVARCHAR2 | 40 | Y |
| MADOITUONG | CHAR | 15 | Y |
| MATHOIGIAN | CHAR | 15 | Y |
| MANGONNGU | CHAR | 15 | Y |

---

## Views & Materialized Views

### V_BAOCAO_GIANGDAY
**Mô tả:** View báo cáo giảng dạy (Regular View)

**Định nghĩa:**
```sql
SELECT
    gv.MaGV,
    gv.HoTen,
    tgd.NamHoc,
    SUM(ctgd.SoTiet) as TongSoTiet,
    SUM(ctgd.SoTietQuyDoi) as TongSoTietQuyDoi,
    COUNT(DISTINCT tgd.MaTaiGiangDay) as SoMonHoc
FROM GiaoVien gv
JOIN ChiTietGiangDay ctgd ON gv.MaGV = ctgd.MaGV
JOIN TaiGiangDay tgd ON ctgd.MaTaiGiangDay = tgd.MaTaiGiangDay
GROUP BY gv.MaGV, gv.HoTen, tgd.NamHoc
```

---

### V_GIAOVIEN_TONGHOP
**Mô tả:** View tổng hợp thông tin giáo viên

**Định nghĩa:**
```sql
SELECT
    gv.MaGV,
    gv.HoTen,
    gv.NgaySinh,
    gv.GioiTinh,
    gv.Email,
    gv.SDT,
    bm.TenBM,
    k.TenKhoa,
    hv.TenHocVi,
    hh.TenHocHam
FROM GiaoVien gv
LEFT JOIN BoMon bm ON gv.MaBM = bm.MaBM
LEFT JOIN Khoa k ON bm.MaKhoa = k.MaKhoa
LEFT JOIN HocVi hv ON gv.MaGV = hv.MaGV
LEFT JOIN LichSuHocHam lshh ON gv.MaGV = lshh.MaGV
LEFT JOIN HocHam hh ON lshh.MaHocHam = hh.MaHocHam
WHERE lshh.NgayNhan = (
    SELECT MAX(NgayNhan)
    FROM LichSuHocHam
    WHERE MaGV = gv.MaGV
)
```

---

### MV_BAOCAO_GIANGDAY_TONGHOP
**Mô tả:** Materialized View báo cáo tổng hợp giảng dạy

**⚡ Performance:** 50-100x nhanh hơn view thông thường

**Định nghĩa:**
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
WHERE tgd.NAMHOC IS NOT NULL
GROUP BY gv.MAGV, gv.HOTEN, bm.TENBM, k.TENKHOA, tgd.NAMHOC
```

**Indexes:**
- IDX_MV_GIANGDAY_MAGV (MAGV)
- IDX_MV_GIANGDAY_NAMHOC (NAMHOC)

**Refresh:** ON DEMAND (Manual hoặc Schedule)

**Use Case:**
```sql
-- Query CỰC NHANH
SELECT * FROM MV_BAOCAO_GIANGDAY_TONGHOP
WHERE NAMHOC = '2024-2025';

-- Refresh data
EXEC sp_refresh_all_mv;
```

---

### MV_THONGKE_NCKH
**Mô tả:** Materialized View thống kê nghiên cứu khoa học

**⚡ Performance:** 50-100x nhanh hơn query gốc

**Định nghĩa:**
```sql
SELECT
    gv.MAGV,
    gv.HOTEN,
    bm.TENBM,
    k.TENKHOA,
    tn.NAMHOC,
    ln.TENLOAINCKH,
    COUNT(DISTINCT tn.MATAINCKH) as SO_CONG_TRINH,
    SUM(cn.SOGIO) as TONG_GIO_NCKH,
    AVG(tn.SOTACGIA) as SO_TAC_GIA_TB
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON gv.MABM = bm.MABM
LEFT JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
LEFT JOIN CHITIETNCKH cn ON gv.MAGV = cn.MAGV
LEFT JOIN TAINCKH tn ON cn.MATAINCKH = tn.MATAINCKH
LEFT JOIN LOAINCKH ln ON tn.MALOAINCKH = ln.MALOAINCKH
WHERE tn.NAMHOC IS NOT NULL
GROUP BY gv.MAGV, gv.HOTEN, bm.TENBM, k.TENKHOA, tn.NAMHOC, ln.TENLOAINCKH
```

**Indexes:**
- IDX_MV_NCKH_MAGV (MAGV)
- IDX_MV_NCKH_NAMHOC (NAMHOC)

---

## Stored Procedures

### SP_GET_GIAOVIEN_FULL_INFO
**Mô tả:** Lấy thông tin đầy đủ giáo viên kèm metadata JSON

**Parameters:**
- `p_magv` (IN CHAR): Mã giáo viên
- `p_result` (OUT SYS_REFCURSOR): Cursor kết quả

**Logic:**
```sql
SELECT
    gv.*,
    bm.TENBM,
    k.TENKHOA,
    hv.TENHOCVI,
    (SELECT METADATA_JSON FROM GIAOVIEN_METADATA_JSON
     WHERE MAGV = gv.MAGV AND METADATA_TYPE = 'SKILLS') as SKILLS_JSON,
    (SELECT METADATA_JSON FROM GIAOVIEN_METADATA_JSON
     WHERE MAGV = gv.MAGV AND METADATA_TYPE = 'CERTIFICATIONS') as CERT_JSON
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON gv.MABM = bm.MABM
LEFT JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
LEFT JOIN HOCVI hv ON gv.MAGV = hv.MAGV
WHERE gv.MAGV = p_magv
```

**Use Case (Web API):**
```javascript
// Node.js example
const result = await connection.execute(
    `BEGIN sp_get_giaovien_full_info(:magv, :result); END;`,
    { magv: 'GV001', result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } }
);
```

---

### SP_REFRESH_ALL_MV
**Mô tả:** Refresh tất cả Materialized Views

**Logic:**
```sql
DBMS_MVIEW.REFRESH('MV_BAOCAO_GIANGDAY_TONGHOP', 'C');
DBMS_MVIEW.REFRESH('MV_THONGKE_NCKH', 'C');
COMMIT;
```

**Use Case:**
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

### SP_PARTITION_STATS
**Mô tả:** Lấy thống kê chi tiết các partitions

**Parameters:**
- `p_table_name` (IN VARCHAR2): Tên bảng partition
- `p_result` (OUT SYS_REFCURSOR): Cursor kết quả

**Logic:**
```sql
SELECT
    partition_name,
    num_rows,
    blocks,
    ROUND(num_rows * avg_row_len / 1024 / 1024, 2) as size_mb
FROM user_tab_partitions
WHERE table_name = UPPER(p_table_name)
ORDER BY partition_position
```

**Use Case:**
```sql
-- Monitor partition growth
DECLARE
    l_cursor SYS_REFCURSOR;
BEGIN
    sp_partition_stats('LICHSUDANGNHAP_PARTITIONED', l_cursor);
END;
```

---

## Indexes

### Function-Based Indexes
Cho phép tìm kiếm không phân biệt hoa/thường

| Index Name | Table | Expression |
|------------|-------|------------|
| IDX_GIAOVIEN_HOTEN_UPPER | GIAOVIEN | UPPER(HOTEN) |
| IDX_NGUOIDUNG_TENDANGNHAP_UPPER | NGUOIDUNG | UPPER(TENDANGNHAP) |

**Use Case:**
```sql
-- Query sử dụng function-based index
SELECT * FROM GIAOVIEN
WHERE UPPER(HOTEN) = 'NGUYỄN VĂN A';
```

---

### Bitmap Indexes
Tối ưu cho cột có ít giá trị distinct (low cardinality)

| Index Name | Table | Column | Distinct Values |
|------------|-------|--------|-----------------|
| IDX_GIAOVIEN_GIOITINH_BMP | GIAOVIEN | GIOITINH | 2 (Nam/Nữ) |

**Performance:** 10-100x nhanh hơn B-tree cho filter

**Use Case:**
```sql
-- Filter theo giới tính - CỰC NHANH
SELECT COUNT(*) FROM GIAOVIEN WHERE GIOITINH = 1;
```

---

### B-Tree Indexes
Index thông thường cho các trường thường xuyên tìm kiếm

| Index Name | Table | Column |
|------------|-------|--------|
| IX_GIAOVIEN_EMAIL | GIAOVIEN | EMAIL |
| IX_GIAOVIEN_HOTEN | GIAOVIEN | HOTEN |
| IX_GIAOVIEN_MABM | GIAOVIEN | MABM |
| IX_NGUOIDUNG_TENDANGNHAP | NGUOIDUNG | TENDANGNHAP |

---

## Triggers

### Auto Update Triggers
Tự động cập nhật timestamp khi UPDATE

| Trigger Name | Table | Action |
|--------------|-------|--------|
| TRG_UPDATE_GV_METADATA_DATE | GIAOVIEN_METADATA_JSON | UPDATE UPDATED_DATE |
| TRG_UPDATE_SYSTEM_CONFIG_DATE | SYSTEM_CONFIG_JSON | UPDATE UPDATED_DATE |
| TRG_UPDATE_NCKH_DETAILS_DATE | NCKH_DETAILS_JSON | UPDATE UPDATED_DATE |

**Logic:**
```sql
BEFORE UPDATE ON <table>
FOR EACH ROW
BEGIN
    :NEW.UPDATED_DATE := SYSTIMESTAMP;
END;
```

---

## Performance Summary

### Expected Performance Improvements

| Feature | Improvement | Use Case |
|---------|-------------|----------|
| **Partition** | 3-5x faster | Query by time range |
| **Cluster** | 2-3x faster | GIAOVIEN-BOMON JOIN |
| **Materialized View** | 50-100x faster | Complex reports |
| **Bitmap Index** | 10-100x faster | Low-cardinality filters |
| **JSON Support** | Schema flexibility | New features without migration |

---

## Tài Liệu Liên Quan

- [DATABASE_OPTIMIZATION_GUIDE.md](./DATABASE_OPTIMIZATION_GUIDE.md) - Chi tiết tối ưu hóa
- [README_OPTIMIZATION.md](./README_OPTIMIZATION.md) - Hướng dẫn sử dụng
- [database_optimization.sql](./database_optimization.sql) - SQL script
- [db_optimize_final.sql](./db_optimize_final.sql) - SQL script (recommended)

---

**Tác giả:** LuckyBoiz Team
**Ngày cập nhật:** 2025-10-23
**Version:** 2.0

