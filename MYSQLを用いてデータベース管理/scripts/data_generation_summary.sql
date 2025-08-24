-- 現在のデータ生成の詳細確認

USE product_management;

-- 1. 商品データの確認
SELECT 
    '商品データ' as 'データ種別',
    COUNT(*) as '件数',
    MIN(created_at) as '最古データ',
    MAX(created_at) as '最新データ'
FROM products;

-- 2. 取引データの確認
SELECT 
    '取引データ' as 'データ種別',
    COUNT(*) as '総件数',
    MIN(transaction_date) as '最古取引日',
    MAX(transaction_date) as '最新取引日',
    DATEDIFF(MAX(transaction_date), MIN(transaction_date)) as '期間_日数'
FROM inventory_transactions;

-- 3. 月別取引件数の確認
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') as '年月',
    COUNT(*) as '取引件数',
    SUM(CASE WHEN transaction_type = '入荷' THEN 1 ELSE 0 END) as '入荷件数',
    SUM(CASE WHEN transaction_type = '出荷' THEN 1 ELSE 0 END) as '出荷件数',
    SUM(CASE WHEN transaction_type = '調整' THEN 1 ELSE 0 END) as '調整件数',
    SUM(CASE WHEN transaction_type = '返品' THEN 1 ELSE 0 END) as '返品件数'
FROM inventory_transactions
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
ORDER BY 年月 DESC;

-- 4. 商品あたりの平均取引件数
SELECT 
    '商品あたり平均取引件数' as '項目',
    ROUND(COUNT(it.transaction_id) / COUNT(DISTINCT p.product_id), 2) as '平均件数'
FROM products p
LEFT JOIN inventory_transactions it ON p.product_id = it.product_id;

-- 5. データ生成期間の確認
SELECT 
    '取引データ期間' as '項目',
    CONCAT(
        ROUND(DATEDIFF(MAX(transaction_date), MIN(transaction_date)) / 30.44, 1), 
        'ヶ月'
    ) as '期間'
FROM inventory_transactions;
