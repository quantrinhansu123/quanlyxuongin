# 🚀 Hướng dẫn Setup Project

## Bước 1: Clone Repository

```bash
git clone https://github.com/quantrinhansu123/quanlyxuongin.git
cd quanlyxuongin
```

## Bước 2: Cài đặt Dependencies

```bash
npm install
```

## Bước 3: Cấu hình Firebase

1. Copy file template:
   ```bash
   cp firebase-realtime.config.ts.example firebase-realtime.config.ts
   ```

2. Lấy Firebase config:
   - Vào [Firebase Console](https://console.firebase.google.com/)
   - Chọn project `quanlyxuongin-d18cc`
   - Vào **Project Settings** > **Your apps** > **Web app**
   - Copy các giá trị: `apiKey`, `messagingSenderId`, `appId`

3. Cập nhật `firebase-realtime.config.ts` với các giá trị vừa copy

## Bước 4: Seed dữ liệu (Tùy chọn)

Nếu database chưa có dữ liệu, chạy:

```bash
npm run seed:simple
```

## Bước 5: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 📁 Cấu trúc Project

```
├── components/          # React components
├── services/            # Firebase services
├── hooks/              # Custom React hooks
├── types.ts            # TypeScript types
├── constants.ts        # Mock data (fallback)
└── firebase-realtime.config.ts  # Firebase config
```

## 🔧 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run seed:simple` - Seed dữ liệu vào Firebase
- `npm run seed:realtime` - Seed dữ liệu (cần config Firebase SDK)
- `npm run seed:firebase` - Seed vào Firestore (nếu dùng Firestore)

## 📝 Lưu ý

- File `firebase-realtime.config.ts` đã được thêm vào `.gitignore` để bảo mật
- Không commit file config chứa API keys lên GitHub
- Database URL và Project ID đã được cấu hình sẵn cho project `quanlyxuongin-d18cc`

## 🐛 Troubleshooting

### Lỗi: "Permission denied"
- Kiểm tra Realtime Database Rules trong Firebase Console
- Đảm bảo rules cho phép đọc/ghi (test mode)

### Lỗi: "Cannot find module 'firebase'"
- Chạy lại `npm install`

### Dữ liệu không hiển thị
- Kiểm tra Firebase config đã đúng chưa
- Chạy `npm run seed:simple` để seed dữ liệu
- Kiểm tra browser console để xem lỗi

