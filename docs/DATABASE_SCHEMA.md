# Cấu trúc Database - Hệ thống Quản lý Giáo viên

## Tổng quan

Hệ thống quản lý giáo viên bao gồm các module chính sau:

### 1. Module Tổ chức (Organization)
- **KHOA** (Khoa/Faculty): Quản lý các khoa trong trường
- **BOMON** (Bộ môn/Department): Quản lý các bộ môn thuộc khoa

### 2. Module Giáo viên (Teacher)
- **GIAOVIEN** (Giáo viên): Thông tin cá nhân giáo viên
- **CHUCVU** (Chức vụ): Các chức vụ trong trường
- **LICHSUCHUCVU**: Lịch sử chức vụ của giáo viên
- **HOCHAM** (Học hàm): Học hàm của giáo viên
- **HOCVI** (Học vị): Học vị của giáo viên

### 3. Module Giảng dạy (Teaching)
- **TAIGIANGDAY** (Tài giảng dạy): Các học phần giảng dạy
- **CHITIETGIANGDAY** (Chi tiết giảng dạy): Phân công giảng dạy chi tiết
- **DOITUONGGIANGDAY**: Đối tượng giảng dạy (đại học, cao học...)
- **THOIGIANGIANGDAY**: Thời gian giảng dạy
- **NGONNGUGIANGDAY**: Ngôn ngữ giảng dạy
- **DINHMUCGIANGDAY**: Định mức giờ giảng dạy

### 4. Module Nghiên cứu khoa học (Research)
- **TAINCKH** (Tài liệu NCKH): Công trình nghiên cứu
- **CHITIETNCKH**: Chi tiết nghiên cứu
- **LOAINCKH**: Loại hình nghiên cứu
- **DINHMUCNGHIENCUU**: Định mức nghiên cứu
- **QUYDOIGIOCHUANNCKH**: Quy đổi giờ chuẩn nghiên cứu

### 5. Module Khác
- **CONGTACKHAC**: Công tác khác
- **TAIKHAOTHI**: Tài khảo thí
- **TAIHUONGDAN**: Tài hướng dẫn
- **TAIHOIDONG**: Tài hội đồng
- **NGUOIDUNG**: Người dùng hệ thống
- **NHOMNGUOIDUNG**: Nhóm người dùng
- **QUYEN**: Quyền hạn

## Chi tiết các bảng chính

### GIAOVIEN (Giáo viên)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MAGV | CHAR(15) PK | Mã giáo viên |
| HOTEN | NVARCHAR2(100) | Họ và tên |
| NGAYSINH | DATE | Ngày sinh |
| GIOITINH | NUMBER(1) | Giới tính (1: Nam, 0: Nữ) |
| QUEQUAN | NVARCHAR2(100) | Quê quán |
| DIACHI | NVARCHAR2(100) | Địa chỉ |
| SDT | NUMBER(15) | Số điện thoại |
| EMAIL | NVARCHAR2(100) | Email |
| MABM | CHAR(15) FK | Mã bộ môn |

### KHOA (Khoa)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MAKHOA | CHAR(15) PK | Mã khoa |
| TENKHOA | NVARCHAR2(100) | Tên khoa |
| DIACHI | NVARCHAR2(100) | Địa chỉ |
| MACHUNHIEMKHOA | CHAR(15) FK | Mã chủ nhiệm khoa |

### BOMON (Bộ môn)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MABM | CHAR(15) PK | Mã bộ môn |
| TENBM | NVARCHAR2(100) | Tên bộ môn |
| DIACHI | NVARCHAR2(100) | Địa chỉ |
| MAKHOA | CHAR(15) FK | Mã khoa |
| MACHUNHIEMBM | CHAR(15) FK | Mã chủ nhiệm bộ môn |

### TAIGIANGDAY (Tài giảng dạy)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MATAIGIANGDAY | CHAR(15) PK | Mã tài giảng dạy |
| TENHOCPHAN | NVARCHAR2(100) | Tên học phần |
| SISO | NUMBER(10) | Sĩ số |
| HE | NVARCHAR2(20) | Hệ đào tạo |
| LOP | NVARCHAR2(20) | Lớp |
| SOTINCHI | NUMBER(5) | Số tín chỉ |
| GHICHU | NVARCHAR2(200) | Ghi chú |
| NAMHOC | NVARCHAR2(20) | Năm học |
| MADOITUONG | CHAR(15) FK | Mã đối tượng |
| MATHOIGIAN | CHAR(15) FK | Mã thời gian |
| MANGONNGU | CHAR(15) FK | Mã ngôn ngữ |

### CHITIETGIANGDAY (Chi tiết giảng dạy)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MACHITIETGIANGDAY | CHAR(15) PK | Mã chi tiết giảng dạy |
| SOTIET | NUMBER(10) | Số tiết |
| SOTIETQUYDOI | NUMBER(10,2) | Số tiết quy đổi |
| GHICHU | NVARCHAR2(200) | Ghi chú |
| MAGV | CHAR(15) FK | Mã giáo viên |
| MATAIGIANGDAY | CHAR(15) FK | Mã tài giảng dạy |
| NOIDUNGGIANGDAY | NVARCHAR2(200) | Nội dung giảng dạy |

### TAINCKH (Tài nghiên cứu khoa học)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| MATAINCKH | CHAR(15) PK | Mã tài NCKH |
| TENCONGTRINHKHOAHOC | NVARCHAR2(200) | Tên công trình |
| NAMHOC | NVARCHAR2(20) | Năm học |
| SOTACGIA | NUMBER(5) | Số tác giả |
| MALOAINCKH | CHAR(15) FK | Mã loại NCKH |

## Quan hệ giữa các bảng

1. **GIAOVIEN** ↔ **BOMON**: N-1 (Nhiều giáo viên thuộc 1 bộ môn)
2. **BOMON** ↔ **KHOA**: N-1 (Nhiều bộ môn thuộc 1 khoa)
3. **GIAOVIEN** ↔ **CHITIETGIANGDAY**: 1-N (1 giáo viên có nhiều chi tiết giảng dạy)
4. **TAIGIANGDAY** ↔ **CHITIETGIANGDAY**: 1-N (1 tài giảng dạy có nhiều chi tiết)
5. **GIAOVIEN** ↔ **LICHSUCHUCVU**: 1-N (1 giáo viên có nhiều lịch sử chức vụ)
6. **CHUCVU** ↔ **LICHSUCHUCVU**: 1-N (1 chức vụ có nhiều lịch sử)
