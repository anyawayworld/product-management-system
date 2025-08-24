#!/bin/bash

# データベースセットアップスクリプト
# 使用方法: ./setup-database.sh

echo "🚀 商品管理データベースのセットアップを開始します..."

# MySQLのパスワードを入力
read -s -p "MySQLのrootパスワードを入力してください: " MYSQL_PASSWORD
echo

# データベースとテーブルの作成
echo "📊 データベースとテーブルを作成中..."
mysql -u root -p$MYSQL_PASSWORD < 01_create_database.sql

if [ $? -eq 0 ]; then
    echo "✅ データベースとテーブルの作成が完了しました"
else
    echo "❌ データベースの作成に失敗しました"
    exit 1
fi

# マスタデータの挿入
echo "📝 マスタデータを挿入中..."
mysql -u root -p$MYSQL_PASSWORD < 02_insert_master_data.sql

if [ $? -eq 0 ]; then
    echo "✅ マスタデータの挿入が完了しました"
else
    echo "❌ マスタデータの挿入に失敗しました"
    exit 1
fi

# サンプル商品データの生成
echo "🛍️ サンプル商品データを生成中..."
mysql -u root -p$MYSQL_PASSWORD < 03_generate_sample_products.sql

if [ $? -eq 0 ]; then
    echo "✅ サンプル商品データの生成が完了しました"
else
    echo "❌ サンプル商品データの生成に失敗しました"
    exit 1
fi

# 在庫取引データの生成
echo "📋 在庫取引データを生成中..."
mysql -u root -p$MYSQL_PASSWORD < 04_generate_inventory_transactions.sql

if [ $? -eq 0 ]; then
    echo "✅ 在庫取引データの生成が完了しました"
else
    echo "❌ 在庫取引データの生成に失敗しました"
    exit 1
fi

# インデックスとビューの作成
echo "🔍 インデックスとビューを作成中..."
mysql -u root -p$MYSQL_PASSWORD < 05_create_indexes_and_views.sql

if [ $? -eq 0 ]; then
    echo "✅ インデックスとビューの作成が完了しました"
else
    echo "❌ インデックスとビューの作成に失敗しました"
    exit 1
fi

echo ""
echo "🎉 データベースセットアップが完了しました！"
echo ""
echo "📊 データベース統計:"
mysql -u root -p$MYSQL_PASSWORD -e "
USE product_management;
SELECT 
    (SELECT COUNT(*) FROM products) as '商品数',
    (SELECT COUNT(*) FROM inventory_transactions) as '取引履歴数',
    (SELECT COUNT(*) FROM staff) as '担当者数',
    (SELECT COUNT(*) FROM suppliers) as '仕入先数',
    (SELECT COUNT(*) FROM categories) as 'カテゴリ数';
"

echo ""
echo "🔧 次のステップ:"
echo "1. バックエンドサーバーを起動: cd backend && npm install && npm run dev"
echo "2. フロントエンドを起動: cd frontend && npm install && npm run dev"
echo "3. ブラウザで http://localhost:3000 にアクセス"
