-- もし「12ヶ月で5,000件の取引データ」が必要な場合の代替スクリプト

USE product_management;

-- 既存の取引データを削除
DELETE FROM inventory_transactions;

-- 在庫数をリセット
UPDATE products SET current_stock = FLOOR(RAND() * 200) + 10;

-- 5,000件の取引データを生成するプロシージャ
DELIMITER //
CREATE PROCEDURE Generate5000Transactions()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE product_count INT;
    DECLARE random_product_id VARCHAR(20);
    DECLARE random_date DATE;
    DECLARE random_quantity INT;
    DECLARE random_staff_id INT;
    DECLARE random_type VARCHAR(10);
    DECLARE unit_price_val DECIMAL(10,2);
    
    -- 商品数を取得
    SELECT COUNT(*) INTO product_count FROM products WHERE is_active = TRUE;
    
    WHILE i <= 5000 DO
        -- ランダムな商品を選択
        SELECT product_id, unit_price 
        INTO random_product_id, unit_price_val
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY RAND() 
        LIMIT 1;
        
        -- ランダムな日付（過去12ヶ月）
        SET random_date = DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 365) DAY);
        
        -- ランダムな取引タイプ（入荷70%, 出荷25%, その他5%）
        SET random_type = CASE 
            WHEN RAND() < 0.7 THEN '入荷'
            WHEN RAND() < 0.95 THEN '出荷'
            WHEN RAND() < 0.98 THEN '調整'
            ELSE '返品'
        END;
        
        -- 取引タイプに応じた数量設定
        SET random_quantity = CASE random_type
            WHEN '入荷' THEN 10 + FLOOR(RAND() * 100)
            WHEN '出荷' THEN 1 + FLOOR(RAND() * 50)
            WHEN '調整' THEN -10 + FLOOR(RAND() * 20)
            ELSE 1 + FLOOR(RAND() * 10)
        END;
        
        -- ランダムな担当者
        SET random_staff_id = 1 + FLOOR(RAND() * 20);
        
        INSERT INTO inventory_transactions (
            product_id,
            transaction_type,
            quantity,
            transaction_date,
            staff_id,
            order_date,
            unit_price,
            total_amount,
            notes
        ) VALUES (
            random_product_id,
            random_type,
            random_quantity,
            random_date,
            random_staff_id,
            DATE_SUB(random_date, INTERVAL FLOOR(RAND() * 7) DAY),
            unit_price_val,
            unit_price_val * random_quantity,
            CASE 
                WHEN RAND() < 0.1 THEN '要確認'
                WHEN RAND() < 0.2 THEN '急ぎ'
                WHEN RAND() < 0.3 THEN '通常'
                ELSE NULL
            END
        );
        
        SET i = i + 1;
        
        -- 進捗表示（1000件ごと）
        IF i % 1000 = 0 THEN
            SELECT CONCAT('Generated ', i, ' transactions...') as progress;
        END IF;
    END WHILE;
    
    SELECT CONCAT('Total 5,000 transactions generated successfully!') as result;
END //
DELIMITER ;

-- プロシージャを実行
CALL Generate5000Transactions();

-- プロシージャを削除
DROP PROCEDURE Generate5000Transactions;

-- 結果確認
SELECT 
    '取引データ生成完了' as 'ステータス',
    COUNT(*) as '総取引件数',
    MIN(transaction_date) as '最古取引日',
    MAX(transaction_date) as '最新取引日'
FROM inventory_transactions;
