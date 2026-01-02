// Script test kết nối Firebase
// Chạy: npx tsx test-firebase-connection.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Cấu hình Firebase - Thay thế bằng config của bạn
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

async function testConnection() {
  try {
    console.log('🔍 Đang kiểm tra kết nối Firebase...');
    
    // Kiểm tra config
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.error('❌ Vui lòng cập nhật Firebase config trong file này!');
      console.log('📝 Lấy config tại: Firebase Console > Project Settings > Your apps > Web app');
      process.exit(1);
    }

    console.log('✅ Config hợp lệ');
    console.log('📡 Đang kết nối đến Firestore...');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Kết nối thành công!');
    console.log('📊 Đang kiểm tra collections...');

    // Thử đọc một collection để test
    const collections = [
      'nhom_khach_hang',
      'nguon_khach_hang',
      'nhan_vien',
      'khach_hang',
      'don_hang'
    ];

    for (const colName of collections) {
      try {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        console.log(`  ✓ ${colName}: ${snapshot.size} documents`);
      } catch (error: any) {
        console.log(`  ⚠ ${colName}: ${error.message}`);
      }
    }

    console.log('\n✅ Test kết nối hoàn tất!');
    console.log('💡 Bây giờ bạn có thể chạy: npm run seed:firebase');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.error('\n🔧 Kiểm tra:');
    console.error('  1. Firebase config đã đúng chưa?');
    console.error('  2. Firestore đã được bật trong Firebase Console chưa?');
    console.error('  3. Security rules có cho phép đọc/ghi không?');
    process.exit(1);
  }
}

testConnection();

