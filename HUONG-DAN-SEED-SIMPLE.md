# 🚀 Hướng dẫn seed dữ liệu đơn giản (Không cần config)

Script này sử dụng REST API trực tiếp, không cần cấu hình Firebase SDK.

## Bước 1: Kiểm tra Realtime Database Rules

**QUAN TRỌNG**: Phải cho phép đọc/ghi trước!

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project: **quanlyxuongin-d18cc**
3. Vào **Realtime Database**
4. Click tab **Rules**
5. Đảm bảo rules như sau (cho development):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

6. Click **Publish** để lưu

## Bước 2: Chạy Script

Chỉ cần chạy lệnh:

```bash
node seed-realtime-simple.js
```

Hoặc:

```bash
npm run seed:simple
```

## Bước 3: Kiểm tra kết quả

Sau khi chạy xong, kiểm tra tại:
- Firebase Console > Realtime Database
- Hoặc: https://quanlyxuongin-d18cc-default-rtdb.asia-southeast1.firebasedatabase.app/

Bạn sẽ thấy các node:
- `nhom_khach_hang`
- `nguon_khach_hang`
- `nhan_vien`
- `khach_hang`
- `don_hang`
- ... và các node khác

## Xử lý lỗi

### Lỗi: "Permission denied"
- **Nguyên nhân**: Rules chưa cho phép đọc/ghi
- **Giải pháp**: Làm lại Bước 1, đảm bảo rules là `.read: true` và `.write: true`

### Lỗi: "Cannot find module"
- **Giải pháp**: Script này chỉ dùng Node.js built-in modules, không cần cài thêm gì

### Lỗi: "ECONNREFUSED" hoặc timeout
- **Nguyên nhân**: Database URL sai hoặc database chưa được bật
- **Giải pháp**: Kiểm tra lại URL trong script

## ✅ Checklist

- [ ] Đã kiểm tra và cập nhật Realtime Database Rules
- [ ] Đã chạy `node seed-realtime-simple.js`
- [ ] Đã kiểm tra dữ liệu trong Firebase Console
- [ ] Dữ liệu đã xuất hiện (không còn null)

## 🎉 Hoàn thành!

Sau khi seed xong, bạn sẽ có đầy đủ dữ liệu trong Realtime Database!

