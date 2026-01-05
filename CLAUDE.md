# CLAUDE.md

File này cung cấp hướng dẫn cho Claude Code (claude.ai/code) khi làm việc với mã nguồn trong repository này.

## Tổng Quan Dự Án

Hệ Thống Quản Lý Giáo Viên - Ứng dụng full-stack Next.js để quản lý giáo viên, bộ môn, khoa và chức vụ với backend Oracle Database.

## Các Lệnh

```bash
npm run dev          # Khởi động server phát triển (bao gồm NLS_LANG cho mã hóa tiếng Việt)
npm run build        # Build production
npm start            # Khởi động server production
npm test             # Chạy Jest tests
npm test:watch       # Chế độ watch cho tests
npm test:coverage    # Tạo báo cáo coverage
npm run lint         # Chạy ESLint
```

## Kiến Trúc

### Công Nghệ Sử Dụng
- **Frontend:** Next.js 15.3 + React 19 + TypeScript
- **State:** Redux Toolkit (các slice e-commerce cũ, không sử dụng cho quản lý giáo viên)
- **Database:** Oracle 19c qua node-oracledb 6.10.0
- **UI:** React-Bootstrap + SPK components tùy chỉnh
- **Testing:** Jest + React Testing Library

### Cấu Trúc Thư Mục
```
app/
├── (components)/                  # Route group với layouts
│   ├── (content-layout)/          # Các trang nội dung chính (teachers/, departments/, etc.)
│   ├── teachers/                  # Components giáo viên (TeacherList, TeacherForm, etc.)
│   ├── departments/               # Components bộ môn
│   ├── positions/                 # Components chức vụ
│   └── layout/                    # Header, Sidebar components
├── api/                           # API routes (teachers/, departments/, faculties/, positions/, degrees/)
lib/
└── oracle.ts                      # Oracle connection pool & hàm executeQuery()
shared/
├── redux/                         # Redux store & slices
├── layouts-components/            # Header, Sidebar, Footer, Switcher
└── @spk-reusable-components/      # UI components tái sử dụng
tests/
└── components/                    # Jest test files
```

### Mẫu API Route
Tất cả API routes sử dụng hàm `executeQuery()` từ `lib/oracle.ts`:
```typescript
import { executeQuery } from '@/lib/oracle';

export async function GET() {
  const result = await executeQuery<YourType>('SELECT * FROM TABLE');
  return NextResponse.json(result.rows);
}
```

### Cơ Sở Dữ Liệu
- **Host:** 172.17.0.1:1521, Service: qlgvpdb, Schema: LUCKYBOIZ
- **Các bảng chính:** GIAOVIEN (giáo viên), BOMON (bộ môn), KHOA (khoa), HOCVI (học vị), HOCHAM (học hàm)
- **Mã hóa:** AL32UTF8 hỗ trợ tiếng Việt
- Sử dụng kiểu NVARCHAR2 và bound parameters để chống SQL injection

### Mẫu Component
- Tất cả interactive components sử dụng directive `"use client"`
- Forms dạng Modal (TeacherForm, DepartmentForm, etc.)
- DataTable cho danh sách với search/filter/sort
- SweetAlert2 cho xác nhận và thông báo

## Tiêu Chuẩn Code

- **Ngôn ngữ:** Tiếng Việt cho tất cả text hiển thị và comments
- **TypeScript:** Bật strict mode, yêu cầu type coverage đầy đủ
- **Validation:** Cả client-side (form) và server-side (API route)
- Code clean, tối ưu với cấu trúc production-ready
