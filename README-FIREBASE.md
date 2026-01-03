# Hướng dẫn thiết lập Firebase Firestore

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Firestore Database:
   - Vào **Firestore Database** trong menu
   - Click **Create database**
   - Chọn chế độ: **Start in test mode** (hoặc production mode với rules)
   - Chọn location gần nhất

## Bước 2: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống phần **Your apps**
3. Click **Web** (biểu tượng `</>`) để tạo web app
4. Copy thông tin config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Bước 3: Cấu hình trong dự án

1. Cập nhật `firebase.config.ts` với config của bạn
2. Cập nhật `firebase-seed.ts` với config của bạn
3. Cập nhật `.firebaserc` với project ID của bạn

## Bước 4: Cài đặt dependencies

```bash
npm install
```

## Bước 5: Seed dữ liệu vào Firestore

```bash
npm run seed:firebase
```

Hoặc chạy trực tiếp:
```bash
npx tsx firebase-seed.ts
```

## Bước 6: Deploy Firestore Rules và Indexes (Tùy chọn)

Nếu bạn đã cài Firebase CLI:

```bash
# Cài Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Login
firebase login

# Init project
firebase init firestore

# Deploy rules và indexes
firebase deploy --only firestore
```

## Cấu trúc Collections

Xem file `firestore-collections.md` để biết chi tiết về cấu trúc dữ liệu.

## Lưu ý

- **Security Rules**: File `firestore.rules` mặc định yêu cầu authentication. Điều chỉnh theo nhu cầu của bạn.
- **Indexes**: Firestore tự động tạo indexes cho các query phức tạp. File `firestore.indexes.json` định nghĩa composite indexes.
- **Timestamps**: Firestore sử dụng `Timestamp` thay vì `Date`. Script seed đã xử lý điều này.

## Sử dụng trong code

```typescript
import { db } from './firebase.config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Lấy tất cả khách hàng
const khachHangRef = collection(db, 'khach_hang');
const snapshot = await getDocs(khachHangRef);
const khachHang = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Lấy một khách hàng
const docRef = doc(db, 'khach_hang', 'KH001');
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  console.log(docSnap.data());
}
```


