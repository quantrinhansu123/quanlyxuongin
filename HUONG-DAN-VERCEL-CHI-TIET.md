# 📋 Hướng dẫn thêm Environment Variables trên Vercel (Chi tiết từng bước)

## Cách 1: Qua Vercel Dashboard (Dễ nhất) ⭐

### Bước 1: Mở Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Đăng nhập vào tài khoản của bạn

### Bước 2: Chọn Project
1. Tìm project `quanlyxuongin` (hoặc project bạn đã import)
2. Click vào project đó

### Bước 3: Vào Settings
1. Click tab **Settings** ở trên cùng
2. Click **Environment Variables** ở menu bên trái

### Bước 4: Thêm từng biến

#### Biến 1: VITE_FIREBASE_API_KEY
1. Click nút **Add New**
2. **Key**: `VITE_FIREBASE_API_KEY`
3. **Value**: (Lấy từ Firebase Console - xem bên dưới)
4. Chọn **Environment**: 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

#### Biến 2: VITE_FIREBASE_MESSAGING_SENDER_ID
1. Click nút **Add New**
2. **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
3. **Value**: (Lấy từ Firebase Console)
4. Chọn **Environment**: Production, Preview, Development
5. Click **Save**

#### Biến 3: VITE_FIREBASE_APP_ID
1. Click nút **Add New**
2. **Key**: `VITE_FIREBASE_APP_ID`
3. **Value**: (Lấy từ Firebase Console)
4. Chọn **Environment**: Production, Preview, Development
5. Click **Save**

### Bước 5: Lấy giá trị từ Firebase Console

1. Mở tab mới: https://console.firebase.google.com/
2. Chọn project: **quanlyxuongin-d18cc**
3. Click biểu tượng ⚙️ **Settings** (bên cạnh "Project Overview")
4. Scroll xuống phần **"Your apps"**
5. Tìm app **Web** (biểu tượng `</>`)
6. Nếu chưa có, click **Add app** > Chọn **Web** > Đặt tên > **Register app**
7. Bạn sẽ thấy config như sau:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // ← Copy giá trị này
  authDomain: "quanlyxuongin-d18cc.firebaseapp.com",
  projectId: "quanlyxuongin-d18cc",
  storageBucket: "quanlyxuongin-d18cc.appspot.com",
  messagingSenderId: "123456789",  // ← Copy giá trị này
  appId: "1:123456789:web:abc123"  // ← Copy giá trị này
};
```

8. Copy 3 giá trị:
   - `apiKey` → Dán vào `VITE_FIREBASE_API_KEY` trên Vercel
   - `messagingSenderId` → Dán vào `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → Dán vào `VITE_FIREBASE_APP_ID`

### Bước 6: Redeploy
1. Quay lại Vercel Dashboard
2. Vào tab **Deployments**
3. Click vào deployment mới nhất
4. Click nút **Redeploy** (hoặc 3 chấm > Redeploy)
5. Chọn **Use existing Build Cache** hoặc **Rebuild**
6. Click **Redeploy**

## Cách 2: Qua Vercel CLI (Nhanh hơn)

### Bước 1: Cài Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Login
```bash
vercel login
```

### Bước 3: Link project (nếu chưa)
```bash
vercel link
```

### Bước 4: Chạy script
**Windows:**
```bash
setup-vercel-env.bat
```

**Mac/Linux:**
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

Script sẽ hỏi bạn nhập 3 giá trị, sau đó tự động thêm vào Vercel.

## Cách 3: Copy-paste nhanh

Nếu bạn đã có giá trị, có thể thêm trực tiếp qua CLI:

```bash
# Thêm cho Production
echo "YOUR_API_KEY" | vercel env add VITE_FIREBASE_API_KEY production
echo "YOUR_MESSAGING_SENDER_ID" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
echo "YOUR_APP_ID" | vercel env add VITE_FIREBASE_APP_ID production

# Thêm cho Preview
echo "YOUR_API_KEY" | vercel env add VITE_FIREBASE_API_KEY preview
echo "YOUR_MESSAGING_SENDER_ID" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview
echo "YOUR_APP_ID" | vercel env add VITE_FIREBASE_APP_ID preview

# Thêm cho Development
echo "YOUR_API_KEY" | vercel env add VITE_FIREBASE_API_KEY development
echo "YOUR_MESSAGING_SENDER_ID" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID development
echo "YOUR_APP_ID" | vercel env add VITE_FIREBASE_APP_ID development
```

Thay `YOUR_API_KEY`, `YOUR_MESSAGING_SENDER_ID`, `YOUR_APP_ID` bằng giá trị thật.

## ✅ Checklist

Sau khi thêm xong, kiểm tra:
- [ ] Đã thêm `VITE_FIREBASE_API_KEY`
- [ ] Đã thêm `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] Đã thêm `VITE_FIREBASE_APP_ID`
- [ ] Đã chọn cả 3 environments (Production, Preview, Development)
- [ ] Đã redeploy project

## 🐛 Troubleshooting

### Lỗi: "Environment variable not found"
- Đảm bảo đã thêm đúng tên biến (có prefix `VITE_`)
- Kiểm tra đã chọn đúng environment chưa

### Build vẫn fail
- Kiểm tra giá trị đã đúng chưa (không có khoảng trắng thừa)
- Thử redeploy lại
- Xem logs trong Vercel để biết lỗi cụ thể

### App chạy nhưng không kết nối được Firebase
- Kiểm tra API key đã đúng chưa
- Kiểm tra Realtime Database Rules cho phép đọc/ghi
- Xem browser console để xem lỗi cụ thể

