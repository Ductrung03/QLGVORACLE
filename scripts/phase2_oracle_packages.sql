-- ============================================================
-- PHASE 2: TAO ORACLE PACKAGES MOI
-- He thong Quan Ly Giao Vien - qlgvpdb
-- Ngay tao: 2026-01-04
-- Tac gia: LuckyBoiz
-- ============================================================

-- ============================================================
-- 1. SEQUENCES MOI (neu chua co)
-- ============================================================

-- Sequence cho Chuc vu
CREATE SEQUENCE SEQ_CHUCVU START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Hoc ham
CREATE SEQUENCE SEQ_HOCHAM START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Hoc vi
CREATE SEQUENCE SEQ_HOCVI START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Lich su chuc vu
CREATE SEQUENCE SEQ_LICHSUCHUCVU START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Lich su hoc ham
CREATE SEQUENCE SEQ_LICHSUHOCHAM START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Tai giang day
CREATE SEQUENCE SEQ_TAIGIANGDAY START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Chi tiet giang day
CREATE SEQUENCE SEQ_CHITIETGIANGDAY START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Tai NCKH
CREATE SEQUENCE SEQ_TAINCKH START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Chi tiet NCKH
CREATE SEQUENCE SEQ_CHITIETNCKH START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Tai khao thi
CREATE SEQUENCE SEQ_TAIKHAOTHI START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Chi tiet khao thi
CREATE SEQUENCE SEQ_CHITIETTAIKHAOTHI START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Hoi dong
CREATE SEQUENCE SEQ_HOIDONG START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Tham gia hoi dong
CREATE SEQUENCE SEQ_THAMGIA START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Huong dan
CREATE SEQUENCE SEQ_HUONGDAN START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Tham gia huong dan
CREATE SEQUENCE SEQ_THAMGIAHUONGDAN START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Cong tac khac
CREATE SEQUENCE SEQ_CONGTACKHAC START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- Sequence cho Chi tiet cong tac khac
CREATE SEQUENCE SEQ_CHITIETCONGTACKHAC START WITH 100 INCREMENT BY 1 NOCACHE NOCYCLE;
/

-- ============================================================
-- 2. PKG_BOMON - Package quan ly Bo mon
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_BOMON AS
    -- Lay danh sach bo mon
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay bo mon theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mabm        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them bo mon moi
    PROCEDURE SP_THEM(
        p_tenbm       IN NVARCHAR2,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_makhoa      IN CHAR DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_mabm_out    OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua bo mon
    PROCEDURE SP_SUA(
        p_mabm        IN CHAR,
        p_tenbm       IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_makhoa      IN CHAR DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa bo mon
    PROCEDURE SP_XOA(
        p_mabm        IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Dem so giao vien trong bo mon
    FUNCTION FN_DEM_GV(p_mabm IN CHAR) RETURN NUMBER;

END PKG_BOMON;
/

CREATE OR REPLACE PACKAGE BODY PKG_BOMON AS

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_BOMON_THONGKE ORDER BY TENBM;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mabm        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_BOMON_THONGKE
            WHERE TRIM(MABM) = TRIM(p_mabm);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tenbm       IN NVARCHAR2,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_makhoa      IN CHAR DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_mabm_out    OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mabm CHAR(15);
        v_khoa_exists NUMBER := 0;
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mabm_out := NULL;

        -- Validation: Ten bo mon khong duoc rong
        IF p_tenbm IS NULL OR LENGTH(TRIM(p_tenbm)) = 0 THEN
            p_status := -1;
            p_message := N'Ten bo mon khong duoc de trong';
            RETURN;
        END IF;

        -- Kiem tra khoa ton tai
        IF p_makhoa IS NOT NULL THEN
            SELECT COUNT(*) INTO v_khoa_exists FROM KHOA WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
            IF v_khoa_exists = 0 THEN
                p_status := -2;
                p_message := N'Khoa khong ton tai';
                RETURN;
            END IF;
        END IF;

        -- Kiem tra chu nhiem ton tai
        IF p_machunhiem IS NOT NULL THEN
            SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_machunhiem);
            IF v_gv_exists = 0 THEN
                p_status := -3;
                p_message := N'Giao vien (chu nhiem) khong ton tai';
                RETURN;
            END IF;
        END IF;

        -- Tao ma bo mon moi
        SELECT 'BM' || LPAD(SEQ_BOMON.NEXTVAL, 13, '0') INTO v_mabm FROM DUAL;

        INSERT INTO BOMON (MABM, TENBM, DIACHI, MAKHOA, MACHUNHIEMBM)
        VALUES (v_mabm, p_tenbm, p_diachi, p_makhoa, p_machunhiem);

        COMMIT;

        p_mabm_out := v_mabm;
        p_status := 1;
        p_message := N'Them bo mon thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mabm        IN CHAR,
        p_tenbm       IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_makhoa      IN CHAR DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_bm_exists NUMBER := 0;
        v_khoa_exists NUMBER := 0;
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra bo mon ton tai
        SELECT COUNT(*) INTO v_bm_exists FROM BOMON WHERE TRIM(MABM) = TRIM(p_mabm);
        IF v_bm_exists = 0 THEN
            p_status := -1;
            p_message := N'Bo mon khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra khoa ton tai
        IF p_makhoa IS NOT NULL THEN
            SELECT COUNT(*) INTO v_khoa_exists FROM KHOA WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
            IF v_khoa_exists = 0 THEN
                p_status := -2;
                p_message := N'Khoa khong ton tai';
                RETURN;
            END IF;
        END IF;

        -- Kiem tra chu nhiem ton tai
        IF p_machunhiem IS NOT NULL THEN
            SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_machunhiem);
            IF v_gv_exists = 0 THEN
                p_status := -3;
                p_message := N'Giao vien (chu nhiem) khong ton tai';
                RETURN;
            END IF;
        END IF;

        UPDATE BOMON
        SET
            TENBM = NVL(p_tenbm, TENBM),
            DIACHI = NVL(p_diachi, DIACHI),
            MAKHOA = NVL(p_makhoa, MAKHOA),
            MACHUNHIEMBM = NVL(p_machunhiem, MACHUNHIEMBM)
        WHERE TRIM(MABM) = TRIM(p_mabm);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat bo mon thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mabm        IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_bm_exists NUMBER := 0;
        v_gv_count NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra bo mon ton tai
        SELECT COUNT(*) INTO v_bm_exists FROM BOMON WHERE TRIM(MABM) = TRIM(p_mabm);
        IF v_bm_exists = 0 THEN
            p_status := -1;
            p_message := N'Bo mon khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra co giao vien trong bo mon khong
        SELECT COUNT(*) INTO v_gv_count FROM GIAOVIEN WHERE TRIM(MABM) = TRIM(p_mabm);
        IF v_gv_count > 0 THEN
            p_status := -2;
            p_message := N'Khong the xoa: Bo mon con ' || v_gv_count || N' giao vien';
            RETURN;
        END IF;

        DELETE FROM BOMON WHERE TRIM(MABM) = TRIM(p_mabm);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa bo mon thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    FUNCTION FN_DEM_GV(p_mabm IN CHAR) RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM GIAOVIEN WHERE TRIM(MABM) = TRIM(p_mabm);
        RETURN v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 0;
    END FN_DEM_GV;

END PKG_BOMON;
/

-- ============================================================
-- 3. PKG_KHOA - Package quan ly Khoa
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_KHOA AS
    -- Lay danh sach khoa
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay khoa theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_makhoa      IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them khoa moi
    PROCEDURE SP_THEM(
        p_tenkhoa     IN NVARCHAR2,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_makhoa_out  OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua khoa
    PROCEDURE SP_SUA(
        p_makhoa      IN CHAR,
        p_tenkhoa     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa khoa
    PROCEDURE SP_XOA(
        p_makhoa      IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Dem so bo mon trong khoa
    FUNCTION FN_DEM_BM(p_makhoa IN CHAR) RETURN NUMBER;

    -- Dem so giao vien trong khoa
    FUNCTION FN_DEM_GV(p_makhoa IN CHAR) RETURN NUMBER;

END PKG_KHOA;
/

CREATE OR REPLACE PACKAGE BODY PKG_KHOA AS

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_KHOA_THONGKE ORDER BY TENKHOA;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_makhoa      IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM V_KHOA_THONGKE
            WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tenkhoa     IN NVARCHAR2,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_makhoa_out  OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_makhoa CHAR(15);
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_makhoa_out := NULL;

        -- Validation: Ten khoa khong duoc rong
        IF p_tenkhoa IS NULL OR LENGTH(TRIM(p_tenkhoa)) = 0 THEN
            p_status := -1;
            p_message := N'Ten khoa khong duoc de trong';
            RETURN;
        END IF;

        -- Kiem tra chu nhiem ton tai
        IF p_machunhiem IS NOT NULL THEN
            SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_machunhiem);
            IF v_gv_exists = 0 THEN
                p_status := -2;
                p_message := N'Giao vien (chu nhiem) khong ton tai';
                RETURN;
            END IF;
        END IF;

        -- Tao ma khoa moi
        SELECT 'K' || LPAD(SEQ_KHOA.NEXTVAL, 14, '0') INTO v_makhoa FROM DUAL;

        INSERT INTO KHOA (MAKHOA, TENKHOA, DIACHI, MACHUNHIEMKHOA)
        VALUES (v_makhoa, p_tenkhoa, p_diachi, p_machunhiem);

        COMMIT;

        p_makhoa_out := v_makhoa;
        p_status := 1;
        p_message := N'Them khoa thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_makhoa      IN CHAR,
        p_tenkhoa     IN NVARCHAR2 DEFAULT NULL,
        p_diachi      IN NVARCHAR2 DEFAULT NULL,
        p_machunhiem  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_khoa_exists NUMBER := 0;
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra khoa ton tai
        SELECT COUNT(*) INTO v_khoa_exists FROM KHOA WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
        IF v_khoa_exists = 0 THEN
            p_status := -1;
            p_message := N'Khoa khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra chu nhiem ton tai
        IF p_machunhiem IS NOT NULL THEN
            SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_machunhiem);
            IF v_gv_exists = 0 THEN
                p_status := -2;
                p_message := N'Giao vien (chu nhiem) khong ton tai';
                RETURN;
            END IF;
        END IF;

        UPDATE KHOA
        SET
            TENKHOA = NVL(p_tenkhoa, TENKHOA),
            DIACHI = NVL(p_diachi, DIACHI),
            MACHUNHIEMKHOA = NVL(p_machunhiem, MACHUNHIEMKHOA)
        WHERE TRIM(MAKHOA) = TRIM(p_makhoa);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat khoa thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_makhoa      IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_khoa_exists NUMBER := 0;
        v_bm_count NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra khoa ton tai
        SELECT COUNT(*) INTO v_khoa_exists FROM KHOA WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
        IF v_khoa_exists = 0 THEN
            p_status := -1;
            p_message := N'Khoa khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra co bo mon trong khoa khong
        SELECT COUNT(*) INTO v_bm_count FROM BOMON WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
        IF v_bm_count > 0 THEN
            p_status := -2;
            p_message := N'Khong the xoa: Khoa con ' || v_bm_count || N' bo mon';
            RETURN;
        END IF;

        DELETE FROM KHOA WHERE TRIM(MAKHOA) = TRIM(p_makhoa);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa khoa thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    FUNCTION FN_DEM_BM(p_makhoa IN CHAR) RETURN NUMBER IS
        v_count NUMBER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM BOMON WHERE TRIM(MAKHOA) = TRIM(p_makhoa);
        RETURN v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 0;
    END FN_DEM_BM;

    FUNCTION FN_DEM_GV(p_makhoa IN CHAR) RETURN NUMBER IS
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
    END FN_DEM_GV;

END PKG_KHOA;
/

-- ============================================================
-- 4. PKG_CHUCVU - Package quan ly Chuc vu
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_CHUCVU AS
    -- Lay danh sach chuc vu
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay chuc vu theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_machucvu    IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them chuc vu moi
    PROCEDURE SP_THEM(
        p_tenchucvu   IN NVARCHAR2,
        p_mota        IN NVARCHAR2 DEFAULT NULL,
        p_madinhmuc   IN CHAR DEFAULT NULL,
        p_machucvu_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua chuc vu
    PROCEDURE SP_SUA(
        p_machucvu    IN CHAR,
        p_tenchucvu   IN NVARCHAR2 DEFAULT NULL,
        p_mota        IN NVARCHAR2 DEFAULT NULL,
        p_madinhmuc   IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa chuc vu
    PROCEDURE SP_XOA(
        p_machucvu    IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Gan chuc vu cho giao vien
    PROCEDURE SP_GAN_CHUCVU(
        p_magv        IN CHAR,
        p_machucvu    IN CHAR,
        p_ngaynhan    IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Ket thuc chuc vu cua giao vien
    PROCEDURE SP_KETTHUC_CHUCVU(
        p_magv        IN CHAR,
        p_machucvu    IN CHAR,
        p_ngayketthuc IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

END PKG_CHUCVU;
/

CREATE OR REPLACE PACKAGE BODY PKG_CHUCVU AS

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                cv.MACHUCVU,
                cv.TENCHUCVU,
                cv.MOTA,
                cv.MADINHMUCMIENGIAM,
                (SELECT COUNT(*) FROM LICHSUCHUCVU lscv
                 WHERE TRIM(lscv.MACHUCVU) = TRIM(cv.MACHUCVU)
                 AND lscv.NGAYKETTHUC IS NULL) AS SO_GV_DANG_GIU
            FROM CHUCVU cv
            ORDER BY cv.TENCHUCVU;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_machucvu    IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                cv.MACHUCVU,
                cv.TENCHUCVU,
                cv.MOTA,
                cv.MADINHMUCMIENGIAM,
                (SELECT COUNT(*) FROM LICHSUCHUCVU lscv
                 WHERE TRIM(lscv.MACHUCVU) = TRIM(cv.MACHUCVU)
                 AND lscv.NGAYKETTHUC IS NULL) AS SO_GV_DANG_GIU
            FROM CHUCVU cv
            WHERE TRIM(cv.MACHUCVU) = TRIM(p_machucvu);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tenchucvu   IN NVARCHAR2,
        p_mota        IN NVARCHAR2 DEFAULT NULL,
        p_madinhmuc   IN CHAR DEFAULT NULL,
        p_machucvu_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_machucvu CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_machucvu_out := NULL;

        -- Validation
        IF p_tenchucvu IS NULL OR LENGTH(TRIM(p_tenchucvu)) = 0 THEN
            p_status := -1;
            p_message := N'Ten chuc vu khong duoc de trong';
            RETURN;
        END IF;

        -- Tao ma chuc vu moi
        SELECT 'CV' || LPAD(SEQ_CHUCVU.NEXTVAL, 13, '0') INTO v_machucvu FROM DUAL;

        INSERT INTO CHUCVU (MACHUCVU, TENCHUCVU, MOTA, MADINHMUCMIENGIAM)
        VALUES (v_machucvu, p_tenchucvu, p_mota, p_madinhmuc);

        COMMIT;

        p_machucvu_out := v_machucvu;
        p_status := 1;
        p_message := N'Them chuc vu thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_machucvu    IN CHAR,
        p_tenchucvu   IN NVARCHAR2 DEFAULT NULL,
        p_mota        IN NVARCHAR2 DEFAULT NULL,
        p_madinhmuc   IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM CHUCVU WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Chuc vu khong ton tai';
            RETURN;
        END IF;

        UPDATE CHUCVU
        SET
            TENCHUCVU = NVL(p_tenchucvu, TENCHUCVU),
            MOTA = NVL(p_mota, MOTA),
            MADINHMUCMIENGIAM = NVL(p_madinhmuc, MADINHMUCMIENGIAM)
        WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat chuc vu thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_machucvu    IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
        v_used NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM CHUCVU WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Chuc vu khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_used FROM LICHSUCHUCVU WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);
        IF v_used > 0 THEN
            p_status := -2;
            p_message := N'Khong the xoa: Chuc vu dang duoc su dung';
            RETURN;
        END IF;

        DELETE FROM CHUCVU WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa chuc vu thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_GAN_CHUCVU(
        p_magv        IN CHAR,
        p_machucvu    IN CHAR,
        p_ngaynhan    IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_cv_exists NUMBER := 0;
        v_already_has NUMBER := 0;
        v_mals CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra giao vien ton tai
        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra chuc vu ton tai
        SELECT COUNT(*) INTO v_cv_exists FROM CHUCVU WHERE TRIM(MACHUCVU) = TRIM(p_machucvu);
        IF v_cv_exists = 0 THEN
            p_status := -2;
            p_message := N'Chuc vu khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra giao vien da co chuc vu nay chua (chua ket thuc)
        SELECT COUNT(*) INTO v_already_has
        FROM LICHSUCHUCVU
        WHERE TRIM(MAGV) = TRIM(p_magv)
        AND TRIM(MACHUCVU) = TRIM(p_machucvu)
        AND NGAYKETTHUC IS NULL;

        IF v_already_has > 0 THEN
            p_status := -3;
            p_message := N'Giao vien da dang giu chuc vu nay';
            RETURN;
        END IF;

        -- Tao ma lich su chuc vu moi
        SELECT 'LSCV' || LPAD(SEQ_LICHSUCHUCVU.NEXTVAL, 11, '0') INTO v_mals FROM DUAL;

        INSERT INTO LICHSUCHUCVU (MALICHSUCHUCVU, NGAYNHAN, NGAYKETTHUC, MAGV, MACHUCVU)
        VALUES (v_mals, p_ngaynhan, NULL, p_magv, p_machucvu);

        COMMIT;

        p_status := 1;
        p_message := N'Gan chuc vu thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_GAN_CHUCVU;

    PROCEDURE SP_KETTHUC_CHUCVU(
        p_magv        IN CHAR,
        p_machucvu    IN CHAR,
        p_ngayketthuc IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        -- Kiem tra lich su chuc vu ton tai va chua ket thuc
        SELECT COUNT(*) INTO v_exists
        FROM LICHSUCHUCVU
        WHERE TRIM(MAGV) = TRIM(p_magv)
        AND TRIM(MACHUCVU) = TRIM(p_machucvu)
        AND NGAYKETTHUC IS NULL;

        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong dang giu chuc vu nay';
            RETURN;
        END IF;

        UPDATE LICHSUCHUCVU
        SET NGAYKETTHUC = p_ngayketthuc
        WHERE TRIM(MAGV) = TRIM(p_magv)
        AND TRIM(MACHUCVU) = TRIM(p_machucvu)
        AND NGAYKETTHUC IS NULL;

        COMMIT;

        p_status := 1;
        p_message := N'Ket thuc chuc vu thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_KETTHUC_CHUCVU;

END PKG_CHUCVU;
/

-- ============================================================
-- 5. PKG_HOCHAM - Package quan ly Hoc ham
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_HOCHAM AS
    -- Lay danh sach hoc ham
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay hoc ham theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mahocham    IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them hoc ham moi
    PROCEDURE SP_THEM(
        p_tenhocham   IN NVARCHAR2,
        p_madinhmucnc IN CHAR DEFAULT NULL,
        p_madinhmucgd IN CHAR DEFAULT NULL,
        p_mahocham_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua hoc ham
    PROCEDURE SP_SUA(
        p_mahocham    IN CHAR,
        p_tenhocham   IN NVARCHAR2 DEFAULT NULL,
        p_madinhmucnc IN CHAR DEFAULT NULL,
        p_madinhmucgd IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa hoc ham
    PROCEDURE SP_XOA(
        p_mahocham    IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Gan hoc ham cho giao vien
    PROCEDURE SP_GAN_HOCHAM(
        p_magv        IN CHAR,
        p_mahocham    IN CHAR,
        p_tenhocham   IN NVARCHAR2,
        p_ngaynhan    IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay lich su hoc ham cua giao vien
    PROCEDURE SP_LICHSU_GV(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_HOCHAM;
/

CREATE OR REPLACE PACKAGE BODY PKG_HOCHAM AS

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hh.MAHOCHAM,
                hh.TENHOCHAM,
                hh.MADINHMUCNGHIENCUU,
                hh.MADINHMUCGIANGDAY,
                (SELECT COUNT(DISTINCT MAGV) FROM LICHSUHOCHAM lhh
                 WHERE TRIM(lhh.MAHOCHAM) = TRIM(hh.MAHOCHAM)) AS SO_GV
            FROM HOCHAM hh
            ORDER BY hh.TENHOCHAM;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mahocham    IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hh.MAHOCHAM,
                hh.TENHOCHAM,
                hh.MADINHMUCNGHIENCUU,
                hh.MADINHMUCGIANGDAY,
                (SELECT COUNT(DISTINCT MAGV) FROM LICHSUHOCHAM lhh
                 WHERE TRIM(lhh.MAHOCHAM) = TRIM(hh.MAHOCHAM)) AS SO_GV
            FROM HOCHAM hh
            WHERE TRIM(hh.MAHOCHAM) = TRIM(p_mahocham);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tenhocham   IN NVARCHAR2,
        p_madinhmucnc IN CHAR DEFAULT NULL,
        p_madinhmucgd IN CHAR DEFAULT NULL,
        p_mahocham_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mahocham CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mahocham_out := NULL;

        IF p_tenhocham IS NULL OR LENGTH(TRIM(p_tenhocham)) = 0 THEN
            p_status := -1;
            p_message := N'Ten hoc ham khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'HH' || LPAD(SEQ_HOCHAM.NEXTVAL, 13, '0') INTO v_mahocham FROM DUAL;

        INSERT INTO HOCHAM (MAHOCHAM, TENHOCHAM, MADINHMUCNGHIENCUU, MADINHMUCGIANGDAY)
        VALUES (v_mahocham, p_tenhocham, p_madinhmucnc, p_madinhmucgd);

        COMMIT;

        p_mahocham_out := v_mahocham;
        p_status := 1;
        p_message := N'Them hoc ham thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mahocham    IN CHAR,
        p_tenhocham   IN NVARCHAR2 DEFAULT NULL,
        p_madinhmucnc IN CHAR DEFAULT NULL,
        p_madinhmucgd IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoc ham khong ton tai';
            RETURN;
        END IF;

        UPDATE HOCHAM
        SET
            TENHOCHAM = NVL(p_tenhocham, TENHOCHAM),
            MADINHMUCNGHIENCUU = NVL(p_madinhmucnc, MADINHMUCNGHIENCUU),
            MADINHMUCGIANGDAY = NVL(p_madinhmucgd, MADINHMUCGIANGDAY)
        WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat hoc ham thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mahocham    IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
        v_used NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoc ham khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_used FROM LICHSUHOCHAM WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);
        IF v_used > 0 THEN
            p_status := -2;
            p_message := N'Khong the xoa: Hoc ham dang duoc su dung';
            RETURN;
        END IF;

        DELETE FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa hoc ham thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_GAN_HOCHAM(
        p_magv        IN CHAR,
        p_mahocham    IN CHAR,
        p_tenhocham   IN NVARCHAR2,
        p_ngaynhan    IN DATE DEFAULT SYSDATE,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_hh_exists NUMBER := 0;
        v_mals CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_hh_exists FROM HOCHAM WHERE TRIM(MAHOCHAM) = TRIM(p_mahocham);
        IF v_hh_exists = 0 THEN
            p_status := -2;
            p_message := N'Hoc ham khong ton tai';
            RETURN;
        END IF;

        SELECT 'LSHH' || LPAD(SEQ_LICHSUHOCHAM.NEXTVAL, 11, '0') INTO v_mals FROM DUAL;

        INSERT INTO LICHSUHOCHAM (MALSHOCHAM, TENHOCHAM, NGAYNHAN, MAGV, MAHOCHAM)
        VALUES (v_mals, p_tenhocham, p_ngaynhan, p_magv, p_mahocham);

        COMMIT;

        p_status := 1;
        p_message := N'Gan hoc ham thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_GAN_HOCHAM;

    PROCEDURE SP_LICHSU_GV(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                lhh.MALSHOCHAM,
                lhh.TENHOCHAM,
                lhh.NGAYNHAN,
                lhh.MAHOCHAM,
                hh.TENHOCHAM AS TENHOCHAM_GOC
            FROM LICHSUHOCHAM lhh
            LEFT JOIN HOCHAM hh ON TRIM(hh.MAHOCHAM) = TRIM(lhh.MAHOCHAM)
            WHERE TRIM(lhh.MAGV) = TRIM(p_magv)
            ORDER BY lhh.NGAYNHAN DESC;
    END SP_LICHSU_GV;

END PKG_HOCHAM;
/

-- ============================================================
-- 6. PKG_HOCVI - Package quan ly Hoc vi
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_HOCVI AS
    -- Lay danh sach hoc vi theo giao vien
    PROCEDURE SP_LAYDS_GV(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay tat ca hoc vi
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them hoc vi cho giao vien
    PROCEDURE SP_THEM(
        p_tenhocvi    IN NVARCHAR2,
        p_ngaynhan    IN DATE,
        p_magv        IN CHAR,
        p_mahocvi_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua hoc vi
    PROCEDURE SP_SUA(
        p_mahocvi     IN CHAR,
        p_tenhocvi    IN NVARCHAR2 DEFAULT NULL,
        p_ngaynhan    IN DATE DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa hoc vi
    PROCEDURE SP_XOA(
        p_mahocvi     IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

END PKG_HOCVI;
/

CREATE OR REPLACE PACKAGE BODY PKG_HOCVI AS

    PROCEDURE SP_LAYDS_GV(
        p_magv        IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hv.MAHOCVI,
                hv.TENHOCVI,
                hv.NGAYNHAN,
                hv.MAGV,
                gv.HOTEN
            FROM HOCVI hv
            JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(hv.MAGV)
            WHERE TRIM(hv.MAGV) = TRIM(p_magv)
            ORDER BY hv.NGAYNHAN DESC;
    END SP_LAYDS_GV;

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hv.MAHOCVI,
                hv.TENHOCVI,
                hv.NGAYNHAN,
                hv.MAGV,
                gv.HOTEN
            FROM HOCVI hv
            JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(hv.MAGV)
            ORDER BY gv.HOTEN, hv.NGAYNHAN DESC;
    END SP_LAYDS;

    PROCEDURE SP_THEM(
        p_tenhocvi    IN NVARCHAR2,
        p_ngaynhan    IN DATE,
        p_magv        IN CHAR,
        p_mahocvi_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mahocvi CHAR(15);
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mahocvi_out := NULL;

        IF p_tenhocvi IS NULL OR LENGTH(TRIM(p_tenhocvi)) = 0 THEN
            p_status := -1;
            p_message := N'Ten hoc vi khong duoc de trong';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -2;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT 'HV' || LPAD(SEQ_HOCVI.NEXTVAL, 13, '0') INTO v_mahocvi FROM DUAL;

        INSERT INTO HOCVI (MAHOCVI, TENHOCVI, NGAYNHAN, MAGV)
        VALUES (v_mahocvi, p_tenhocvi, p_ngaynhan, p_magv);

        COMMIT;

        p_mahocvi_out := v_mahocvi;
        p_status := 1;
        p_message := N'Them hoc vi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mahocvi     IN CHAR,
        p_tenhocvi    IN NVARCHAR2 DEFAULT NULL,
        p_ngaynhan    IN DATE DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM HOCVI WHERE TRIM(MAHOCVI) = TRIM(p_mahocvi);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoc vi khong ton tai';
            RETURN;
        END IF;

        UPDATE HOCVI
        SET
            TENHOCVI = NVL(p_tenhocvi, TENHOCVI),
            NGAYNHAN = NVL(p_ngaynhan, NGAYNHAN)
        WHERE TRIM(MAHOCVI) = TRIM(p_mahocvi);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat hoc vi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mahocvi     IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM HOCVI WHERE TRIM(MAHOCVI) = TRIM(p_mahocvi);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoc vi khong ton tai';
            RETURN;
        END IF;

        DELETE FROM HOCVI WHERE TRIM(MAHOCVI) = TRIM(p_mahocvi);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa hoc vi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

END PKG_HOCVI;
/

-- ============================================================
-- 7. PKG_GIANGDAY - Package quan ly Giang day
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_GIANGDAY AS
    -- Lay danh sach tai giang day
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay tai giang day theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mataigiangday IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them tai giang day
    PROCEDURE SP_THEM(
        p_tenhocphan  IN NVARCHAR2,
        p_siso        IN NUMBER DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_sotinchi    IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_madoituong  IN CHAR DEFAULT NULL,
        p_mathoigian  IN CHAR DEFAULT NULL,
        p_mangonngu   IN CHAR DEFAULT NULL,
        p_matgd_out   OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua tai giang day
    PROCEDURE SP_SUA(
        p_mataigiangday IN CHAR,
        p_tenhocphan  IN NVARCHAR2 DEFAULT NULL,
        p_siso        IN NUMBER DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_sotinchi    IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa tai giang day
    PROCEDURE SP_XOA(
        p_mataigiangday IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Phan cong giang day cho giao vien
    PROCEDURE SP_PHANCONG(
        p_magv        IN CHAR,
        p_mataigiangday IN CHAR,
        p_sotiet      IN NUMBER,
        p_sotietquydoi IN NUMBER DEFAULT NULL,
        p_noidung     IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay chi tiet giang day theo giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_GIANGDAY;
/

CREATE OR REPLACE PACKAGE BODY PKG_GIANGDAY AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    tgd.MATAIGIANGDAY,
                    tgd.TENHOCPHAN,
                    tgd.SISO,
                    tgd.HE,
                    tgd.LOP,
                    tgd.SOTINCHI,
                    tgd.GHICHU,
                    tgd.NAMHOC,
                    tgd.MADOITUONG,
                    tgd.MATHOIGIAN,
                    tgd.MANGONNGU,
                    (SELECT COUNT(*) FROM CHITIETGIANGDAY ctgd
                     WHERE TRIM(ctgd.MATAIGIANGDAY) = TRIM(tgd.MATAIGIANGDAY)) AS SO_GV_PHANCONG,
                    (SELECT SUM(ctgd.SOTIET) FROM CHITIETGIANGDAY ctgd
                     WHERE TRIM(ctgd.MATAIGIANGDAY) = TRIM(tgd.MATAIGIANGDAY)) AS TONG_SOTIET
                FROM TAIGIANGDAY tgd
                WHERE TRIM(tgd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tgd.TENHOCPHAN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    tgd.MATAIGIANGDAY,
                    tgd.TENHOCPHAN,
                    tgd.SISO,
                    tgd.HE,
                    tgd.LOP,
                    tgd.SOTINCHI,
                    tgd.GHICHU,
                    tgd.NAMHOC,
                    tgd.MADOITUONG,
                    tgd.MATHOIGIAN,
                    tgd.MANGONNGU,
                    (SELECT COUNT(*) FROM CHITIETGIANGDAY ctgd
                     WHERE TRIM(ctgd.MATAIGIANGDAY) = TRIM(tgd.MATAIGIANGDAY)) AS SO_GV_PHANCONG,
                    (SELECT SUM(ctgd.SOTIET) FROM CHITIETGIANGDAY ctgd
                     WHERE TRIM(ctgd.MATAIGIANGDAY) = TRIM(tgd.MATAIGIANGDAY)) AS TONG_SOTIET
                FROM TAIGIANGDAY tgd
                ORDER BY tgd.NAMHOC DESC, tgd.TENHOCPHAN;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mataigiangday IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tgd.MATAIGIANGDAY,
                tgd.TENHOCPHAN,
                tgd.SISO,
                tgd.HE,
                tgd.LOP,
                tgd.SOTINCHI,
                tgd.GHICHU,
                tgd.NAMHOC,
                tgd.MADOITUONG,
                tgd.MATHOIGIAN,
                tgd.MANGONNGU
            FROM TAIGIANGDAY tgd
            WHERE TRIM(tgd.MATAIGIANGDAY) = TRIM(p_mataigiangday);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tenhocphan  IN NVARCHAR2,
        p_siso        IN NUMBER DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_sotinchi    IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_madoituong  IN CHAR DEFAULT NULL,
        p_mathoigian  IN CHAR DEFAULT NULL,
        p_mangonngu   IN CHAR DEFAULT NULL,
        p_matgd_out   OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_matgd CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_matgd_out := NULL;

        IF p_tenhocphan IS NULL OR LENGTH(TRIM(p_tenhocphan)) = 0 THEN
            p_status := -1;
            p_message := N'Ten hoc phan khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'TGD' || LPAD(SEQ_TAIGIANGDAY.NEXTVAL, 12, '0') INTO v_matgd FROM DUAL;

        INSERT INTO TAIGIANGDAY (MATAIGIANGDAY, TENHOCPHAN, SISO, HE, LOP, SOTINCHI, GHICHU, NAMHOC, MADOITUONG, MATHOIGIAN, MANGONNGU)
        VALUES (v_matgd, p_tenhocphan, p_siso, p_he, p_lop, p_sotinchi, p_ghichu, p_namhoc, p_madoituong, p_mathoigian, p_mangonngu);

        COMMIT;

        p_matgd_out := v_matgd;
        p_status := 1;
        p_message := N'Them tai giang day thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mataigiangday IN CHAR,
        p_tenhocphan  IN NVARCHAR2 DEFAULT NULL,
        p_siso        IN NUMBER DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_sotinchi    IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIGIANGDAY WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai giang day khong ton tai';
            RETURN;
        END IF;

        UPDATE TAIGIANGDAY
        SET
            TENHOCPHAN = NVL(p_tenhocphan, TENHOCPHAN),
            SISO = NVL(p_siso, SISO),
            HE = NVL(p_he, HE),
            LOP = NVL(p_lop, LOP),
            SOTINCHI = NVL(p_sotinchi, SOTINCHI),
            GHICHU = NVL(p_ghichu, GHICHU),
            NAMHOC = NVL(p_namhoc, NAMHOC)
        WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat tai giang day thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mataigiangday IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIGIANGDAY WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai giang day khong ton tai';
            RETURN;
        END IF;

        -- Xoa chi tiet truoc
        DELETE FROM CHITIETGIANGDAY WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);

        DELETE FROM TAIGIANGDAY WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa tai giang day thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_PHANCONG(
        p_magv        IN CHAR,
        p_mataigiangday IN CHAR,
        p_sotiet      IN NUMBER,
        p_sotietquydoi IN NUMBER DEFAULT NULL,
        p_noidung     IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_tgd_exists NUMBER := 0;
        v_machitiet CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_machitiet_out := NULL;

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_tgd_exists FROM TAIGIANGDAY WHERE TRIM(MATAIGIANGDAY) = TRIM(p_mataigiangday);
        IF v_tgd_exists = 0 THEN
            p_status := -2;
            p_message := N'Tai giang day khong ton tai';
            RETURN;
        END IF;

        SELECT 'CTGD' || LPAD(SEQ_CHITIETGIANGDAY.NEXTVAL, 11, '0') INTO v_machitiet FROM DUAL;

        INSERT INTO CHITIETGIANGDAY (MACHITIETGIANGDAY, SOTIET, SOTIETQUYDOI, GHICHU, MAGV, MATAIGIANGDAY, NOIDUNGGIANGDAY)
        VALUES (v_machitiet, p_sotiet, NVL(p_sotietquydoi, p_sotiet), p_ghichu, p_magv, p_mataigiangday, p_noidung);

        COMMIT;

        p_machitiet_out := v_machitiet;
        p_status := 1;
        p_message := N'Phan cong giang day thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_PHANCONG;

    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    ctgd.MACHITIETGIANGDAY,
                    ctgd.SOTIET,
                    ctgd.SOTIETQUYDOI,
                    ctgd.GHICHU,
                    ctgd.NOIDUNGGIANGDAY,
                    tgd.MATAIGIANGDAY,
                    tgd.TENHOCPHAN,
                    tgd.NAMHOC,
                    tgd.LOP,
                    tgd.HE,
                    tgd.SOTINCHI
                FROM CHITIETGIANGDAY ctgd
                JOIN TAIGIANGDAY tgd ON TRIM(tgd.MATAIGIANGDAY) = TRIM(ctgd.MATAIGIANGDAY)
                WHERE TRIM(ctgd.MAGV) = TRIM(p_magv)
                AND TRIM(tgd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tgd.TENHOCPHAN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    ctgd.MACHITIETGIANGDAY,
                    ctgd.SOTIET,
                    ctgd.SOTIETQUYDOI,
                    ctgd.GHICHU,
                    ctgd.NOIDUNGGIANGDAY,
                    tgd.MATAIGIANGDAY,
                    tgd.TENHOCPHAN,
                    tgd.NAMHOC,
                    tgd.LOP,
                    tgd.HE,
                    tgd.SOTINCHI
                FROM CHITIETGIANGDAY ctgd
                JOIN TAIGIANGDAY tgd ON TRIM(tgd.MATAIGIANGDAY) = TRIM(ctgd.MATAIGIANGDAY)
                WHERE TRIM(ctgd.MAGV) = TRIM(p_magv)
                ORDER BY tgd.NAMHOC DESC, tgd.TENHOCPHAN;
        END IF;
    END SP_CHITIET_GV;

END PKG_GIANGDAY;
/

-- ============================================================
-- 8. PKG_NCKH - Package quan ly Nghien cuu khoa hoc
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_NCKH AS
    -- Lay danh sach tai NCKH
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay tai NCKH theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_matainckh   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them tai NCKH
    PROCEDURE SP_THEM(
        p_tencongtrinhkh IN NVARCHAR2,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_sotacgia    IN NUMBER DEFAULT NULL,
        p_maloainckh  IN CHAR DEFAULT NULL,
        p_matainckh_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua tai NCKH
    PROCEDURE SP_SUA(
        p_matainckh   IN CHAR,
        p_tencongtrinhkh IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_sotacgia    IN NUMBER DEFAULT NULL,
        p_maloainckh  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa tai NCKH
    PROCEDURE SP_XOA(
        p_matainckh   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Them thanh vien NCKH
    PROCEDURE SP_THEM_THANHVIEN(
        p_magv        IN CHAR,
        p_matainckh   IN CHAR,
        p_vaitro      IN NVARCHAR2 DEFAULT NULL,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay chi tiet NCKH theo giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_NCKH;
/

CREATE OR REPLACE PACKAGE BODY PKG_NCKH AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    tn.MATAINCKH,
                    tn.TENCONGTRINHKHOAHOC,
                    tn.NAMHOC,
                    tn.SOTACGIA,
                    tn.MALOAINCKH,
                    ln.TENLOAINCKH,
                    (SELECT COUNT(*) FROM CHITIETNCKH ctn
                     WHERE TRIM(ctn.MATAINCKH) = TRIM(tn.MATAINCKH)) AS SO_THANHVIEN,
                    (SELECT SUM(ctn.SOGIO) FROM CHITIETNCKH ctn
                     WHERE TRIM(ctn.MATAINCKH) = TRIM(tn.MATAINCKH)) AS TONG_SOGIO
                FROM TAINCKH tn
                LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH)
                WHERE TRIM(tn.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tn.TENCONGTRINHKHOAHOC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    tn.MATAINCKH,
                    tn.TENCONGTRINHKHOAHOC,
                    tn.NAMHOC,
                    tn.SOTACGIA,
                    tn.MALOAINCKH,
                    ln.TENLOAINCKH,
                    (SELECT COUNT(*) FROM CHITIETNCKH ctn
                     WHERE TRIM(ctn.MATAINCKH) = TRIM(tn.MATAINCKH)) AS SO_THANHVIEN,
                    (SELECT SUM(ctn.SOGIO) FROM CHITIETNCKH ctn
                     WHERE TRIM(ctn.MATAINCKH) = TRIM(tn.MATAINCKH)) AS TONG_SOGIO
                FROM TAINCKH tn
                LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH)
                ORDER BY tn.NAMHOC DESC, tn.TENCONGTRINHKHOAHOC;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_matainckh   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tn.MATAINCKH,
                tn.TENCONGTRINHKHOAHOC,
                tn.NAMHOC,
                tn.SOTACGIA,
                tn.MALOAINCKH,
                ln.TENLOAINCKH
            FROM TAINCKH tn
            LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH)
            WHERE TRIM(tn.MATAINCKH) = TRIM(p_matainckh);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tencongtrinhkh IN NVARCHAR2,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_sotacgia    IN NUMBER DEFAULT NULL,
        p_maloainckh  IN CHAR DEFAULT NULL,
        p_matainckh_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_matainckh CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_matainckh_out := NULL;

        IF p_tencongtrinhkh IS NULL OR LENGTH(TRIM(p_tencongtrinhkh)) = 0 THEN
            p_status := -1;
            p_message := N'Ten cong trinh khoa hoc khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'NCKH' || LPAD(SEQ_TAINCKH.NEXTVAL, 11, '0') INTO v_matainckh FROM DUAL;

        INSERT INTO TAINCKH (MATAINCKH, TENCONGTRINHKHOAHOC, NAMHOC, SOTACGIA, MALOAINCKH)
        VALUES (v_matainckh, p_tencongtrinhkh, p_namhoc, p_sotacgia, p_maloainckh);

        COMMIT;

        p_matainckh_out := v_matainckh;
        p_status := 1;
        p_message := N'Them tai NCKH thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_matainckh   IN CHAR,
        p_tencongtrinhkh IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_sotacgia    IN NUMBER DEFAULT NULL,
        p_maloainckh  IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAINCKH WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai NCKH khong ton tai';
            RETURN;
        END IF;

        UPDATE TAINCKH
        SET
            TENCONGTRINHKHOAHOC = NVL(p_tencongtrinhkh, TENCONGTRINHKHOAHOC),
            NAMHOC = NVL(p_namhoc, NAMHOC),
            SOTACGIA = NVL(p_sotacgia, SOTACGIA),
            MALOAINCKH = NVL(p_maloainckh, MALOAINCKH)
        WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat tai NCKH thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_matainckh   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAINCKH WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai NCKH khong ton tai';
            RETURN;
        END IF;

        DELETE FROM CHITIETNCKH WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);
        DELETE FROM TAINCKH WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa tai NCKH thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_THEM_THANHVIEN(
        p_magv        IN CHAR,
        p_matainckh   IN CHAR,
        p_vaitro      IN NVARCHAR2 DEFAULT NULL,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_nckh_exists NUMBER := 0;
        v_machitiet CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_machitiet_out := NULL;

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_nckh_exists FROM TAINCKH WHERE TRIM(MATAINCKH) = TRIM(p_matainckh);
        IF v_nckh_exists = 0 THEN
            p_status := -2;
            p_message := N'Tai NCKH khong ton tai';
            RETURN;
        END IF;

        SELECT 'CTNCKH' || LPAD(SEQ_CHITIETNCKH.NEXTVAL, 9, '0') INTO v_machitiet FROM DUAL;

        INSERT INTO CHITIETNCKH (MACHITIETNCKH, VAITRO, MAGV, MATAINCKH, SOGIO)
        VALUES (v_machitiet, p_vaitro, p_magv, p_matainckh, p_sogio);

        COMMIT;

        p_machitiet_out := v_machitiet;
        p_status := 1;
        p_message := N'Them thanh vien NCKH thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM_THANHVIEN;

    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    ctn.MACHITIETNCKH,
                    ctn.VAITRO,
                    ctn.SOGIO,
                    tn.MATAINCKH,
                    tn.TENCONGTRINHKHOAHOC,
                    tn.NAMHOC,
                    tn.SOTACGIA,
                    ln.TENLOAINCKH
                FROM CHITIETNCKH ctn
                JOIN TAINCKH tn ON TRIM(tn.MATAINCKH) = TRIM(ctn.MATAINCKH)
                LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH)
                WHERE TRIM(ctn.MAGV) = TRIM(p_magv)
                AND TRIM(tn.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tn.TENCONGTRINHKHOAHOC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    ctn.MACHITIETNCKH,
                    ctn.VAITRO,
                    ctn.SOGIO,
                    tn.MATAINCKH,
                    tn.TENCONGTRINHKHOAHOC,
                    tn.NAMHOC,
                    tn.SOTACGIA,
                    ln.TENLOAINCKH
                FROM CHITIETNCKH ctn
                JOIN TAINCKH tn ON TRIM(tn.MATAINCKH) = TRIM(ctn.MATAINCKH)
                LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH)
                WHERE TRIM(ctn.MAGV) = TRIM(p_magv)
                ORDER BY tn.NAMHOC DESC, tn.TENCONGTRINHKHOAHOC;
        END IF;
    END SP_CHITIET_GV;

END PKG_NCKH;
/

-- ============================================================
-- COMMIT FINAL
-- ============================================================

COMMIT;
/

-- ============================================================
-- END OF PHASE 2 SCRIPT - PART 1
-- ============================================================
