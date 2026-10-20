@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo 🌸 ĐANG KHỞI ĐỘNG WEB BÓ HOA 20/10 ^& CLOUDFLARE TUNNEL...
echo (Giữ cửa sổ này mở để link online hoạt động liên tục)
echo ============================================================
start "Server Hoa 20-10" /min node server-flowers.cjs
timeout /t 2 >nul
start "" "http://localhost:8090/qr.html"
cloudflared.exe tunnel --url http://localhost:8090
pause
