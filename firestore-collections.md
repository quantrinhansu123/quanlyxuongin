# Cấu trúc Firestore Collections

## Collections (Tên tiếng Việt không dấu)

### 1. nhom_khach_hang
- **id**: string (document ID)
- **ten**: string
- **mo_ta**: string
- **created_at**: Timestamp

### 2. nguon_khach_hang
- **id**: string (document ID)
- **ten**: string
- **mo_ta**: string
- **created_at**: Timestamp

### 3. nhan_vien
- **id**: string (document ID)
- **ten**: string
- **chuc_vu**: string
- **phong_ban**: string
- **so_dien_thoai**: string
- **email**: string
- **ngay_vao_lam**: Timestamp
- **trang_thai**: string ('Dang lam viec', 'Nghi phep', 'Da nghi viec')
- **avatar**: string
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 4. nhom_san_pham
- **id**: string (document ID)
- **ten**: string
- **mo_ta**: string
- **created_at**: Timestamp

### 5. san_pham
- **id**: string (document ID)
- **ten**: string
- **nhom_san_pham_id**: string (reference)
- **mo_ta**: string
- **gia**: number
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 6. phan_bo_ban_hang
- **id**: string (document ID)
- **nhom_khach_hang_id**: string (reference)
- **nhom_san_pham_ids**: array<string>
- **san_pham_ids**: array<string>
- **nhan_vien_ids**: array<string>
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 7. khach_hang
- **id**: string (document ID)
- **nhom_khach_hang_id**: string (reference)
- **ten**: string
- **so_dien_thoai**: string
- **nguon_id**: string (reference)
- **ten_nguon**: string
- **nhan_vien_ban_hang_id**: string (reference)
- **so_lan_goi**: number
- **noi_dung_goi**: string
- **ghi_chu**: string
- **trang_thai**: string ('Moi', 'Da goi', 'Quan tam', 'Khong quan tam', 'Suy nghi', 'Da chot')
- **da_tao_don**: boolean
- **ngay_phan_cong**: Timestamp
- **ngay_xu_ly**: Timestamp | null
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 8. don_hang
- **id**: string (document ID)
- **khach_hang_id**: string (reference)
- **ten_khach_hang**: string
- **so_dien_thoai**: string
- **nhom_khach_hang_id**: string (reference)
- **nguon_id**: string (reference)
- **nhan_vien_ban_hang_id**: string (reference)
- **ten_san_pham**: string
- **yeu_cau**: string
- **trang_thai**: string ('Cho xac nhan', 'Dang thuc hien', 'Dang giao', 'Hoan thanh', 'Da huy')
- **doanh_thu**: number
- **so_lan_goi**: number
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 9. lich_su_thanh_toan
- **id**: string (document ID)
- **don_hang_id**: string (reference)
- **ngay_thanh_toan**: Timestamp
- **so_tien**: number
- **noi_dung**: string
- **hinh_anh_chung_tu**: string
- **created_at**: Timestamp

**Lưu ý**: Lưu cả ở collection riêng và subcollection của don_hang để query linh hoạt

### 10. mau_thiet_ke
- **id**: string (document ID)
- **tieu_de**: string
- **url_hinh_anh**: string
- **danh_muc**: string
- **mo_ta**: string
- **created_at**: Timestamp
- **updated_at**: Timestamp

### 11. don_thiet_ke
- **id**: string (document ID)
- **ten_khach_hang**: string
- **so_dien_thoai**: string
- **loai_san_pham**: string
- **yeu_cau**: string
- **nhan_vien_thiet_ke_id**: string | null (reference)
- **trang_thai**: string ('Cho xu ly', 'Dang thiet ke', 'Cho duyet', 'Hoan thanh', 'Huy')
- **doanh_thu**: number
- **han_hoan_thanh**: Timestamp
- **created_at**: Timestamp
- **updated_at**: Timestamp

## Cách sử dụng

1. Cài đặt Firebase:
```bash
npm install firebase
```

2. Cấu hình Firebase trong `firebase.config.ts` với thông tin project của bạn

3. Chạy script seed dữ liệu:
```bash
npx tsx firebase-seed.ts
```

hoặc nếu đã compile:
```bash
node firebase-seed.js
```

## Firestore Security Rules (Mẫu)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi nếu đã authenticate
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Hoặc custom rules theo collection
    match /khach_hang/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

