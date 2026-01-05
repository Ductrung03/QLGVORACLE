-- ============================================================
-- PHASE 1: BO SUNG ORACLE OBJECTS
-- He thong Quan Ly Giao Vien - qlgvpdb
-- Ngay tao: 2026-01-04
-- Tac gia: LuckyBoiz
-- ============================================================

-- ============================================================
-- 1. VIEWS
-- ============================================================

-- -------------------------------------------------------------
-- 1.1 V_GIAOVIEN_CHITIET
-- View hien thi day du thong tin giao vien voi bo mon, khoa, hoc vi, hoc ham, chuc vu
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW V_GIAOVIEN_CHITIET AS
SELECT
    gv.MAGV,
    gv.HOTEN,
    gv.NGAYSINH,
    CASE gv.GIOITINH
        WHEN 1 THEN N'Nam'
        WHEN 0 THEN N'Nu'
        ELSE N'Khac'
    END AS GIOITINH_TEXT,
    gv.GIOITINH,
    FLOOR(MONTHS_BETWEEN(SYSDATE, gv.NGAYSINH) / 12) AS TUOI,
    gv.QUEQUAN,
    gv.DIACHI,
    gv.SDT,
    gv.EMAIL,
    gv.MABM,
    bm.TENBM,
    bm.DIACHI AS DIACHI_BM,
    bm.MAKHOA,
    k.TENKHOA,
    k.DIACHI AS DIACHI_KHOA,
    -- Hoc vi moi nhat
    (SELECT hv.MAHOCVI FROM HOCVI hv
     WHERE hv.MAGV = gv.MAGV
     AND hv.NGAYNHAN = (SELECT MAX(hv2.NGAYNHAN) FROM HOCVI hv2 WHERE hv2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS MAHOCVI,
    (SELECT hv.TENHOCVI FROM HOCVI hv
     WHERE hv.MAGV = gv.MAGV
     AND hv.NGAYNHAN = (SELECT MAX(hv2.NGAYNHAN) FROM HOCVI hv2 WHERE hv2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS TENHOCVI,
    (SELECT hv.NGAYNHAN FROM HOCVI hv
     WHERE hv.MAGV = gv.MAGV
     AND hv.NGAYNHAN = (SELECT MAX(hv2.NGAYNHAN) FROM HOCVI hv2 WHERE hv2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS NGAYNHAN_HOCVI,
    -- Hoc ham moi nhat
    (SELECT lhh.MAHOCHAM FROM LICHSUHOCHAM lhh
     WHERE lhh.MAGV = gv.MAGV
     AND lhh.NGAYNHAN = (SELECT MAX(lhh2.NGAYNHAN) FROM LICHSUHOCHAM lhh2 WHERE lhh2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS MAHOCHAM,
    (SELECT lhh.TENHOCHAM FROM LICHSUHOCHAM lhh
     WHERE lhh.MAGV = gv.MAGV
     AND lhh.NGAYNHAN = (SELECT MAX(lhh2.NGAYNHAN) FROM LICHSUHOCHAM lhh2 WHERE lhh2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS TENHOCHAM,
    (SELECT lhh.NGAYNHAN FROM LICHSUHOCHAM lhh
     WHERE lhh.MAGV = gv.MAGV
     AND lhh.NGAYNHAN = (SELECT MAX(lhh2.NGAYNHAN) FROM LICHSUHOCHAM lhh2 WHERE lhh2.MAGV = gv.MAGV)
     AND ROWNUM = 1) AS NGAYNHAN_HOCHAM,
    -- Chuc vu hien tai (chua ket thuc)
    (SELECT lscv.MACHUCVU FROM LICHSUCHUCVU lscv
     WHERE lscv.MAGV = gv.MAGV
     AND lscv.NGAYKETTHUC IS NULL
     AND ROWNUM = 1) AS MACHUCVU,
    (SELECT cv.TENCHUCVU FROM LICHSUCHUCVU lscv
     JOIN CHUCVU cv ON cv.MACHUCVU = lscv.MACHUCVU
     WHERE lscv.MAGV = gv.MAGV
     AND lscv.NGAYKETTHUC IS NULL
     AND ROWNUM = 1) AS TENCHUCVU
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_GIAOVIEN_CHITIET IS 'View hien thi day du thong tin giao vien';
/

-- -------------------------------------------------------------
-- 1.2 V_BOMON_THONGKE
-- View thong ke bo mon voi so luong giao vien
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW V_BOMON_THONGKE AS
SELECT
    bm.MABM,
    bm.TENBM,
    bm.DIACHI,
    bm.MAKHOA,
    k.TENKHOA,
    bm.MACHUNHIEMBM,
    (SELECT gv.HOTEN FROM GIAOVIEN gv WHERE TRIM(gv.MAGV) = TRIM(bm.MACHUNHIEMBM)) AS HOTEN_CHUNHIEM,
    (SELECT COUNT(*) FROM GIAOVIEN gv WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS SO_GIAOVIEN,
    (SELECT COUNT(*) FROM GIAOVIEN gv
     JOIN LICHSUHOCHAM lhh ON TRIM(lhh.MAGV) = TRIM(gv.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS SO_GV_CO_HOCHAM,
    (SELECT COUNT(DISTINCT gv.MAGV) FROM GIAOVIEN gv
     JOIN HOCVI hv ON TRIM(hv.MAGV) = TRIM(gv.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)
     AND UPPER(hv.TENHOCVI) LIKE '%TIEN SI%') AS SO_TIENSI
FROM BOMON bm
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_BOMON_THONGKE IS 'View thong ke bo mon voi so luong giao vien';
/

-- -------------------------------------------------------------
-- 1.3 V_KHOA_THONGKE
-- View thong ke khoa voi so bo mon, so giao vien
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW V_KHOA_THONGKE AS
SELECT
    k.MAKHOA,
    k.TENKHOA,
    k.DIACHI,
    k.MACHUNHIEMKHOA,
    (SELECT gv.HOTEN FROM GIAOVIEN gv WHERE TRIM(gv.MAGV) = TRIM(k.MACHUNHIEMKHOA)) AS HOTEN_CHUNHIEM,
    (SELECT COUNT(*) FROM BOMON bm WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS SO_BOMON,
    (SELECT COUNT(*) FROM GIAOVIEN gv
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS SO_GIAOVIEN,
    (SELECT COUNT(DISTINCT gv.MAGV) FROM GIAOVIEN gv
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     JOIN LICHSUHOCHAM lhh ON TRIM(lhh.MAGV) = TRIM(gv.MAGV)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS SO_GV_CO_HOCHAM,
    (SELECT COUNT(DISTINCT gv.MAGV) FROM GIAOVIEN gv
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     JOIN HOCVI hv ON TRIM(hv.MAGV) = TRIM(gv.MAGV)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)
     AND UPPER(hv.TENHOCVI) LIKE '%TIEN SI%') AS SO_TIENSI
FROM KHOA k;

COMMENT ON TABLE V_KHOA_THONGKE IS 'View thong ke khoa voi so bo mon va giao vien';
/

-- -------------------------------------------------------------
-- 1.4 V_THONGKE_TONG
-- View thong ke tong hop toan he thong
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW V_THONGKE_TONG AS
SELECT
    (SELECT COUNT(*) FROM KHOA) AS TONG_KHOA,
    (SELECT COUNT(*) FROM BOMON) AS TONG_BOMON,
    (SELECT COUNT(*) FROM GIAOVIEN) AS TONG_GIAOVIEN,
    (SELECT COUNT(*) FROM GIAOVIEN WHERE GIOITINH = 1) AS SO_GV_NAM,
    (SELECT COUNT(*) FROM GIAOVIEN WHERE GIOITINH = 0) AS SO_GV_NU,
    (SELECT COUNT(DISTINCT MAGV) FROM LICHSUHOCHAM) AS SO_GV_CO_HOCHAM,
    (SELECT COUNT(DISTINCT MAGV) FROM HOCVI WHERE UPPER(TENHOCVI) LIKE '%TIEN SI%') AS SO_TIENSI,
    (SELECT COUNT(DISTINCT MAGV) FROM HOCVI WHERE UPPER(TENHOCVI) LIKE '%THAC SI%') AS SO_THACSI,
    (SELECT COUNT(DISTINCT MAGV) FROM LICHSUCHUCVU WHERE NGAYKETTHUC IS NULL) AS SO_GV_CO_CHUCVU,
    (SELECT ROUND(AVG(MONTHS_BETWEEN(SYSDATE, NGAYSINH) / 12), 1) FROM GIAOVIEN WHERE NGAYSINH IS NOT NULL) AS TUOI_TRUNGBINH,
    (SELECT MIN(NGAYSINH) FROM GIAOVIEN WHERE NGAYSINH IS NOT NULL) AS NGAYSINH_LON_NHAT,
    (SELECT MAX(NGAYSINH) FROM GIAOVIEN WHERE NGAYSINH IS NOT NULL) AS NGAYSINH_NHO_NHAT
FROM DUAL;

COMMENT ON TABLE V_THONGKE_TONG IS 'View thong ke tong hop toan he thong';
/

-- ============================================================
-- 2. FUNCTIONS
-- ============================================================

-- -------------------------------------------------------------
-- 2.1 FN_DEM_GV_BOMON
-- Dem so giao vien trong mot bo mon
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_DEM_GV_BOMON(
    p_mabm IN CHAR
) RETURN NUMBER
IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM GIAOVIEN
    WHERE TRIM(MABM) = TRIM(p_mabm);

    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_DEM_GV_BOMON;
/

-- -------------------------------------------------------------
-- 2.2 FN_DEM_GV_KHOA
-- Dem so giao vien trong mot khoa
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_DEM_GV_KHOA(
    p_makhoa IN CHAR
) RETURN NUMBER
IS
    v_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM GIAOVIEN gv
    JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
    WHERE TRIM(bm.MAKHOA) = TRIM(p_makhoa);

    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_DEM_GV_KHOA;
/

-- -------------------------------------------------------------
-- 2.3 FN_TINH_TUOI
-- Tinh tuoi tu ngay sinh
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_TINH_TUOI(
    p_ngaysinh IN DATE
) RETURN NUMBER
IS
BEGIN
    IF p_ngaysinh IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN FLOOR(MONTHS_BETWEEN(SYSDATE, p_ngaysinh) / 12);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END FN_TINH_TUOI;
/

-- -------------------------------------------------------------
-- 2.4 FN_VALIDATE_EMAIL
-- Kiem tra email hop le
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_VALIDATE_EMAIL(
    p_email IN NVARCHAR2
) RETURN NUMBER
IS
    v_valid NUMBER := 0;
BEGIN
    IF p_email IS NULL THEN
        RETURN 0;
    END IF;

    -- Kiem tra email co dinh dang co ban: xxx@xxx.xxx
    IF REGEXP_LIKE(p_email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
        v_valid := 1;
    END IF;

    RETURN v_valid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END FN_VALIDATE_EMAIL;
/

-- ============================================================
-- 3. STORED PROCEDURES
-- ============================================================

-- -------------------------------------------------------------
-- 3.1 SP_THEM_GIAOVIEN
-- Them giao vien moi voi validation
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_THEM_GIAOVIEN(
    p_hoten       IN NVARCHAR2,
    p_ngaysinh    IN DATE DEFAULT NULL,
    p_gioitinh    IN NUMBER DEFAULT NULL,
    p_quequan     IN NVARCHAR2 DEFAULT NULL,
    p_diachi      IN NVARCHAR2 DEFAULT NULL,
    p_sdt         IN NUMBER DEFAULT NULL,
    p_email       IN NVARCHAR2 DEFAULT NULL,
    p_mabm        IN CHAR DEFAULT NULL,
    p_magv_out    OUT CHAR,
    p_status      OUT NUMBER,
    p_message     OUT NVARCHAR2
)
IS
    v_magv CHAR(15);
    v_bm_exists NUMBER := 0;
    v_email_exists NUMBER := 0;
BEGIN
    -- Khoi tao gia tri tra ve
    p_status := 0;
    p_message := N'Thanh cong';
    p_magv_out := NULL;

    -- Validation: Ho ten khong duoc rong
    IF p_hoten IS NULL OR LENGTH(TRIM(p_hoten)) = 0 THEN
        p_status := -1;
        p_message := N'Ho ten khong duoc de trong';
        RETURN;
    END IF;

    -- Validation: Kiem tra bo mon ton tai
    IF p_mabm IS NOT NULL THEN
        SELECT COUNT(*) INTO v_bm_exists FROM BOMON WHERE TRIM(MABM) = TRIM(p_mabm);
        IF v_bm_exists = 0 THEN
            p_status := -2;
            p_message := N'Bo mon khong ton tai';
            RETURN;
        END IF;
    END IF;

    -- Validation: Kiem tra email hop le va khong trung
    IF p_email IS NOT NULL THEN
        IF FN_VALIDATE_EMAIL(p_email) = 0 THEN
            p_status := -3;
            p_message := N'Email khong hop le';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_email_exists
        FROM GIAOVIEN
        WHERE UPPER(TRIM(EMAIL)) = UPPER(TRIM(p_email));

        IF v_email_exists > 0 THEN
            p_status := -4;
            p_message := N'Email da ton tai trong he thong';
            RETURN;
        END IF;
    END IF;

    -- Validation: Kiem tra gioi tinh hop le
    IF p_gioitinh IS NOT NULL AND p_gioitinh NOT IN (0, 1) THEN
        p_status := -5;
        p_message := N'Gioi tinh khong hop le (0: Nu, 1: Nam)';
        RETURN;
    END IF;

    -- Validation: Kiem tra ngay sinh hop le
    IF p_ngaysinh IS NOT NULL AND p_ngaysinh > SYSDATE THEN
        p_status := -6;
        p_message := N'Ngay sinh khong hop le';
        RETURN;
    END IF;

    -- Lay ma giao vien tiep theo tu sequence
    SELECT 'GV' || LPAD(SEQ_GIAOVIEN.NEXTVAL, 13, '0') INTO v_magv FROM DUAL;

    -- Them giao vien moi
    INSERT INTO GIAOVIEN (MAGV, HOTEN, NGAYSINH, GIOITINH, QUEQUAN, DIACHI, SDT, EMAIL, MABM)
    VALUES (v_magv, p_hoten, p_ngaysinh, p_gioitinh, p_quequan, p_diachi, p_sdt, p_email, p_mabm);

    COMMIT;

    p_magv_out := v_magv;
    p_status := 1;
    p_message := N'Them giao vien thanh cong';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := -99;
        p_message := N'Loi: ' || SQLERRM;
END SP_THEM_GIAOVIEN;
/

-- -------------------------------------------------------------
-- 3.2 SP_SUA_GIAOVIEN
-- Sua thong tin giao vien
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_SUA_GIAOVIEN(
    p_magv        IN CHAR,
    p_hoten       IN NVARCHAR2 DEFAULT NULL,
    p_ngaysinh    IN DATE DEFAULT NULL,
    p_gioitinh    IN NUMBER DEFAULT NULL,
    p_quequan     IN NVARCHAR2 DEFAULT NULL,
    p_diachi      IN NVARCHAR2 DEFAULT NULL,
    p_sdt         IN NUMBER DEFAULT NULL,
    p_email       IN NVARCHAR2 DEFAULT NULL,
    p_mabm        IN CHAR DEFAULT NULL,
    p_status      OUT NUMBER,
    p_message     OUT NVARCHAR2
)
IS
    v_gv_exists NUMBER := 0;
    v_bm_exists NUMBER := 0;
    v_email_exists NUMBER := 0;
BEGIN
    -- Khoi tao gia tri tra ve
    p_status := 0;
    p_message := N'Thanh cong';

    -- Validation: Ma giao vien khong duoc rong
    IF p_magv IS NULL OR LENGTH(TRIM(p_magv)) = 0 THEN
        p_status := -1;
        p_message := N'Ma giao vien khong duoc de trong';
        RETURN;
    END IF;

    -- Kiem tra giao vien ton tai
    SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
    IF v_gv_exists = 0 THEN
        p_status := -2;
        p_message := N'Giao vien khong ton tai';
        RETURN;
    END IF;

    -- Validation: Kiem tra bo mon ton tai
    IF p_mabm IS NOT NULL THEN
        SELECT COUNT(*) INTO v_bm_exists FROM BOMON WHERE TRIM(MABM) = TRIM(p_mabm);
        IF v_bm_exists = 0 THEN
            p_status := -3;
            p_message := N'Bo mon khong ton tai';
            RETURN;
        END IF;
    END IF;

    -- Validation: Kiem tra email hop le va khong trung (tru chinh no)
    IF p_email IS NOT NULL THEN
        IF FN_VALIDATE_EMAIL(p_email) = 0 THEN
            p_status := -4;
            p_message := N'Email khong hop le';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_email_exists
        FROM GIAOVIEN
        WHERE UPPER(TRIM(EMAIL)) = UPPER(TRIM(p_email))
        AND TRIM(MAGV) != TRIM(p_magv);

        IF v_email_exists > 0 THEN
            p_status := -5;
            p_message := N'Email da ton tai trong he thong';
            RETURN;
        END IF;
    END IF;

    -- Validation: Kiem tra gioi tinh hop le
    IF p_gioitinh IS NOT NULL AND p_gioitinh NOT IN (0, 1) THEN
        p_status := -6;
        p_message := N'Gioi tinh khong hop le (0: Nu, 1: Nam)';
        RETURN;
    END IF;

    -- Cap nhat thong tin (chi cap nhat cac truong khong NULL)
    UPDATE GIAOVIEN
    SET
        HOTEN = NVL(p_hoten, HOTEN),
        NGAYSINH = NVL(p_ngaysinh, NGAYSINH),
        GIOITINH = NVL(p_gioitinh, GIOITINH),
        QUEQUAN = NVL(p_quequan, QUEQUAN),
        DIACHI = NVL(p_diachi, DIACHI),
        SDT = NVL(p_sdt, SDT),
        EMAIL = NVL(p_email, EMAIL),
        MABM = NVL(p_mabm, MABM)
    WHERE TRIM(MAGV) = TRIM(p_magv);

    COMMIT;

    p_status := 1;
    p_message := N'Cap nhat giao vien thanh cong';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := -99;
        p_message := N'Loi: ' || SQLERRM;
END SP_SUA_GIAOVIEN;
/

-- -------------------------------------------------------------
-- 3.3 SP_XOA_GIAOVIEN
-- Xoa giao vien (kiem tra rang buoc)
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_XOA_GIAOVIEN(
    p_magv        IN CHAR,
    p_status      OUT NUMBER,
    p_message     OUT NVARCHAR2
)
IS
    v_gv_exists NUMBER := 0;
    v_is_chunhiem_bm NUMBER := 0;
    v_is_chunhiem_khoa NUMBER := 0;
    v_has_lichsu_chucvu NUMBER := 0;
    v_has_lichsu_hocham NUMBER := 0;
    v_has_hocvi NUMBER := 0;
    v_has_giangday NUMBER := 0;
    v_has_nckh NUMBER := 0;
BEGIN
    -- Khoi tao gia tri tra ve
    p_status := 0;
    p_message := N'Thanh cong';

    -- Validation: Ma giao vien khong duoc rong
    IF p_magv IS NULL OR LENGTH(TRIM(p_magv)) = 0 THEN
        p_status := -1;
        p_message := N'Ma giao vien khong duoc de trong';
        RETURN;
    END IF;

    -- Kiem tra giao vien ton tai
    SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
    IF v_gv_exists = 0 THEN
        p_status := -2;
        p_message := N'Giao vien khong ton tai';
        RETURN;
    END IF;

    -- Kiem tra rang buoc: La chu nhiem bo mon
    SELECT COUNT(*) INTO v_is_chunhiem_bm FROM BOMON WHERE TRIM(MACHUNHIEMBM) = TRIM(p_magv);
    IF v_is_chunhiem_bm > 0 THEN
        p_status := -3;
        p_message := N'Khong the xoa: Giao vien dang la chu nhiem bo mon';
        RETURN;
    END IF;

    -- Kiem tra rang buoc: La chu nhiem khoa
    SELECT COUNT(*) INTO v_is_chunhiem_khoa FROM KHOA WHERE TRIM(MACHUNHIEMKHOA) = TRIM(p_magv);
    IF v_is_chunhiem_khoa > 0 THEN
        p_status := -4;
        p_message := N'Khong the xoa: Giao vien dang la chu nhiem khoa';
        RETURN;
    END IF;

    -- Xoa cac du lieu lien quan (cascade soft)
    -- Xoa lich su chuc vu
    DELETE FROM LICHSUCHUCVU WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa lich su hoc ham
    DELETE FROM LICHSUHOCHAM WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa hoc vi
    DELETE FROM HOCVI WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa tham gia hoi dong
    DELETE FROM THAMGIA WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa tham gia huong dan
    DELETE FROM THAMGIAHUONGDAN WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa chi tiet giang day
    DELETE FROM CHITIETGIANGDAY WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa chi tiet NCKH
    DELETE FROM CHITIETNCKH WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa chi tiet khao thi
    DELETE FROM CHITIETTAIKHAOTHI WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa chi tiet cong tac khac
    DELETE FROM CHITIETCONGTACKHAC WHERE TRIM(MAGV) = TRIM(p_magv);

    -- Xoa giao vien
    DELETE FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);

    COMMIT;

    p_status := 1;
    p_message := N'Xoa giao vien thanh cong';

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := -99;
        p_message := N'Loi: ' || SQLERRM;
END SP_XOA_GIAOVIEN;
/

-- -------------------------------------------------------------
-- 3.4 SP_TIMKIEM_GIAOVIEN
-- Tim kiem giao vien theo nhieu tieu chi
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_TIMKIEM_GIAOVIEN(
    p_keyword     IN NVARCHAR2 DEFAULT NULL,
    p_mabm        IN CHAR DEFAULT NULL,
    p_makhoa      IN CHAR DEFAULT NULL,
    p_gioitinh    IN NUMBER DEFAULT NULL,
    p_cursor      OUT SYS_REFCURSOR
)
IS
    v_sql NVARCHAR2(4000);
BEGIN
    v_sql := 'SELECT * FROM V_GIAOVIEN_CHITIET WHERE 1=1';

    -- Tim theo keyword (trong ho ten, email, dia chi)
    IF p_keyword IS NOT NULL AND LENGTH(TRIM(p_keyword)) > 0 THEN
        v_sql := v_sql || ' AND (UPPER(HOTEN) LIKE ''%'' || UPPER(''' || p_keyword || ''') || ''%''';
        v_sql := v_sql || ' OR UPPER(EMAIL) LIKE ''%'' || UPPER(''' || p_keyword || ''') || ''%''';
        v_sql := v_sql || ' OR UPPER(DIACHI) LIKE ''%'' || UPPER(''' || p_keyword || ''') || ''%'')';
    END IF;

    -- Tim theo bo mon
    IF p_mabm IS NOT NULL THEN
        v_sql := v_sql || ' AND TRIM(MABM) = TRIM(''' || p_mabm || ''')';
    END IF;

    -- Tim theo khoa
    IF p_makhoa IS NOT NULL THEN
        v_sql := v_sql || ' AND TRIM(MAKHOA) = TRIM(''' || p_makhoa || ''')';
    END IF;

    -- Tim theo gioi tinh
    IF p_gioitinh IS NOT NULL THEN
        v_sql := v_sql || ' AND GIOITINH = ' || p_gioitinh;
    END IF;

    v_sql := v_sql || ' ORDER BY HOTEN';

    OPEN p_cursor FOR v_sql;

EXCEPTION
    WHEN OTHERS THEN
        OPEN p_cursor FOR SELECT * FROM V_GIAOVIEN_CHITIET WHERE 1=0;
END SP_TIMKIEM_GIAOVIEN;
/

-- -------------------------------------------------------------
-- 3.5 SP_BAOCAO_THEO_KHOA
-- Bao cao giao vien theo khoa
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_BAOCAO_THEO_KHOA(
    p_makhoa      IN CHAR DEFAULT NULL,
    p_cursor      OUT SYS_REFCURSOR
)
IS
BEGIN
    IF p_makhoa IS NOT NULL THEN
        OPEN p_cursor FOR
            SELECT
                k.MAKHOA,
                k.TENKHOA,
                bm.MABM,
                bm.TENBM,
                gv.MAGV,
                gv.HOTEN,
                gv.EMAIL,
                (SELECT hv.TENHOCVI FROM HOCVI hv
                 WHERE TRIM(hv.MAGV) = TRIM(gv.MAGV)
                 AND hv.NGAYNHAN = (SELECT MAX(hv2.NGAYNHAN) FROM HOCVI hv2 WHERE TRIM(hv2.MAGV) = TRIM(gv.MAGV))
                 AND ROWNUM = 1) AS HOCVI,
                (SELECT lhh.TENHOCHAM FROM LICHSUHOCHAM lhh
                 WHERE TRIM(lhh.MAGV) = TRIM(gv.MAGV)
                 AND lhh.NGAYNHAN = (SELECT MAX(lhh2.NGAYNHAN) FROM LICHSUHOCHAM lhh2 WHERE TRIM(lhh2.MAGV) = TRIM(gv.MAGV))
                 AND ROWNUM = 1) AS HOCHAM
            FROM KHOA k
            JOIN BOMON bm ON TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)
            LEFT JOIN GIAOVIEN gv ON TRIM(gv.MABM) = TRIM(bm.MABM)
            WHERE TRIM(k.MAKHOA) = TRIM(p_makhoa)
            ORDER BY bm.TENBM, gv.HOTEN;
    ELSE
        OPEN p_cursor FOR
            SELECT
                k.MAKHOA,
                k.TENKHOA,
                bm.MABM,
                bm.TENBM,
                gv.MAGV,
                gv.HOTEN,
                gv.EMAIL,
                (SELECT hv.TENHOCVI FROM HOCVI hv
                 WHERE TRIM(hv.MAGV) = TRIM(gv.MAGV)
                 AND hv.NGAYNHAN = (SELECT MAX(hv2.NGAYNHAN) FROM HOCVI hv2 WHERE TRIM(hv2.MAGV) = TRIM(gv.MAGV))
                 AND ROWNUM = 1) AS HOCVI,
                (SELECT lhh.TENHOCHAM FROM LICHSUHOCHAM lhh
                 WHERE TRIM(lhh.MAGV) = TRIM(gv.MAGV)
                 AND lhh.NGAYNHAN = (SELECT MAX(lhh2.NGAYNHAN) FROM LICHSUHOCHAM lhh2 WHERE TRIM(lhh2.MAGV) = TRIM(gv.MAGV))
                 AND ROWNUM = 1) AS HOCHAM
            FROM KHOA k
            JOIN BOMON bm ON TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)
            LEFT JOIN GIAOVIEN gv ON TRIM(gv.MABM) = TRIM(bm.MABM)
            ORDER BY k.TENKHOA, bm.TENBM, gv.HOTEN;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        OPEN p_cursor FOR SELECT NULL AS MAKHOA FROM DUAL WHERE 1=0;
END SP_BAOCAO_THEO_KHOA;
/

-- ============================================================
-- 4. PACKAGES
-- ============================================================

-- -------------------------------------------------------------
-- 4.1 PKG_GIAOVIEN
-- Package quan ly giao vien
-- -------------------------------------------------------------
CREATE OR REPLACE PACKAGE PKG_GIAOVIEN AS
    -- Them giao vien moi
    PROCEDURE SP_THEM(
        p_hoten       IN NVARCHAR2,
        p_ngaysinh    IN DATE DEFAULT NULL,
        p_gioitinh    IN NUMBER DEFAULT NULL,
        p_quequan     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_sdt         IN NUMBER DEFAULT NULL,
        p_email       IN NVARCHAR2 DEFAULT NULL,
        p_mabm        IN CHAR DEFAULT NULL,
        p_magv_out    OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua giao vien
    PROCEDURE SP_SUA(
        p_magv        IN CHAR,
        p_hoten       IN NVARCHAR2 DEFAULT NULL,
        p_ngaysinh    IN DATE DEFAULT NULL,
        p_gioitinh    IN NUMBER DEFAULT NULL,
        p_quequan     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_sdt         IN NUMBER DEFAULT NULL,
        p_email       IN NVARCHAR2 DEFAULT NULL,
        p_mabm        IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa giao vien
    PROCEDURE SP_XOA(
        p_magv        IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay danh sach giao vien
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Dem so giao vien
    FUNCTION FN_DEM RETURN NUMBER;

    -- Lay thong tin giao vien theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_GIAOVIEN;
/

CREATE OR REPLACE PACKAGE BODY PKG_GIAOVIEN AS

    PROCEDURE SP_THEM(
        p_hoten       IN NVARCHAR2,
        p_ngaysinh    IN DATE DEFAULT NULL,
        p_gioitinh    IN NUMBER DEFAULT NULL,
        p_quequan     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_sdt         IN NUMBER DEFAULT NULL,
        p_email       IN NVARCHAR2 DEFAULT NULL,
        p_mabm        IN CHAR DEFAULT NULL,
        p_magv_out    OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
    BEGIN
        SP_THEM_GIAOVIEN(
            p_hoten, p_ngaysinh, p_gioitinh, p_quequan,
            p_diachi, p_sdt, p_email, p_mabm,
            p_magv_out, p_status, p_message
        );
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_magv        IN CHAR,
        p_hoten       IN NVARCHAR2 DEFAULT NULL,
        p_ngaysinh    IN DATE DEFAULT NULL,
        p_gioitinh    IN NUMBER DEFAULT NULL,
        p_quequan     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_sdt         IN NUMBER DEFAULT NULL,
        p_email       IN NVARCHAR2 DEFAULT NULL,
        p_mabm        IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
    BEGIN
        SP_SUA_GIAOVIEN(
            p_magv, p_hoten, p_ngaysinh, p_gioitinh,
            p_quequan, p_diachi, p_sdt, p_email, p_mabm,
            p_status, p_message
        );
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_magv        IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
    BEGIN
        SP_XOA_GIAOVIEN(p_magv, p_status, p_message);
    END SP_XOA;

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_GIAOVIEN_CHITIET ORDER BY HOTEN;
    END SP_LAYDS;

    FUNCTION FN_DEM RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM GIAOVIEN;
        RETURN v_count;
    END FN_DEM;

    PROCEDURE SP_LAYTHEOMA(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_GIAOVIEN_CHITIET
            WHERE TRIM(MAGV) = TRIM(p_magv);
    END SP_LAYTHEOMA;

END PKG_GIAOVIEN;
/

-- -------------------------------------------------------------
-- 4.2 PKG_THONGKE
-- Package thong ke
-- -------------------------------------------------------------
CREATE OR REPLACE PACKAGE PKG_THONGKE AS
    -- Thong ke theo khoa
    PROCEDURE SP_THONGKE_KHOA(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Thong ke theo bo mon
    PROCEDURE SP_THONGKE_BOMON(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Tong so giao vien
    FUNCTION FN_TONG_GV RETURN NUMBER;

    -- Tong so khoa
    FUNCTION FN_TONG_KHOA RETURN NUMBER;

    -- Tong so bo mon
    FUNCTION FN_TONG_BOMON RETURN NUMBER;

    -- Thong ke tong hop
    PROCEDURE SP_THONGKE_TONG(
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_THONGKE;
/

CREATE OR REPLACE PACKAGE BODY PKG_THONGKE AS

    PROCEDURE SP_THONGKE_KHOA(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_KHOA_THONGKE ORDER BY TENKHOA;
    END SP_THONGKE_KHOA;

    PROCEDURE SP_THONGKE_BOMON(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_BOMON_THONGKE ORDER BY TENBM;
    END SP_THONGKE_BOMON;

    FUNCTION FN_TONG_GV RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM GIAOVIEN;
        RETURN v_count;
    END FN_TONG_GV;

    FUNCTION FN_TONG_KHOA RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM KHOA;
        RETURN v_count;
    END FN_TONG_KHOA;

    FUNCTION FN_TONG_BOMON RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM BOMON;
        RETURN v_count;
    END FN_TONG_BOMON;

    PROCEDURE SP_THONGKE_TONG(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_THONGKE_TONG;
    END SP_THONGKE_TONG;

END PKG_THONGKE;
/

-- ============================================================
-- 5. GRANT PRIVILEGES (neu can)
-- ============================================================

-- Grant execute cho cac procedure va function
-- GRANT EXECUTE ON SP_THEM_GIAOVIEN TO PUBLIC;
-- GRANT EXECUTE ON SP_SUA_GIAOVIEN TO PUBLIC;
-- GRANT EXECUTE ON SP_XOA_GIAOVIEN TO PUBLIC;
-- GRANT EXECUTE ON SP_TIMKIEM_GIAOVIEN TO PUBLIC;
-- GRANT EXECUTE ON SP_BAOCAO_THEO_KHOA TO PUBLIC;
-- GRANT EXECUTE ON FN_DEM_GV_BOMON TO PUBLIC;
-- GRANT EXECUTE ON FN_DEM_GV_KHOA TO PUBLIC;
-- GRANT EXECUTE ON FN_TINH_TUOI TO PUBLIC;
-- GRANT EXECUTE ON FN_VALIDATE_EMAIL TO PUBLIC;
-- GRANT EXECUTE ON PKG_GIAOVIEN TO PUBLIC;
-- GRANT EXECUTE ON PKG_THONGKE TO PUBLIC;

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- Kiem tra cac Views da tao
-- SELECT view_name FROM user_views WHERE view_name LIKE 'V_%';

-- Kiem tra cac Procedures da tao
-- SELECT object_name FROM user_procedures WHERE object_type = 'PROCEDURE';

-- Kiem tra cac Functions da tao
-- SELECT object_name FROM user_procedures WHERE object_type = 'FUNCTION';

-- Kiem tra cac Packages da tao
-- SELECT object_name FROM user_objects WHERE object_type = 'PACKAGE';

-- ============================================================
-- END OF PHASE 1 SCRIPT
-- ============================================================
