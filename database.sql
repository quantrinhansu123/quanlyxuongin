-- ============================================
-- DATABASE SCHEMA FOR CRM LEAD MANAGEMENT
-- Tên bảng tiếng Việt không dấu
-- ============================================

-- Bảng: Nhân viên
CREATE TABLE nhan_vien (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    chuc_vu VARCHAR(100) NOT NULL,
    phong_ban VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(20),
    email VARCHAR(255),
    ngay_vao_lam DATE NOT NULL,
    trang_thai VARCHAR(50) NOT NULL, -- 'Dang lam viec', 'Nghi phep', 'Da nghi viec'
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng: Nhóm khách hàng
CREATE TABLE nhom_khach_hang (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: Nguồn khách hàng
CREATE TABLE nguon_khach_hang (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: Khách hàng (Lead)
CREATE TABLE khach_hang (
    id VARCHAR(50) PRIMARY KEY,
    nhom_khach_hang_id VARCHAR(50) NOT NULL,
    ten VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    nguon_id VARCHAR(50) NOT NULL,
    ten_nguon VARCHAR(255), -- Tên cụ thể của nguồn (ví dụ: Fanpage Đồ Gia Dụng)
    nhan_vien_ban_hang_id VARCHAR(50) NOT NULL,
    so_lan_goi INT DEFAULT 0,
    noi_dung_goi TEXT, -- Nội dung các cuộc gọi: "1. Content\n2. Content"
    ghi_chu TEXT,
    trang_thai VARCHAR(50) NOT NULL, -- 'Moi', 'Da goi', 'Quan tam', 'Khong quan tam', 'Suy nghi', 'Da chot'
    da_tao_don BOOLEAN DEFAULT FALSE,
    ngay_phan_cong TIMESTAMP NOT NULL, -- Thời gian phân công cho sale
    ngay_xu_ly TIMESTAMP NULL, -- Thời gian xử lý (gọi hoặc tạo đơn)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nhom_khach_hang_id) REFERENCES nhom_khach_hang(id),
    FOREIGN KEY (nguon_id) REFERENCES nguon_khach_hang(id),
    FOREIGN KEY (nhan_vien_ban_hang_id) REFERENCES nhan_vien(id)
);

-- Bảng: Nhóm sản phẩm
CREATE TABLE nhom_san_pham (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: Sản phẩm
CREATE TABLE san_pham (
    id VARCHAR(50) PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    nhom_san_pham_id VARCHAR(50) NOT NULL,
    mo_ta TEXT,
    gia DECIMAL(15, 2),
    don_vi VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nhom_san_pham_id) REFERENCES nhom_san_pham(id)
);

-- Bảng: Phân bổ bán hàng
CREATE TABLE phan_bo_ban_hang (
    id VARCHAR(50) PRIMARY KEY,
    nhom_khach_hang_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nhom_khach_hang_id) REFERENCES nhom_khach_hang(id)
);

-- Bảng: Phân bổ bán hàng - Nhóm sản phẩm (Many-to-Many)
CREATE TABLE phan_bo_ban_hang_nhom_san_pham (
    phan_bo_id VARCHAR(50) NOT NULL,
    nhom_san_pham_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (phan_bo_id, nhom_san_pham_id),
    FOREIGN KEY (phan_bo_id) REFERENCES phan_bo_ban_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (nhom_san_pham_id) REFERENCES nhom_san_pham(id) ON DELETE CASCADE
);

-- Bảng: Phân bổ bán hàng - Sản phẩm (Many-to-Many)
CREATE TABLE phan_bo_ban_hang_san_pham (
    phan_bo_id VARCHAR(50) NOT NULL,
    san_pham_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (phan_bo_id, san_pham_id),
    FOREIGN KEY (phan_bo_id) REFERENCES phan_bo_ban_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE
);

-- Bảng: Phân bổ bán hàng - Nhân viên (Many-to-Many)
CREATE TABLE phan_bo_ban_hang_nhan_vien (
    phan_bo_id VARCHAR(50) NOT NULL,
    nhan_vien_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (phan_bo_id, nhan_vien_id),
    FOREIGN KEY (phan_bo_id) REFERENCES phan_bo_ban_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE CASCADE
);

-- Bảng: Đơn hàng
CREATE TABLE don_hang (
    id VARCHAR(50) PRIMARY KEY,
    khach_hang_id VARCHAR(50) NOT NULL,
    ten_khach_hang VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    nhom_khach_hang_id VARCHAR(50) NOT NULL,
    nguon_id VARCHAR(50) NOT NULL,
    nhan_vien_ban_hang_id VARCHAR(50) NOT NULL,
    ten_san_pham VARCHAR(255) NOT NULL,
    yeu_cau TEXT,
    trang_thai VARCHAR(50) NOT NULL, -- 'Cho xac nhan', 'Dang thuc hien', 'Dang giao', 'Hoan thanh', 'Da huy'
    doanh_thu DECIMAL(15, 2) NOT NULL DEFAULT 0,
    so_lan_goi INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
    FOREIGN KEY (nhom_khach_hang_id) REFERENCES nhom_khach_hang(id),
    FOREIGN KEY (nguon_id) REFERENCES nguon_khach_hang(id),
    FOREIGN KEY (nhan_vien_ban_hang_id) REFERENCES nhan_vien(id)
);

-- Bảng: Lịch sử thanh toán
CREATE TABLE lich_su_thanh_toan (
    id VARCHAR(50) PRIMARY KEY,
    don_hang_id VARCHAR(50) NOT NULL,
    ngay_thanh_toan TIMESTAMP NOT NULL,
    so_tien DECIMAL(15, 2) NOT NULL,
    noi_dung TEXT,
    hinh_anh_chung_tu VARCHAR(500), -- URL hoặc Base64
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE
);

-- Bảng: Mẫu thiết kế
CREATE TABLE mau_thiet_ke (
    id VARCHAR(50) PRIMARY KEY,
    tieu_de VARCHAR(255) NOT NULL,
    url_hinh_anh VARCHAR(500),
    danh_muc VARCHAR(100),
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng: Đơn thiết kế
CREATE TABLE don_thiet_ke (
    id VARCHAR(50) PRIMARY KEY,
    ten_khach_hang VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    loai_san_pham VARCHAR(100) NOT NULL, -- Logo, Banner, Menu...
    yeu_cau TEXT,
    nhan_vien_thiet_ke_id VARCHAR(50), -- NULL nếu chưa phân bổ
    trang_thai VARCHAR(50) NOT NULL, -- 'Cho xu ly', 'Dang thiet ke', 'Cho duyet', 'Hoan thanh', 'Huy'
    doanh_thu DECIMAL(15, 2) NOT NULL DEFAULT 0,
    han_hoan_thanh DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nhan_vien_thiet_ke_id) REFERENCES nhan_vien(id)
);

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- Insert Nhóm khách hàng
INSERT INTO nhom_khach_hang (id, ten, mo_ta) VALUES
('NH01', 'Ban le', 'Khách hàng bán lẻ'),
('NH02', 'Dai ly', 'Đại lý'),
('NH03', 'Du an', 'Dự án'),
('NH04', 'Vang lai', 'Vãng lai');

-- Insert Nguồn khách hàng
INSERT INTO nguon_khach_hang (id, ten, mo_ta) VALUES
('NG01', 'Facebook Ads', 'Quảng cáo Facebook'),
('NG02', 'Facebook Group', 'Nhóm Facebook'),
('NG03', 'Website', 'Website công ty'),
('NG04', 'Zalo', 'Zalo'),
('NG05', 'Gioi thieu', 'Giới thiệu');

-- Insert Nhân viên
INSERT INTO nhan_vien (id, ten, chuc_vu, phong_ban, so_dien_thoai, email, ngay_vao_lam, trang_thai, avatar) VALUES
('NV001', 'Nguyễn Văn A', 'Sale Executive', 'Kinh Doanh', '0988777666', 'nva@company.com', '2023-01-15', 'Dang lam viec', 'NA'),
('NV002', 'Trần Thị B', 'Sale Executive', 'Kinh Doanh', '0911222333', 'ttb@company.com', '2023-03-20', 'Dang lam viec', 'TB'),
('NV003', 'Lê Văn C', 'Sale Leader', 'Kinh Doanh', '0909090909', 'lvc@company.com', '2022-05-10', 'Nghi phep', 'LC'),
('NV004', 'Phạm Thị D', 'Designer', 'Thiet ke', '0944555666', 'ptd@company.com', '2023-08-01', 'Dang lam viec', 'PD'),
('NV005', 'Hoàng Văn E', 'HR Manager', 'Hanh chinh nhan su', '0977888999', 'hve@company.com', '2021-12-01', 'Dang lam viec', 'HE');

-- Insert Nhóm sản phẩm
INSERT INTO nhom_san_pham (id, ten, mo_ta) VALUES
('NSP01', 'Gia dung', 'Gia dụng'),
('NSP02', 'Dien tu', 'Điện tử'),
('NSP03', 'Cong nghiep', 'Công nghiệp');

-- Insert Sản phẩm
INSERT INTO san_pham (id, ten, nhom_san_pham_id, mo_ta, gia) VALUES
('SP01', 'Noi com', 'NSP01', 'Nồi cơm điện', 500000),
('SP02', 'Quat dien', 'NSP02', 'Quạt điện', 300000),
('SP03', 'May in', 'NSP03', 'Máy in công nghiệp', 5000000),
('SP04', 'May cat', 'NSP03', 'Máy cắt', 8000000);

-- Insert Phân bổ bán hàng
INSERT INTO phan_bo_ban_hang (id, nhom_khach_hang_id) VALUES
('PB01', 'NH01'),
('PB02', 'NH02');

-- Insert Phân bổ bán hàng - Nhóm sản phẩm
INSERT INTO phan_bo_ban_hang_nhom_san_pham (phan_bo_id, nhom_san_pham_id) VALUES
('PB01', 'NSP01'),
('PB01', 'NSP02'),
('PB02', 'NSP03');

-- Insert Phân bổ bán hàng - Sản phẩm
INSERT INTO phan_bo_ban_hang_san_pham (phan_bo_id, san_pham_id) VALUES
('PB01', 'SP01'),
('PB01', 'SP02'),
('PB02', 'SP03'),
('PB02', 'SP04');

-- Insert Phân bổ bán hàng - Nhân viên
INSERT INTO phan_bo_ban_hang_nhan_vien (phan_bo_id, nhan_vien_id) VALUES
('PB01', 'NV001'),
('PB01', 'NV002'),
('PB02', 'NV003');

-- Insert Khách hàng
INSERT INTO khach_hang (id, nhom_khach_hang_id, ten, so_dien_thoai, nguon_id, ten_nguon, nhan_vien_ban_hang_id, so_lan_goi, noi_dung_goi, ghi_chu, trang_thai, da_tao_don, ngay_phan_cong, ngay_xu_ly) VALUES
('KH001', 'NH01', 'Nguyễn Văn Mạnh', '0912345678', 'NG01', 'Fanpage Đồ Gia Dụng', 'NV001', 1, '1. Khách hỏi giá, chưa chốt', 'Cần tư vấn thêm về bảo hành', 'Suy nghi', FALSE, NOW() - INTERVAL 45 MINUTE, NULL),
('KH002', 'NH02', 'Công ty TNHH ABC', '0987654321', 'NG03', 'Form đăng ký đại lý', 'NV002', 0, '', '', 'Moi', FALSE, NOW() - INTERVAL 120 MINUTE, NULL),
('KH003', 'NH03', 'Tập đoàn XYZ', '0909090909', 'NG05', 'Anh Ba giới thiệu', 'NV003', 2, '1. Gọi lần 1 thuê bao\n2. Gọi lại khách bảo gửi email', 'Gửi báo giá qua email', 'Quan tam', FALSE, NOW() - INTERVAL 300 MINUTE, NOW() - INTERVAL 280 MINUTE),
('KH004', 'NH01', 'Phạm Thị Hoa', '0911223344', 'NG02', 'Hội Mẹ Bỉm Sữa', 'NV001', 3, '1. Tư vấn SP A\n2. Khách chê đắt\n3. Chốt đơn giảm giá 5%', 'Đã lên đơn', 'Da chot', TRUE, NOW() - INTERVAL 1440 MINUTE, NOW() - INTERVAL 1400 MINUTE);

-- Insert Đơn hàng
INSERT INTO don_hang (id, khach_hang_id, ten_khach_hang, so_dien_thoai, nhom_khach_hang_id, nguon_id, nhan_vien_ban_hang_id, ten_san_pham, yeu_cau, trang_thai, doanh_thu, so_lan_goi, created_at) VALUES
('DH1001', 'KH004', 'Phạm Thị Hoa', '0911223344', 'NH01', 'NG02', 'NV001', 'Combo Gia Dung A', 'Gói quà cẩn thận, giao giờ hành chính', 'Dang thuc hien', 550000, 3, NOW() - INTERVAL 1400 MINUTE),
('DH1002', 'KH003', 'Minh Long Corp', '0999888777', 'NH03', 'NG05', 'NV003', 'Hop dong in an Q1', 'Xuất hóa đơn VAT, giao hàng tại kho', 'Cho xac nhan', 15000000, 5, NOW() - INTERVAL 2800 MINUTE),
('DH1003', 'KH001', 'Nguyễn Văn Mạnh', '0912345678', 'NH01', 'NG01', 'NV001', 'May xay sinh to', '', 'Hoan thanh', 1200000, 1, NOW() - INTERVAL 50 MINUTE),
('DH1004', 'KH002', 'Đại Lý Điện Máy Xanh', '0988777111', 'NH02', 'NG03', 'NV002', 'Lo hang quat dien', 'Kiểm tra kỹ tem bảo hành', 'Dang giao', 45000000, 2, NOW() - INTERVAL 4000 MINUTE);

-- Insert Lịch sử thanh toán
INSERT INTO lich_su_thanh_toan (id, don_hang_id, ngay_thanh_toan, so_tien, noi_dung, hinh_anh_chung_tu) VALUES
('PAY01', 'DH1001', NOW() - INTERVAL 100 MINUTE, 550000, 'CK VCB', 'url'),
('PAY02', 'DH1003', NOW() - INTERVAL 10 MINUTE, 1200000, 'Tien mat', 'url'),
('PAY03', 'DH1004', NOW() - INTERVAL 3000 MINUTE, 20000000, 'Dat coc', 'url');

-- Insert Mẫu thiết kế
INSERT INTO mau_thiet_ke (id, tieu_de, url_hinh_anh, danh_muc, mo_ta) VALUES
('D001', 'Landing Page My Pham', 'https://picsum.photos/400/300?random=1', 'My pham', 'Thiết kế tone hồng, sang trọng'),
('D002', 'Banner Khuyen Mai', 'https://picsum.photos/400/300?random=2', 'Su kien', 'Banner đỏ, nổi bật cho sale 11/11'),
('D003', 'Catalogue Noi That', 'https://picsum.photos/400/300?random=3', 'Noi that', 'Phong cách tối giản, hiện đại');

-- Insert Đơn thiết kế
INSERT INTO don_thiet_ke (id, ten_khach_hang, so_dien_thoai, loai_san_pham, yeu_cau, nhan_vien_thiet_ke_id, trang_thai, doanh_thu, han_hoan_thanh, created_at) VALUES
('DH001', 'Spa Tham My Lan Anh', '0912345678', 'Bo nhan dien', 'Thiết kế Logo + Namecard tông màu vàng gold, sang trọng. Cần file vector gốc.', 'NV004', 'Dang thiet ke', 2500000, DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW() - INTERVAL 2000 MINUTE),
('DH002', 'Nha hang Bien Dong', '0988777666', 'Menu', 'Làm lại menu 10 trang, phong cách nhiệt đới (Tropical). Gửi trước bản demo trang bìa.', 'NV004', 'Cho duyet', 1500000, DATE_ADD(CURDATE(), INTERVAL 1 DAY), NOW() - INTERVAL 4000 MINUTE),
('DH003', 'Shop Quan Ao May', '0909111222', 'Banner Ads', '5 Banner chạy quảng cáo Facebook size vuông và chữ nhật. Nội dung Sale off 50%.', NULL, 'Cho xu ly', 500000, DATE_ADD(CURDATE(), INTERVAL 3 DAY), NOW() - INTERVAL 120 MINUTE),
('DH004', 'Cty Bat Dong San Hung Thinh', '0944555888', 'Brochure', 'Thiết kế Brochure dự án mới, khổ A4 gấp 3. Hình ảnh đã có sẵn trong drive.', 'NV004', 'Hoan thanh', 3000000, DATE_SUB(CURDATE(), INTERVAL 1 DAY), NOW() - INTERVAL 10000 MINUTE);

-- ============================================
-- TẠO INDEX ĐỂ TỐI ƯU HIỆU SUẤT
-- ============================================

CREATE INDEX idx_khach_hang_nhan_vien ON khach_hang(nhan_vien_ban_hang_id);
CREATE INDEX idx_khach_hang_trang_thai ON khach_hang(trang_thai);
CREATE INDEX idx_khach_hang_ngay_phan_cong ON khach_hang(ngay_phan_cong);
CREATE INDEX idx_don_hang_khach_hang ON don_hang(khach_hang_id);
CREATE INDEX idx_don_hang_trang_thai ON don_hang(trang_thai);
CREATE INDEX idx_don_hang_ngay_tao ON don_hang(created_at);
CREATE INDEX idx_lich_su_thanh_toan_don_hang ON lich_su_thanh_toan(don_hang_id);
CREATE INDEX idx_don_thiet_ke_trang_thai ON don_thiet_ke(trang_thai);
CREATE INDEX idx_don_thiet_ke_nhan_vien ON don_thiet_ke(nhan_vien_thiet_ke_id);

