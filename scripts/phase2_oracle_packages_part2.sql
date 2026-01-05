-- ============================================================
-- PHASE 2: TAO ORACLE PACKAGES MOI - PART 2
-- He thong Quan Ly Giao Vien - qlgvpdb
-- Ngay tao: 2026-01-05
-- Tac gia: LuckyBoiz
-- ============================================================

-- ============================================================
-- 9. PKG_KHAOTHI - Package quan ly Khao thi
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_KHAOTHI AS
    -- Lay danh sach tai khao thi
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay tai khao thi theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mataikhaothi IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them tai khao thi
    PROCEDURE SP_THEM(
        p_hocphan     IN NVARCHAR2,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaicongtac IN CHAR DEFAULT NULL,
        p_mataikhaothi_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua tai khao thi
    PROCEDURE SP_SUA(
        p_mataikhaothi IN CHAR,
        p_hocphan     IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaicongtac IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa tai khao thi
    PROCEDURE SP_XOA(
        p_mataikhaothi IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Phan cong khao thi cho giao vien
    PROCEDURE SP_PHANCONG(
        p_magv        IN CHAR,
        p_mataikhaothi IN CHAR,
        p_sobai       IN NUMBER DEFAULT NULL,
        p_sogioquychuan IN NUMBER DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay chi tiet khao thi theo giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay danh sach loai cong tac khao thi
    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_KHAOTHI;
/

CREATE OR REPLACE PACKAGE BODY PKG_KHAOTHI AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    tk.MATAIKHAOTHI,
                    tk.HOCPHAN,
                    tk.LOP,
                    tk.NAMHOC,
                    tk.GHICHU,
                    tk.MALOAICONGTACKHAOTHI,
                    lct.TENLOAICONGTACKHAOTHI,
                    (SELECT COUNT(*) FROM CHITIETTAIKHAOTHI cttk
                     WHERE TRIM(cttk.MATAIKHAOTHI) = TRIM(tk.MATAIKHAOTHI)) AS SO_GV_PHANCONG,
                    (SELECT SUM(cttk.SOBAI) FROM CHITIETTAIKHAOTHI cttk
                     WHERE TRIM(cttk.MATAIKHAOTHI) = TRIM(tk.MATAIKHAOTHI)) AS TONG_SOBAI
                FROM TAIKHAOTHI tk
                LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI)
                WHERE TRIM(tk.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tk.HOCPHAN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    tk.MATAIKHAOTHI,
                    tk.HOCPHAN,
                    tk.LOP,
                    tk.NAMHOC,
                    tk.GHICHU,
                    tk.MALOAICONGTACKHAOTHI,
                    lct.TENLOAICONGTACKHAOTHI,
                    (SELECT COUNT(*) FROM CHITIETTAIKHAOTHI cttk
                     WHERE TRIM(cttk.MATAIKHAOTHI) = TRIM(tk.MATAIKHAOTHI)) AS SO_GV_PHANCONG,
                    (SELECT SUM(cttk.SOBAI) FROM CHITIETTAIKHAOTHI cttk
                     WHERE TRIM(cttk.MATAIKHAOTHI) = TRIM(tk.MATAIKHAOTHI)) AS TONG_SOBAI
                FROM TAIKHAOTHI tk
                LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI)
                ORDER BY tk.NAMHOC DESC, tk.HOCPHAN;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mataikhaothi IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tk.MATAIKHAOTHI,
                tk.HOCPHAN,
                tk.LOP,
                tk.NAMHOC,
                tk.GHICHU,
                tk.MALOAICONGTACKHAOTHI,
                lct.TENLOAICONGTACKHAOTHI
            FROM TAIKHAOTHI tk
            LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI)
            WHERE TRIM(tk.MATAIKHAOTHI) = TRIM(p_mataikhaothi);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_hocphan     IN NVARCHAR2,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaicongtac IN CHAR DEFAULT NULL,
        p_mataikhaothi_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mataikhaothi CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mataikhaothi_out := NULL;

        IF p_hocphan IS NULL OR LENGTH(TRIM(p_hocphan)) = 0 THEN
            p_status := -1;
            p_message := N'Ten hoc phan khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'TKT' || LPAD(SEQ_TAIKHAOTHI.NEXTVAL, 12, '0') INTO v_mataikhaothi FROM DUAL;

        INSERT INTO TAIKHAOTHI (MATAIKHAOTHI, HOCPHAN, LOP, NAMHOC, GHICHU, MALOAICONGTACKHAOTHI)
        VALUES (v_mataikhaothi, p_hocphan, p_lop, p_namhoc, p_ghichu, p_maloaicongtac);

        COMMIT;

        p_mataikhaothi_out := v_mataikhaothi;
        p_status := 1;
        p_message := N'Them tai khao thi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mataikhaothi IN CHAR,
        p_hocphan     IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaicongtac IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIKHAOTHI WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai khao thi khong ton tai';
            RETURN;
        END IF;

        UPDATE TAIKHAOTHI
        SET
            HOCPHAN = NVL(p_hocphan, HOCPHAN),
            LOP = NVL(p_lop, LOP),
            NAMHOC = NVL(p_namhoc, NAMHOC),
            GHICHU = NVL(p_ghichu, GHICHU),
            MALOAICONGTACKHAOTHI = NVL(p_maloaicongtac, MALOAICONGTACKHAOTHI)
        WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat tai khao thi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mataikhaothi IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIKHAOTHI WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Tai khao thi khong ton tai';
            RETURN;
        END IF;

        DELETE FROM CHITIETTAIKHAOTHI WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);
        DELETE FROM TAIKHAOTHI WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa tai khao thi thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_PHANCONG(
        p_magv        IN CHAR,
        p_mataikhaothi IN CHAR,
        p_sobai       IN NUMBER DEFAULT NULL,
        p_sogioquychuan IN NUMBER DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_tkt_exists NUMBER := 0;
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

        SELECT COUNT(*) INTO v_tkt_exists FROM TAIKHAOTHI WHERE TRIM(MATAIKHAOTHI) = TRIM(p_mataikhaothi);
        IF v_tkt_exists = 0 THEN
            p_status := -2;
            p_message := N'Tai khao thi khong ton tai';
            RETURN;
        END IF;

        SELECT 'CTTKT' || LPAD(SEQ_CHITIETTAIKHAOTHI.NEXTVAL, 10, '0') INTO v_machitiet FROM DUAL;

        INSERT INTO CHITIETTAIKHAOTHI (MACHITIETTAIKHAOTHI, SOBAI, SOGIOQUYCHUAN, MAGV, MATAIKHAOTHI)
        VALUES (v_machitiet, p_sobai, p_sogioquychuan, p_magv, p_mataikhaothi);

        COMMIT;

        p_machitiet_out := v_machitiet;
        p_status := 1;
        p_message := N'Phan cong khao thi thanh cong';

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
                    cttk.MACHITIETTAIKHAOTHI,
                    cttk.SOBAI,
                    cttk.SOGIOQUYCHUAN,
                    tk.MATAIKHAOTHI,
                    tk.HOCPHAN,
                    tk.LOP,
                    tk.NAMHOC,
                    lct.TENLOAICONGTACKHAOTHI
                FROM CHITIETTAIKHAOTHI cttk
                JOIN TAIKHAOTHI tk ON TRIM(tk.MATAIKHAOTHI) = TRIM(cttk.MATAIKHAOTHI)
                LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI)
                WHERE TRIM(cttk.MAGV) = TRIM(p_magv)
                AND TRIM(tk.NAMHOC) = TRIM(p_namhoc)
                ORDER BY tk.HOCPHAN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    cttk.MACHITIETTAIKHAOTHI,
                    cttk.SOBAI,
                    cttk.SOGIOQUYCHUAN,
                    tk.MATAIKHAOTHI,
                    tk.HOCPHAN,
                    tk.LOP,
                    tk.NAMHOC,
                    lct.TENLOAICONGTACKHAOTHI
                FROM CHITIETTAIKHAOTHI cttk
                JOIN TAIKHAOTHI tk ON TRIM(tk.MATAIKHAOTHI) = TRIM(cttk.MATAIKHAOTHI)
                LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI)
                WHERE TRIM(cttk.MAGV) = TRIM(p_magv)
                ORDER BY tk.NAMHOC DESC, tk.HOCPHAN;
        END IF;
    END SP_CHITIET_GV;

    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                MALOAICONGTACKHAOTHI,
                TENLOAICONGTACKHAOTHI,
                MOTA
            FROM LOAICONGTACKHAOTHI
            ORDER BY TENLOAICONGTACKHAOTHI;
    END SP_LAYDS_LOAI;

END PKG_KHAOTHI;
/

-- ============================================================
-- 10. PKG_HOIDONG - Package quan ly Hoi dong
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_HOIDONG AS
    -- Lay danh sach hoi dong
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay hoi dong theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mahoidong   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them hoi dong
    PROCEDURE SP_THEM(
        p_soluong     IN NUMBER DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_thoigianbatdau IN TIMESTAMP DEFAULT NULL,
        p_thoigianketthuc IN TIMESTAMP DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaihoidong IN CHAR DEFAULT NULL,
        p_mahoidong_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua hoi dong
    PROCEDURE SP_SUA(
        p_mahoidong   IN CHAR,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_thoigianbatdau IN TIMESTAMP DEFAULT NULL,
        p_thoigianketthuc IN TIMESTAMP DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaihoidong IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa hoi dong
    PROCEDURE SP_XOA(
        p_mahoidong   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Them thanh vien hoi dong
    PROCEDURE SP_THEM_THANHVIEN(
        p_magv        IN CHAR,
        p_mahoidong   IN CHAR,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_mathamgia_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa thanh vien hoi dong
    PROCEDURE SP_XOA_THANHVIEN(
        p_mathamgia   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay danh sach thanh vien hoi dong
    PROCEDURE SP_LAYDS_THANHVIEN(
        p_mahoidong   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay danh sach loai hoi dong
    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay chi tiet tham gia hoi dong cua giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_HOIDONG;
/

CREATE OR REPLACE PACKAGE BODY PKG_HOIDONG AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    hd.MAHOIDONG,
                    hd.SOLUONG,
                    hd.NAMHOC,
                    hd.THOIGIANBATDAU,
                    hd.THOIGIANKETTHUC,
                    hd.GHICHU,
                    hd.MALOAIHOIDONG,
                    lhd.TENLOAIHOIDONG,
                    (SELECT COUNT(*) FROM THAMGIA tg
                     WHERE TRIM(tg.MAHOIDONG) = TRIM(hd.MAHOIDONG)) AS SO_THANHVIEN
                FROM TAIHOIDONG hd
                LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG)
                WHERE TRIM(hd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY hd.THOIGIANBATDAU DESC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    hd.MAHOIDONG,
                    hd.SOLUONG,
                    hd.NAMHOC,
                    hd.THOIGIANBATDAU,
                    hd.THOIGIANKETTHUC,
                    hd.GHICHU,
                    hd.MALOAIHOIDONG,
                    lhd.TENLOAIHOIDONG,
                    (SELECT COUNT(*) FROM THAMGIA tg
                     WHERE TRIM(tg.MAHOIDONG) = TRIM(hd.MAHOIDONG)) AS SO_THANHVIEN
                FROM TAIHOIDONG hd
                LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG)
                ORDER BY hd.NAMHOC DESC, hd.THOIGIANBATDAU DESC;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mahoidong   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hd.MAHOIDONG,
                hd.SOLUONG,
                hd.NAMHOC,
                hd.THOIGIANBATDAU,
                hd.THOIGIANKETTHUC,
                hd.GHICHU,
                hd.MALOAIHOIDONG,
                lhd.TENLOAIHOIDONG
            FROM TAIHOIDONG hd
            LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG)
            WHERE TRIM(hd.MAHOIDONG) = TRIM(p_mahoidong);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_soluong     IN NUMBER DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_thoigianbatdau IN TIMESTAMP DEFAULT NULL,
        p_thoigianketthuc IN TIMESTAMP DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaihoidong IN CHAR DEFAULT NULL,
        p_mahoidong_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mahoidong CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mahoidong_out := NULL;

        SELECT 'HD' || LPAD(SEQ_HOIDONG.NEXTVAL, 13, '0') INTO v_mahoidong FROM DUAL;

        INSERT INTO TAIHOIDONG (MAHOIDONG, SOLUONG, NAMHOC, THOIGIANBATDAU, THOIGIANKETTHUC, GHICHU, MALOAIHOIDONG)
        VALUES (v_mahoidong, p_soluong, p_namhoc, p_thoigianbatdau, p_thoigianketthuc, p_ghichu, p_maloaihoidong);

        COMMIT;

        p_mahoidong_out := v_mahoidong;
        p_status := 1;
        p_message := N'Them hoi dong thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mahoidong   IN CHAR,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_thoigianbatdau IN TIMESTAMP DEFAULT NULL,
        p_thoigianketthuc IN TIMESTAMP DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_maloaihoidong IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIHOIDONG WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoi dong khong ton tai';
            RETURN;
        END IF;

        UPDATE TAIHOIDONG
        SET
            SOLUONG = NVL(p_soluong, SOLUONG),
            NAMHOC = NVL(p_namhoc, NAMHOC),
            THOIGIANBATDAU = NVL(p_thoigianbatdau, THOIGIANBATDAU),
            THOIGIANKETTHUC = NVL(p_thoigianketthuc, THOIGIANKETTHUC),
            GHICHU = NVL(p_ghichu, GHICHU),
            MALOAIHOIDONG = NVL(p_maloaihoidong, MALOAIHOIDONG)
        WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat hoi dong thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mahoidong   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIHOIDONG WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Hoi dong khong ton tai';
            RETURN;
        END IF;

        DELETE FROM THAMGIA WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);
        DELETE FROM TAIHOIDONG WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa hoi dong thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_THEM_THANHVIEN(
        p_magv        IN CHAR,
        p_mahoidong   IN CHAR,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_mathamgia_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_hd_exists NUMBER := 0;
        v_already_exists NUMBER := 0;
        v_mathamgia CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mathamgia_out := NULL;

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_hd_exists FROM TAIHOIDONG WHERE TRIM(MAHOIDONG) = TRIM(p_mahoidong);
        IF v_hd_exists = 0 THEN
            p_status := -2;
            p_message := N'Hoi dong khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_already_exists FROM THAMGIA
        WHERE TRIM(MAGV) = TRIM(p_magv) AND TRIM(MAHOIDONG) = TRIM(p_mahoidong);
        IF v_already_exists > 0 THEN
            p_status := -3;
            p_message := N'Giao vien da tham gia hoi dong nay';
            RETURN;
        END IF;

        SELECT 'TG' || LPAD(SEQ_THAMGIA.NEXTVAL, 13, '0') INTO v_mathamgia FROM DUAL;

        INSERT INTO THAMGIA (MATHAMGIA, MAGV, MAHOIDONG, SOGIO)
        VALUES (v_mathamgia, p_magv, p_mahoidong, p_sogio);

        COMMIT;

        p_mathamgia_out := v_mathamgia;
        p_status := 1;
        p_message := N'Them thanh vien hoi dong thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM_THANHVIEN;

    PROCEDURE SP_XOA_THANHVIEN(
        p_mathamgia   IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM THAMGIA WHERE TRIM(MATHAMGIA) = TRIM(p_mathamgia);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Thanh vien hoi dong khong ton tai';
            RETURN;
        END IF;

        DELETE FROM THAMGIA WHERE TRIM(MATHAMGIA) = TRIM(p_mathamgia);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa thanh vien hoi dong thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA_THANHVIEN;

    PROCEDURE SP_LAYDS_THANHVIEN(
        p_mahoidong   IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tg.MATHAMGIA,
                tg.MAGV,
                gv.HOTEN,
                gv.EMAIL,
                tg.SOGIO,
                bm.TENBM,
                k.TENKHOA
            FROM THAMGIA tg
            JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tg.MAGV)
            LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
            LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
            WHERE TRIM(tg.MAHOIDONG) = TRIM(p_mahoidong)
            ORDER BY gv.HOTEN;
    END SP_LAYDS_THANHVIEN;

    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                MALOAIHOIDONG,
                TENLOAIHOIDONG,
                MOTA
            FROM LOAIHOIDONG
            ORDER BY TENLOAIHOIDONG;
    END SP_LAYDS_LOAI;

    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    tg.MATHAMGIA,
                    tg.SOGIO,
                    hd.MAHOIDONG,
                    hd.NAMHOC,
                    hd.THOIGIANBATDAU,
                    hd.THOIGIANKETTHUC,
                    lhd.TENLOAIHOIDONG
                FROM THAMGIA tg
                JOIN TAIHOIDONG hd ON TRIM(hd.MAHOIDONG) = TRIM(tg.MAHOIDONG)
                LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG)
                WHERE TRIM(tg.MAGV) = TRIM(p_magv)
                AND TRIM(hd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY hd.THOIGIANBATDAU DESC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    tg.MATHAMGIA,
                    tg.SOGIO,
                    hd.MAHOIDONG,
                    hd.NAMHOC,
                    hd.THOIGIANBATDAU,
                    hd.THOIGIANKETTHUC,
                    lhd.TENLOAIHOIDONG
                FROM THAMGIA tg
                JOIN TAIHOIDONG hd ON TRIM(hd.MAHOIDONG) = TRIM(tg.MAHOIDONG)
                LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG)
                WHERE TRIM(tg.MAGV) = TRIM(p_magv)
                ORDER BY hd.NAMHOC DESC, hd.THOIGIANBATDAU DESC;
        END IF;
    END SP_CHITIET_GV;

END PKG_HOIDONG;
/

-- ============================================================
-- 11. PKG_HUONGDAN - Package quan ly Huong dan
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_HUONGDAN AS
    -- Lay danh sach huong dan
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay huong dan theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_mahuongdan  IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them huong dan
    PROCEDURE SP_THEM(
        p_hotenhocvien IN NVARCHAR2,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_tendetai    IN NVARCHAR2 DEFAULT NULL,
        p_socbhd      IN NUMBER DEFAULT NULL,
        p_maloaihinhhuongdan IN CHAR DEFAULT NULL,
        p_mahuongdan_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua huong dan
    PROCEDURE SP_SUA(
        p_mahuongdan  IN CHAR,
        p_hotenhocvien IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_tendetai    IN NVARCHAR2 DEFAULT NULL,
        p_socbhd      IN NUMBER DEFAULT NULL,
        p_maloaihinhhuongdan IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa huong dan
    PROCEDURE SP_XOA(
        p_mahuongdan  IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Them giao vien huong dan
    PROCEDURE SP_THEM_GV(
        p_magv        IN CHAR,
        p_mahuongdan  IN CHAR,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_mathamgia_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay danh sach giao vien huong dan
    PROCEDURE SP_LAYDS_GV(
        p_mahuongdan  IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay chi tiet huong dan cua giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay danh sach loai hinh huong dan
    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_HUONGDAN;
/

CREATE OR REPLACE PACKAGE BODY PKG_HUONGDAN AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    hd.MAHUONGDAN,
                    hd.HOTENHOCVIEN,
                    hd.LOP,
                    hd.HE,
                    hd.NAMHOC,
                    hd.TENDETAI,
                    hd.SOCBHD,
                    hd.MALOAIHINHHUONGDAN,
                    lhhd.TENLOAIHINHHUONGDAN,
                    (SELECT COUNT(*) FROM THAMGIAHUONGDAN tghd
                     WHERE TRIM(tghd.MAHUONGDAN) = TRIM(hd.MAHUONGDAN)) AS SO_GV_HUONGDAN
                FROM TAIHUONGDAN hd
                LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN)
                WHERE TRIM(hd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY hd.HOTENHOCVIEN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    hd.MAHUONGDAN,
                    hd.HOTENHOCVIEN,
                    hd.LOP,
                    hd.HE,
                    hd.NAMHOC,
                    hd.TENDETAI,
                    hd.SOCBHD,
                    hd.MALOAIHINHHUONGDAN,
                    lhhd.TENLOAIHINHHUONGDAN,
                    (SELECT COUNT(*) FROM THAMGIAHUONGDAN tghd
                     WHERE TRIM(tghd.MAHUONGDAN) = TRIM(hd.MAHUONGDAN)) AS SO_GV_HUONGDAN
                FROM TAIHUONGDAN hd
                LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN)
                ORDER BY hd.NAMHOC DESC, hd.HOTENHOCVIEN;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_mahuongdan  IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                hd.MAHUONGDAN,
                hd.HOTENHOCVIEN,
                hd.LOP,
                hd.HE,
                hd.NAMHOC,
                hd.TENDETAI,
                hd.SOCBHD,
                hd.MALOAIHINHHUONGDAN,
                lhhd.TENLOAIHINHHUONGDAN
            FROM TAIHUONGDAN hd
            LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN)
            WHERE TRIM(hd.MAHUONGDAN) = TRIM(p_mahuongdan);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_hotenhocvien IN NVARCHAR2,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_tendetai    IN NVARCHAR2 DEFAULT NULL,
        p_socbhd      IN NUMBER DEFAULT NULL,
        p_maloaihinhhuongdan IN CHAR DEFAULT NULL,
        p_mahuongdan_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_mahuongdan CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mahuongdan_out := NULL;

        IF p_hotenhocvien IS NULL OR LENGTH(TRIM(p_hotenhocvien)) = 0 THEN
            p_status := -1;
            p_message := N'Ho ten hoc vien khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'HD' || LPAD(SEQ_HUONGDAN.NEXTVAL, 13, '0') INTO v_mahuongdan FROM DUAL;

        INSERT INTO TAIHUONGDAN (MAHUONGDAN, HOTENHOCVIEN, LOP, HE, NAMHOC, TENDETAI, SOCBHD, MALOAIHINHHUONGDAN)
        VALUES (v_mahuongdan, p_hotenhocvien, p_lop, p_he, p_namhoc, p_tendetai, p_socbhd, p_maloaihinhhuongdan);

        COMMIT;

        p_mahuongdan_out := v_mahuongdan;
        p_status := 1;
        p_message := N'Them huong dan thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_mahuongdan  IN CHAR,
        p_hotenhocvien IN NVARCHAR2 DEFAULT NULL,
        p_lop         IN NVARCHAR2 DEFAULT NULL,
        p_he          IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_tendetai    IN NVARCHAR2 DEFAULT NULL,
        p_socbhd      IN NUMBER DEFAULT NULL,
        p_maloaihinhhuongdan IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIHUONGDAN WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Huong dan khong ton tai';
            RETURN;
        END IF;

        UPDATE TAIHUONGDAN
        SET
            HOTENHOCVIEN = NVL(p_hotenhocvien, HOTENHOCVIEN),
            LOP = NVL(p_lop, LOP),
            HE = NVL(p_he, HE),
            NAMHOC = NVL(p_namhoc, NAMHOC),
            TENDETAI = NVL(p_tendetai, TENDETAI),
            SOCBHD = NVL(p_socbhd, SOCBHD),
            MALOAIHINHHUONGDAN = NVL(p_maloaihinhhuongdan, MALOAIHINHHUONGDAN)
        WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat huong dan thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_mahuongdan  IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM TAIHUONGDAN WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Huong dan khong ton tai';
            RETURN;
        END IF;

        DELETE FROM THAMGIAHUONGDAN WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);
        DELETE FROM TAIHUONGDAN WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa huong dan thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_THEM_GV(
        p_magv        IN CHAR,
        p_mahuongdan  IN CHAR,
        p_sogio       IN NUMBER DEFAULT NULL,
        p_mathamgia_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_hd_exists NUMBER := 0;
        v_already_exists NUMBER := 0;
        v_mathamgia CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_mathamgia_out := NULL;

        SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
        IF v_gv_exists = 0 THEN
            p_status := -1;
            p_message := N'Giao vien khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_hd_exists FROM TAIHUONGDAN WHERE TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);
        IF v_hd_exists = 0 THEN
            p_status := -2;
            p_message := N'Huong dan khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_already_exists FROM THAMGIAHUONGDAN
        WHERE TRIM(MAGV) = TRIM(p_magv) AND TRIM(MAHUONGDAN) = TRIM(p_mahuongdan);
        IF v_already_exists > 0 THEN
            p_status := -3;
            p_message := N'Giao vien da tham gia huong dan nay';
            RETURN;
        END IF;

        SELECT 'TGHD' || LPAD(SEQ_THAMGIAHUONGDAN.NEXTVAL, 11, '0') INTO v_mathamgia FROM DUAL;

        INSERT INTO THAMGIAHUONGDAN (MATHAMGIAHUONGDAN, MAGV, MAHUONGDAN, SOGIO)
        VALUES (v_mathamgia, p_magv, p_mahuongdan, p_sogio);

        COMMIT;

        p_mathamgia_out := v_mathamgia;
        p_status := 1;
        p_message := N'Them giao vien huong dan thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM_GV;

    PROCEDURE SP_LAYDS_GV(
        p_mahuongdan  IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tghd.MATHAMGIAHUONGDAN,
                tghd.MAGV,
                gv.HOTEN,
                gv.EMAIL,
                tghd.SOGIO,
                bm.TENBM,
                k.TENKHOA
            FROM THAMGIAHUONGDAN tghd
            JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tghd.MAGV)
            LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
            LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
            WHERE TRIM(tghd.MAHUONGDAN) = TRIM(p_mahuongdan)
            ORDER BY gv.HOTEN;
    END SP_LAYDS_GV;

    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    tghd.MATHAMGIAHUONGDAN,
                    tghd.SOGIO,
                    hd.MAHUONGDAN,
                    hd.HOTENHOCVIEN,
                    hd.TENDETAI,
                    hd.LOP,
                    hd.HE,
                    hd.NAMHOC,
                    lhhd.TENLOAIHINHHUONGDAN
                FROM THAMGIAHUONGDAN tghd
                JOIN TAIHUONGDAN hd ON TRIM(hd.MAHUONGDAN) = TRIM(tghd.MAHUONGDAN)
                LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN)
                WHERE TRIM(tghd.MAGV) = TRIM(p_magv)
                AND TRIM(hd.NAMHOC) = TRIM(p_namhoc)
                ORDER BY hd.HOTENHOCVIEN;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    tghd.MATHAMGIAHUONGDAN,
                    tghd.SOGIO,
                    hd.MAHUONGDAN,
                    hd.HOTENHOCVIEN,
                    hd.TENDETAI,
                    hd.LOP,
                    hd.HE,
                    hd.NAMHOC,
                    lhhd.TENLOAIHINHHUONGDAN
                FROM THAMGIAHUONGDAN tghd
                JOIN TAIHUONGDAN hd ON TRIM(hd.MAHUONGDAN) = TRIM(tghd.MAHUONGDAN)
                LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN)
                WHERE TRIM(tghd.MAGV) = TRIM(p_magv)
                ORDER BY hd.NAMHOC DESC, hd.HOTENHOCVIEN;
        END IF;
    END SP_CHITIET_GV;

    PROCEDURE SP_LAYDS_LOAI(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                MALOAIHINHHUONGDAN,
                TENLOAIHINHHUONGDAN,
                MOTA
            FROM LOAIHINHHUONGDAN
            ORDER BY TENLOAIHINHHUONGDAN;
    END SP_LAYDS_LOAI;

END PKG_HUONGDAN;
/

-- ============================================================
-- 12. PKG_CONGTACKHAC - Package quan ly Cong tac khac
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_CONGTACKHAC AS
    -- Lay danh sach cong tac khac
    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay cong tac khac theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_macongtackhac IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them cong tac khac
    PROCEDURE SP_THEM(
        p_noidungcongviec IN NVARCHAR2,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_macongtackhac_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua cong tac khac
    PROCEDURE SP_SUA(
        p_macongtackhac IN CHAR,
        p_noidungcongviec IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa cong tac khac
    PROCEDURE SP_XOA(
        p_macongtackhac IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Them giao vien tham gia
    PROCEDURE SP_THEM_GV(
        p_magv        IN CHAR,
        p_macongtackhac IN CHAR,
        p_vaitro      IN NVARCHAR2 DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay chi tiet cong tac khac theo giao vien
    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_CONGTACKHAC;
/

CREATE OR REPLACE PACKAGE BODY PKG_CONGTACKHAC AS

    PROCEDURE SP_LAYDS(
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    ctk.MACONGTACKHAC,
                    ctk.NOIDUNGCONGVIEC,
                    ctk.NAMHOC,
                    ctk.SOLUONG,
                    ctk.GHICHU,
                    (SELECT COUNT(*) FROM CHITIETCONGTACKHAC ctctk
                     WHERE TRIM(ctctk.MACONGTACKHAC) = TRIM(ctk.MACONGTACKHAC)) AS SO_GV_THAMGIA
                FROM CONGTACKHAC ctk
                WHERE TRIM(ctk.NAMHOC) = TRIM(p_namhoc)
                ORDER BY ctk.NOIDUNGCONGVIEC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    ctk.MACONGTACKHAC,
                    ctk.NOIDUNGCONGVIEC,
                    ctk.NAMHOC,
                    ctk.SOLUONG,
                    ctk.GHICHU,
                    (SELECT COUNT(*) FROM CHITIETCONGTACKHAC ctctk
                     WHERE TRIM(ctctk.MACONGTACKHAC) = TRIM(ctk.MACONGTACKHAC)) AS SO_GV_THAMGIA
                FROM CONGTACKHAC ctk
                ORDER BY ctk.NAMHOC DESC, ctk.NOIDUNGCONGVIEC;
        END IF;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_macongtackhac IN CHAR,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                ctk.MACONGTACKHAC,
                ctk.NOIDUNGCONGVIEC,
                ctk.NAMHOC,
                ctk.SOLUONG,
                ctk.GHICHU
            FROM CONGTACKHAC ctk
            WHERE TRIM(ctk.MACONGTACKHAC) = TRIM(p_macongtackhac);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_noidungcongviec IN NVARCHAR2,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_macongtackhac_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_macongtackhac CHAR(15);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_macongtackhac_out := NULL;

        IF p_noidungcongviec IS NULL OR LENGTH(TRIM(p_noidungcongviec)) = 0 THEN
            p_status := -1;
            p_message := N'Noi dung cong viec khong duoc de trong';
            RETURN;
        END IF;

        SELECT 'CTK' || LPAD(SEQ_CONGTACKHAC.NEXTVAL, 12, '0') INTO v_macongtackhac FROM DUAL;

        INSERT INTO CONGTACKHAC (MACONGTACKHAC, NOIDUNGCONGVIEC, NAMHOC, SOLUONG, GHICHU)
        VALUES (v_macongtackhac, p_noidungcongviec, p_namhoc, p_soluong, p_ghichu);

        COMMIT;

        p_macongtackhac_out := v_macongtackhac;
        p_status := 1;
        p_message := N'Them cong tac khac thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_macongtackhac IN CHAR,
        p_noidungcongviec IN NVARCHAR2 DEFAULT NULL,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_soluong     IN NUMBER DEFAULT NULL,
        p_ghichu      IN NVARCHAR2 DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM CONGTACKHAC WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Cong tac khac khong ton tai';
            RETURN;
        END IF;

        UPDATE CONGTACKHAC
        SET
            NOIDUNGCONGVIEC = NVL(p_noidungcongviec, NOIDUNGCONGVIEC),
            NAMHOC = NVL(p_namhoc, NAMHOC),
            SOLUONG = NVL(p_soluong, SOLUONG),
            GHICHU = NVL(p_ghichu, GHICHU)
        WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat cong tac khac thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_XOA(
        p_macongtackhac IN CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM CONGTACKHAC WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Cong tac khac khong ton tai';
            RETURN;
        END IF;

        DELETE FROM CHITIETCONGTACKHAC WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);
        DELETE FROM CONGTACKHAC WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa cong tac khac thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_THEM_GV(
        p_magv        IN CHAR,
        p_macongtackhac IN CHAR,
        p_vaitro      IN NVARCHAR2 DEFAULT NULL,
        p_machitiet_out OUT CHAR,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_gv_exists NUMBER := 0;
        v_ctk_exists NUMBER := 0;
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

        SELECT COUNT(*) INTO v_ctk_exists FROM CONGTACKHAC WHERE TRIM(MACONGTACKHAC) = TRIM(p_macongtackhac);
        IF v_ctk_exists = 0 THEN
            p_status := -2;
            p_message := N'Cong tac khac khong ton tai';
            RETURN;
        END IF;

        SELECT 'CTCTK' || LPAD(SEQ_CHITIETCONGTACKHAC.NEXTVAL, 10, '0') INTO v_machitiet FROM DUAL;

        INSERT INTO CHITIETCONGTACKHAC (MACHITIETCONGTACKHAC, VAITRO, MAGV, MACONGTACKHAC)
        VALUES (v_machitiet, p_vaitro, p_magv, p_macongtackhac);

        COMMIT;

        p_machitiet_out := v_machitiet;
        p_status := 1;
        p_message := N'Them giao vien tham gia thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM_GV;

    PROCEDURE SP_CHITIET_GV(
        p_magv        IN CHAR,
        p_namhoc      IN NVARCHAR2 DEFAULT NULL,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_namhoc IS NOT NULL THEN
            OPEN p_cursor FOR
                SELECT
                    ctctk.MACHITIETCONGTACKHAC,
                    ctctk.VAITRO,
                    ctk.MACONGTACKHAC,
                    ctk.NOIDUNGCONGVIEC,
                    ctk.NAMHOC,
                    ctk.SOLUONG
                FROM CHITIETCONGTACKHAC ctctk
                JOIN CONGTACKHAC ctk ON TRIM(ctk.MACONGTACKHAC) = TRIM(ctctk.MACONGTACKHAC)
                WHERE TRIM(ctctk.MAGV) = TRIM(p_magv)
                AND TRIM(ctk.NAMHOC) = TRIM(p_namhoc)
                ORDER BY ctk.NOIDUNGCONGVIEC;
        ELSE
            OPEN p_cursor FOR
                SELECT
                    ctctk.MACHITIETCONGTACKHAC,
                    ctctk.VAITRO,
                    ctk.MACONGTACKHAC,
                    ctk.NOIDUNGCONGVIEC,
                    ctk.NAMHOC,
                    ctk.SOLUONG
                FROM CHITIETCONGTACKHAC ctctk
                JOIN CONGTACKHAC ctk ON TRIM(ctk.MACONGTACKHAC) = TRIM(ctctk.MACONGTACKHAC)
                WHERE TRIM(ctctk.MAGV) = TRIM(p_magv)
                ORDER BY ctk.NAMHOC DESC, ctk.NOIDUNGCONGVIEC;
        END IF;
    END SP_CHITIET_GV;

END PKG_CONGTACKHAC;
/

-- ============================================================
-- 13. PKG_NGUOIDUNG - Package quan ly Nguoi dung
-- ============================================================

CREATE OR REPLACE PACKAGE PKG_NGUOIDUNG AS
    -- Lay danh sach nguoi dung
    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay nguoi dung theo ma
    PROCEDURE SP_LAYTHEOMA(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Them nguoi dung moi
    PROCEDURE SP_THEM(
        p_tendangnhap IN NVARCHAR2,
        p_matkhau     IN NVARCHAR2,
        p_magv        IN CHAR DEFAULT NULL,
        p_manguoidung_out OUT VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Sua nguoi dung
    PROCEDURE SP_SUA(
        p_manguoidung IN VARCHAR2,
        p_tendangnhap IN NVARCHAR2 DEFAULT NULL,
        p_magv        IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Doi mat khau
    PROCEDURE SP_DOI_MATKHAU(
        p_manguoidung IN VARCHAR2,
        p_matkhaucu   IN NVARCHAR2,
        p_matkhaumoi  IN NVARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa nguoi dung
    PROCEDURE SP_XOA(
        p_manguoidung IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Dang nhap
    PROCEDURE SP_DANGNHAP(
        p_tendangnhap IN NVARCHAR2,
        p_matkhau     IN NVARCHAR2,
        p_manguoidung OUT VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Gan nhom cho nguoi dung
    PROCEDURE SP_GAN_NHOM(
        p_manguoidung IN VARCHAR2,
        p_manhom      IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Xoa nguoi dung khoi nhom
    PROCEDURE SP_XOA_NHOM(
        p_manguoidung IN VARCHAR2,
        p_manhom      IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    );

    -- Lay danh sach nhom cua nguoi dung
    PROCEDURE SP_LAYDS_NHOM(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    );

    -- Lay danh sach quyen cua nguoi dung
    PROCEDURE SP_LAYDS_QUYEN(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    );

END PKG_NGUOIDUNG;
/

CREATE OR REPLACE PACKAGE BODY PKG_NGUOIDUNG AS

    PROCEDURE SP_LAYDS(
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                nd.MANGUOIDUNG,
                nd.TENDANGNHAP,
                nd.MAGV,
                gv.HOTEN,
                gv.EMAIL,
                (SELECT LISTAGG(nnd.TENNHOM, ', ') WITHIN GROUP (ORDER BY nnd.TENNHOM)
                 FROM NGUOIDUNG_NHOM ndn
                 JOIN NHOMNGUOIDUNG nnd ON TRIM(nnd.MANHOM) = TRIM(ndn.MANHOM)
                 WHERE TRIM(ndn.MANGUOIDUNG) = TRIM(nd.MANGUOIDUNG)) AS DS_NHOM
            FROM NGUOIDUNG nd
            LEFT JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(nd.MAGV)
            ORDER BY nd.TENDANGNHAP;
    END SP_LAYDS;

    PROCEDURE SP_LAYTHEOMA(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                nd.MANGUOIDUNG,
                nd.TENDANGNHAP,
                nd.MAGV,
                gv.HOTEN,
                gv.EMAIL
            FROM NGUOIDUNG nd
            LEFT JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(nd.MAGV)
            WHERE TRIM(nd.MANGUOIDUNG) = TRIM(p_manguoidung);
    END SP_LAYTHEOMA;

    PROCEDURE SP_THEM(
        p_tendangnhap IN NVARCHAR2,
        p_matkhau     IN NVARCHAR2,
        p_magv        IN CHAR DEFAULT NULL,
        p_manguoidung_out OUT VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_manguoidung VARCHAR2(50);
        v_exists NUMBER := 0;
        v_gv_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_manguoidung_out := NULL;

        IF p_tendangnhap IS NULL OR LENGTH(TRIM(p_tendangnhap)) = 0 THEN
            p_status := -1;
            p_message := N'Ten dang nhap khong duoc de trong';
            RETURN;
        END IF;

        IF p_matkhau IS NULL OR LENGTH(TRIM(p_matkhau)) < 6 THEN
            p_status := -2;
            p_message := N'Mat khau phai co it nhat 6 ky tu';
            RETURN;
        END IF;

        -- Kiem tra ten dang nhap da ton tai chua
        SELECT COUNT(*) INTO v_exists FROM NGUOIDUNG WHERE UPPER(TRIM(TENDANGNHAP)) = UPPER(TRIM(p_tendangnhap));
        IF v_exists > 0 THEN
            p_status := -3;
            p_message := N'Ten dang nhap da ton tai';
            RETURN;
        END IF;

        -- Kiem tra giao vien ton tai
        IF p_magv IS NOT NULL THEN
            SELECT COUNT(*) INTO v_gv_exists FROM GIAOVIEN WHERE TRIM(MAGV) = TRIM(p_magv);
            IF v_gv_exists = 0 THEN
                p_status := -4;
                p_message := N'Giao vien khong ton tai';
                RETURN;
            END IF;
        END IF;

        -- Tao ma nguoi dung moi
        v_manguoidung := 'ND' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS') || LPAD(SEQ_GENERAL.NEXTVAL, 5, '0');

        INSERT INTO NGUOIDUNG (MANGUOIDUNG, TENDANGNHAP, MATKHAU, MAGV)
        VALUES (v_manguoidung, p_tendangnhap, p_matkhau, p_magv);

        COMMIT;

        p_manguoidung_out := v_manguoidung;
        p_status := 1;
        p_message := N'Them nguoi dung thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_THEM;

    PROCEDURE SP_SUA(
        p_manguoidung IN VARCHAR2,
        p_tendangnhap IN NVARCHAR2 DEFAULT NULL,
        p_magv        IN CHAR DEFAULT NULL,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
        v_dup NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM NGUOIDUNG WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Nguoi dung khong ton tai';
            RETURN;
        END IF;

        -- Kiem tra ten dang nhap trung
        IF p_tendangnhap IS NOT NULL THEN
            SELECT COUNT(*) INTO v_dup FROM NGUOIDUNG
            WHERE UPPER(TRIM(TENDANGNHAP)) = UPPER(TRIM(p_tendangnhap))
            AND TRIM(MANGUOIDUNG) != TRIM(p_manguoidung);
            IF v_dup > 0 THEN
                p_status := -2;
                p_message := N'Ten dang nhap da ton tai';
                RETURN;
            END IF;
        END IF;

        UPDATE NGUOIDUNG
        SET
            TENDANGNHAP = NVL(p_tendangnhap, TENDANGNHAP),
            MAGV = NVL(p_magv, MAGV)
        WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);

        COMMIT;

        p_status := 1;
        p_message := N'Cap nhat nguoi dung thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_SUA;

    PROCEDURE SP_DOI_MATKHAU(
        p_manguoidung IN VARCHAR2,
        p_matkhaucu   IN NVARCHAR2,
        p_matkhaumoi  IN NVARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
        v_matkhau_current NVARCHAR2(100);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*), MAX(MATKHAU) INTO v_exists, v_matkhau_current
        FROM NGUOIDUNG WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);

        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Nguoi dung khong ton tai';
            RETURN;
        END IF;

        IF v_matkhau_current != p_matkhaucu THEN
            p_status := -2;
            p_message := N'Mat khau cu khong chinh xac';
            RETURN;
        END IF;

        IF p_matkhaumoi IS NULL OR LENGTH(TRIM(p_matkhaumoi)) < 6 THEN
            p_status := -3;
            p_message := N'Mat khau moi phai co it nhat 6 ky tu';
            RETURN;
        END IF;

        UPDATE NGUOIDUNG
        SET MATKHAU = p_matkhaumoi
        WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);

        COMMIT;

        p_status := 1;
        p_message := N'Doi mat khau thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_DOI_MATKHAU;

    PROCEDURE SP_XOA(
        p_manguoidung IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM NGUOIDUNG WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Nguoi dung khong ton tai';
            RETURN;
        END IF;

        DELETE FROM NGUOIDUNG_NHOM WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);
        DELETE FROM NGUOIDUNG WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa nguoi dung thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA;

    PROCEDURE SP_DANGNHAP(
        p_tendangnhap IN NVARCHAR2,
        p_matkhau     IN NVARCHAR2,
        p_manguoidung OUT VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
        v_matkhau NVARCHAR2(100);
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';
        p_manguoidung := NULL;

        SELECT COUNT(*), MAX(MANGUOIDUNG), MAX(MATKHAU)
        INTO v_exists, p_manguoidung, v_matkhau
        FROM NGUOIDUNG WHERE UPPER(TRIM(TENDANGNHAP)) = UPPER(TRIM(p_tendangnhap));

        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Ten dang nhap khong ton tai';
            p_manguoidung := NULL;
            RETURN;
        END IF;

        IF v_matkhau != p_matkhau THEN
            p_status := -2;
            p_message := N'Mat khau khong chinh xac';
            p_manguoidung := NULL;
            RETURN;
        END IF;

        p_status := 1;
        p_message := N'Dang nhap thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
            p_manguoidung := NULL;
    END SP_DANGNHAP;

    PROCEDURE SP_GAN_NHOM(
        p_manguoidung IN VARCHAR2,
        p_manhom      IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_nd_exists NUMBER := 0;
        v_nhom_exists NUMBER := 0;
        v_already_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_nd_exists FROM NGUOIDUNG WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung);
        IF v_nd_exists = 0 THEN
            p_status := -1;
            p_message := N'Nguoi dung khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_nhom_exists FROM NHOMNGUOIDUNG WHERE TRIM(MANHOM) = TRIM(p_manhom);
        IF v_nhom_exists = 0 THEN
            p_status := -2;
            p_message := N'Nhom khong ton tai';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_already_exists FROM NGUOIDUNG_NHOM
        WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung) AND TRIM(MANHOM) = TRIM(p_manhom);
        IF v_already_exists > 0 THEN
            p_status := -3;
            p_message := N'Nguoi dung da thuoc nhom nay';
            RETURN;
        END IF;

        INSERT INTO NGUOIDUNG_NHOM (MANGUOIDUNG, MANHOM)
        VALUES (p_manguoidung, p_manhom);

        COMMIT;

        p_status := 1;
        p_message := N'Gan nhom thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_GAN_NHOM;

    PROCEDURE SP_XOA_NHOM(
        p_manguoidung IN VARCHAR2,
        p_manhom      IN VARCHAR2,
        p_status      OUT NUMBER,
        p_message     OUT NVARCHAR2
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        p_status := 0;
        p_message := N'Thanh cong';

        SELECT COUNT(*) INTO v_exists FROM NGUOIDUNG_NHOM
        WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung) AND TRIM(MANHOM) = TRIM(p_manhom);
        IF v_exists = 0 THEN
            p_status := -1;
            p_message := N'Nguoi dung khong thuoc nhom nay';
            RETURN;
        END IF;

        DELETE FROM NGUOIDUNG_NHOM
        WHERE TRIM(MANGUOIDUNG) = TRIM(p_manguoidung) AND TRIM(MANHOM) = TRIM(p_manhom);

        COMMIT;

        p_status := 1;
        p_message := N'Xoa nguoi dung khoi nhom thanh cong';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := -99;
            p_message := N'Loi: ' || SQLERRM;
    END SP_XOA_NHOM;

    PROCEDURE SP_LAYDS_NHOM(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                nnd.MANHOM,
                nnd.TENNHOM
            FROM NGUOIDUNG_NHOM ndn
            JOIN NHOMNGUOIDUNG nnd ON TRIM(nnd.MANHOM) = TRIM(ndn.MANHOM)
            WHERE TRIM(ndn.MANGUOIDUNG) = TRIM(p_manguoidung)
            ORDER BY nnd.TENNHOM;
    END SP_LAYDS_NHOM;

    PROCEDURE SP_LAYDS_QUYEN(
        p_manguoidung IN VARCHAR2,
        p_cursor      OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT DISTINCT
                q.MAQUYEN,
                q.TENQUYEN
            FROM NGUOIDUNG_NHOM ndn
            JOIN NHOM_QUYEN nq ON TRIM(nq.MANHOM) = TRIM(ndn.MANHOM)
            JOIN QUYEN q ON TRIM(q.MAQUYEN) = TRIM(nq.MAQUYEN)
            WHERE TRIM(ndn.MANGUOIDUNG) = TRIM(p_manguoidung)
            ORDER BY q.TENQUYEN;
    END SP_LAYDS_QUYEN;

END PKG_NGUOIDUNG;
/

-- ============================================================
-- COMMIT FINAL
-- ============================================================

COMMIT;
/

-- ============================================================
-- END OF PHASE 2 SCRIPT - PART 2
-- ============================================================
