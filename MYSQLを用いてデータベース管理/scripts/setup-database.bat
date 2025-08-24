@echo off
chcp 65001 > nul
echo 🚀 商品管理データベースのセットアップを開始します...
echo.

set /p MYSQL_PASSWORD="MySQLのrootパスワードを入力してください: "

echo 📊 データベースとテーブルを作成中...
mysql -u root -p%MYSQL_PASSWORD% < 01_create_database.sql
if %errorlevel% neq 0 (
    echo ❌ データベースの作成に失敗しました
    pause
    exit /b 1
)
echo ✅ データベースとテーブルの作成が完了しました

echo 📝 マスタデータを挿入中...
mysql -u root -p%MYSQL_PASSWORD% < 02_insert_master_data.sql
if %errorlevel% neq 0 (
    echo ❌ マスタデータの挿入に失敗しました
    pause
    exit /b 1
)
echo ✅ マスタデータの挿入が完了しました

echo 🛍️ サンプル商品データを生成中...
mysql -u root -p%MYSQL_PASSWORD% < 03_generate_sample_products.sql
if %errorlevel% neq 0 (
    echo ❌ サンプル商品データの生成に失敗しました
    pause
    exit /b 1
)
echo ✅ サンプル商品データの生成が完了しました

echo 📋 在庫取引データを生成中...
mysql -u root -p%MYSQL_PASSWORD% < 04_generate_inventory_transactions.sql
if %errorlevel% neq 0 (
    echo ❌ 在庫取引データの生成に失敗しました
    pause
    exit /b 1
)
echo ✅ 在庫取引データの生成が完了しました

echo 🔍 インデックスとビューを作成中...
mysql -u root -p%MYSQL_PASSWORD% < 05_create_indexes_and_views.sql
if %errorlevel% neq 0 (
    echo ❌ インデックスとビューの作成に失敗しました
    pause
    exit /b 1
)
echo ✅ インデックスとビューの作成が完了しました

echo.
echo 🎉 データベースセットアップが完了しました！
echo.

echo 📊 データベース統計:
mysql -u root -p%MYSQL_PASSWORD% -e "USE product_management; SELECT (SELECT COUNT(*) FROM products) as '商品数', (SELECT COUNT(*) FROM inventory_transactions) as '取引履歴数', (SELECT COUNT(*) FROM staff) as '担当者数', (SELECT COUNT(*) FROM suppliers) as '仕入先数', (SELECT COUNT(*) FROM categories) as 'カテゴリ数';"

echo.
echo 🔧 次のステップ:
echo 1. バックエンドサーバーを起動: cd backend ^&^& npm install ^&^& npm run dev
echo 2. フロントエンドを起動: cd frontend ^&^& npm install ^&^& npm run dev
echo 3. ブラウザで http://localhost:3000 にアクセス
echo.
pause
