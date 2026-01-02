# 🚀 Hướng dẫn Deploy lên Vercel

## Vấn đề đã sửa

File `firebase-realtime.config.ts` đã được cập nhật để sử dụng **Environment Variables** thay vì hardcode API keys. Điều này giúp:
- ✅ Code có thể build trên Vercel
- ✅ Bảo mật API keys
- ✅ Dễ dàng quản lý config cho các môi trường khác nhau

## Cách setup trên Vercel

### Bước 1: Thêm Environment Variables

1. Vào Vercel Dashboard > Project Settings > Environment Variables
2. Thêm các biến sau:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=quanlyxuongin-d18cc.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://quanlyxuongin-d18cc-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=quanlyxuongin-d18cc
VITE_FIREBASE_STORAGE_BUCKET=quanlyxuongin-d18cc.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Bước 2: Lấy giá trị từ Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `quanlyxuongin-d18cc`
3. Vào **Project Settings** > **Your apps** > **Web app**
4. Copy các giá trị:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

### Bước 3: Deploy lại

Sau khi thêm environment variables, Vercel sẽ tự động redeploy. Hoặc bạn có thể:
- Vào Deployments > Click "Redeploy"
- Hoặc push một commit mới

## Cấu trúc Environment Variables

File `firebase-realtime.config.ts` sẽ tự động sử dụng:
1. **Environment Variables** (nếu có) - Ưu tiên cao nhất
2. **Giá trị mặc định** (nếu không có env vars) - Cho development local

## Lưu ý

- ⚠️ **KHÔNG** commit file `.env.local` lên Git
- ✅ File `firebase-realtime.config.ts` đã có sẵn với giá trị mặc định
- ✅ Environment variables chỉ cần set trên Vercel, không cần trong code

## Troubleshooting

### Lỗi: "Could not resolve firebase-realtime.config"
- ✅ Đã sửa: File config đã được commit vào repo
- File này sử dụng env vars nên an toàn

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra `VITE_FIREBASE_API_KEY` đã đúng chưa
- Đảm bảo đã thêm vào Vercel Environment Variables

### Build thành công nhưng app không chạy
- Kiểm tra browser console để xem lỗi
- Đảm bảo tất cả env vars đã được set trên Vercel
- Kiểm tra Realtime Database Rules cho phép đọc/ghi

