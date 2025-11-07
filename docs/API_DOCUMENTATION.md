# Tài liệu API - Hệ thống Quản lý Giáo viên

## Tổng quan

Tài liệu này cung cấp thông tin đầy đủ về các API endpoint REST của Hệ thống Quản lý Giáo viên.

**URL Cơ bản**: `http://localhost:3000/api`

**Content-Type**: `application/json`

---

## Mục lục

1. [Xác thực](#xác-thực)
2. [Các Endpoint về Giáo viên](#các-endpoint-về-giáo-viên)
3. [Xử lý Lỗi](#xử-lý-lỗi)
4. [Mã Trạng thái](#mã-trạng-thái)
5. [Mô hình Dữ liệu](#mô-hình-dữ-liệu)
6. [Ví dụ](#ví-dụ)

---

## Xác thực

Hiện tại, API chưa triển khai xác thực. Tính năng này sẽ được bổ sung trong các phiên bản sau.

**Tính năng Dự kiến**:
- Xác thực dựa trên JWT
- Kiểm soát truy cập theo vai trò (RBAC)
- Xác thực API key cho tích hợp bên ngoài

---

## Các Endpoint về Giáo viên

### 1. Lấy Danh sách Tất cả Giáo viên

Truy xuất danh sách tất cả giáo viên trong hệ thống.

**Endpoint**: `GET /api/teachers`

**Yêu cầu**:
```http
GET /api/teachers HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Phản hồi** (200 OK):
```json
[
  {
    "id": 1,
    "ho_ten": "Nguyễn Văn A",
    "chuyen_nganh": "Toán học",
    "email": "nguyenvana@example.com",
    "so_dien_thoai": "0123456789",
    "dia_chi": "Hà Nội"
  },
  {
    "id": 2,
    "ho_ten": "Trần Thị B",
    "chuyen_nganh": "Vật lý",
    "email": "tranthib@example.com",
    "so_dien_thoai": "0987654321",
    "dia_chi": "TP. Hồ Chí Minh"
  }
]
```

**Các Trường Phản hồi**:

| Trường | Kiểu | Mô tả |
|-------|------|-------|
| id | number | Mã định danh duy nhất của giáo viên |
| ho_ten | string | Họ và tên đầy đủ của giáo viên |
| chuyen_nganh | string | Chuyên ngành (có thể để trống) |
| email | string | Địa chỉ email (duy nhất) |
| so_dien_thoai | string | Số điện thoại (có thể để trống) |
| dia_chi | string | Địa chỉ (có thể để trống) |

**Phản hồi Lỗi** (500 Internal Server Error):
```json
{
  "error": "Không thể tải danh sách giáo viên",
  "message": "Chi tiết thông báo lỗi"
}
```

---

### 2. Tạo Giáo viên Mới

Thêm một giáo viên mới vào hệ thống.

**Endpoint**: `POST /api/teachers`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "ho_ten": "Lê Văn C",
  "chuyen_nganh": "Hóa học",
  "email": "levanc@example.com",
  "so_dien_thoai": "0111222333",
  "dia_chi": "Đà Nẵng"
}
```

**Các Trường Bắt buộc**:
- `ho_ten` (string): Họ và tên đầy đủ
- `email` (string): Địa chỉ email hợp lệ

**Các Trường Tùy chọn**:
- `chuyen_nganh` (string): Chuyên ngành
- `so_dien_thoai` (string): Số điện thoại
- `dia_chi` (string): Địa chỉ

**Phản hồi Thành công** (201 Created):
```json
{
  "message": "Tạo giáo viên thành công",
  "id": 3
}
```

**Phản hồi Lỗi Validation** (400 Bad Request):
```json
{
  "error": "Thiếu các trường bắt buộc: ho_ten và email là bắt buộc"
}
```

**Phản hồi Lỗi Định dạng Email** (400 Bad Request):
```json
{
  "error": "Định dạng email không hợp lệ"
}
```

**Phản hồi Lỗi Email Trùng lặp** (409 Conflict):
```json
{
  "error": "Email đã tồn tại"
}
```

**Phản hồi Lỗi Server** (500 Internal Server Error):
```json
{
  "error": "Không thể tạo giáo viên",
  "message": "Chi tiết thông báo lỗi"
}
```

---

### 3. Cập nhật Thông tin Giáo viên

Cập nhật thông tin của giáo viên hiện có.

**Endpoint**: `PUT /api/teachers/{id}`

**Tham số URL**:
- `id` (number): ID của giáo viên cần cập nhật

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "ho_ten": "Nguyễn Văn A",
  "chuyen_nganh": "Toán học Ứng dụng",
  "email": "nguyenvana.updated@example.com",
  "so_dien_thoai": "0123456789",
  "dia_chi": "Hà Nội, Việt Nam"
}
```

**Các Trường Bắt buộc**:
- `ho_ten` (string): Họ và tên đầy đủ
- `email` (string): Địa chỉ email hợp lệ

**Các Trường Tùy chọn**:
- `chuyen_nganh` (string): Chuyên ngành
- `so_dien_thoai` (string): Số điện thoại
- `dia_chi` (string): Địa chỉ

**Phản hồi Thành công** (200 OK):
```json
{
  "message": "Cập nhật giáo viên thành công",
  "id": 1
}
```

**Phản hồi Lỗi ID Không hợp lệ** (400 Bad Request):
```json
{
  "error": "ID giáo viên không hợp lệ"
}
```

**Phản hồi Lỗi Validation** (400 Bad Request):
```json
{
  "error": "Thiếu các trường bắt buộc: ho_ten và email là bắt buộc"
}
```

**Phản hồi Lỗi Định dạng Email** (400 Bad Request):
```json
{
  "error": "Định dạng email không hợp lệ"
}
```

**Phản hồi Lỗi Không Tìm thấy** (404 Not Found):
```json
{
  "error": "Không tìm thấy giáo viên"
}
```

**Phản hồi Lỗi Email Trùng lặp** (409 Conflict):
```json
{
  "error": "Email đã tồn tại"
}
```

**Phản hồi Lỗi Server** (500 Internal Server Error):
```json
{
  "error": "Không thể cập nhật giáo viên",
  "message": "Chi tiết thông báo lỗi"
}
```

---

### 4. Xóa Giáo viên

Xóa một giáo viên khỏi hệ thống.

**Endpoint**: `DELETE /api/teachers/{id}`

**Tham số URL**:
- `id` (number): ID của giáo viên cần xóa

**Yêu cầu**:
```http
DELETE /api/teachers/1 HTTP/1.1
Host: localhost:3000
```

**Phản hồi Thành công** (200 OK):
```json
{
  "message": "Xóa giáo viên thành công",
  "id": 1
}
```

**Phản hồi Lỗi ID Không hợp lệ** (400 Bad Request):
```json
{
  "error": "ID giáo viên không hợp lệ"
}
```

**Phản hồi Lỗi Không Tìm thấy** (404 Not Found):
```json
{
  "error": "Không tìm thấy giáo viên"
}
```

**Phản hồi Lỗi Server** (500 Internal Server Error):
```json
{
  "error": "Không thể xóa giáo viên",
  "message": "Chi tiết thông báo lỗi"
}
```

---

## Xử lý Lỗi

Tất cả các API endpoint tuân theo định dạng phản hồi lỗi nhất quán:

```json
{
  "error": "Mô tả ngắn gọn về lỗi",
  "message": "Thông báo lỗi chi tiết (tùy chọn)"
}
```

### Các Loại Lỗi

1. **Lỗi Validation** (400 Bad Request)
   - Thiếu các trường bắt buộc
   - Định dạng dữ liệu không hợp lệ
   - Định dạng ID không hợp lệ

2. **Lỗi Không Tìm thấy** (404 Not Found)
   - Giáo viên với ID được chỉ định không tồn tại

3. **Lỗi Xung đột** (409 Conflict)
   - Email đã tồn tại trong hệ thống

4. **Lỗi Server** (500 Internal Server Error)
   - Sự cố kết nối cơ sở dữ liệu
   - Lỗi server không mong muốn
   - Lỗi thực thi truy vấn

---

## Mã Trạng thái

| Mã Trạng thái | Ý nghĩa | Mô tả |
|---------------|---------|-------|
| 200 | OK | Yêu cầu thành công |
| 201 | Created | Tạo tài nguyên thành công |
| 400 | Bad Request | Dữ liệu hoặc tham số yêu cầu không hợp lệ |
| 404 | Not Found | Không tìm thấy tài nguyên |
| 409 | Conflict | Tài nguyên đã tồn tại (trùng lặp) |
| 500 | Internal Server Error | Lỗi phía server |

---

## Mô hình Dữ liệu

### Mô hình Teacher (Giáo viên)

```typescript
interface Teacher {
  id: number;              // Tự động tạo, duy nhất
  ho_ten: string;          // Họ và tên (bắt buộc)
  chuyen_nganh?: string;   // Chuyên ngành (tùy chọn)
  email: string;           // Địa chỉ email (bắt buộc, duy nhất)
  so_dien_thoai?: string;  // Số điện thoại (tùy chọn)
  dia_chi?: string;        // Địa chỉ (tùy chọn)
}
```

### Schema Cơ sở Dữ liệu

```sql
CREATE TABLE GIAOVIEN (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    HO_TEN NVARCHAR2(100) NOT NULL,
    CHUYEN_NGANH NVARCHAR2(100),
    EMAIL NVARCHAR2(100) NOT NULL UNIQUE,
    SO_DIEN_THOAI NVARCHAR2(20),
    DIA_CHI NVARCHAR2(255)
);
```

### Ràng buộc Trường

| Trường | Kiểu | Độ dài Tối đa | Bắt buộc | Duy nhất | Ghi chú |
|--------|------|---------------|----------|----------|---------|
| ID | NUMBER | - | Có (tự động) | Có | Tự động tạo identity |
| HO_TEN | NVARCHAR2 | 100 | Có | Không | Họ và tên đầy đủ |
| CHUYEN_NGANH | NVARCHAR2 | 100 | Không | Không | Lĩnh vực chuyên môn |
| EMAIL | NVARCHAR2 | 100 | Có | Có | Phải có định dạng email hợp lệ |
| SO_DIEN_THOAI | NVARCHAR2 | 20 | Không | Không | Số điện thoại |
| DIA_CHI | NVARCHAR2 | 255 | Không | Không | Địa chỉ |

---

## Ví dụ

### Ví dụ 1: Lấy Tất cả Giáo viên

**Yêu cầu cURL**:
```bash
curl -X GET http://localhost:3000/api/teachers \
  -H "Content-Type: application/json"
```

**JavaScript (fetch)**:
```javascript
fetch('http://localhost:3000/api/teachers')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Lỗi:', error));
```

**Axios**:
```javascript
import axios from 'axios';

axios.get('http://localhost:3000/api/teachers')
  .then(response => console.log(response.data))
  .catch(error => console.error('Lỗi:', error));
```

---

### Ví dụ 2: Tạo Giáo viên Mới

**Yêu cầu cURL**:
```bash
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "ho_ten": "Phạm Văn D",
    "chuyen_nganh": "Sinh học",
    "email": "phamvand@example.com",
    "so_dien_thoai": "0444555666",
    "dia_chi": "Huế"
  }'
```

**JavaScript (fetch)**:
```javascript
const giaoVienMoi = {
  ho_ten: "Phạm Văn D",
  chuyen_nganh: "Sinh học",
  email: "phamvand@example.com",
  so_dien_thoai: "0444555666",
  dia_chi: "Huế"
};

fetch('http://localhost:3000/api/teachers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(giaoVienMoi),
})
  .then(response => response.json())
  .then(data => console.log('Thành công:', data))
  .catch(error => console.error('Lỗi:', error));
```

**Axios**:
```javascript
import axios from 'axios';

const giaoVienMoi = {
  ho_ten: "Phạm Văn D",
  chuyen_nganh: "Sinh học",
  email: "phamvand@example.com",
  so_dien_thoai: "0444555666",
  dia_chi: "Huế"
};

axios.post('http://localhost:3000/api/teachers', giaoVienMoi)
  .then(response => console.log('Thành công:', response.data))
  .catch(error => console.error('Lỗi:', error));
```

---

### Ví dụ 3: Cập nhật Giáo viên

**Yêu cầu cURL**:
```bash
curl -X PUT http://localhost:3000/api/teachers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "ho_ten": "Nguyễn Văn A",
    "chuyen_nganh": "Toán học Ứng dụng",
    "email": "nguyenvana.updated@example.com",
    "so_dien_thoai": "0123456789",
    "dia_chi": "Hà Nội, Việt Nam"
  }'
```

**JavaScript (fetch)**:
```javascript
const giaoVienCapNhat = {
  ho_ten: "Nguyễn Văn A",
  chuyen_nganh: "Toán học Ứng dụng",
  email: "nguyenvana.updated@example.com",
  so_dien_thoai: "0123456789",
  dia_chi: "Hà Nội, Việt Nam"
};

fetch('http://localhost:3000/api/teachers/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(giaoVienCapNhat),
})
  .then(response => response.json())
  .then(data => console.log('Thành công:', data))
  .catch(error => console.error('Lỗi:', error));
```

**Axios**:
```javascript
import axios from 'axios';

const giaoVienCapNhat = {
  ho_ten: "Nguyễn Văn A",
  chuyen_nganh: "Toán học Ứng dụng",
  email: "nguyenvana.updated@example.com",
  so_dien_thoai: "0123456789",
  dia_chi: "Hà Nội, Việt Nam"
};

axios.put('http://localhost:3000/api/teachers/1', giaoVienCapNhat)
  .then(response => console.log('Thành công:', response.data))
  .catch(error => console.error('Lỗi:', error));
```

---

### Ví dụ 4: Xóa Giáo viên

**Yêu cầu cURL**:
```bash
curl -X DELETE http://localhost:3000/api/teachers/1 \
  -H "Content-Type: application/json"
```

**JavaScript (fetch)**:
```javascript
fetch('http://localhost:3000/api/teachers/1', {
  method: 'DELETE',
})
  .then(response => response.json())
  .then(data => console.log('Thành công:', data))
  .catch(error => console.error('Lỗi:', error));
```

**Axios**:
```javascript
import axios from 'axios';

axios.delete('http://localhost:3000/api/teachers/1')
  .then(response => console.log('Thành công:', response.data))
  .catch(error => console.error('Lỗi:', error));
```

---

## Giới hạn Tốc độ

Hiện tại, không có giới hạn tốc độ nào được triển khai. Tính năng này sẽ được bổ sung trong các phiên bản sau để ngăn chặn lạm dụng.

**Tính năng Dự kiến**:
- Giới hạn tốc độ theo địa chỉ IP
- Giới hạn tốc độ theo API key
- Giới hạn có thể cấu hình cho các endpoint khác nhau

---

## Phân trang

Phân trang hiện chưa được triển khai. Tất cả giáo viên được trả về trong một phản hồi duy nhất.

**Tính năng Dự kiến**:
- Tham số truy vấn cho phân trang: `?page=1&limit=20`
- Metadata phản hồi: tổng số, trang hiện tại, tổng số trang
- Giới hạn mặc định: 50 giáo viên mỗi trang

---

## Lọc và Sắp xếp

Lọc và sắp xếp hiện chưa được triển khai.

**Tính năng Dự kiến**:
- Lọc theo chuyên ngành: `?chuyen_nganh=Toán học`
- Tìm kiếm theo tên: `?search=Nguyễn`
- Sắp xếp theo trường: `?sort=ho_ten&order=asc`
- Nhiều bộ lọc: `?chuyen_nganh=Toán học&sort=ho_ten`

---

## Webhooks

Webhooks hiện chưa được triển khai.

**Tính năng Dự kiến**:
- Thông báo sự kiện cho việc tạo, cập nhật, xóa giáo viên
- URL webhook có thể cấu hình
- Cơ chế thử lại cho các lần gửi thất bại

---

## Phiên bản

API hiện đang ở phiên bản 1.0.0. Các phiên bản tương lai sẽ được truy cập thông qua phiên bản URL:

- v1: `/api/v1/teachers`
- v2: `/api/v2/teachers`

---

## Hỗ trợ

Để được hỗ trợ về API, vui lòng liên hệ:
- **Email**: api-support@yourcompany.com
- **Tài liệu**: https://docs.yourcompany.com
- **GitHub Issues**: https://github.com/yourcompany/teacher-management/issues

---

**Cập nhật Lần cuối**: 06/11/2025
**Phiên bản**: 1.0.0
**© 2025 Hệ thống Quản lý Giáo viên. Bảo lưu mọi quyền.**
