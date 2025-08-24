-- リアル業務量データでのパフォーマンステスト用クエリ

USE product_management;

-- 実行時間測定開始
SET @start_time = NOW(6);

-- 1. 商品検索パフォーマンステスト
SELECT '=== 商品検索パフォーマンステスト ===' as test_name;

-- 商品名での部分一致検索
SELECT COUNT(*) as '商品名検索結果数'
FROM products 
WHERE product_name LIKE '%ワイヤレス%';

-- カテゴリ別商品数
SELECT 
    c.category_name as 'カテゴリ',
    COUNT(p.product_id) as '商品数',
    AVG(p.unit_price) as '平均単価',
    SUM(p.current_stock * p.unit_price) as '在庫総額'
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
WHERE p.is_active = TRUE
GROUP BY c.category_id, c.category_name
ORDER BY 商品数 DESC;

-- 2. 取引履歴パフォーマンステスト
SELECT '=== 取引履歴パフォーマンステスト ===' as test_name;

-- 月別取引統計（12ヶ月分）
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') as '年月',
    COUNT(*) as '取引件数',
    SUM(CASE WHEN transaction_type = '入荷' THEN quantity ELSE 0 END) as '入荷数量',
    SUM(CASE WHEN transaction_type = '出荷' THEN quantity ELSE 0 END) as '出荷数量',
    FORMAT(SUM(CASE WHEN transaction_type = '出荷' THEN total_amount ELSE 0 END), 0) as '売上金額'
FROM inventory_transactions
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
ORDER BY 年月 DESC;

-- 3. 在庫状況分析
SELECT '=== 在庫状況分析 ===' as test_name;

-- 在庫状況別商品数
SELECT 
    CASE 
        WHEN current_stock = 0 THEN '在庫切れ'
        WHEN current_stock <= min_stock_level THEN '在庫不足'
        WHEN current_stock >= max_stock_level THEN '在庫過多'
        ELSE '正常'
    END as '在庫状況',
    COUNT(*) as '商品数',
    FORMAT(SUM(current_stock * unit_price), 0) as '在庫価値'
FROM products
WHERE is_active = TRUE
GROUP BY 
    CASE 
        WHEN current_stock = 0 THEN '在庫切れ'
        WHEN current_stock <= min_stock_level THEN '在庫不足'
        WHEN current_stock >= max_stock_level THEN '在庫過多'
        ELSE '正常'
    END
ORDER BY 商品数 DESC;

-- 4. 売れ筋商品分析（TOP20）
SELECT '=== 売れ筋商品 TOP20 ===' as test_name;

SELECT 
    p.product_name as '商品名',
    p.model as '型式',
    c.category_name as 'カテゴリ',
    SUM(it.quantity) as '総出荷数',
    FORMAT(SUM(it.total_amount), 0) as '総売上金額',
    p.current_stock as '現在庫'
FROM products p
JOIN inventory_transactions it ON p.product_id = it.product_id
JOIN categories c ON p.category_id = c.category_id
WHERE it.transaction_type = '出荷'
GROUP BY p.product_id, p.product_name, p.model, c.category_name, p.current_stock
ORDER BY 総出荷数 DESC
LIMIT 20;

-- 5. 担当者別実績（TOP10）
SELECT '=== 担当者別実績 TOP10 ===' as test_name;

SELECT 
    s.staff_name as '担当者名',
    s.department as '部署',
    COUNT(it.transaction_id) as '取引件数',
    SUM(CASE WHEN it.transaction_type = '出荷' THEN it.quantity ELSE 0 END) as '出荷数量',
    FORMAT(SUM(CASE WHEN it.transaction_type = '出荷' THEN it.total_amount ELSE 0 END), 0) as '売上金額'
FROM staff s
LEFT JOIN inventory_transactions it ON s.staff_id = it.staff_id
GROUP BY s.staff_id, s.staff_name, s.department
HAVING 売上金額 > 0
ORDER BY CAST(REPLACE(売上金額, ',', '') AS UNSIGNED) DESC
LIMIT 10;

-- 6. 仕入先別分析
SELECT '=== 仕入先別分析 ===' as test_name;

SELECT 
    sup.supplier_name as '仕入先',
    COUNT(DISTINCT p.product_id) as '取扱商品数',
    SUM(p.current_stock) as '総在庫数',
    FORMAT(SUM(p.current_stock * p.unit_price), 0) as '在庫価値',
    FORMAT(AVG(p.unit_price), 0) as '平均単価'
FROM suppliers sup
LEFT JOIN products p ON sup.supplier_id = p.supplier_id
WHERE p.is_active = TRUE
GROUP BY sup.supplier_id, sup.supplier_name
ORDER BY CAST(REPLACE(在庫価値, ',', '') AS UNSIGNED) DESC;

-- 実行時間測定終了
SET @end_time = NOW(6);
SELECT 
    'パフォーマンステスト完了' as 'ステータス',
    TIMESTAMPDIFF(MICROSECOND, @start_time, @end_time) / 1000000 as '実行時間_秒';

-- データベースサイズ確認
SELECT 
    table_name as 'テーブル名',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'サイズ_MB',
    table_rows as '行数'
FROM information_schema.tables 
WHERE table_schema = 'product_management'
ORDER BY (data_length + index_length) DESC;
