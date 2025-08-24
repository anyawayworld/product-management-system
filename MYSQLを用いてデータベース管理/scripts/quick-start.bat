@echo off
chcp 65001 > nul
echo 🚀 商品管理システム クイックスタート
echo =====================================
echo.

echo 📋 実行手順:
echo 1. データベースセットアップ
echo 2. バックエンドサーバー起動
echo 3. フロントエンドアプリ起動
echo.

set /p choice="続行しますか？ (y/n): "
if /i "%choice%" neq "y" (
    echo キャンセルしました。
    pause
    exit /b 0
)

echo.
echo 🔧 ステップ1: データベースセットアップ
echo =====================================
call setup-complete-system.bat

if %errorlevel% neq 0 (
    echo ❌ データベースセットアップに失敗しました
    pause
    exit /b 1
)

echo.
echo ✅ データベースセットアップ完了！
echo.
echo 🔧 次のステップ: アプリケーション起動
echo =====================================
echo.
echo 以下のコマンドを別々のコマンドプロンプトで実行してください:
echo.
echo 【バックエンド起動】
echo cd ..\backend
echo npm install
echo npm run dev
echo.
echo 【フロントエンド起動】
echo cd ..\frontend
echo npm install  
echo npm run dev
echo.
echo 【アクセス】
echo http://localhost:3000
echo.
echo 📝 詳細な手順は SETUP_GUIDE.md を参照してください
echo.
pause
