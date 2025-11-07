# Hệ Thống Quản Lý Giáo Viên

Ứng dụng web quản lý thông tin giáo viên được xây dựng với Next.js 15, React 18, TypeScript và Oracle Database 19c.

## 📋 Tính Năng Chính

### ✅ Quản Lý Giáo Viên
- **Xem danh sách**: Hiển thị tất cả giáo viên với thông tin đầy đủ
- **Thêm mới**: Thêm giáo viên mới vào hệ thống
- **Cập nhật**: Chỉnh sửa thông tin giáo viên
- **Xóa**: Xóa giáo viên khỏi hệ thống
- **Validation**: Kiểm tra dữ liệu đầu vào (client & server)
- **Responsive**: Giao diện tối ưu cho mọi thiết bị

### 📊 Cơ Sở Dữ Liệu
Hệ thống sử dụng Oracle Database 19c với các bảng chính:
- **GIAOVIEN**: Thông tin cơ bản giáo viên
- **BOMON**: Bộ môn
- **KHOA**: Khoa
- **HOCVI**: Học vị
- **HOCHAM**: Học hàm
- Và nhiều bảng khác (xem chi tiết tại `docs/database/`)

## 🚀 Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Hệ Thống
```
Node.js >= 18.x
npm hoặc yarn
Oracle Database 19c+
```

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd QuanLyGiaoVien
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình Database
Tạo file `.env.local` trong thư mục gốc:
```env
DB_USER=LUCKYBOIZ
DB_PASSWORD=your_password
DB_CONNECTION_STRING=localhost:1521/qlgvpdb
```

### Bước 4: Chạy Development Server
```bash
npm run dev
```

Truy cập: `http://localhost:3000` (tự động redirect về `/teachers`)

### Bước 5: Build Production
```bash
npm run build
npm start
```

## 📁 Cấu Trúc Dự Án

```
QuanLyGiaoVien/
├── app/
│   ├── (components)/
│   │   └── (content-layout)/
│   │       └── teachers/           # Trang quản lý giáo viên
│   ├── api/
│   │   └── teachers/               # API endpoints
│   └── page.tsx                    # Trang chủ (redirect về /teachers)
├── lib/
│   └── db.ts                       # Kết nối Oracle Database
├── shared/
│   ├── layouts-components/         # Header, Sidebar, Footer
│   └── @spk-reusable-components/   # UI Components
├── docs/                           # Tài liệu
│   ├── database/                   # Schema database
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   └── README.md
└── tests/                          # Unit tests
```

## 🔌 API Endpoints

### GET /api/teachers
Lấy danh sách tất cả giáo viên
```bash
curl http://localhost:3000/api/teachers
```

### GET /api/teachers/[id]
Lấy thông tin chi tiết một giáo viên
```bash
curl http://localhost:3000/api/teachers/GV001
```

### POST /api/teachers
Thêm giáo viên mới
```bash
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "HOTEN": "Nguyễn Văn A",
    "NGAYSINH": "1990-01-01",
    "GIOITINH": 1,
    "EMAIL": "nguyenvana@example.com",
    "SDT": "0123456789",
    "DIACHI": "Hà Nội",
    "QUEQUAN": "Hà Nội",
    "MABM": "BM001"
  }'
```

### PUT /api/teachers/[id]
Cập nhật thông tin giáo viên
```bash
curl -X PUT http://localhost:3000/api/teachers/GV001 \
  -H "Content-Type: application/json" \
  -d '{"EMAIL": "newemail@example.com"}'
```

### DELETE /api/teachers/[id]
Xóa giáo viên
```bash
curl -X DELETE http://localhost:3000/api/teachers/GV001
```

## 🧪 Testing

### Chạy Tests
```bash
npm test
```

### Chạy Tests với Coverage
```bash
npm run test:coverage
```

## 📚 Tài Liệu

### Dành cho Người Dùng
- [Hướng Dẫn Sử Dụng](docs/USER_GUIDE.md)

### Dành cho Developer
- [Tài Liệu API](docs/API_DOCUMENTATION.md)
- [Schema Database](docs/database/Database.md)

### Dành cho Quản Lý Dự Án
- [Báo Cáo Hoàn Thành Phase 7](docs/PHASE_7_COMPLETION_REPORT.md)

## 🛠️ Stack Công Nghệ

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Bootstrap 5, Custom SPK Components
- **Backend**: Next.js API Routes
- **Database**: Oracle Database 19c
- **ORM**: oracledb (node-oracledb)
- **Testing**: Jest, React Testing Library
- **Styling**: SCSS, CSS Modules

## 🎯 Chỉ Số Chất Lượng

### Code Quality
- ✅ TypeScript: 100% type coverage
- ✅ ESLint: Không có lỗi
- ✅ Build: Thành công (4.0s)
- ✅ Tests: 38/38 passed

### Performance
- ✅ Page Load: < 2s
- ✅ API Response: < 1s
- ✅ Build Time: ~4s

## 📝 Ghi Chú Quan Trọng

### Cấu Trúc Database
Hệ thống sử dụng schema `LUCKYBOIZ` trong Oracle Database với các bảng chính:

**Bảng GIAOVIEN**:
- MAGV (Primary Key): Mã giáo viên (tự động sinh)
- HOTEN: Họ tên
- NGAYSINH: Ngày sinh (DATE)
- GIOITINH: Giới tính (0=Nữ, 1=Nam)
- EMAIL: Email
- SDT: Số điện thoại
- DIACHI: Địa chỉ
- QUEQUAN: Quê quán
- MABM: Mã bộ môn (Foreign Key)

### Validation Rules
- Họ tên: Bắt buộc, chỉ chứa chữ cái và khoảng trắng
- Email: Bắt buộc, định dạng email hợp lệ
- Số điện thoại: Bắt buộc, 10-11 số
- Ngày sinh: Phải < ngày hiện tại

## 🚧 Hạn Chế & Cải Tiến Tương Lai

### Hạn Chế Hiện Tại
- ❌ Chưa có authentication
- ❌ Chưa có pagination
- ❌ Chưa có search/filter
- ❌ Chưa có export Excel/CSV
- ❌ Chỉ có hard delete

### Kế Hoạch v1.1.0 (Q1 2026)
- [ ] Authentication (JWT)
- [ ] Pagination
- [ ] Search & Filter
- [ ] Role-based access control
- [ ] Export Excel/CSV
- [ ] Soft delete
- [ ] Upload ảnh đại diện

## 🤝 Đóng Góp

Đây là dự án nội bộ. Để đóng góp hoặc đề xuất, vui lòng liên hệ đội phát triển.

## 📧 Hỗ Trợ

- **Email**: support@giaovien.edu.vn
- **Hotline**: 1900-xxxx (T2-T6, 8:00-17:00)

## 📄 License

© 2025 Hệ Thống Quản Lý Giáo Viên. Bảo lưu mọi quyền.

---

**Phiên bản**: 1.0.0
**Cập nhật**: 06/11/2025
**Trạng thái**: ✅ SẴN SÀNG SỬ DỤNG
