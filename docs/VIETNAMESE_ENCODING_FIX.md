# Khắc Phục Vấn Đề Font Tiếng Việt (Nguy?n Van AN)

## Vấn Đề
Khi nhập tên giáo viên bằng tiếng Việt (ví dụ: "Nguyễn Văn An"), dữ liệu được lưu vào Oracle Database bị lỗi font, hiển thị thành "Nguy?n Van AN" hoặc các ký tự không hợp lệ.

## Nguyên Nhân
1. **Thiếu cấu hình UTF-8 encoding** trong connection pool Oracle
2. **Không sử dụng UNISTR()** khi INSERT dữ liệu tiếng Việt
3. **NLS_LANG environment variable** không được thiết lập đúng

## Giải Pháp Được Áp Dụng

### 1. Cấu Hình UTF-8 Encoding trong `lib/oracle.ts`
```typescript
// Set UTF-8 encoding for proper Vietnamese character support
if (process.env.NLS_LANG === undefined) {
  process.env.NLS_LANG = 'VIETNAMESE_VIETNAM.AL32UTF8';
}
```

### 2. Thêm NLS_LANG vào `.env.local`
```
NLS_LANG=VIETNAMESE_VIETNAM.AL32UTF8
```

### 3. Sử dụng UNISTR() trong SQL Queries
**Trước (Lỗi):**
```sql
INSERT INTO GIAOVIEN (HOTEN, QUEQUAN, DIACHI, ...)
VALUES (:hoTen, :queQuan, :diaChi, ...)
```

**Sau (Đúng):**
```sql
INSERT INTO GIAOVIEN (HOTEN, QUEQUAN, DIACHI, ...)
VALUES (UNISTR(:hoTen), UNISTR(:queQuan), UNISTR(:diaChi), ...)
```

## Các File Được Sửa

### 1. `/lib/oracle.ts`
- Thêm cấu hình `NLS_LANG` environment variable
- Đảm bảo UTF-8 encoding được sử dụng cho tất cả connections

### 2. `/app/api/teachers/route.ts` (POST)
- Thêm `UNISTR()` cho các trường: `HOTEN`, `QUEQUAN`, `DIACHI`
- Đảm bảo tiếng Việt được lưu đúng khi tạo mới giáo viên

### 3. `/app/api/teachers/[id]/route.ts` (PUT)
- Đã có `UNISTR()` cho các trường tiếng Việt
- Không cần thay đổi thêm

### 4. `/.env.local`
- Thêm `NLS_LANG=VIETNAMESE_VIETNAM.AL32UTF8`

## Cách Kiểm Tra

1. **Khởi động lại ứng dụng:**
   ```bash
   npm run dev
   ```

2. **Thêm giáo viên mới với tên tiếng Việt:**
   - Tên: "Nguyễn Văn An"
   - Quê quán: "Hà Nội"
   - Địa chỉ: "123 Đường Lê Lợi, Quận 1, TP.HCM"

3. **Kiểm tra dữ liệu trong database:**
   ```sql
   SELECT HOTEN, QUEQUAN, DIACHI FROM GIAOVIEN WHERE HOTEN LIKE '%Nguyễn%';
   ```

4. **Kết quả mong đợi:**
   - Tên hiển thị: "Nguyễn Văn An" (không phải "Nguy?n Van AN")
   - Quê quán: "Hà Nội" (không phải "Ha Noi")
   - Địa chỉ: "123 Đường Lê Lợi, Quận 1, TP.HCM" (không phải "123 Duong Le Loi, Quan 1, TP.HCM")

## Lưu Ý Quan Trọng

1. **UNISTR() Function:**
   - Chỉ cần sử dụng cho các trường text chứa ký tự đặc biệt
   - Không cần sử dụng cho các trường số (SDT, GIOITINH, v.v.)
   - Không cần sử dụng cho email (chỉ chứa ASCII)

2. **NLS_LANG Setting:**
   - `VIETNAMESE_VIETNAM.AL32UTF8` là cấu hình tối ưu cho tiếng Việt
   - `AL32UTF8` là character set hỗ trợ Unicode (bao gồm tiếng Việt)
   - `VIETNAMESE_VIETNAM` là locale cho định dạng ngày tháng, số tiền, v.v.

3. **Database Character Set:**
   - Đảm bảo Oracle Database được tạo với character set `AL32UTF8`
   - Kiểm tra bằng lệnh: `SELECT * FROM NLS_DATABASE_PARAMETERS WHERE PARAMETER = 'NLS_CHARACTERSET';`

## Troubleshooting

### Nếu vẫn gặp lỗi font:

1. **Kiểm tra NLS_LANG:**
   ```bash
   echo $NLS_LANG
   ```

2. **Kiểm tra character set của database:**
   ```sql
   SELECT * FROM NLS_DATABASE_PARAMETERS WHERE PARAMETER = 'NLS_CHARACTERSET';
   ```

3. **Khởi động lại Docker container Oracle:**
   ```bash
   docker restart oracle19c
   ```

4. **Xóa connection pool cache:**
   - Xóa thư mục `.next` và khởi động lại ứng dụng
   ```bash
   rm -rf .next
   npm run dev
   ```

## Tài Liệu Tham Khảo

- [Oracle NLS_LANG Documentation](https://docs.oracle.com/cd/B19306_01/server.102/b14225/ch4.htm)
- [Node-oracledb Character Set Support](https://node-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html)
- [Unicode Support in Oracle Database](https://docs.oracle.com/cd/B19306_01/server.102/b14225/ch3.htm)
