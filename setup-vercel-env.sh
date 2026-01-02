#!/bin/bash
# Script để thêm Environment Variables vào Vercel
# Sử dụng: ./setup-vercel-env.sh

echo "🚀 Setup Vercel Environment Variables"
echo "======================================"
echo ""

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài đặt"
    echo "📦 Cài đặt: npm i -g vercel"
    exit 1
fi

echo "📝 Vui lòng nhập các giá trị từ Firebase Console:"
echo ""

read -p "Firebase API Key: " API_KEY
read -p "Firebase Messaging Sender ID: " MESSAGING_SENDER_ID
read -p "Firebase App ID: " APP_ID

echo ""
echo "🔧 Đang thêm Environment Variables vào Vercel..."

# Thêm các biến môi trường
vercel env add VITE_FIREBASE_API_KEY production <<< "$API_KEY"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production <<< "$MESSAGING_SENDER_ID"
vercel env add VITE_FIREBASE_APP_ID production <<< "$APP_ID"

# Cũng thêm cho preview và development
vercel env add VITE_FIREBASE_API_KEY preview <<< "$API_KEY"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview <<< "$MESSAGING_SENDER_ID"
vercel env add VITE_FIREBASE_APP_ID preview <<< "$APP_ID"

vercel env add VITE_FIREBASE_API_KEY development <<< "$API_KEY"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID development <<< "$MESSAGING_SENDER_ID"
vercel env add VITE_FIREBASE_APP_ID development <<< "$APP_ID"

echo ""
echo "✅ Đã thêm Environment Variables thành công!"
echo "🔄 Vui lòng redeploy project trên Vercel Dashboard"

