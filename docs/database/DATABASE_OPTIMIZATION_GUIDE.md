# Hướng Dẫn Tối Ưu Hóa Cơ Sở Dữ Liệu Quản Lý Giáo Viên

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Partitioning - Phân Vùng Dữ Liệu](#partitioning---phân-vùng-dữ-liệu)
3. [Cluster Tables](#cluster-tables)
4. [JSON Support](#json-support)
5. [Materialized Views](#materialized-views)
6. [Indexes Optimization](#indexes-optimization)
7. [Stored Procedures](#stored-procedures)
8. [Hướng Dẫn Triển Khai](#hướng-dẫn-triển-khai)

---

## Tổng Quan

### Mục Đích
Tài liệu này mô tả các kỹ thuật tối ưu hóa cơ sở dữ liệu Oracle 19c cho hệ thống quản lý giáo viên, nhằm:
- **Cải thiện hiệu suất** truy vấn và xử lý dữ liệu
- **Tối ưu hóa lưu trữ** và quản lý dữ liệu lớn
- **Hỗ trợ triển khai web** với các tính năng hiện đại
- **Dễ dàng mở rộng** và bảo trì hệ thống

### Phân Tích Hiện Trạng
Cơ sở dữ liệu hiện tại có:
- **20 giáo viên** - Dữ liệu chính
- **7 bản ghi giảng dạy** - Dữ liệu hoạt động
- **10 lịch sử đăng nhập** - Dữ liệu audit tăng theo thời gian
- **5 nhật ký thay đổi** - Dữ liệu log
- **15 chi tiết NCKH** - Dữ liệu nghiên cứu

---

## Partitioning - Phân Vùng Dữ Liệu

### 1. Partitioning Bảng LICHSUDANGNHAP

#### Tại Sao Cần Partition?
```
┌─────────────────────────────────────────┐
│  LÝ DO PARTITION BẢNG LICHSUDANGNHAP    │
├─────────────────────────────────────────┤
│ ✓ Dữ liệu tăng liên tục theo thời gian  │
│ ✓ Truy vấn thường theo khoảng thời gian │
│ ✓ Cần archiving dữ liệu cũ định kỳ      │
│ ✓ Cải thiện hiệu suất DELETE/TRUNCATE   │
└─────────────────────────────────────────┘
```

#### Cách Hoạt Động
- **Phân vùng theo NĂM** với INTERVAL partitioning
- Oracle **tự động tạo partition mới** khi có dữ liệu năm mới
- Mỗi partition lưu dữ liệu của 1 năm

#### Lợi Ích Cụ Thể

**1. Partition Pruning (Loại bỏ partition không cần)**
```sql
-- Truy vấn chỉ quét partition 2024, BỎ QUA các năm khác
SELECT * FROM LICHSUDANGNHAP_PARTITIONED
WHERE THOIDIEMDANGNHAP >= TO_TIMESTAMP('2024-01-01', 'YYYY-MM-DD')
  AND THOIDIEMDANGNHAP < TO_TIMESTAMP('2025-01-01', 'YYYY-MM-DD');

-- KẾT QUẢ: Chỉ đọc 1 partition thay vì toàn bảng
-- TỐC ĐỘ: Nhanh hơn 3-5 lần với bảng lớn
```

**2. Dễ Dàng Archiving**
```sql
-- Xóa dữ liệu cũ CỰC NHANH (chỉ drop partition)
ALTER TABLE LICHSUDANGNHAP_PARTITIONED DROP PARTITION p_2023;
-- Thay vì: DELETE FROM ... WHERE year = 2023 (rất chậm)

-- TỐC ĐỘ: Xóa hàng triệu bản ghi trong vài giây
```

**3. Backup & Recovery Linh Hoạt**
```sql
-- Backup chỉ dữ liệu năm hiện tại
-- Phục hồi nhanh partition bị lỗi mà không ảnh hưởng partition khác
```

#### So Sánh Hiệu Suất

| Thao Tác | Không Partition | Có Partition | Cải Thiện |
|----------|----------------|--------------|-----------|
| SELECT theo năm | Quét toàn bảng | Quét 1 partition | 3-5x nhanh hơn |
| DELETE dữ liệu cũ | Vài phút - vài giờ | Vài giây | 100-1000x nhanh hơn |
| Index maintenance | Toàn bộ index | Từng partition | Dễ quản lý hơn |

---

### 2. Partitioning Bảng NHATKYTHAYDOI

#### Tại Sao Cần Partition?
```
┌─────────────────────────────────────────┐
│   LÝ DO PARTITION BẢNG NHATKYTHAYDOI    │
├─────────────────────────────────────────┤
│ ✓ LOG AUDIT tăng RẤT NHANH              │
│ ✓ Thường chỉ quan tâm dữ liệu gần đây   │
│ ✓ Cần compliance (lưu log 3-5 năm)      │
│ ✓ Cần query performance cho báo cáo     │
└─────────────────────────────────────────┘
```

#### Cách Hoạt Động
- **Phân vùng theo QUÝ** (3 tháng)
- Partition nhỏ hơn → Quản lý tốt hơn
- INTERVAL tự động tạo partition mới

#### Lợi Ích Cho Web Application

**1. Dashboard Performance**
```sql
-- Dashboard hiển thị hoạt động 30 ngày gần đây
SELECT * FROM NHATKYTHAYDOI_PARTITIONED
WHERE THOIGIANTHAYDOI >= SYSTIMESTAMP - INTERVAL '30' DAY;

-- CHỈ ĐỌC 1 PARTITION (quý hiện tại)
-- Phản hồi web nhanh < 100ms thay vì vài giây
```

**2. Báo Cáo Theo Kỳ**
```sql
-- Báo cáo quý 1/2024
SELECT * FROM NHATKYTHAYDOI_PARTITIONED
WHERE THOIGIANTHAYDOI >= TO_TIMESTAMP('2024-01-01', 'YYYY-MM-DD')
  AND THOIGIANTHAYDOI < TO_TIMESTAMP('2024-04-01', 'YYYY-MM-DD');

-- Oracle tự động chỉ đọc partition p_2024_q1
```

**3. Archiving Theo Chính Sách**
```sql
-- Lưu log 2 năm, xóa log cũ hơn
-- Xóa theo quý - dễ dàng và an toàn
ALTER TABLE NHATKYTHAYDOI_PARTITIONED DROP PARTITION p_2022_q1;
```

---

### 3. Partitioning Bảng CHITIETGIANGDAY

#### Tại Sao Cần Partition?
```
┌──────────────────────────────────────────┐
│  LÝ DO PARTITION BẢNG CHITIETGIANGDAY    │
├──────────────────────────────────────────┤
│ ✓ Truy vấn LUÔN theo năm học             │
│ ✓ Mỗi năm học là 1 đơn vị độc lập        │
│ ✓ Báo cáo giảng dạy theo năm học         │
│ ✓ Dễ dàng so sánh giữa các năm học      │
└──────────────────────────────────────────┘
```

#### Cách Hoạt Động
- **LIST PARTITIONING** theo NAMHOC
- Mỗi năm học = 1 partition riêng biệt
- Partition DEFAULT cho năm học mới

#### Lợi Ích Thực Tế

**1. Báo Cáo Giảng Dạy**
```sql
-- Thống kê giảng dạy năm 2024-2025
SELECT gv.HOTEN, SUM(ctgd.SOTIET) as TONG_TIET
FROM GIAOVIEN gv
JOIN CHITIETGIANGDAY_PARTITIONED ctgd ON gv.MAGV = ctgd.MAGV
WHERE ctgd.NAMHOC = '2024-2025'
GROUP BY gv.HOTEN;

-- CHỈ ĐỌC partition p_2024_2025
-- Bỏ qua hoàn toàn dữ liệu các năm khác
```

**2. So Sánh Năm Học**
```sql
-- So sánh 2 năm học
SELECT NAMHOC, SUM(SOTIET)
FROM CHITIETGIANGDAY_PARTITIONED
WHERE NAMHOC IN ('2023-2024', '2024-2025')
GROUP BY NAMHOC;

-- CHỈ ĐỌC 2 partitions, bỏ qua tất cả các năm khác
```

**3. Độc Lập Dữ Liệu**
- Mỗi năm học có lifecycle riêng
- Có thể backup/restore theo năm học
- Index riêng cho mỗi partition

---

## Cluster Tables

### Tại Sao Cần Cluster?

```
┌───────────────────────────────────────────────┐
│          CLUSTER GIAOVIEN - BOMON             │
├───────────────────────────────────────────────┤
│ VẤN ĐỀ: 2 bảng này LUÔN JOIN với nhau        │
│                                               │
│ KHÔNG CÓ CLUSTER:                             │
│   ┌─────────┐         ┌─────────┐            │
│   │ GIAOVIEN│  JOIN   │  BOMON  │            │
│   │(disk 1) │ <═════> │(disk 2) │            │
│   └─────────┘         └─────────┘            │
│   → Phải đọc 2 nơi khác nhau                 │
│   → Nhiều I/O operations                      │
│                                               │
│ CÓ CLUSTER:                                   │
│   ┌──────────────────────────┐               │
│   │  CÙNG 1 DATA BLOCK        │               │
│   │  ┌────────┐  ┌─────────┐ │               │
│   │  │ GIAOVIEN│  │  BOMON  │ │               │
│   │  └────────┘  └─────────┘ │               │
│   └──────────────────────────┘               │
│   → Đọc 1 lần, có cả 2 bảng                  │
│   → Giảm I/O đáng kể                         │
└───────────────────────────────────────────────┘
```

### Cách Hoạt Động

**1. Physical Storage**
```
KHÔNG CLUSTER:
Block 1: [GV001, GV002, GV003] (Giáo viên bộ môn CNTT)
Block 2: [GV004, GV005]        (Giáo viên bộ môn Toán)
Block 3: [BM_CNTT]             (Bộ môn CNTT)
Block 4: [BM_TOAN]             (Bộ môn Toán)

→ JOIN phải đọc 4 blocks khác nhau

CÓ CLUSTER (theo MABM):
Block 1: [BM_CNTT, GV001, GV002, GV003] (Tất cả cùng bộ môn CNTT)
Block 2: [BM_TOAN, GV004, GV005]        (Tất cả cùng bộ môn Toán)

→ JOIN chỉ đọc 1-2 blocks
```

### Lợi Ích Cụ Thể

**1. Query Performance**
```sql
-- Truy vấn giáo viên kèm thông tin bộ môn
SELECT gv.HOTEN, bm.TENBM, k.TENKHOA
FROM GIAOVIEN_CLUSTERED gv
JOIN BOMON_CLUSTERED bm ON gv.MABM = bm.MABM
JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
WHERE bm.MABM = 'BM001';

-- LỢI ÍCH:
-- ✓ Giảm 40-60% I/O operations
-- ✓ Nhanh hơn 2-3 lần với JOIN thường xuyên
-- ✓ Giảm buffer cache sử dụng
```

**2. Khi Nào Nên Dùng Cluster?**

| Điều Kiện | GIAOVIEN-BOMON | Phù Hợp? |
|-----------|----------------|----------|
| 2 bảng thường JOIN với nhau | ✓ Rất thường | ✓ PHẢI DÙNG |
| Ít INSERT/UPDATE | ✓ Ổn định | ✓ TỐT |
| JOIN theo key cụ thể (MABM) | ✓ Đúng | ✓ HOÀN HẢO |
| Kích thước bảng vừa phải | ✓ 20 GV, ít BM | ✓ LÝ TƯỞNG |

**3. Trade-offs (Cân nhắc)**

**Ưu điểm:**
- Cải thiện đáng kể hiệu suất JOIN
- Giảm I/O cho truy vấn thường xuyên
- Tiết kiệm memory (buffer cache)

**Nhược điểm:**
- INSERT/UPDATE chậm hơn một chút (phải maintain cluster)
- Chiếm nhiều disk space hơn
- Phức tạp hơn trong quản lý

**Kết luận:** Phù hợp cho GIAOVIEN-BOMON vì:
- Dữ liệu ổn định, ít thay đổi
- JOIN RẤT thường xuyên trong mọi truy vấn
- Cải thiện UX cho web (tải trang nhanh hơn)

---

## JSON Support

### Tại Sao Cần JSON?

```
┌──────────────────────────────────────────────┐
│      VẤN ĐỀ VỚI SCHEMA TRUYỀN THỐNG         │
├──────────────────────────────────────────────┤
│ ❌ Mỗi lần thêm trường → ALTER TABLE         │
│ ❌ Downtime khi thay đổi schema              │
│ ❌ Dữ liệu không đồng nhất khó lưu           │
│ ❌ Không linh hoạt với yêu cầu mới           │
│                                              │
│      GIẢI PHÁP VỚI JSON                      │
├──────────────────────────────────────────────┤
│ ✓ Thêm trường mới không cần ALTER TABLE     │
│ ✓ Zero downtime                              │
│ ✓ Lưu dữ liệu linh hoạt, đa dạng            │
│ ✓ Tương thích tốt với REST API              │
└──────────────────────────────────────────────┘
```

### 1. Bảng GIAOVIEN_METADATA_JSON

#### Mục Đích
Lưu thông tin mở rộng của giáo viên mà không cần thay đổi schema chính

#### Cấu Trúc Dữ Liệu

```json
// METADATA_TYPE: 'SKILLS'
{
  "technical_skills": [
    "Java", "Python", "Oracle Database", "Machine Learning"
  ],
  "soft_skills": [
    "Presentation", "Team Management", "Research"
  ],
  "languages": [
    {
      "language": "English",
      "level": "Fluent",
      "certificates": ["TOEIC 900", "IELTS 7.5"]
    },
    {
      "language": "Japanese",
      "level": "Intermediate",
      "certificates": ["JLPT N2"]
    }
  ],
  "tools": [
    {
      "tool": "Python",
      "proficiency": "Expert",
      "years_experience": 5
    }
  ]
}
```

```json
// METADATA_TYPE: 'CERTIFICATIONS'
{
  "certifications": [
    {
      "name": "Oracle Certified Professional",
      "issued_by": "Oracle",
      "issued_date": "2023-05-15",
      "expiry_date": "2026-05-15",
      "credential_id": "OCP123456",
      "credential_url": "https://..."
    },
    {
      "name": "AWS Solutions Architect",
      "issued_by": "Amazon",
      "issued_date": "2022-08-20",
      "expiry_date": "2025-08-20"
    }
  ]
}
```

```json
// METADATA_TYPE: 'AWARDS'
{
  "awards": [
    {
      "title": "Giáo viên xuất sắc nhất năm",
      "year": 2024,
      "issued_by": "Trường ĐH ABC",
      "description": "Đóng góp xuất sắc trong giảng dạy và NCKH"
    }
  ]
}
```

```json
// METADATA_TYPE: 'PREFERENCES'
{
  "teaching_preferences": {
    "preferred_subjects": ["Database", "Data Science"],
    "preferred_class_size": "20-30",
    "preferred_time_slots": ["Morning"]
  },
  "notification_settings": {
    "email": true,
    "sms": false,
    "push": true
  },
  "dashboard_layout": {
    "widgets": ["schedule", "students", "research"],
    "theme": "light"
  }
}
```

#### Lợi Ích Cho Web Application

**1. Schema Flexibility**
```javascript
// Frontend có thể thêm field mới mà không cần backend migration
const newSkill = {
  technical_skills: [...oldSkills, "React", "Next.js"],
  cloud_platforms: ["AWS", "Azure", "GCP"]  // Trường mới!
};

// UPDATE JSON - không cần ALTER TABLE
```

**2. Query JSON Data**
```sql
-- Tìm giáo viên biết Python
SELECT gv.MAGV, gv.HOTEN
FROM GIAOVIEN gv
JOIN GIAOVIEN_METADATA_JSON meta ON gv.MAGV = meta.MAGV
WHERE meta.METADATA_TYPE = 'SKILLS'
  AND JSON_EXISTS(meta.METADATA_JSON, '$.technical_skills[*]?(@ == "Python")');

-- Tìm giáo viên có chứng chỉ Oracle
SELECT gv.HOTEN,
       JSON_VALUE(meta.METADATA_JSON, '$.certifications[0].name') as cert_name
FROM GIAOVIEN gv
JOIN GIAOVIEN_METADATA_JSON meta ON gv.MAGV = meta.MAGV
WHERE meta.METADATA_TYPE = 'CERTIFICATIONS'
  AND JSON_TEXTCONTAINS(meta.METADATA_JSON, '$.certifications[*].name', 'Oracle');
```

**3. JSON Search Index**
```sql
-- Tạo JSON Search Index để tối ưu truy vấn
CREATE SEARCH INDEX idx_gv_metadata_json_search
ON GIAOVIEN_METADATA_JSON(METADATA_JSON) FOR JSON;

-- Lợi ích: Truy vấn JSON nhanh như truy vấn cột thông thường
-- Full-text search trong JSON
```

---

### 2. Bảng SYSTEM_CONFIG_JSON

#### Mục Đích
Cấu hình hệ thống linh hoạt cho web application

#### Use Cases

**1. Email Templates**
```json
{
  "welcome_email": {
    "subject": "Chào mừng {{name}} đến với hệ thống",
    "body": "Xin chào {{name}},\n\nTài khoản của bạn đã được kích hoạt...",
    "variables": ["name", "username", "activation_link"]
  },
  "password_reset": {
    "subject": "Đặt lại mật khẩu",
    "body": "Click vào link sau để đặt lại: {{reset_link}}",
    "expiry_hours": 24
  },
  "report_ready": {
    "subject": "Báo cáo {{report_type}} đã sẵn sàng",
    "body": "Báo cáo {{report_type}} của kỳ {{period}} đã được tạo."
  }
}
```

**2. Feature Flags**
```json
{
  "features": {
    "enable_online_grading": true,
    "enable_video_lectures": false,
    "enable_ai_assistant": {
      "enabled": true,
      "max_tokens": 1000,
      "models": ["gpt-4", "claude-3"]
    },
    "maintenance_mode": false
  }
}
```

**3. Business Rules**
```json
{
  "teaching_rules": {
    "max_classes_per_semester": 6,
    "min_hours_between_classes": 2,
    "max_students_per_class": {
      "undergraduate": 40,
      "graduate": 20,
      "lab": 25
    }
  },
  "grading_rules": {
    "passing_score": 5.0,
    "grade_scale": [
      {"min": 8.5, "max": 10, "grade": "A"},
      {"min": 7.0, "max": 8.4, "grade": "B"},
      {"min": 5.5, "max": 6.9, "grade": "C"},
      {"min": 4.0, "max": 5.4, "grade": "D"},
      {"min": 0, "max": 3.9, "grade": "F"}
    ]
  }
}
```

**4. UI Configuration**
```json
{
  "dashboard_config": {
    "default_widgets": [
      {"id": "schedule", "position": 1, "size": "large"},
      {"id": "notifications", "position": 2, "size": "medium"},
      {"id": "quick_stats", "position": 3, "size": "small"}
    ],
    "themes": {
      "light": {"primary": "#1976d2", "secondary": "#dc004e"},
      "dark": {"primary": "#90caf9", "secondary": "#f48fb1"}
    }
  }
}
```

#### Lợi Ích

**1. Hot Configuration (Không cần restart)**
```javascript
// Frontend gọi API lấy config
const config = await fetch('/api/config/features').then(r => r.json());

if (config.enable_ai_assistant.enabled) {
  // Hiển thị AI assistant
}

// Thay đổi config realtime
UPDATE SYSTEM_CONFIG_JSON
SET CONFIG_VALUE = JSON_MERGEPATCH(CONFIG_VALUE, '{"features": {"enable_ai_assistant": {"enabled": false}}}')
WHERE CONFIG_KEY = 'FEATURE_FLAGS';

// Không cần deploy lại code!
```

**2. A/B Testing**
```json
{
  "ab_tests": {
    "new_dashboard_layout": {
      "enabled": true,
      "variant_a_percentage": 50,
      "variant_b_percentage": 50,
      "start_date": "2025-01-01",
      "end_date": "2025-02-01"
    }
  }
}
```

---

### 3. Bảng NCKH_DETAILS_JSON

#### Mục Đích
Lưu chi tiết phức tạp của công trình nghiên cứu khoa học

#### Cấu Trúc

```json
{
  "title": "Ứng dụng Machine Learning trong giáo dục",
  "abstract": "Nghiên cứu này đề xuất phương pháp...",
  "keywords": [
    "Machine Learning",
    "Education",
    "Data Mining",
    "Learning Analytics"
  ],
  "funding": {
    "source": "Quỹ phát triển khoa học và công nghệ quốc gia",
    "grant_number": "QPTD.2024.01",
    "amount": 500000000,
    "currency": "VND",
    "start_date": "2024-01-01",
    "end_date": "2025-12-31"
  },
  "publications": [
    {
      "title": "Deep Learning for Student Performance Prediction",
      "journal": "IEEE Transactions on Education",
      "type": "Journal Article",
      "doi": "10.1109/TE.2024.12345",
      "published_date": "2024-03-15",
      "impact_factor": 3.5,
      "quartile": "Q1",
      "citations": 15
    },
    {
      "title": "Automated Essay Grading using NLP",
      "conference": "International Conference on AI in Education",
      "type": "Conference Paper",
      "location": "Tokyo, Japan",
      "published_date": "2024-07-20",
      "acceptance_rate": "25%"
    }
  ],
  "collaborators": [
    {
      "name": "Trường ĐH Bách Khoa Hà Nội",
      "country": "Vietnam",
      "role": "Co-investigator"
    },
    {
      "name": "MIT",
      "country": "USA",
      "role": "Consultant"
    }
  ],
  "datasets": [
    {
      "name": "Student Performance Dataset",
      "size": "10000 records",
      "url": "https://github.com/...",
      "license": "MIT"
    }
  ],
  "code_repositories": [
    {
      "name": "ML-Education",
      "url": "https://github.com/...",
      "stars": 250,
      "language": "Python"
    }
  ],
  "impact": {
    "total_citations": 25,
    "h_index_contribution": 2,
    "awards": [
      "Best Paper Award - AIED 2024"
    ],
    "media_coverage": [
      {
        "outlet": "VnExpress",
        "url": "https://...",
        "date": "2024-08-01"
      }
    ]
  }
}
```

#### Lợi Ích

**1. Rich Research Profile**
```sql
-- Lấy toàn bộ thông tin nghiên cứu để hiển thị profile
SELECT
    gv.HOTEN,
    tn.TENCONGTRINHKHOAHOC,
    nd.RESEARCH_DETAILS
FROM GIAOVIEN gv
JOIN CHITIETNCKH cn ON gv.MAGV = cn.MAGV
JOIN TAINCKH tn ON cn.MATAINCKH = tn.MATAINCKH
JOIN NCKH_DETAILS_JSON nd ON tn.MATAINCKH = nd.MATAINCKH
WHERE gv.MAGV = 'GV001';
```

**2. Advanced Queries**
```sql
-- Tìm công trình có impact factor > 3.0
SELECT
    tn.TENCONGTRINHKHOAHOC,
    JSON_VALUE(nd.RESEARCH_DETAILS, '$.publications[0].impact_factor') as impact_factor
FROM TAINCKH tn
JOIN NCKH_DETAILS_JSON nd ON tn.MATAINCKH = nd.MATAINCKH
WHERE TO_NUMBER(JSON_VALUE(nd.RESEARCH_DETAILS, '$.publications[0].impact_factor')) > 3.0;

-- Đếm số công trình theo funding source
SELECT
    JSON_VALUE(RESEARCH_DETAILS, '$.funding.source') as funding_source,
    COUNT(*) as num_projects
FROM NCKH_DETAILS_JSON
GROUP BY JSON_VALUE(RESEARCH_DETAILS, '$.funding.source');
```

**3. Research Analytics**
```javascript
// Frontend hiển thị research impact
const research = JSON.parse(researchDetails);

const impactScore = calculateImpact({
  citations: research.impact.total_citations,
  impactFactor: research.publications[0].impact_factor,
  awards: research.impact.awards.length
});

// Hiển thị badges, charts, metrics
```

---

## Materialized Views

### Tại Sao Cần Materialized View?

```
┌────────────────────────────────────────────────┐
│          VẤN ĐỀ VỚI VIEW THÔNG THƯỜNG         │
├────────────────────────────────────────────────┤
│ VIEW = Query được lưu, KHÔNG lưu dữ liệu      │
│                                                │
│ SELECT * FROM V_BAOCAO_GIANGDAY;               │
│ → Mỗi lần gọi → Execute query phức tạp        │
│ → JOIN nhiều bảng → CHẬM                       │
│                                                │
│      GIẢI PHÁP: MATERIALIZED VIEW              │
├────────────────────────────────────────────────┤
│ MV = LƯU KẾT QUẢ query vào bảng vật lý        │
│                                                │
│ SELECT * FROM MV_BAOCAO_GIANGDAY_TONGHOP;      │
│ → Đọc trực tiếp từ bảng → CỰC NHANH           │
│ → Không cần JOIN lại → Tiết kiệm resources    │
└────────────────────────────────────────────────┘
```

### 1. MV_BAOCAO_GIANGDAY_TONGHOP

#### Mục Đích
Báo cáo tổng hợp giảng dạy - truy vấn thường xuyên, JOIN nhiều bảng

#### So Sánh Performance

**Không dùng MV:**
```sql
-- Query phức tạp, JOIN 5 bảng
SELECT
    gv.MAGV,
    gv.HOTEN,
    bm.TENBM,
    k.TENKHOA,
    tgd.NAMHOC,
    COUNT(DISTINCT tgd.MATAIGIANGDAY) as SO_MON_HOC,
    SUM(ctgd.SOTIET) as TONG_SO_TIET,
    SUM(ctgd.SOTIETQUYDOI) as TONG_TIET_QUYDOI
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON gv.MABM = bm.MABM
LEFT JOIN KHOA k ON bm.MAKHOA = k.MAKHOA
LEFT JOIN CHITIETGIANGDAY ctgd ON gv.MAGV = ctgd.MAGV
LEFT JOIN TAIGIANGDAY tgd ON ctgd.MATAIGIANGDAY = tgd.MATAIGIANGDAY
WHERE tgd.NAMHOC = '2024-2025'
GROUP BY gv.MAGV, gv.HOTEN, bm.TENBM, k.TENKHOA, tgd.NAMHOC;

-- Execution time: 2-5 seconds (với dữ liệu lớn)
-- Cost: 1000+ (Oracle cost estimate)
```

**Dùng MV:**
```sql
-- Query đơn giản, đọc từ bảng MV
SELECT * FROM MV_BAOCAO_GIANGDAY_TONGHOP
WHERE NAMHOC = '2024-2025';

-- Execution time: < 50ms
-- Cost: 10-20
-- TỐC ĐỘ: NHANH HƠN 50-100 LẦN!
```

#### Refresh Strategy

**1. REFRESH COMPLETE ON DEMAND**
```sql
-- Refresh thủ công khi cần
EXEC DBMS_MVIEW.REFRESH('MV_BAOCAO_GIANGDAY_TONGHOP', 'C');

-- Hoặc schedule refresh hàng đêm
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'REFRESH_MV_GIANGDAY',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN DBMS_MVIEW.REFRESH(''MV_BAOCAO_GIANGDAY_TONGHOP'', ''C''); END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY; BYHOUR=1',
    enabled         => TRUE
  );
END;
/
```

**2. Trade-offs**

| Aspect | Normal View | Materialized View |
|--------|-------------|-------------------|
| Query Speed | Chậm (execute mỗi lần) | Nhanh (đọc từ table) |
| Storage | 0 (không lưu data) | Cần storage |
| Data Freshness | Real-time | Phụ thuộc refresh |
| Maintenance | Không cần | Cần refresh định kỳ |

**Kết luận:** Dùng MV cho:
- Báo cáo phức tạp, truy vấn thường xuyên
- Có thể chấp nhận data lag vài giờ
- Cải thiện UX đáng kể (báo cáo load nhanh)

---

### 2. MV_THONGKE_NCKH

#### Mục Đích
Thống kê nghiên cứu khoa học - aggregation phức tạp

#### Use Cases

**1. Dashboard NCKH**
```sql
-- Top giáo viên có nhiều công trình nhất
SELECT HOTEN, SO_CONG_TRINH, TONG_GIO_NCKH
FROM MV_THONGKE_NCKH
WHERE NAMHOC = '2024'
ORDER BY SO_CONG_TRINH DESC
FETCH FIRST 10 ROWS ONLY;

-- Thống kê theo khoa
SELECT TENKHOA, SUM(SO_CONG_TRINH) as TONG_CONG_TRINH
FROM MV_THONGKE_NCKH
WHERE NAMHOC = '2024'
GROUP BY TENKHOA;
```

**2. Báo Cáo Định Kỳ**
```javascript
// API endpoint cho dashboard
app.get('/api/research/stats/:year', async (req, res) => {
  const stats = await db.query(
    'SELECT * FROM MV_THONGKE_NCKH WHERE NAMHOC = :year',
    [req.params.year]
  );
  // Trả về ngay lập tức - không cần compute
  res.json(stats);
});
```

**3. QUERY REWRITE**
```sql
-- Oracle TỰ ĐỘNG sử dụng MV khi có thể
-- (nếu ENABLE QUERY REWRITE)

-- Developer viết:
SELECT gv.HOTEN, COUNT(tn.MATAINCKH)
FROM GIAOVIEN gv
JOIN CHITIETNCKH cn ON gv.MAGV = cn.MAGV
JOIN TAINCKH tn ON cn.MATAINCKH = tn.MATAINCKH
WHERE tn.NAMHOC = '2024'
GROUP BY gv.HOTEN;

-- Oracle tự động rewrite thành:
SELECT HOTEN, SO_CONG_TRINH
FROM MV_THONGKE_NCKH
WHERE NAMHOC = '2024';

-- Developer không cần biết MV tồn tại!
```

---

## Indexes Optimization

### 1. B-Tree Indexes (Thông Thường)

#### Khi Nào Dùng?
- Cột có **cardinality cao** (nhiều giá trị khác nhau)
- Thường dùng trong WHERE, JOIN, ORDER BY

#### Examples

**1. Email Index**
```sql
CREATE INDEX idx_giaovien_email ON GIAOVIEN(EMAIL);

-- Lợi ích:
-- ✓ Tìm kiếm nhanh: WHERE EMAIL = 'abc@gmail.com'
-- ✓ Kiểm tra unique nhanh khi insert
-- ✓ Sort nhanh: ORDER BY EMAIL
```

**2. Họ Tên Index**
```sql
CREATE INDEX idx_giaovien_hoten ON GIAOVIEN(HOTEN);

-- Use case: Autocomplete search
SELECT HOTEN FROM GIAOVIEN
WHERE HOTEN LIKE 'Nguyễn%'
ORDER BY HOTEN;
-- → Dùng index, rất nhanh
```

---

### 2. Bitmap Indexes

#### Tại Sao Cần Bitmap Index?

```
┌────────────────────────────────────────────┐
│       BITMAP INDEX vs B-TREE INDEX         │
├────────────────────────────────────────────┤
│ GIỚI TÍNH: CHỈ CÓ 2 GIÁ TRỊ (0, 1)        │
│                                            │
│ B-TREE INDEX:                              │
│   - Lưu trữ: 10-50 bytes/row              │
│   - Hiệu quả: Thấp với low cardinality    │
│                                            │
│ BITMAP INDEX:                              │
│   - Lưu trữ: 1 bit/row = 0.125 bytes/row  │
│   - Hiệu quả: CỰC CAO với low cardinality │
│   - Tiết kiệm: 80-99% storage             │
└────────────────────────────────────────────┘
```

#### Cách Hoạt Động

```
Dữ liệu GIAOVIEN (20 rows):
MAGV  | GIOITINH
------|----------
GV001 | 0
GV002 | 1
GV003 | 0
GV004 | 1
...

BITMAP INDEX:
GIOITINH=0: 10101010... (1 bit/row)
GIOITINH=1: 01010101...

Query: WHERE GIOITINH = 1
→ Bitwise AND operation → CỰC NHANH
```

#### Examples

**1. Giới Tính**
```sql
CREATE BITMAP INDEX idx_giaovien_gioitinh_bmp ON GIAOVIEN(GIOITINH);

-- Query:
SELECT COUNT(*) FROM GIAOVIEN WHERE GIOITINH = 1;
-- → Bitmap scan: O(1) operation
-- → Nhanh gấp 10-100 lần B-tree
```

**2. Năm Học**
```sql
CREATE BITMAP INDEX idx_taigiangday_namhoc_bmp ON TAIGIANGDAY(NAMHOC);

-- Chỉ có vài năm học: 2022-2023, 2023-2024, 2024-2025
-- Bitmap perfect cho trường hợp này

-- Query:
SELECT * FROM TAIGIANGDAY
WHERE NAMHOC IN ('2023-2024', '2024-2025');
-- → Bitmap OR operation → Cực nhanh
```

**3. Bitmap JOIN Index**
```sql
-- Advanced: Bitmap index cho JOIN
CREATE BITMAP INDEX idx_bm_giaovien_khoa
ON GIAOVIEN(bm.MAKHOA)
FROM GIAOVIEN gv, BOMON bm
WHERE gv.MABM = bm.MABM;

-- Query tìm giáo viên theo khoa:
SELECT * FROM GIAOVIEN gv, BOMON bm
WHERE gv.MABM = bm.MABM
  AND bm.MAKHOA = 'K001';
-- → Dùng bitmap join index → Không cần JOIN!
```

#### Khi Nào KHÔNG Nên Dùng Bitmap?

❌ **Bảng có nhiều INSERT/UPDATE/DELETE**
- Bitmap index chậm khi update
- Lock contention cao

✓ **Bitmap phù hợp:**
- Data warehouse (ít update)
- Bảng lookup (ổn định)
- Cardinality thấp (< 100 distinct values)

---

### 3. Function-Based Indexes

#### Tại Sao Cần?

```sql
-- Query không phân biệt hoa/thường:
SELECT * FROM GIAOVIEN
WHERE UPPER(HOTEN) = 'NGUYỄN VĂN A';

-- Vấn đề: Index thông thường KHÔNG được sử dụng!
-- → Full table scan → CHẬM

-- Giải pháp: Function-based index
CREATE INDEX idx_giaovien_hoten_upper ON GIAOVIEN(UPPER(HOTEN));

-- Bây giờ query dùng index → NHANH!
```

#### Examples

**1. Case-Insensitive Search**
```sql
CREATE INDEX idx_giaovien_hoten_upper ON GIAOVIEN(UPPER(HOTEN));
CREATE INDEX idx_nguoidung_tendangnhap_upper ON NGUOIDUNG(UPPER(TENDANGNHAP));

-- Use case: Login không phân biệt hoa/thường
SELECT * FROM NGUOIDUNG
WHERE UPPER(TENDANGNHAP) = UPPER('admin');
-- → Dùng index
```

**2. Date Truncation**
```sql
-- Index theo năm
CREATE INDEX idx_giaovien_birth_year ON GIAOVIEN(EXTRACT(YEAR FROM NGAYSINH));

-- Query giáo viên sinh năm 1990
SELECT * FROM GIAOVIEN
WHERE EXTRACT(YEAR FROM NGAYSINH) = 1990;
-- → Dùng index
```

**3. Computed Columns**
```sql
-- Index theo tổng số tiết
CREATE INDEX idx_chitiet_tong_tiet
ON CHITIETGIANGDAY(SOTIET + NVL(SOTIETQUYDOI, 0));

-- Query:
SELECT * FROM CHITIETGIANGDAY
WHERE SOTIET + NVL(SOTIETQUYDOI, 0) > 100;
-- → Dùng index
```

---

## Stored Procedures

### 1. sp_get_giaovien_full_info

#### Mục Đích
Lấy đầy đủ thông tin giáo viên kèm JSON metadata

#### Use Case
```javascript
// API endpoint
app.get('/api/teacher/:id', async (req, res) => {
  const result = await connection.execute(
    `BEGIN sp_get_giaovien_full_info(:magv, :result); END;`,
    {
      magv: req.params.id,
      result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
    }
  );

  const resultSet = result.outBinds.result;
  const row = await resultSet.getRow();

  const teacher = {
    ...row,
    skills: JSON.parse(row.SKILLS_JSON || '{}'),
    certifications: JSON.parse(row.CERT_JSON || '{}')
  };

  res.json(teacher);
});
```

#### Lợi Ích
- **1 query** thay vì multiple queries
- **Reduce network roundtrips**
- **Consistent logic** trong database
- **Reusable** cho nhiều clients

---

### 2. sp_refresh_all_mv

#### Mục Đích
Refresh tất cả materialized views

#### Scheduling
```sql
-- Chạy hàng đêm lúc 2h sáng
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'REFRESH_ALL_MVs',
    job_type        => 'STORED_PROCEDURE',
    job_action      => 'sp_refresh_all_mv',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY; BYHOUR=2',
    enabled         => TRUE
  );
END;
/
```

#### Monitoring
```sql
-- Check last refresh time
SELECT mview_name, last_refresh_date, staleness
FROM USER_MVIEWS;
```

---

### 3. sp_partition_stats

#### Mục Đích
Thống kê chi tiết các partitions

#### Use Case
```sql
-- Monitor partition growth
DECLARE
  l_cursor SYS_REFCURSOR;
  l_partition VARCHAR2(100);
  l_num_rows NUMBER;
  l_size_mb NUMBER;
BEGIN
  sp_partition_stats('LICHSUDANGNHAP_PARTITIONED', l_cursor);

  LOOP
    FETCH l_cursor INTO l_partition, l_num_rows, l_size_mb;
    EXIT WHEN l_cursor%NOTFOUND;

    DBMS_OUTPUT.PUT_LINE(l_partition || ': ' || l_num_rows || ' rows, ' || l_size_mb || ' MB');

    -- Drop old partitions nếu cần
    IF l_partition LIKE '%2020%' THEN
      EXECUTE IMMEDIATE 'ALTER TABLE LICHSUDANGNHAP_PARTITIONED DROP PARTITION ' || l_partition;
    END IF;
  END LOOP;
END;
/
```

---

## Hướng Dẫn Triển Khai

### Bước 1: Backup Database

```sql
-- Full export
expdp LUCKYBOIZ/4@qlgvpdb DIRECTORY=backup_dir DUMPFILE=qlgv_backup.dmp FULL=Y

-- Hoặc backup specific tables
expdp LUCKYBOIZ/4@qlgvpdb DIRECTORY=backup_dir DUMPFILE=qlgv_tables.dmp \
  TABLES=GIAOVIEN,BOMON,CHITIETGIANGDAY,LICHSUDANGNHAP
```

### Bước 2: Chạy Script Optimization

```bash
# Connect to Oracle container
docker exec -it oracle19c bash

# Run SQL script
sqlplus LUCKYBOIZ/4@//localhost:1521/qlgvpdb @database_optimization.sql
```

### Bước 3: Migrate Dữ Liệu

```sql
-- 1. Chuyển dữ liệu sang bảng partitioned
INSERT INTO LICHSUDANGNHAP_PARTITIONED
SELECT * FROM LICHSUDANGNHAP;

INSERT INTO NHATKYTHAYDOI_PARTITIONED
SELECT * FROM NHATKYTHAYDOI;

-- 2. Chuyển sang cluster tables
INSERT INTO BOMON_CLUSTERED SELECT * FROM BOMON;
INSERT INTO GIAOVIEN_CLUSTERED SELECT * FROM GIAOVIEN;

-- 3. Verify
SELECT COUNT(*) FROM LICHSUDANGNHAP_PARTITIONED;
SELECT COUNT(*) FROM GIAOVIEN_CLUSTERED;
```

### Bước 4: Test Performance

```sql
-- Test partition pruning
SET AUTOTRACE ON
SELECT * FROM LICHSUDANGNHAP_PARTITIONED
WHERE THOIDIEMDANGNHAP >= TIMESTAMP '2024-01-01 00:00:00';
-- Check execution plan: Prt (Partition) được sử dụng

-- Test cluster performance
SELECT gv.HOTEN, bm.TENBM
FROM GIAOVIEN_CLUSTERED gv
JOIN BOMON_CLUSTERED bm ON gv.MABM = bm.MABM;
-- Check consistent gets: Giảm so với non-cluster
```

### Bước 5: Populate JSON Data

```sql
-- Insert sample JSON data
INSERT INTO GIAOVIEN_METADATA_JSON (MAGV, METADATA_TYPE, METADATA_JSON) VALUES (
  'GV001',
  'SKILLS',
  '{
    "technical_skills": ["Java", "Python", "Oracle"],
    "soft_skills": ["Presentation", "Leadership"]
  }'
);

-- Verify JSON constraint
SELECT JSON_VALUE(METADATA_JSON, '$.technical_skills[0]')
FROM GIAOVIEN_METADATA_JSON
WHERE MAGV = 'GV001';
```

### Bước 6: Refresh Materialized Views

```sql
-- Initial build
EXEC DBMS_MVIEW.REFRESH('MV_BAOCAO_GIANGDAY_TONGHOP', 'C');
EXEC DBMS_MVIEW.REFRESH('MV_THONGKE_NCKH', 'C');

-- Verify data
SELECT * FROM MV_BAOCAO_GIANGDAY_TONGHOP;
```

### Bước 7: Monitor Performance

```sql
-- Monitor index usage
SELECT index_name, num_rows, distinct_keys, clustering_factor
FROM USER_INDEXES
WHERE table_name IN ('GIAOVIEN', 'CHITIETGIANGDAY');

-- Monitor partition statistics
SELECT partition_name, num_rows, blocks
FROM USER_TAB_PARTITIONS
WHERE table_name = 'LICHSUDANGNHAP_PARTITIONED';

-- Monitor MV freshness
SELECT mview_name, last_refresh_date, staleness
FROM USER_MVIEWS;
```

---

## Tổng Kết

### Checklist Triển Khai

- [ ] **Backup database** trước khi thực hiện
- [ ] **Chạy script** database_optimization.sql
- [ ] **Migrate dữ liệu** sang bảng mới (partitioned, clustered)
- [ ] **Test performance** và verify data
- [ ] **Populate JSON** metadata cho các tính năng mới
- [ ] **Setup refresh schedule** cho MVs
- [ ] **Monitor** index và partition usage
- [ ] **Update application** để sử dụng bảng mới
- [ ] **Archive/drop** bảng cũ sau khi verify

### Expected Performance Improvements

| Tính Năng | Cải Thiện | Use Case |
|-----------|-----------|----------|
| **Partition** | 3-5x nhanh hơn | Truy vấn theo thời gian |
| **Cluster** | 2-3x nhanh hơn | JOIN GIAOVIEN-BOMON |
| **Materialized View** | 50-100x nhanh hơn | Báo cáo phức tạp |
| **Bitmap Index** | 10-100x nhanh hơn | Filter low-cardinality |
| **JSON Support** | Schema flexibility | Tính năng mới không cần migration |

### Best Practices

1. **Monitoring**
   - Định kỳ check partition growth
   - Monitor MV staleness
   - Review slow queries và tạo index phù hợp

2. **Maintenance**
   - Refresh MVs hàng ngày/tuần
   - Archive old partitions định kỳ
   - Update statistics: `EXEC DBMS_STATS.GATHER_SCHEMA_STATS('LUCKYBOIZ');`

3. **Development**
   - Sử dụng JSON cho metadata linh hoạt
   - Tận dụng MVs cho báo cáo
   - Test với dữ liệu lớn trước khi production

---

**Tác giả:** LuckyBoiz Team
**Ngày:** 2025-10-23
**Version:** 1.0
