-- ============================================================
-- PHASE 2: TAO VIEWS MOI CHO BAO CAO CHI TIET
-- He thong Quan Ly Giao Vien - qlgvpdb
-- Ngay tao: 2026-01-05
-- Tac gia: LuckyBoiz
-- ============================================================

-- ============================================================
-- 1. V_GIANGDAY_CHITIET - View chi tiet giang day
-- ============================================================

CREATE OR REPLACE VIEW V_GIANGDAY_CHITIET AS
SELECT
    ctgd.MACHITIETGIANGDAY,
    ctgd.SOTIET,
    ctgd.SOTIETQUYDOI,
    ctgd.GHICHU AS GHICHU_CHITIET,
    ctgd.NOIDUNGGIANGDAY,
    ctgd.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    tgd.MATAIGIANGDAY,
    tgd.TENHOCPHAN,
    tgd.SISO,
    tgd.HE,
    tgd.LOP,
    tgd.SOTINCHI,
    tgd.NAMHOC,
    tgd.GHICHU AS GHICHU_TAI,
    dt.MADOITUONG,
    tg.MATHOIGIAN,
    nn.MANGONNGU
FROM CHITIETGIANGDAY ctgd
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctgd.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN TAIGIANGDAY tgd ON TRIM(tgd.MATAIGIANGDAY) = TRIM(ctgd.MATAIGIANGDAY)
LEFT JOIN DOITUONGGIANGDAY dt ON TRIM(dt.MADOITUONG) = TRIM(tgd.MADOITUONG)
LEFT JOIN THOIGIANGIANGDAY tg ON TRIM(tg.MATHOIGIAN) = TRIM(tgd.MATHOIGIAN)
LEFT JOIN NGONNGUGIANGDAY nn ON TRIM(nn.MANGONNGU) = TRIM(tgd.MANGONNGU);

COMMENT ON TABLE V_GIANGDAY_CHITIET IS 'View chi tiet giang day voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 2. V_NCKH_CHITIET - View chi tiet NCKH
-- ============================================================

CREATE OR REPLACE VIEW V_NCKH_CHITIET AS
SELECT
    ctn.MACHITIETNCKH,
    ctn.VAITRO,
    ctn.SOGIO,
    ctn.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    tn.MATAINCKH,
    tn.TENCONGTRINHKHOAHOC,
    tn.NAMHOC,
    tn.SOTACGIA,
    tn.MALOAINCKH,
    ln.TENLOAINCKH,
    ln.MOTA AS MOTA_LOAI
FROM CHITIETNCKH ctn
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctn.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN TAINCKH tn ON TRIM(tn.MATAINCKH) = TRIM(ctn.MATAINCKH)
LEFT JOIN LOAINCKH ln ON TRIM(ln.MALOAINCKH) = TRIM(tn.MALOAINCKH);

COMMENT ON TABLE V_NCKH_CHITIET IS 'View chi tiet NCKH voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 3. V_KHAOTHI_CHITIET - View chi tiet khao thi
-- ============================================================

CREATE OR REPLACE VIEW V_KHAOTHI_CHITIET AS
SELECT
    cttk.MACHITIETTAIKHAOTHI,
    cttk.SOBAI,
    cttk.SOGIOQUYCHUAN,
    cttk.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    tk.MATAIKHAOTHI,
    tk.HOCPHAN,
    tk.LOP,
    tk.NAMHOC,
    tk.GHICHU,
    tk.MALOAICONGTACKHAOTHI,
    lct.TENLOAICONGTACKHAOTHI,
    lct.MOTA AS MOTA_LOAI
FROM CHITIETTAIKHAOTHI cttk
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(cttk.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN TAIKHAOTHI tk ON TRIM(tk.MATAIKHAOTHI) = TRIM(cttk.MATAIKHAOTHI)
LEFT JOIN LOAICONGTACKHAOTHI lct ON TRIM(lct.MALOAICONGTACKHAOTHI) = TRIM(tk.MALOAICONGTACKHAOTHI);

COMMENT ON TABLE V_KHAOTHI_CHITIET IS 'View chi tiet khao thi voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 4. V_HOIDONG_CHITIET - View chi tiet hoi dong
-- ============================================================

CREATE OR REPLACE VIEW V_HOIDONG_CHITIET AS
SELECT
    tg.MATHAMGIA,
    tg.SOGIO,
    tg.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    hd.MAHOIDONG,
    hd.SOLUONG,
    hd.NAMHOC,
    hd.THOIGIANBATDAU,
    hd.THOIGIANKETTHUC,
    hd.GHICHU,
    hd.MALOAIHOIDONG,
    lhd.TENLOAIHOIDONG,
    lhd.MOTA AS MOTA_LOAI
FROM THAMGIA tg
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tg.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN TAIHOIDONG hd ON TRIM(hd.MAHOIDONG) = TRIM(tg.MAHOIDONG)
LEFT JOIN LOAIHOIDONG lhd ON TRIM(lhd.MALOAIHOIDONG) = TRIM(hd.MALOAIHOIDONG);

COMMENT ON TABLE V_HOIDONG_CHITIET IS 'View chi tiet hoi dong voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 5. V_HUONGDAN_CHITIET - View chi tiet huong dan
-- ============================================================

CREATE OR REPLACE VIEW V_HUONGDAN_CHITIET AS
SELECT
    tghd.MATHAMGIAHUONGDAN,
    tghd.SOGIO,
    tghd.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    hd.MAHUONGDAN,
    hd.HOTENHOCVIEN,
    hd.LOP,
    hd.HE,
    hd.NAMHOC,
    hd.TENDETAI,
    hd.SOCBHD,
    hd.MALOAIHINHHUONGDAN,
    lhhd.TENLOAIHINHHUONGDAN,
    lhhd.MOTA AS MOTA_LOAI
FROM THAMGIAHUONGDAN tghd
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tghd.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN TAIHUONGDAN hd ON TRIM(hd.MAHUONGDAN) = TRIM(tghd.MAHUONGDAN)
LEFT JOIN LOAIHINHHUONGDAN lhhd ON TRIM(lhhd.MALOAIHINHHUONGDAN) = TRIM(hd.MALOAIHINHHUONGDAN);

COMMENT ON TABLE V_HUONGDAN_CHITIET IS 'View chi tiet huong dan voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 6. V_CONGTACKHAC_CHITIET - View chi tiet cong tac khac
-- ============================================================

CREATE OR REPLACE VIEW V_CONGTACKHAC_CHITIET AS
SELECT
    ctctk.MACHITIETCONGTACKHAC,
    ctctk.VAITRO,
    ctctk.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    ctk.MACONGTACKHAC,
    ctk.NOIDUNGCONGVIEC,
    ctk.NAMHOC,
    ctk.SOLUONG,
    ctk.GHICHU
FROM CHITIETCONGTACKHAC ctctk
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctctk.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
JOIN CONGTACKHAC ctk ON TRIM(ctk.MACONGTACKHAC) = TRIM(ctctk.MACONGTACKHAC);

COMMENT ON TABLE V_CONGTACKHAC_CHITIET IS 'View chi tiet cong tac khac voi thong tin giao vien, bo mon, khoa';
/

-- ============================================================
-- 7. V_TONGHOP_GIAOVIEN - View tong hop tat ca hoat dong cua giao vien
-- ============================================================

CREATE OR REPLACE VIEW V_TONGHOP_GIAOVIEN AS
SELECT
    gv.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    -- Thong ke giang day
    (SELECT COUNT(*) FROM CHITIETGIANGDAY ctgd WHERE TRIM(ctgd.MAGV) = TRIM(gv.MAGV)) AS TONG_GIANGDAY,
    (SELECT NVL(SUM(SOTIETQUYDOI), 0) FROM CHITIETGIANGDAY ctgd WHERE TRIM(ctgd.MAGV) = TRIM(gv.MAGV)) AS TONG_SOTIET_QUYDOI,
    -- Thong ke NCKH
    (SELECT COUNT(*) FROM CHITIETNCKH ctn WHERE TRIM(ctn.MAGV) = TRIM(gv.MAGV)) AS TONG_NCKH,
    (SELECT NVL(SUM(SOGIO), 0) FROM CHITIETNCKH ctn WHERE TRIM(ctn.MAGV) = TRIM(gv.MAGV)) AS TONG_GIO_NCKH,
    -- Thong ke khao thi
    (SELECT COUNT(*) FROM CHITIETTAIKHAOTHI cttk WHERE TRIM(cttk.MAGV) = TRIM(gv.MAGV)) AS TONG_KHAOTHI,
    (SELECT NVL(SUM(SOGIOQUYCHUAN), 0) FROM CHITIETTAIKHAOTHI cttk WHERE TRIM(cttk.MAGV) = TRIM(gv.MAGV)) AS TONG_GIO_KHAOTHI,
    -- Thong ke hoi dong
    (SELECT COUNT(*) FROM THAMGIA tg WHERE TRIM(tg.MAGV) = TRIM(gv.MAGV)) AS TONG_HOIDONG,
    (SELECT NVL(SUM(SOGIO), 0) FROM THAMGIA tg WHERE TRIM(tg.MAGV) = TRIM(gv.MAGV)) AS TONG_GIO_HOIDONG,
    -- Thong ke huong dan
    (SELECT COUNT(*) FROM THAMGIAHUONGDAN tghd WHERE TRIM(tghd.MAGV) = TRIM(gv.MAGV)) AS TONG_HUONGDAN,
    (SELECT NVL(SUM(SOGIO), 0) FROM THAMGIAHUONGDAN tghd WHERE TRIM(tghd.MAGV) = TRIM(gv.MAGV)) AS TONG_GIO_HUONGDAN,
    -- Thong ke cong tac khac
    (SELECT COUNT(*) FROM CHITIETCONGTACKHAC ctctk WHERE TRIM(ctctk.MAGV) = TRIM(gv.MAGV)) AS TONG_CONGTACKHAC
FROM GIAOVIEN gv
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_TONGHOP_GIAOVIEN IS 'View tong hop tat ca hoat dong cua giao vien';
/

-- ============================================================
-- 8. V_TONGHOP_BOMON - View tong hop theo bo mon
-- ============================================================

CREATE OR REPLACE VIEW V_TONGHOP_BOMON AS
SELECT
    bm.MABM,
    bm.TENBM,
    bm.DIACHI,
    bm.MAKHOA,
    k.TENKHOA,
    bm.MACHUNHIEMBM,
    (SELECT gv.HOTEN FROM GIAOVIEN gv WHERE TRIM(gv.MAGV) = TRIM(bm.MACHUNHIEMBM)) AS HOTEN_CHUNHIEM,
    -- So giao vien
    (SELECT COUNT(*) FROM GIAOVIEN gv WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS SO_GIAOVIEN,
    -- Tong giang day
    (SELECT COUNT(*) FROM CHITIETGIANGDAY ctgd
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctgd.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS TONG_GIANGDAY,
    -- Tong NCKH
    (SELECT COUNT(*) FROM CHITIETNCKH ctn
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctn.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS TONG_NCKH,
    -- Tong khao thi
    (SELECT COUNT(*) FROM CHITIETTAIKHAOTHI cttk
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(cttk.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS TONG_KHAOTHI,
    -- Tong hoi dong
    (SELECT COUNT(*) FROM THAMGIA tg
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tg.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS TONG_HOIDONG,
    -- Tong huong dan
    (SELECT COUNT(*) FROM THAMGIAHUONGDAN tghd
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tghd.MAGV)
     WHERE TRIM(gv.MABM) = TRIM(bm.MABM)) AS TONG_HUONGDAN
FROM BOMON bm
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_TONGHOP_BOMON IS 'View tong hop hoat dong theo bo mon';
/

-- ============================================================
-- 9. V_TONGHOP_KHOA - View tong hop theo khoa
-- ============================================================

CREATE OR REPLACE VIEW V_TONGHOP_KHOA AS
SELECT
    k.MAKHOA,
    k.TENKHOA,
    k.DIACHI,
    k.MACHUNHIEMKHOA,
    (SELECT gv.HOTEN FROM GIAOVIEN gv WHERE TRIM(gv.MAGV) = TRIM(k.MACHUNHIEMKHOA)) AS HOTEN_CHUNHIEM,
    -- So bo mon
    (SELECT COUNT(*) FROM BOMON bm WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS SO_BOMON,
    -- So giao vien
    (SELECT COUNT(*) FROM GIAOVIEN gv
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS SO_GIAOVIEN,
    -- Tong giang day
    (SELECT COUNT(*) FROM CHITIETGIANGDAY ctgd
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctgd.MAGV)
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS TONG_GIANGDAY,
    -- Tong NCKH
    (SELECT COUNT(*) FROM CHITIETNCKH ctn
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(ctn.MAGV)
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS TONG_NCKH,
    -- Tong khao thi
    (SELECT COUNT(*) FROM CHITIETTAIKHAOTHI cttk
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(cttk.MAGV)
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS TONG_KHAOTHI,
    -- Tong hoi dong
    (SELECT COUNT(*) FROM THAMGIA tg
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tg.MAGV)
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS TONG_HOIDONG,
    -- Tong huong dan
    (SELECT COUNT(*) FROM THAMGIAHUONGDAN tghd
     JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(tghd.MAGV)
     JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
     WHERE TRIM(bm.MAKHOA) = TRIM(k.MAKHOA)) AS TONG_HUONGDAN
FROM KHOA k;

COMMENT ON TABLE V_TONGHOP_KHOA IS 'View tong hop hoat dong theo khoa';
/

-- ============================================================
-- 10. V_LICHSU_CHUCVU - View lich su chuc vu giao vien
-- ============================================================

CREATE OR REPLACE VIEW V_LICHSU_CHUCVU AS
SELECT
    lscv.MALICHSUCHUCVU,
    lscv.NGAYNHAN,
    lscv.NGAYKETTHUC,
    lscv.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    lscv.MACHUCVU,
    cv.TENCHUCVU,
    cv.MOTA AS MOTA_CHUCVU,
    CASE
        WHEN lscv.NGAYKETTHUC IS NULL THEN N'Dang giu chuc vu'
        ELSE N'Da ket thuc'
    END AS TRANGTHAI
FROM LICHSUCHUCVU lscv
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(lscv.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
LEFT JOIN CHUCVU cv ON TRIM(cv.MACHUCVU) = TRIM(lscv.MACHUCVU);

COMMENT ON TABLE V_LICHSU_CHUCVU IS 'View lich su chuc vu cua giao vien';
/

-- ============================================================
-- 11. V_LICHSU_HOCHAM - View lich su hoc ham giao vien
-- ============================================================

CREATE OR REPLACE VIEW V_LICHSU_HOCHAM AS
SELECT
    lhh.MALSHOCHAM,
    lhh.TENHOCHAM AS TENHOCHAM_NHAN,
    lhh.NGAYNHAN,
    lhh.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    lhh.MAHOCHAM,
    hh.TENHOCHAM AS TENHOCHAM_GOC
FROM LICHSUHOCHAM lhh
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(lhh.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA)
LEFT JOIN HOCHAM hh ON TRIM(hh.MAHOCHAM) = TRIM(lhh.MAHOCHAM);

COMMENT ON TABLE V_LICHSU_HOCHAM IS 'View lich su hoc ham cua giao vien';
/

-- ============================================================
-- 12. V_HOCVI_GIAOVIEN - View hoc vi cua giao vien
-- ============================================================

CREATE OR REPLACE VIEW V_HOCVI_GIAOVIEN AS
SELECT
    hv.MAHOCVI,
    hv.TENHOCVI,
    hv.NGAYNHAN,
    hv.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA
FROM HOCVI hv
JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(hv.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_HOCVI_GIAOVIEN IS 'View hoc vi cua giao vien';
/

-- ============================================================
-- 13. V_NGUOIDUNG_CHITIET - View chi tiet nguoi dung
-- ============================================================

CREATE OR REPLACE VIEW V_NGUOIDUNG_CHITIET AS
SELECT
    nd.MANGUOIDUNG,
    nd.TENDANGNHAP,
    nd.MAGV,
    gv.HOTEN,
    gv.EMAIL,
    bm.MABM,
    bm.TENBM,
    k.MAKHOA,
    k.TENKHOA,
    (SELECT LISTAGG(nnd.TENNHOM, ', ') WITHIN GROUP (ORDER BY nnd.TENNHOM)
     FROM NGUOIDUNG_NHOM ndn
     JOIN NHOMNGUOIDUNG nnd ON TRIM(nnd.MANHOM) = TRIM(ndn.MANHOM)
     WHERE TRIM(ndn.MANGUOIDUNG) = TRIM(nd.MANGUOIDUNG)) AS DS_NHOM,
    (SELECT COUNT(*) FROM NGUOIDUNG_NHOM ndn WHERE TRIM(ndn.MANGUOIDUNG) = TRIM(nd.MANGUOIDUNG)) AS SO_NHOM
FROM NGUOIDUNG nd
LEFT JOIN GIAOVIEN gv ON TRIM(gv.MAGV) = TRIM(nd.MAGV)
LEFT JOIN BOMON bm ON TRIM(bm.MABM) = TRIM(gv.MABM)
LEFT JOIN KHOA k ON TRIM(k.MAKHOA) = TRIM(bm.MAKHOA);

COMMENT ON TABLE V_NGUOIDUNG_CHITIET IS 'View chi tiet nguoi dung voi thong tin giao vien';
/

-- ============================================================
-- COMMIT FINAL
-- ============================================================

COMMIT;
/

-- ============================================================
-- END OF PHASE 2 VIEWS SCRIPT
-- ============================================================
