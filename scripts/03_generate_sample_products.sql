USE product_management;

-- 商品マスタのサンプルデータ生成
INSERT INTO products (product_id, product_name, model, category_id, supplier_id, unit_price, current_stock, min_stock_level, max_stock_level, description) VALUES
-- オーディオ機器
('P000001', 'ワイヤレスイヤホン Pro', 'WE-PRO-001', 1, 1, 12800, 150, 20, 500, '高音質Bluetooth 5.0対応'),
('P000002', 'ノイズキャンセリングヘッドホン', 'NC-HEAD-002', 1, 7, 28500, 80, 10, 200, 'アクティブノイズキャンセリング機能'),
('P000003', 'ポータブルスピーカー', 'PS-MINI-003', 1, 1, 8900, 200, 30, 400, '防水IPX7対応'),
('P000004', 'ゲーミングヘッドセット', 'GH-GAME-004', 1, 7, 15600, 120, 15, 300, '7.1サラウンド対応'),
('P000005', 'Bluetoothスピーカー', 'BT-SPEAK-005', 1, 1, 6800, 180, 25, 350, '12時間連続再生'),

-- PC周辺機器
('P000006', 'メカニカルキーボード', 'MK-MECH-006', 2, 2, 18900, 90, 10, 200, '青軸スイッチ採用'),
('P000007', 'ゲーミングマウス', 'GM-RGB-007', 2, 2, 9800, 160, 20, 300, 'RGB LED搭載'),
('P000008', '4Kモニター 27インチ', '4K-MON-008', 2, 6, 45000, 45, 5, 100, 'IPS液晶パネル'),
('P000009', 'Webカメラ 1080p', 'WC-HD-009', 2, 3, 7800, 140, 15, 250, 'オートフォーカス機能'),
('P000010', 'USB-Cハブ', 'HUB-USBC-010', 2, 4, 5600, 220, 30, 400, '7ポート搭載'),

-- モバイル機器
('P000011', 'スマートフォンケース', 'SC-CLEAR-011', 3, 6, 1200, 500, 50, 1000, '透明TPU素材'),
('P000012', 'モバイルバッテリー 10000mAh', 'MB-10K-012', 3, 6, 3800, 300, 40, 600, 'PD対応急速充電'),
('P000013', 'ワイヤレス充電器', 'WC-QI-013', 3, 6, 4200, 180, 25, 350, 'Qi規格対応'),
('P000014', 'タブレットスタンド', 'TS-ADJ-014', 3, 9, 2800, 250, 35, 500, '角度調整可能'),
('P000015', 'スマートウォッチ', 'SW-FIT-015', 3, 6, 24800, 60, 8, 150, 'フィットネス機能搭載'),

-- ネットワーク機器
('P000016', 'Wi-Fi 6ルーター', 'WF6-RT-016', 4, 8, 18500, 70, 8, 150, 'AX3000対応'),
('P000017', 'LANケーブル Cat6A', 'LAN-C6A-017', 4, 8, 1800, 400, 50, 800, '10Gbps対応 3m'),
('P000018', 'ネットワークスイッチ 8ポート', 'NS-8P-018', 4, 8, 6800, 100, 12, 200, 'ギガビット対応'),
('P000019', 'USB Wi-Fiアダプター', 'UWA-AC-019', 4, 8, 3200, 180, 25, 350, 'AC1200対応'),
('P000020', 'PoEインジェクター', 'POE-INJ-020', 4, 8, 4500, 80, 10, 160, '30W出力対応'),

-- ストレージ
('P000021', '外付けSSD 1TB', 'SSD-EXT-021', 5, 9, 12800, 120, 15, 250, 'USB 3.2 Gen2対応'),
('P000022', 'USBメモリ 64GB', 'USB-64G-022', 5, 9, 1800, 350, 45, 700, 'USB 3.0対応'),
('P000023', '外付けHDD 4TB', 'HDD-4TB-023', 5, 9, 8900, 80, 10, 160, '3.5インチ据え置き型'),
('P000024', 'microSDカード 128GB', 'MSD-128G-024', 5, 9, 2400, 280, 35, 560, 'Class 10対応'),
('P000025', 'NAS 2ベイ', 'NAS-2BAY-025', 5, 9, 28000, 35, 5, 70, 'RAID対応'),

-- 電源・ケーブル
('P000026', 'USB-C充電器 65W', 'CHG-65W-026', 8, 5, 4800, 200, 25, 400, 'GaN技術採用'),
('P000027', 'HDMIケーブル 2m', 'HDMI-2M-027', 8, 5, 1200, 450, 60, 900, '4K@60Hz対応'),
('P000028', '電源タップ 6口', 'TAP-6P-028', 8, 5, 2800, 180, 25, 350, '雷サージ保護'),
('P000029', 'USB-Cケーブル 1m', 'USBC-1M-029', 8, 5, 800, 600, 80, 1200, 'PD対応'),
('P000030', 'ワイヤレス充電パッド', 'WCP-QI-030', 8, 5, 3200, 150, 20, 300, '15W急速充電');

-- 残りの商品データを生成するためのプロシージャ
DELIMITER //
CREATE PROCEDURE GenerateProducts()
BEGIN
    DECLARE i INT DEFAULT 31;
    DECLARE product_names TEXT DEFAULT 'プリンター,スキャナー,プロジェクター,ドキュメントカメラ,ラミネーター,シュレッダー,電卓,デスクライト,マウスパッド,リストレスト,ケーブルボックス,デスクトップPC,ノートパソコン,タブレット端末,電子書籍リーダー,ドローン,アクションカメラ,デジタルカメラ,三脚,カメラバッグ';
    DECLARE name_count INT DEFAULT 20;
    DECLARE current_name VARCHAR(100);
    DECLARE category_id_val INT;
    DECLARE supplier_id_val INT;
    DECLARE price_val DECIMAL(10,2);
    DECLARE stock_val INT;
    
    WHILE i <= 5000 DO
        -- ランダムに商品名を選択
        SET current_name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(product_names, ',', 1 + (i % name_count)), ',', -1));
        SET category_id_val = 1 + (i % 10);
        SET supplier_id_val = 1 + (i % 10);
        SET price_val = 1000 + (i % 50) * 1000;
        SET stock_val = 10 + (i % 200);
        
        INSERT INTO products (
            product_id, 
            product_name, 
            model, 
            category_id, 
            supplier_id, 
            unit_price, 
            current_stock, 
            min_stock_level, 
            max_stock_level,
            description
        ) VALUES (
            CONCAT('P', LPAD(i, 6, '0')),
            CONCAT(current_name, ' ', CASE (i % 5) 
                WHEN 0 THEN 'Pro' 
                WHEN 1 THEN 'Lite' 
                WHEN 2 THEN 'Max' 
                WHEN 3 THEN 'Plus' 
                ELSE 'Standard' 
            END),
            CONCAT(CASE (i % 4) 
                WHEN 0 THEN 'PRO' 
                WHEN 1 THEN 'LITE' 
                WHEN 2 THEN 'MAX' 
                ELSE 'STD' 
            END, '-', LPAD(i, 4, '0')),
            category_id_val,
            supplier_id_val,
            price_val,
            stock_val,
            GREATEST(5, stock_val * 0.1),
            LEAST(1000, stock_val * 3),
            CONCAT('商品番号', i, 'の説明文')
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- プロシージャを実行して残りの商品を生成
CALL GenerateProducts();

-- プロシージャを削除
DROP PROCEDURE GenerateProducts;
