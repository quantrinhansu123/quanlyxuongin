// Script seed đơn giản sử dụng REST API
// Chạy: node seed-realtime-simple.js

const https = require('https');

// URL của Realtime Database
const DATABASE_URL = 'https://quanlyxuongin-d18cc-default-rtdb.asia-southeast1.firebasedatabase.app';

// Helper function để gửi PUT request
function putData(path, data) {
  return new Promise((resolve, reject) => {
    const url = `${DATABASE_URL}${path}.json`;
    const dataStr = JSON.stringify(data);
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(dataStr);
    req.end();
  });
}

async function seedDatabase() {
  try {
    console.log('🚀 Bắt đầu seed dữ liệu vào Firebase Realtime Database...');
    console.log(`📦 Database URL: ${DATABASE_URL}\n`);

    // Helper để tạo timestamp
    const now = new Date();
    const minutesAgo = (mins) => new Date(now.getTime() - mins * 60000).toISOString();
    const daysFromNow = (days) => new Date(now.getTime() + days * 86400000).toISOString();

    // 1. Seed Nhóm khách hàng
    console.log('📝 Đang seed nhom_khach_hang...');
    const nhomKhachHang = {
      'NH01': {
        ten: 'Ban le',
        mo_ta: 'Khách hàng bán lẻ',
        created_at: new Date().toISOString()
      },
      'NH02': {
        ten: 'Dai ly',
        mo_ta: 'Đại lý',
        created_at: new Date().toISOString()
      },
      'NH03': {
        ten: 'Du an',
        mo_ta: 'Dự án',
        created_at: new Date().toISOString()
      },
      'NH04': {
        ten: 'Vang lai',
        mo_ta: 'Vãng lai',
        created_at: new Date().toISOString()
      }
    };
    await putData('/nhom_khach_hang', nhomKhachHang);
    console.log(`  ✓ Đã tạo: ${Object.keys(nhomKhachHang).length} nhóm khách hàng`);

    // 2. Seed Nguồn khách hàng
    console.log('📝 Đang seed nguon_khach_hang...');
    const nguonKhachHang = {
      'NG01': {
        ten: 'Facebook Ads',
        mo_ta: 'Quảng cáo Facebook',
        created_at: new Date().toISOString()
      },
      'NG02': {
        ten: 'Facebook Group',
        mo_ta: 'Nhóm Facebook',
        created_at: new Date().toISOString()
      },
      'NG03': {
        ten: 'Website',
        mo_ta: 'Website công ty',
        created_at: new Date().toISOString()
      },
      'NG04': {
        ten: 'Zalo',
        mo_ta: 'Zalo',
        created_at: new Date().toISOString()
      },
      'NG05': {
        ten: 'Gioi thieu',
        mo_ta: 'Giới thiệu',
        created_at: new Date().toISOString()
      }
    };
    await putData('/nguon_khach_hang', nguonKhachHang);
    console.log(`  ✓ Đã tạo: ${Object.keys(nguonKhachHang).length} nguồn khách hàng`);

    // 3. Seed Nhân viên
    console.log('📝 Đang seed nhan_vien...');
    const nhanVien = {
      'NV001': {
        ten: 'Nguyễn Văn A',
        chuc_vu: 'Sale Executive',
        phong_ban: 'Kinh Doanh',
        so_dien_thoai: '0988777666',
        email: 'nva@company.com',
        ngay_vao_lam: '2023-01-15',
        trang_thai: 'Dang lam viec',
        avatar: 'NA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'NV002': {
        ten: 'Trần Thị B',
        chuc_vu: 'Sale Executive',
        phong_ban: 'Kinh Doanh',
        so_dien_thoai: '0911222333',
        email: 'ttb@company.com',
        ngay_vao_lam: '2023-03-20',
        trang_thai: 'Dang lam viec',
        avatar: 'TB',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'NV003': {
        ten: 'Lê Văn C',
        chuc_vu: 'Sale Leader',
        phong_ban: 'Kinh Doanh',
        so_dien_thoai: '0909090909',
        email: 'lvc@company.com',
        ngay_vao_lam: '2022-05-10',
        trang_thai: 'Nghi phep',
        avatar: 'LC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'NV004': {
        ten: 'Phạm Thị D',
        chuc_vu: 'Designer',
        phong_ban: 'Thiet ke',
        so_dien_thoai: '0944555666',
        email: 'ptd@company.com',
        ngay_vao_lam: '2023-08-01',
        trang_thai: 'Dang lam viec',
        avatar: 'PD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'NV005': {
        ten: 'Hoàng Văn E',
        chuc_vu: 'HR Manager',
        phong_ban: 'Hanh chinh nhan su',
        so_dien_thoai: '0977888999',
        email: 'hve@company.com',
        ngay_vao_lam: '2021-12-01',
        trang_thai: 'Dang lam viec',
        avatar: 'HE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/nhan_vien', nhanVien);
    console.log(`  ✓ Đã tạo: ${Object.keys(nhanVien).length} nhân viên`);

    // 4. Seed Nhóm sản phẩm
    console.log('📝 Đang seed nhom_san_pham...');
    const nhomSanPham = {
      'NSP01': {
        ten: 'Gia dung',
        mo_ta: 'Gia dụng',
        created_at: new Date().toISOString()
      },
      'NSP02': {
        ten: 'Dien tu',
        mo_ta: 'Điện tử',
        created_at: new Date().toISOString()
      },
      'NSP03': {
        ten: 'Cong nghiep',
        mo_ta: 'Công nghiệp',
        created_at: new Date().toISOString()
      }
    };
    await putData('/nhom_san_pham', nhomSanPham);
    console.log(`  ✓ Đã tạo: ${Object.keys(nhomSanPham).length} nhóm sản phẩm`);

    // 5. Seed Sản phẩm
    console.log('📝 Đang seed san_pham...');
    const sanPham = {
      'SP01': {
        ten: 'Noi com',
        nhom_san_pham_id: 'NSP01',
        mo_ta: 'Nồi cơm điện',
        gia: 500000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'SP02': {
        ten: 'Quat dien',
        nhom_san_pham_id: 'NSP02',
        mo_ta: 'Quạt điện',
        gia: 300000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'SP03': {
        ten: 'May in',
        nhom_san_pham_id: 'NSP03',
        mo_ta: 'Máy in công nghiệp',
        gia: 5000000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'SP04': {
        ten: 'May cat',
        nhom_san_pham_id: 'NSP03',
        mo_ta: 'Máy cắt',
        gia: 8000000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/san_pham', sanPham);
    console.log(`  ✓ Đã tạo: ${Object.keys(sanPham).length} sản phẩm`);

    // 6. Seed Phân bổ bán hàng
    console.log('📝 Đang seed phan_bo_ban_hang...');
    const phanBoBanHang = {
      'PB01': {
        nhom_khach_hang_id: 'NH01',
        nhom_san_pham_ids: ['NSP01', 'NSP02'],
        san_pham_ids: ['SP01', 'SP02'],
        nhan_vien_ids: ['NV001', 'NV002'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'PB02': {
        nhom_khach_hang_id: 'NH02',
        nhom_san_pham_ids: ['NSP03'],
        san_pham_ids: ['SP03', 'SP04'],
        nhan_vien_ids: ['NV003'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/phan_bo_ban_hang', phanBoBanHang);
    console.log(`  ✓ Đã tạo: ${Object.keys(phanBoBanHang).length} phân bổ bán hàng`);

    // 7. Seed Khách hàng
    console.log('📝 Đang seed khach_hang...');
    const khachHang = {
      'KH001': {
        nhom_khach_hang_id: 'NH01',
        ten: 'Nguyễn Văn Mạnh',
        so_dien_thoai: '0912345678',
        nguon_id: 'NG01',
        ten_nguon: 'Fanpage Đồ Gia Dụng',
        nhan_vien_ban_hang_id: 'NV001',
        so_lan_goi: 1,
        noi_dung_goi: '1. Khách hỏi giá, chưa chốt',
        ghi_chu: 'Cần tư vấn thêm về bảo hành',
        trang_thai: 'Suy nghi',
        da_tao_don: false,
        ngay_phan_cong: minutesAgo(45),
        ngay_xu_ly: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'KH002': {
        nhom_khach_hang_id: 'NH02',
        ten: 'Công ty TNHH ABC',
        so_dien_thoai: '0987654321',
        nguon_id: 'NG03',
        ten_nguon: 'Form đăng ký đại lý',
        nhan_vien_ban_hang_id: 'NV002',
        so_lan_goi: 0,
        noi_dung_goi: '',
        ghi_chu: '',
        trang_thai: 'Moi',
        da_tao_don: false,
        ngay_phan_cong: minutesAgo(120),
        ngay_xu_ly: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'KH003': {
        nhom_khach_hang_id: 'NH03',
        ten: 'Tập đoàn XYZ',
        so_dien_thoai: '0909090909',
        nguon_id: 'NG05',
        ten_nguon: 'Anh Ba giới thiệu',
        nhan_vien_ban_hang_id: 'NV003',
        so_lan_goi: 2,
        noi_dung_goi: '1. Gọi lần 1 thuê bao\n2. Gọi lại khách bảo gửi email',
        ghi_chu: 'Gửi báo giá qua email',
        trang_thai: 'Quan tam',
        da_tao_don: false,
        ngay_phan_cong: minutesAgo(300),
        ngay_xu_ly: minutesAgo(280),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'KH004': {
        nhom_khach_hang_id: 'NH01',
        ten: 'Phạm Thị Hoa',
        so_dien_thoai: '0911223344',
        nguon_id: 'NG02',
        ten_nguon: 'Hội Mẹ Bỉm Sữa',
        nhan_vien_ban_hang_id: 'NV001',
        so_lan_goi: 3,
        noi_dung_goi: '1. Tư vấn SP A\n2. Khách chê đắt\n3. Chốt đơn giảm giá 5%',
        ghi_chu: 'Đã lên đơn',
        trang_thai: 'Da chot',
        da_tao_don: true,
        ngay_phan_cong: minutesAgo(1440),
        ngay_xu_ly: minutesAgo(1400),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/khach_hang', khachHang);
    console.log(`  ✓ Đã tạo: ${Object.keys(khachHang).length} khách hàng`);

    // 8. Seed Đơn hàng
    console.log('📝 Đang seed don_hang...');
    const donHang = {
      'DH1001': {
        khach_hang_id: 'KH004',
        ten_khach_hang: 'Phạm Thị Hoa',
        so_dien_thoai: '0911223344',
        nhom_khach_hang_id: 'NH01',
        nguon_id: 'NG02',
        nhan_vien_ban_hang_id: 'NV001',
        ten_san_pham: 'Combo Gia Dung A',
        yeu_cau: 'Gói quà cẩn thận, giao giờ hành chính',
        trang_thai: 'Dang thuc hien',
        doanh_thu: 550000,
        so_lan_goi: 3,
        created_at: minutesAgo(1400),
        updated_at: new Date().toISOString()
      },
      'DH1002': {
        khach_hang_id: 'KH003',
        ten_khach_hang: 'Minh Long Corp',
        so_dien_thoai: '0999888777',
        nhom_khach_hang_id: 'NH03',
        nguon_id: 'NG05',
        nhan_vien_ban_hang_id: 'NV003',
        ten_san_pham: 'Hop dong in an Q1',
        yeu_cau: 'Xuất hóa đơn VAT, giao hàng tại kho',
        trang_thai: 'Cho xac nhan',
        doanh_thu: 15000000,
        so_lan_goi: 5,
        created_at: minutesAgo(2800),
        updated_at: new Date().toISOString()
      },
      'DH1003': {
        khach_hang_id: 'KH001',
        ten_khach_hang: 'Nguyễn Văn Mạnh',
        so_dien_thoai: '0912345678',
        nhom_khach_hang_id: 'NH01',
        nguon_id: 'NG01',
        nhan_vien_ban_hang_id: 'NV001',
        ten_san_pham: 'May xay sinh to',
        yeu_cau: '',
        trang_thai: 'Hoan thanh',
        doanh_thu: 1200000,
        so_lan_goi: 1,
        created_at: minutesAgo(50),
        updated_at: new Date().toISOString()
      },
      'DH1004': {
        khach_hang_id: 'KH002',
        ten_khach_hang: 'Đại Lý Điện Máy Xanh',
        so_dien_thoai: '0988777111',
        nhom_khach_hang_id: 'NH02',
        nguon_id: 'NG03',
        nhan_vien_ban_hang_id: 'NV002',
        ten_san_pham: 'Lo hang quat dien',
        yeu_cau: 'Kiểm tra kỹ tem bảo hành',
        trang_thai: 'Dang giao',
        doanh_thu: 45000000,
        so_lan_goi: 2,
        created_at: minutesAgo(4000),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/don_hang', donHang);
    console.log(`  ✓ Đã tạo: ${Object.keys(donHang).length} đơn hàng`);

    // 9. Seed Lịch sử thanh toán
    console.log('📝 Đang seed lich_su_thanh_toan...');
    const lichSuThanhToan = {
      'PAY01': {
        don_hang_id: 'DH1001',
        ngay_thanh_toan: minutesAgo(100),
        so_tien: 550000,
        noi_dung: 'CK VCB',
        hinh_anh_chung_tu: 'url',
        created_at: new Date().toISOString()
      },
      'PAY02': {
        don_hang_id: 'DH1003',
        ngay_thanh_toan: minutesAgo(10),
        so_tien: 1200000,
        noi_dung: 'Tien mat',
        hinh_anh_chung_tu: 'url',
        created_at: new Date().toISOString()
      },
      'PAY03': {
        don_hang_id: 'DH1004',
        ngay_thanh_toan: minutesAgo(3000),
        so_tien: 20000000,
        noi_dung: 'Dat coc',
        hinh_anh_chung_tu: 'url',
        created_at: new Date().toISOString()
      }
    };
    await putData('/lich_su_thanh_toan', lichSuThanhToan);
    console.log(`  ✓ Đã tạo: ${Object.keys(lichSuThanhToan).length} lịch sử thanh toán`);

    // 10. Seed Mẫu thiết kế
    console.log('📝 Đang seed mau_thiet_ke...');
    const mauThietKe = {
      'D001': {
        tieu_de: 'Landing Page My Pham',
        url_hinh_anh: 'https://picsum.photos/400/300?random=1',
        danh_muc: 'My pham',
        mo_ta: 'Thiết kế tone hồng, sang trọng',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'D002': {
        tieu_de: 'Banner Khuyen Mai',
        url_hinh_anh: 'https://picsum.photos/400/300?random=2',
        danh_muc: 'Su kien',
        mo_ta: 'Banner đỏ, nổi bật cho sale 11/11',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'D003': {
        tieu_de: 'Catalogue Noi That',
        url_hinh_anh: 'https://picsum.photos/400/300?random=3',
        danh_muc: 'Noi that',
        mo_ta: 'Phong cách tối giản, hiện đại',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/mau_thiet_ke', mauThietKe);
    console.log(`  ✓ Đã tạo: ${Object.keys(mauThietKe).length} mẫu thiết kế`);

    // 11. Seed Đơn thiết kế
    console.log('📝 Đang seed don_thiet_ke...');
    const donThietKe = {
      'DH001': {
        ten_khach_hang: 'Spa Tham My Lan Anh',
        so_dien_thoai: '0912345678',
        loai_san_pham: 'Bo nhan dien',
        yeu_cau: 'Thiết kế Logo + Namecard tông màu vàng gold, sang trọng. Cần file vector gốc.',
        nhan_vien_thiet_ke_id: 'NV004',
        trang_thai: 'Dang thiet ke',
        doanh_thu: 2500000,
        han_hoan_thanh: daysFromNow(2),
        created_at: minutesAgo(2000),
        updated_at: new Date().toISOString()
      },
      'DH002': {
        ten_khach_hang: 'Nha hang Bien Dong',
        so_dien_thoai: '0988777666',
        loai_san_pham: 'Menu',
        yeu_cau: 'Làm lại menu 10 trang, phong cách nhiệt đới (Tropical). Gửi trước bản demo trang bìa.',
        nhan_vien_thiet_ke_id: 'NV004',
        trang_thai: 'Cho duyet',
        doanh_thu: 1500000,
        han_hoan_thanh: daysFromNow(1),
        created_at: minutesAgo(4000),
        updated_at: new Date().toISOString()
      },
      'DH003': {
        ten_khach_hang: 'Shop Quan Ao May',
        so_dien_thoai: '0909111222',
        loai_san_pham: 'Banner Ads',
        yeu_cau: '5 Banner chạy quảng cáo Facebook size vuông và chữ nhật. Nội dung Sale off 50%.',
        nhan_vien_thiet_ke_id: null,
        trang_thai: 'Cho xu ly',
        doanh_thu: 500000,
        han_hoan_thanh: daysFromNow(3),
        created_at: minutesAgo(120),
        updated_at: new Date().toISOString()
      },
      'DH004': {
        ten_khach_hang: 'Cty Bat Dong San Hung Thinh',
        so_dien_thoai: '0944555888',
        loai_san_pham: 'Brochure',
        yeu_cau: 'Thiết kế Brochure dự án mới, khổ A4 gấp 3. Hình ảnh đã có sẵn trong drive.',
        nhan_vien_thiet_ke_id: 'NV004',
        trang_thai: 'Hoan thanh',
        doanh_thu: 3000000,
        han_hoan_thanh: daysFromNow(-1),
        created_at: minutesAgo(10000),
        updated_at: new Date().toISOString()
      }
    };
    await putData('/don_thiet_ke', donThietKe);
    console.log(`  ✓ Đã tạo: ${Object.keys(donThietKe).length} đơn thiết kế`);

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ Seed dữ liệu hoàn tất!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📊 Tổng kết:');
    console.log(`  - Nhóm khách hàng: 4`);
    console.log(`  - Nguồn khách hàng: 5`);
    console.log(`  - Nhân viên: 5`);
    console.log(`  - Nhóm sản phẩm: 3`);
    console.log(`  - Sản phẩm: 4`);
    console.log(`  - Phân bổ bán hàng: 2`);
    console.log(`  - Khách hàng: 4`);
    console.log(`  - Đơn hàng: 4`);
    console.log(`  - Lịch sử thanh toán: 3`);
    console.log(`  - Mẫu thiết kế: 3`);
    console.log(`  - Đơn thiết kế: 4`);
    console.log('');
    console.log('🔍 Kiểm tra dữ liệu tại:');
    console.log(`   ${DATABASE_URL}`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ LỖI khi seed dữ liệu!');
    console.error('═══════════════════════════════════════');
    console.error('Chi tiết lỗi:', error.message);
    console.error('');
    console.error('🔧 Kiểm tra:');
    console.error('  1. Realtime Database Rules có cho phép đọc/ghi không?');
    console.error('  2. Database URL đã đúng chưa?');
    console.error('  3. Kiểm tra Firebase Console > Realtime Database > Rules');
    console.error('');
    if (error.code) {
      console.error('Mã lỗi:', error.code);
    }
    process.exit(1);
  }
}

seedDatabase();

