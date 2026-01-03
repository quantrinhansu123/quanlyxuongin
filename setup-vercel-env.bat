@echo off
REM Script để thêm Environment Variables vào Vercel (Windows)
REM Sử dụng: setup-vercel-env.bat

echo.
echo ========================================
echo Setup Vercel Environment Variables
echo ========================================
echo.

REM Kiểm tra Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI chua duoc cai dat
    echo [INFO] Cai dat: npm i -g vercel
    pause
    exit /b 1
)

echo [INFO] Vui long nhap cac gia tri tu Firebase Console:
echo.

set /p API_KEY="Firebase API Key: "
set /p MESSAGING_SENDER_ID="Firebase Messaging Sender ID: "
set /p APP_ID="Firebase App ID: "

echo.
echo [INFO] Dang them Environment Variables vao Vercel...
echo.

echo %API_KEY% | vercel env add VITE_FIREBASE_API_KEY production
echo %MESSAGING_SENDER_ID% | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
echo %APP_ID% | vercel env add VITE_FIREBASE_APP_ID production

echo %API_KEY% | vercel env add VITE_FIREBASE_API_KEY preview
echo %MESSAGING_SENDER_ID% | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview
echo %APP_ID% | vercel env add VITE_FIREBASE_APP_ID preview

echo %API_KEY% | vercel env add VITE_FIREBASE_API_KEY development
echo %MESSAGING_SENDER_ID% | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID development
echo %APP_ID% | vercel env add VITE_FIREBASE_APP_ID development

echo.
echo [SUCCESS] Da them Environment Variables thanh cong!
echo [INFO] Vui long redeploy project tren Vercel Dashboard
echo.
pause


