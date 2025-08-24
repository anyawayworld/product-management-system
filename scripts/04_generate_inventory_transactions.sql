USE product_management;

-- 在庫取引データ生成用のプロシージャ
DELIMITER //
CREATE PROCEDURE GenerateInventoryTransactions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE product_id_val VARCHAR(20);
    DECLARE i INT DEFAULT 0;
    DECLARE transaction_count INT DEFAULT 0;
    DECLARE random_date DATE;
    DECLARE random_quantity INT;
    DECLARE random_staff_id INT;
    DECLARE random_type VARCHAR(10);
    DECLARE unit_price_val DECIMAL(10,2);
    
    -- 商品IDを取得するカーソル
    DECLARE product_cursor CURSOR FOR 
        SELECT product_id, unit_price FROM products WHERE is_active = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN product_cursor;
    
    product_loop: LOOP
        FETCH product_cursor INTO product_id_val, unit_price_val;
        IF done THEN
            LEAVE product_loop;
        END IF;
        
        -- 各商品に対して過去12ヶ月のランダムな取引を生成
        SET i = 0;
        WHILE i < 15 DO -- 商品あたり平均15件の取引
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
                product_id_val,
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
            SET transaction_count = transaction_count + 1;
            
            -- 進捗表示（1000件ごと）
            IF transaction_count % 1000 = 0 THEN
                SELECT CONCAT('Generated ', transaction_count, ' transactions...') as progress;
            END IF;
        END WHILE;
    END LOOP;
    
    CLOSE product_cursor;
    
    SELECT CONCAT('Total transactions generated: ', transaction_count) as result;
END //
DELIMITER ;

-- プロシージャを実行して取引データを生成
CALL GenerateInventoryTransactions();

-- プロシージャを削除
DROP PROCEDURE GenerateInventoryTransactions;

-- 在庫数を取引履歴に基づいて更新
UPDATE products p SET current_stock = (
    SELECT COALESCE(
        (SELECT SUM(
            CASE 
                WHEN transaction_type = '入荷' THEN quantity
                WHEN transaction_type = '出荷' THEN -quantity
                WHEN transaction_type = '調整' THEN quantity
                WHEN transaction_type = '返品' THEN quantity
                ELSE 0
            END
        ) FROM inventory_transactions WHERE product_id = p.product_id), 
        FLOOR(RAND() * 200) + 10
    )
);

-- 負の在庫を0に修正
UPDATE products SET current_stock = 0 WHERE current_stock < 0;
