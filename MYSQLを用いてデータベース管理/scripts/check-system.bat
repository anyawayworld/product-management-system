@echo off
chcp 65001 > nul
echo 🔍 システム環境チェック
echo ========================

echo.
echo 📊 必要なソフトウェアの確認:

echo.
echo MySQL:
mysql --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL がインストールされていません
    echo    https://dev.mysql.com/downloads/mysql/ からダウンロードしてください
) else (
    echo ✅ MySQL インストール済み
)

echo.
echo Node.js:
node --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js がインストールされていません
    echo    https://nodejs.org/ からダウンロードしてください
) else (
    echo ✅ Node.js インストール済み
)

echo.
echo npm:
npm --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm が利用できません
) else (
    echo ✅ npm 利用可能
)

echo.
echo 📁 プロジェクトファイルの確認:

if exist "01_create_database_fixed.sql" (
    echo ✅ データベース作成スクリプト
) else (
    echo ❌ データベース作成スクリプトが見つかりません
)

if exist "..\backend\package.json" (
    echo ✅ バックエンドプロジェクト
) else (
    echo ❌ バックエンドプロジェクトが見つかりません
)

if exist "..\frontend\package.json" (
    echo ✅ フロントエンドプロジェクト
) else (
    echo ❌ フロントエンドプロジェクトが見つかりません
)

echo.
echo 🔌 MySQL接続テスト:
set /p MYSQL_PASSWORD="MySQLのrootパスワードを入力してください（テスト用）: "

mysql -u root -p%MYSQL_PASSWORD% -e "SELECT 'MySQL接続成功' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL接続に失敗しました
    echo    - パスワードを確認してください
    echo    - MySQLサーバーが起動しているか確認してください
) else (
    echo ✅ MySQL接続成功
)

echo.
echo 📋 システムチェック完了
echo.
echo 問題がなければ quick-start.bat を実行してください
echo.
pause
