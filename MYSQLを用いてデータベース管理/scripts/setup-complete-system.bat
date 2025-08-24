@echo off
chcp 65001 > nul
echo 🚀 商品管理システム完全セットアップ（リアル業務量版）
echo ================================================
echo 📊 生成予定データ:
echo   - 商品マスタ: 5,000件
echo   - 取引履歴: 約75,000件（12ヶ月間）
echo   - カテゴリ: 10種類
echo   - 仕入先: 10社
echo   - 担当者: 20名
echo ================================================
echo.

set /p MYSQL_PASSWORD="MySQLのrootパスワードを入力してください: "

echo.
echo 🔧 ステップ1: MySQLの文字エンコーディング設定確認
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 00_mysql_config_check.sql
if %errorlevel% neq 0 (
    echo ❌ MySQL設定の確認に失敗しました
    pause
    exit /b 1
)

echo.
echo 🔧 ステップ2: データベースとテーブル作成
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 01_create_database_fixed.sql
if %errorlevel% neq 0 (
    echo ❌ データベースの作成に失敗しました
    pause
    exit /b 1
)
echo ✅ データベースとテーブルの作成完了

echo.
echo 🔧 ステップ3: マスタデータ挿入（カテゴリ、仕入先、担当者）
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 02_insert_master_data_fixed.sql
if %errorlevel% neq 0 (
    echo ❌ マスタデータの挿入に失敗しました
    pause
    exit /b 1
)
echo ✅ マスタデータの挿入完了

echo.
echo 🔧 ステップ4: 商品データ生成（5,000件）
echo    ⏳ 処理時間: 約30秒
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 03_generate_sample_products.sql
if %errorlevel% neq 0 (
    echo ❌ 商品データの生成に失敗しました
    pause
    exit /b 1
)
echo ✅ 商品データ生成完了（5,000件）

echo.
echo 🔧 ステップ5: 取引履歴データ生成（約75,000件）
echo    ⏳ 処理時間: 約2-3分（大量データのため）
echo    📊 生成中の進捗が表示されます...
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 04_generate_inventory_transactions.sql
if %errorlevel% neq 0 (
    echo ❌ 取引データの生成に失敗しました
    pause
    exit /b 1
)
echo ✅ 取引履歴データ生成完了（約75,000件）

echo.
echo 🔧 ステップ6: インデックスとビュー作成（パフォーマンス最適化）
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < 05_create_indexes_and_views.sql
if %errorlevel% neq 0 (
    echo ❌ インデックスとビューの作成に失敗しました
    pause
    exit /b 1
)
echo ✅ インデックスとビュー作成完了

echo.
echo 🔧 ステップ7: データベース統計確認
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 < data_generation_summary.sql

echo.
echo 🎉 データベースセットアップ完了！
echo ================================================
echo 📊 生成されたデータ:
mysql -u root -p%MYSQL_PASSWORD% --default-character-set=utf8mb4 -e "USE product_management; SELECT '商品数' as 'データ種別', COUNT(*) as '件数' FROM products UNION ALL SELECT '取引履歴数', COUNT(*) FROM inventory_transactions UNION ALL SELECT 'カテゴリ数', COUNT(*) FROM categories UNION ALL SELECT '仕入先数', COUNT(*) FROM suppliers UNION ALL SELECT '担当者数', COUNT(*) FROM staff;"

echo.
echo 🚀 次のステップ: アプリケーション起動
echo ================================================
echo 1. バックエンドサーバー起動:
echo    cd ..\backend
echo    npm install
echo    npm run dev
echo.
echo 2. 新しいコマンドプロンプトでフロントエンド起動:
echo    cd ..\frontend  
echo    npm install
echo    npm run dev
echo.
echo 3. ブラウザでアクセス:
echo    http://localhost:3000
echo ================================================
echo.
pause
