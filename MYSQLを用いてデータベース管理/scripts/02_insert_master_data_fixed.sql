-- 文字エンコーディング問題を修正したマスタデータ挿入スクリプト

-- セッションの文字エンコーディングを設定
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

USE product_management;

-- カテゴリマスタデータ
INSERT INTO categories (category_name, description) VALUES
('オーディオ機器', 'イヤホン、ヘッドホン、スピーカーなど'),
('PC周辺機器', 'キーボード、マウス、モニターなど'),
('モバイル機器', 'スマートフォン、タブレット関連'),
('ネットワーク機器', 'ルーター、LANケーブルなど'),
('ストレージ', 'HDD、SSD、USBメモリなど'),
('ディスプレイ', 'モニター、プロジェクターなど'),
('入力機器', 'キーボード、マウス、ペンタブレットなど'),
('電源・ケーブル', '電源アダプター、各種ケーブル'),
('アクセサリー', 'ケース、スタンド、クリーナーなど'),
('オフィス機器', 'プリンター、スキャナーなど');

-- 仕入先マスタデータ
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES
('テクノロジー商事株式会社', '山田太郎', '03-1234-5678', 'yamada@techno-trade.co.jp', '東京都千代田区丸の内1-1-1'),
('デジタル機器販売', '佐藤花子', '06-2345-6789', 'sato@digital-sales.co.jp', '大阪府大阪市北区梅田2-2-2'),
('エレクトロニクス卸売', '鈴木一郎', '052-3456-7890', 'suzuki@electronics-wholesale.co.jp', '愛知県名古屋市中区栄3-3-3'),
('ITソリューションズ', '高橋美咲', '092-4567-8901', 'takahashi@it-solutions.co.jp', '福岡県福岡市博多区博多駅前4-4-4'),
('コンピューター商会', '伊藤健太', '011-5678-9012', 'ito@computer-trade.co.jp', '北海道札幌市中央区大通西5-5-5'),
('モバイルデバイス株式会社', '渡辺由美', '022-6789-0123', 'watanabe@mobile-device.co.jp', '宮城県仙台市青葉区一番町6-6-6'),
('オーディオ専門店', '山本大輔', '075-7890-1234', 'yamamoto@audio-specialty.co.jp', '京都府京都市下京区烏丸通7-7-7'),
('ネットワーク機器販売', '中村さくら', '045-8901-2345', 'nakamura@network-sales.co.jp', '神奈川県横浜市西区みなとみらい8-8-8'),
('ストレージ販売', '小林雄介', '048-9012-3456', 'kobayashi@storage-sales.co.jp', '埼玉県さいたま市大宮区大宮駅前9-9-9'),
('アクセサリー卸売', '加藤恵子', '043-0123-4567', 'kato@accessory-wholesale.co.jp', '千葉県千葉市中央区中央10-10-10');

-- 担当者マスタデータ
INSERT INTO staff (staff_name, department, email, phone) VALUES
('田中太郎', '営業部', 'tanaka@company.co.jp', '090-1111-1111'),
('佐藤花子', '購買部', 'sato@company.co.jp', '090-2222-2222'),
('鈴木一郎', '営業部', 'suzuki@company.co.jp', '090-3333-3333'),
('高橋美咲', '物流部', 'takahashi@company.co.jp', '090-4444-4444'),
('伊藤健太', '営業部', 'ito@company.co.jp', '090-5555-5555'),
('渡辺由美', '購買部', 'watanabe@company.co.jp', '090-6666-6666'),
('山本大輔', '営業部', 'yamamoto@company.co.jp', '090-7777-7777'),
('中村さくら', '物流部', 'nakamura@company.co.jp', '090-8888-8888'),
('小林雄介', '営業部', 'kobayashi@company.co.jp', '090-9999-9999'),
('加藤恵子', '購買部', 'kato@company.co.jp', '090-0000-0000'),
('吉田拓也', '営業部', 'yoshida@company.co.jp', '090-1234-5678'),
('山田麻衣', '物流部', 'yamada@company.co.jp', '090-2345-6789'),
('佐々木翔', '営業部', 'sasaki@company.co.jp', '090-3456-7890'),
('松本優子', '購買部', 'matsumoto@company.co.jp', '090-4567-8901'),
('井上和也', '営業部', 'inoue@company.co.jp', '090-5678-9012'),
('木村真理', '物流部', 'kimura@company.co.jp', '090-6789-0123'),
('林大樹', '営業部', 'hayashi@company.co.jp', '090-7890-1234'),
('清水愛', '購買部', 'shimizu@company.co.jp', '090-8901-2345'),
('山崎浩二', '営業部', 'yamazaki@company.co.jp', '090-9012-3456'),
('森田智子', '物流部', 'morita@company.co.jp', '090-0123-4567');

-- データ挿入完了メッセージ
SELECT 'マスタデータ挿入完了' as message;
SELECT 
    (SELECT COUNT(*) FROM categories) as 'カテゴリ数',
    (SELECT COUNT(*) FROM suppliers) as '仕入先数',
    (SELECT COUNT(*) FROM staff) as '担当者数';
