# Hướng dẫn Sử dụng Ứng dụng Quản lý Giáo viên

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Yêu cầu Hệ thống](#yêu-cầu-hệ-thống)
3. [Cài đặt và Chạy Ứng dụng](#cài-đặt-và-chạy-ứng-dụng)
4. [Các Chức năng Chính](#các-chức-năng-chính)
5. [Hướng dẫn Chi tiết](#hướng-dẫn-chi-tiết)
6. [Xử lý Lỗi](#xử-lý-lỗi)
7. [Câu hỏi Thường gặp](#câu-hỏi-thường-gặp)

---

## Giới thiệu

Ứng dụng Quản lý Giáo viên là một hệ thống web hiện đại được xây dựng bằng Next.js và Oracle Database, giúp quản trị viên dễ dàng quản lý thông tin giáo viên trong tổ chức.

### Tính năng chính

- ✅ **Xem danh sách giáo viên**: Hiển thị tất cả giáo viên với thông tin đầy đủ
- ✅ **Thêm giáo viên mới**: Form nhập liệu với validation đầy đủ
- ✅ **Cập nhật thông tin**: Chỉnh sửa thông tin giáo viên hiện có
- ✅ **Xóa giáo viên**: Xóa giáo viên với xác nhận an toàn
- ✅ **Tìm kiếm và Lọc**: Dễ dàng tìm kiếm giáo viên (sắp tới)
- ✅ **Giao diện Responsive**: Hoạt động tốt trên mọi thiết bị

---

## Yêu cầu Hệ thống

### Phần mềm cần thiết

- **Node.js**: Phiên bản LTS (v18.x trở lên)
- **npm** hoặc **yarn**: Trình quản lý gói
- **Oracle Database**: Phiên bản 19c trở lên
- **Trình duyệt web hiện đại**: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)

### Môi trường phát triển

- **Hệ điều hành**: Windows, macOS, Linux (ArchLinux Hyprland được khuyến nghị)
- **RAM**: Tối thiểu 4GB, khuyến nghị 8GB
- **Dung lượng đĩa**: Tối thiểu 500MB cho ứng dụng và dependencies

---

## Cài đặt và Chạy Ứng dụng

### Bước 1: Cài đặt Dependencies

```bash
# Clone repository (nếu chưa có)
git clone <repository-url>
cd QuanLyGiaoVien

# Cài đặt các gói phụ thuộc
npm install
# hoặc
yarn install
```

### Bước 2: Cấu hình Cơ sở Dữ liệu

Tạo file `.env.local` trong thư mục gốc của dự án:

```env
DB_USERNAME=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=ORCL
```

**Lưu ý**: Thay thế các giá trị trên bằng thông tin kết nối thực tế của bạn.

### Bước 3: Khởi tạo Cơ sở Dữ liệu

Chạy script SQL để tạo bảng GIAOVIEN:

```sql
-- Tạo bảng GIAOVIEN
CREATE TABLE GIAOVIEN (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    HO_TEN NVARCHAR2(100) NOT NULL,
    CHUYEN_NGANH NVARCHAR2(100),
    EMAIL NVARCHAR2(100) NOT NULL UNIQUE,
    SO_DIEN_THOAI NVARCHAR2(20),
    DIA_CHI NVARCHAR2(255)
);

-- Tạo index cho email để tăng tốc độ tìm kiếm
CREATE INDEX idx_giaovien_email ON GIAOVIEN(EMAIL);
```

### Bước 4: Chạy Ứng dụng

#### Chế độ Development

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

#### Chế độ Production

```bash
# Build ứng dụng
npm run build
# hoặc
yarn build

# Chạy ứng dụng
npm start
# hoặc
yarn start
```

---

## Các Chức năng Chính

### 1. Xem Danh sách Giáo viên

- Truy cập trang `/teachers` để xem danh sách tất cả giáo viên
- Thông tin hiển thị bao gồm:
  - ID giáo viên
  - Họ và tên
  - Chuyên ngành
  - Email
  - Số điện thoại
  - Địa chỉ

### 2. Thêm Giáo viên Mới

- Nhấp vào nút **"Thêm Giáo viên mới"** ở góc trên bên phải
- Điền đầy đủ thông tin vào form
- Nhấn **"Thêm mới"** để lưu

### 3. Chỉnh sửa Thông tin Giáo viên

- Nhấp vào nút **"Chỉnh sửa"** (biểu tượng bút) ở cột "Hành động"
- Cập nhật thông tin cần thiết
- Nhấn **"Cập nhật"** để lưu thay đổi

### 4. Xóa Giáo viên

- Nhấp vào nút **"Xóa"** (biểu tượng thùng rác) ở cột "Hành động"
- Xác nhận xóa trong hộp thoại hiện ra
- Lưu ý: **Hành động này không thể hoàn tác**

---

## Hướng dẫn Chi tiết

### Thêm Giáo viên Mới

#### Bước 1: Mở Form Thêm Mới

1. Đăng nhập vào hệ thống
2. Điều hướng đến trang "Quản lý Giáo viên"
3. Nhấp vào nút **"Thêm Giáo viên mới"**

#### Bước 2: Điền Thông tin

Form yêu cầu các thông tin sau:

| Trường | Bắt buộc | Mô tả | Ví dụ |
|--------|----------|-------|-------|
| Họ và Tên | ✅ Có | Họ tên đầy đủ của giáo viên | Nguyễn Văn A |
| Chuyên ngành | ❌ Không | Lĩnh vực chuyên môn | Toán học, Vật lý, Hóa học |
| Email | ✅ Có | Địa chỉ email hợp lệ | nguyenvana@example.com |
| Số điện thoại | ❌ Không | Số điện thoại liên hệ | 0123456789 |
| Địa chỉ | ❌ Không | Địa chỉ nơi ở | Hà Nội, Việt Nam |

#### Bước 3: Validation

Hệ thống sẽ kiểm tra:

- ✅ **Họ và Tên**: Không được để trống
- ✅ **Email**: Phải có định dạng hợp lệ (example@domain.com)
- ✅ **Email**: Không được trùng với email đã tồn tại trong hệ thống

#### Bước 4: Lưu Thông tin

1. Nhấn nút **"Thêm mới"**
2. Hệ thống sẽ hiển thị thông báo thành công hoặc lỗi
3. Nếu thành công, giáo viên mới sẽ xuất hiện trong danh sách

### Chỉnh sửa Thông tin Giáo viên

#### Bước 1: Mở Form Chỉnh sửa

1. Tìm giáo viên cần chỉnh sửa trong danh sách
2. Nhấp vào nút **"Chỉnh sửa"** (biểu tượng bút)
3. Form sẽ hiển thị với thông tin hiện tại

#### Bước 2: Cập nhật Thông tin

1. Thay đổi các trường thông tin cần cập nhật
2. Các quy tắc validation giống như khi thêm mới
3. Nhấn **"Cập nhật"** để lưu

#### Bước 3: Xác nhận

- Hệ thống sẽ hiển thị thông báo thành công
- Danh sách sẽ tự động làm mới với thông tin mới

### Xóa Giáo viên

#### Bước 1: Chọn Giáo viên cần Xóa

1. Tìm giáo viên trong danh sách
2. Nhấp vào nút **"Xóa"** (biểu tượng thùng rác)

#### Bước 2: Xác nhận Xóa

1. Hộp thoại xác nhận sẽ hiển thị
2. Kiểm tra kỹ thông tin giáo viên
3. Đọc cảnh báo: "Hành động này không thể hoàn tác"

#### Bước 3: Thực hiện Xóa

- Nhấn **"Xác nhận xóa"** để xóa vĩnh viễn
- Hoặc nhấn **"Hủy"** để giữ lại giáo viên

#### ⚠️ Cảnh báo Quan trọng

- **Dữ liệu bị xóa không thể khôi phục**
- Hãy chắc chắn trước khi xóa
- Xem xét lưu trữ hoặc đánh dấu thay vì xóa nếu cần thiết

### Làm mới Danh sách

- Nhấp vào nút **"Làm mới"** (biểu tượng mũi tên tròn) ở góc trên bên phải
- Danh sách sẽ tải lại từ cơ sở dữ liệu
- Sử dụng khi cần cập nhật dữ liệu mới nhất

---

## Xử lý Lỗi

### Lỗi Kết nối Cơ sở Dữ liệu

**Triệu chứng**: Không thể tải danh sách giáo viên, hiển thị thông báo lỗi kết nối.

**Giải pháp**:
1. Kiểm tra Oracle Database đang chạy
2. Xác minh thông tin kết nối trong `.env.local`
3. Kiểm tra firewall có chặn kết nối không
4. Kiểm tra log server: `npm run dev` để xem chi tiết lỗi

### Lỗi Email Đã Tồn tại

**Triệu chứng**: Thông báo "Email already exists" khi thêm/cập nhật giáo viên.

**Giải pháp**:
1. Kiểm tra email đã được sử dụng chưa
2. Sử dụng email khác
3. Nếu đúng là email của giáo viên, hãy cập nhật thông tin giáo viên hiện có thay vì tạo mới

### Lỗi Validation Form

**Triệu chứng**: Form hiển thị thông báo lỗi màu đỏ.

**Giải pháp**:
1. Kiểm tra các trường bắt buộc (đánh dấu *)
2. Đảm bảo email có định dạng hợp lệ
3. Đọc kỹ thông báo lỗi cụ thể

### Lỗi Thời gian Chờ (Timeout)

**Triệu chứng**: Request mất quá nhiều thời gian, không có phản hồi.

**Giải pháp**:
1. Kiểm tra kết nối mạng
2. Kiểm tra Oracle Database có quá tải không
3. Xem xét tối ưu hóa queries trong database
4. Liên hệ quản trị viên hệ thống

### Lỗi 404 - Teacher Not Found

**Triệu chứng**: Không tìm thấy giáo viên khi cập nhật/xóa.

**Giải pháp**:
1. Làm mới danh sách giáo viên
2. Giáo viên có thể đã bị xóa bởi người dùng khác
3. Kiểm tra ID giáo viên có chính xác không

---

## Câu hỏi Thường gặp

### 1. Làm thế nào để tìm kiếm giáo viên?

**Trả lời**: Tính năng tìm kiếm sẽ được cập nhật trong phiên bản tiếp theo. Hiện tại, bạn có thể:
- Sử dụng Ctrl+F (hoặc Cmd+F trên Mac) để tìm kiếm trong trang
- Sắp xếp danh sách theo các cột

### 2. Có thể xuất danh sách giáo viên ra Excel không?

**Trả lời**: Tính năng xuất Excel đang trong kế hoạch phát triển. Hiện tại bạn có thể:
- Copy dữ liệu từ bảng và paste vào Excel
- Sử dụng API endpoint `/api/teachers` để lấy dữ liệu JSON

### 3. Làm thế nào để khôi phục giáo viên đã xóa?

**Trả lời**: Hiện tại không hỗ trợ khôi phục dữ liệu đã xóa. Khuyến nghị:
- Sao lưu database thường xuyên
- Kiểm tra kỹ trước khi xóa
- Xem xét thêm trường "is_active" thay vì xóa vật lý

### 4. Có giới hạn số lượng giáo viên không?

**Trả lời**: Không có giới hạn cứng. Hệ thống được thiết kế để xử lý hàng nghìn giáo viên. Hiệu suất phụ thuộc vào:
- Cấu hình Oracle Database
- Tài nguyên server
- Kết nối mạng

### 5. Tại sao cần email phải là duy nhất?

**Trả lời**: Email được sử dụng làm identifier duy nhất cho mỗi giáo viên để:
- Tránh trùng lặp dữ liệu
- Hỗ trợ các tính năng xác thực trong tương lai
- Đảm bảo tính toàn vẹn của dữ liệu

### 6. Ứng dụng có hoạt động trên mobile không?

**Trả lời**: Có! Ứng dụng được thiết kế responsive và hoạt động tốt trên:
- Điện thoại thông minh (iOS, Android)
- Máy tính bảng
- Desktop/Laptop

### 7. Làm thế nào để thay đổi số lượng giáo viên hiển thị trên mỗi trang?

**Trả lời**: Tính năng phân trang sẽ được thêm vào trong phiên bản tiếp theo. Hiện tại tất cả giáo viên được hiển thị trên một trang.

### 8. Có thể thêm ảnh đại diện cho giáo viên không?

**Trả lời**: Tính năng này đang trong roadmap phát triển. Để thêm, cần:
- Mở rộng database schema
- Thêm chức năng upload file
- Lưu trữ file ảnh

### 9. Có hỗ trợ nhiều ngôn ngữ không?

**Trả lời**: Hiện tại ứng dụng chỉ hỗ trợ tiếng Việt. Hỗ trợ đa ngôn ngữ có thể được thêm vào trong tương lai.

### 10. Làm thế nào để báo cáo lỗi hoặc đề xuất tính năng?

**Trả lời**: Vui lòng:
- Liên hệ với quản trị viên hệ thống
- Gửi email đến địa chỉ hỗ trợ
- Tạo issue trên repository GitHub (nếu có)

---

## Hỗ trợ Kỹ thuật

### Thông tin Liên hệ

- **Email Hỗ trợ**: support@yourcompany.com
- **Hotline**: 1900-xxxx
- **Giờ làm việc**: 8:00 - 17:00 (Thứ 2 - Thứ 6)

### Tài liệu Bổ sung

- [Tài liệu API](/docs/API_DOCUMENTATION.md)
- [Hướng dẫn Cài đặt cho Admin](/docs/ADMIN_SETUP.md)
- [Tài liệu Phát triển](/docs/DEVELOPER_GUIDE.md)

### Ghi chú Phiên bản

**Phiên bản hiện tại**: 1.0.0

**Lịch sử Cập nhật**:
- v1.0.0 (2025-11-05): Phát hành phiên bản đầu tiên
  - Quản lý danh sách giáo viên
  - Thêm, sửa, xóa giáo viên
  - Validation và error handling
  - UI responsive

---

## Bảo mật

### Thực hành Tốt nhất

1. **Bảo mật Thông tin Đăng nhập**
   - Không chia sẻ thông tin đăng nhập
   - Sử dụng mật khẩu mạnh
   - Đăng xuất sau khi sử dụng

2. **Bảo vệ Dữ liệu**
   - Không export dữ liệu ra ngoài khi không cần thiết
   - Tuân thủ quy định về bảo vệ thông tin cá nhân
   - Báo cáo ngay nếu phát hiện lỗ hổng bảo mật

3. **Sao lưu Dữ liệu**
   - Định kỳ sao lưu database
   - Kiểm tra khả năng phục hồi dữ liệu
   - Lưu trữ backup ở vị trí an toàn

---

**© 2025 Ứng dụng Quản lý Giáo viên. All rights reserved.**
