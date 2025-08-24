# 文字エンコーディング問題の解決方法

## 🚨 問題の原因

MySQLで日本語データを扱う際に発生する文字化けエラーです。主な原因：

1. MySQLサーバーの文字エンコーディング設定
2. クライアント接続時の文字エンコーディング設定
3. データベース/テーブルの文字エンコーディング設定

## 🔧 解決方法

### 方法1: 修正版スクリプトを使用（推奨）

\`\`\`cmd
# 修正版のセットアップスクリプトを実行
setup-database-fixed.bat
\`\`\`

### 方法2: 手動で文字エンコーディングを指定

\`\`\`cmd
# --default-character-set=utf8mb4 オプションを追加
mysql -u root -p --default-character-set=utf8mb4 < scripts/01_create_database_fixed.sql
mysql -u root -p --default-character-set=utf8mb4 < scripts/02_insert_master_data_fixed.sql
\`\`\`

### 方法3: MySQLプロンプト内で実行

\`\`\`sql
mysql -u root -p

-- 文字エンコーディングを設定
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- SQLファイルを実行
source scripts/01_create_database_fixed.sql;
source scripts/02_insert_master_data_fixed.sql;
\`\`\`

## 🔍 設定確認方法

### MySQLの文字エンコーディング設定を確認

\`\`\`sql
-- 現在の設定を確認
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 理想的な設定:
-- character_set_client: utf8mb4
-- character_set_connection: utf8mb4
-- character_set_database: utf8mb4
-- character_set_results: utf8mb4
-- character_set_server: utf8mb4
-- character_set_system: utf8
-- collation_connection: utf8mb4_unicode_ci
-- collation_database: utf8mb4_unicode_ci
-- collation_server: utf8mb4_unicode_ci
\`\`\`

## ⚙️ MySQL設定ファイルの修正（永続的な解決）

### Windows (my.ini)
場所: \`C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini\`

### Linux/Mac (my.cnf)
場所: \`/etc/mysql/my.cnf\` または \`~/.my.cnf\`

設定内容:
\`\`\`ini
[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init-connect = 'SET NAMES utf8mb4'
init-connect = 'SET collation_connection = utf8mb4_unicode_ci'
skip-character-set-client-handshake
\`\`\`

設定後、MySQLサーバーを再起動してください。

## 🧪 テスト方法

\`\`\`sql
-- 日本語データのテスト
USE product_management;
SELECT * FROM categories WHERE category_name LIKE '%オーディオ%';

-- 文字化けしていなければ成功
\`\`\`

## 📞 それでも解決しない場合

1. MySQLサーバーのバージョンを確認: \`SELECT VERSION();\`
2. OSの文字エンコーディング設定を確認
3. コマンドプロンプト/ターミナルの文字エンコーディング設定を確認
4. MySQL WorkbenchなどのGUIツールを使用して実行
