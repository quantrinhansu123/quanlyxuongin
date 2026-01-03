# 🔥 Hướng dẫn seed dữ liệu vào Firebase Realtime Database

## Bước 1: Lấy Firebase Config

1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **quanlyxuongin-d18cc**
3. Vào **Project Settings** (biểu tượng ⚙️)
4. Scroll xuống phần **"Your apps"**
5. Nếu chưa có Web app, click icon **Web** (`</>`) để tạo
6. Copy thông tin config

## Bước 2: Cập nhật Config

Mở file `firebase-realtime-seed.ts` và cập nhật:

```typescript
const firebaseConfig = {
  apiKey: "DÁN_API_KEY_VÀO_ĐÂY",  // ← Quan trọng!
  authDomain: "quanlyxuongin-d18cc.firebaseapp.com",  // Đã có sẵn
  databaseURL: "https://quanlyxuongin-d18cc-default-rtdb.asia-southeast1.firebasedatabase.app",  // Đã có sẵn
  projectId: "quanlyxuongin-d18cc",  // Đã có sẵn
  storageBucket: "quanlyxuongin-d18cc.appspot.com",  // Đã có sẵn
  messagingSenderId: "DÁN_MESSAGING_SENDER_ID_VÀO_ĐÂY",  // ← Cần cập nhật
  appId: "DÁN_APP_ID_VÀO_ĐÂY"  // ← Cần cập nhật
};
```

**Lưu ý**: Chỉ cần cập nhật `apiKey`, `messagingSenderId`, và `appId`. Các giá trị khác đã được điền sẵn.

## Bước 3: Kiểm tra Realtime Database Rules

1. Vào Firebase Console > **Realtime Database**
2. Click tab **Rules**
3. Đảm bảo rules cho phép đọc/ghi (cho development):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Cảnh báo**: Rules trên cho phép mọi người đọc/ghi. Chỉ dùng cho development!

4. Click **Publish** để lưu rules

## Bước 4: Cài đặt Dependencies

```bash
npm install
```

## Bước 5: Chạy Script Seed

```bash
npm run seed:realtime
```

Hoặc:

```bash
npx tsx firebase-realtime-seed.ts
```

## Bước 6: Kiểm tra dữ liệu

1. Vào Firebase Console > **Realtime Database**
2. Bạn sẽ thấy cấu trúc JSON tree:
   ```
   nhom_khach_hang
   ├── NH01
   ├── NH02
   └── ...
   nhan_vien
   ├── NV001
   ├── NV002
   └── ...
   khach_hang
   ├── KH001
   ├── KH002
   └── ...
   don_hang
   ├── DH1001
   ├── DH1002
   └── ...
   ```

Hoặc truy cập trực tiếp:
https://quanlyxuongin-d18cc-default-rtdb.asia-southeast1.firebasedatabase.app/

## Cấu trúc dữ liệu

Dữ liệu được lưu dưới dạng JSON tree:

```
{
  "nhom_khach_hang": {
    "NH01": { "ten": "Ban le", ... },
    "NH02": { "ten": "Dai ly", ... }
  },
  "nhan_vien": {
    "NV001": { "ten": "Nguyễn Văn A", ... },
    ...
  },
  "khach_hang": {
    "KH001": { ... },
    ...
  },
  "don_hang": {
    "DH1001": { ... },
    ...
  }
}
```

## Xử lý lỗi

### Lỗi: "Permission denied"
- **Giải pháp**: Kiểm tra Realtime Database Rules (Bước 3)

### Lỗi: "Invalid API key"
- **Giải pháp**: Kiểm tra lại `apiKey` trong config

### Lỗi: "Database not found"
- **Giải pháp**: Đảm bảo Realtime Database đã được bật trong Firebase Console

## ✅ Checklist

- [ ] Đã lấy Firebase config từ Console
- [ ] Đã cập nhật `apiKey`, `messagingSenderId`, `appId` trong `firebase-realtime-seed.ts`
- [ ] Đã kiểm tra Realtime Database Rules
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run seed:realtime`
- [ ] Đã kiểm tra dữ liệu trong Firebase Console

## 🎉 Hoàn thành!

Sau khi seed xong, bạn sẽ có đầy đủ dữ liệu trong Realtime Database và có thể sử dụng ngay!


