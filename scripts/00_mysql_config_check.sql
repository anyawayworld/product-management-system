-- MySQLの文字エンコーディング設定を確認
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 現在の設定を表示
SELECT @@character_set_server, @@collation_server;
SELECT @@character_set_database, @@collation_database;
SELECT @@character_set_client, @@character_set_connection, @@character_set_results;
