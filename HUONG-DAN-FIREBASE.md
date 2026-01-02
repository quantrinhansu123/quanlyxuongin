# 🔥 Hướng dẫn thiết lập Firebase từng bước

## Bước 1: Tạo Firebase Project

1. Truy cập: https://console.firebase.google.com/
2. Click **"Add project"** hoặc chọn project có sẵn
3. Điền tên project và click **Continue**
4. Chọn **Google Analytics** (tùy chọn) và click **Continue**
5. Click **Create project**

## Bước 2: Bật Firestore Database

1. Trong Firebase Console, vào menu bên trái
2. Click **Firestore Database**
3. Click **Create database**
4. Chọn chế độ:
   - **Start in test mode** (cho development - cho phép đọc/ghi trong 30 ngày)
   - Hoặc **Start in production mode** (cần config rules)
5. Chọn **location** (chọn gần nhất, ví dụ: `asia-southeast1` cho Việt Nam)
6. Click **Enable**

## Bước 3: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng ⚙️ bên cạnh "Project Overview")
2. Scroll xuống phần **"Your apps"**
3. Click icon **Web** (`</>`)
4. Đặt tên app (ví dụ: "CRM Lead Master") và click **Register app**
5. Copy đoạn config JavaScript:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Bước 4: Cập nhật Config trong dự án

### 4.1. Cập nhật `firebase-seed.ts`

Mở file `firebase-seed.ts` và thay thế phần config:

```typescript
const firebaseConfig = {
  apiKey: "DÁN_API_KEY_VÀO_ĐÂY",
  authDomain: "DÁN_AUTH_DOMAIN_VÀO_ĐÂY",
  projectId: "DÁN_PROJECT_ID_VÀO_ĐÂY",
  storageBucket: "DÁN_STORAGE_BUCKET_VÀO_ĐÂY",
  messagingSenderId: "DÁN_MESSAGING_SENDER_ID_VÀO_ĐÂY",
  appId: "DÁN_APP_ID_VÀO_ĐÂY"
};
```

### 4.2. Cập nhật `firebase.config.ts` (nếu dùng trong app)

Cập nhật config tương tự trong file `firebase.config.ts`

### 4.3. Cập nhật `.firebaserc`

Mở file `.firebaserc` và thay `YOUR_PROJECT_ID` bằng project ID của bạn:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## Bước 5: Cài đặt Dependencies

Mở terminal trong thư mục dự án và chạy:

```bash
npm install
```

Điều này sẽ cài:
- `firebase` - Firebase SDK
- `tsx` - Để chạy TypeScript files

## Bước 6: Test kết nối (Tùy chọn)

Chạy script test để kiểm tra kết nối:

```bash
npx tsx test-firebase-connection.ts
```

**Lưu ý**: Nhớ cập nhật config trong file `test-firebase-connection.ts` trước!

## Bước 7: Seed dữ liệu vào Firestore

Sau khi đã cấu hình xong, chạy:

```bash
npm run seed:firebase
```

Hoặc:

```bash
npx tsx firebase-seed.ts
```

Bạn sẽ thấy output như:

```
🚀 Bắt đầu seed dữ liệu vào Firestore...
📦 Project ID: your-project-id

Đang seed nhom_khach_hang...
  ✓ Đã tạo: NH01 - Ban le
  ✓ Đã tạo: NH02 - Dai ly
  ...
✅ Hoàn thành: 4 nhóm khách hàng
...
```

## Bước 8: Kiểm tra dữ liệu trong Firebase Console

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project của bạn
3. Vào **Firestore Database**
4. Bạn sẽ thấy các collections:
   - `nhom_khach_hang`
   - `nguon_khach_hang`
   - `nhan_vien`
   - `khach_hang`
   - `don_hang`
   - ... và các collections khác

## 🔧 Xử lý lỗi thường gặp

### Lỗi: "Permission denied"
- **Nguyên nhân**: Security rules chưa cho phép đọc/ghi
- **Giải pháp**: 
  1. Vào Firestore Database > Rules
  2. Đảm bảo rules cho phép đọc/ghi (test mode cho phép trong 30 ngày)
  3. Hoặc cập nhật rules trong file `firestore.rules`

### Lỗi: "Firestore has not been initialized"
- **Nguyên nhân**: Firestore chưa được bật
- **Giải pháp**: Bật Firestore Database trong Firebase Console (Bước 2)

### Lỗi: "Invalid API key"
- **Nguyên nhân**: Config chưa đúng
- **Giải pháp**: Kiểm tra lại config đã copy đúng chưa

### Lỗi: "Cannot find module 'firebase'"
- **Nguyên nhân**: Chưa cài dependencies
- **Giải pháp**: Chạy `npm install`

## 📝 Lưu ý quan trọng

1. **Security Rules**: 
   - Test mode chỉ cho phép trong 30 ngày
   - Sau đó cần config rules phù hợp
   - Xem file `firestore.rules` để config

2. **Billing**: 
   - Firestore có free tier (1GB storage, 50K reads/day)
   - Đủ cho development và testing

3. **Backup**: 
   - Nên export dữ liệu định kỳ
   - Hoặc sử dụng Firebase scheduled exports

## ✅ Checklist

- [ ] Đã tạo Firebase project
- [ ] Đã bật Firestore Database
- [ ] Đã lấy Firebase config
- [ ] Đã cập nhật config trong `firebase-seed.ts`
- [ ] Đã cập nhật config trong `firebase.config.ts`
- [ ] Đã cập nhật `.firebaserc`
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run seed:firebase`
- [ ] Đã kiểm tra dữ liệu trong Firebase Console

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, bạn sẽ có:
- ✅ 11 collections với dữ liệu mẫu
- ✅ Tất cả collections có tên tiếng Việt không dấu
- ✅ Sẵn sàng để sử dụng trong ứng dụng

