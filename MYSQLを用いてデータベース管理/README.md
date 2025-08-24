# 商品管理システム

MySQLを使用した本格的な商品管理システムです。

## 🚀 セットアップ方法

### 方法1: 自動セットアップスクリプト使用（推奨）

**Linux/Mac:**
\`\`\`bash
cd scripts
chmod +x setup-database.sh
./setup-database.sh
\`\`\`

**Windows:**
\`\`\`cmd
cd scripts
setup-database.bat
\`\`\`

### 方法2: 手動セットアップ

#### 1. MySQLコマンドラインから実行

\`\`\`bash
# コマンドプロンプト/ターミナルで実行（MySQLプロンプト内ではない）
mysql -u root -p < scripts/01_create_database.sql
mysql -u root -p < scripts/02_insert_master_data.sql
mysql -u root -p < scripts/03_generate_sample_products.sql
mysql -u root -p < scripts/04_generate_inventory_transactions.sql
mysql -u root -p < scripts/05_create_indexes_and_views.sql
\`\`\`

#### 2. MySQLプロンプト内で実行

\`\`\`sql
-- MySQLにログイン
mysql -u root -p

-- SQLファイルを実行
source scripts/01_create_database.sql;
source scripts/02_insert_master_data.sql;
source scripts/03_generate_sample_products.sql;
source scripts/04_generate_inventory_transactions.sql;
source scripts/05_create_indexes_and_views.sql;
\`\`\`

#### 3. MySQL Workbenchを使用

1. MySQL Workbenchを開く
2. 各SQLファイルを順番に開く
3. 実行ボタン（⚡）をクリック

## 🔧 アプリケーション起動

### バックエンド起動
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### フロントエンド起動
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 📊 データベース構成

- **商品数**: 5,000件
- **取引履歴**: 約75,000件
- **担当者**: 20名
- **仕入先**: 10社
- **カテゴリ**: 10種類

## 🎯 主要機能

- ✅ ダッシュボード（統計情報表示）
- ✅ 商品管理（CRUD操作）
- ✅ 在庫管理（入出荷処理）
- ✅ 取引履歴管理
- ✅ レポート機能
- ✅ CSV出力
- ✅ 在庫アラート
- ✅ 検索・フィルタリング

## 🌐 アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000/api

## ⚠️ トラブルシューティング

### MySQLエラーの場合

1. **接続エラー**: MySQLサーバーが起動しているか確認
2. **権限エラー**: rootユーザーの権限を確認
3. **文字化け**: UTF-8MB4エンコーディングを確認

### よくあるエラーと解決方法

\`\`\`sql
-- エラー: Access denied for user 'root'@'localhost'
-- 解決: パスワードを正しく入力、またはユーザー権限を確認

-- エラー: Unknown database 'product_management'
-- 解決: 01_create_database.sqlを最初に実行

-- エラー: Table doesn't exist
-- 解決: SQLファイルを順番通りに実行
\`\`\`

## 📝 環境変数設定

`backend/.env`ファイルを作成：

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=product_management
PORT=5000
\`\`\`

## 🔒 セキュリティ

- SQLインジェクション対策済み
- 入力値検証実装
- CORS設定済み
- 本番環境では環境変数を適切に設定してください

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. MySQLサーバーの起動状況
2. 環境変数の設定
3. ポート番号の競合
4. ファイアウォール設定
