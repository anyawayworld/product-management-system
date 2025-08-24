USE product_management;

-- サンプルクエリ集

-- 1. 在庫状況一覧
SELECT 
    product_id as 'No',
    product_name as '商品名',
    model as '型式',
    current_stock as '在庫数',
    stock_status as '在庫状況'
FROM inventory_summary
ORDER BY 
    CASE stock_status
        WHEN '在庫切れ' THEN 1
        WHEN '在庫少' THEN 2
        WHEN '正常' THEN 3
        WHEN '在庫過多' THEN 4
    END,
    product_id;

-- 2. 月別入出荷実績
SELECT 
    month as '年月',
    total_received as '入荷数',
    total_shipped as '出荷数',
    FORMAT(total_purchases, 0) as '仕入金額',
    FORMAT(total_sales, 0) as '売上金額'
FROM monthly_sales_report
ORDER BY month DESC
LIMIT 12;

-- 3. 在庫アラート一覧
SELECT 
    product_id as '商品ID',
    product_name as '商品名',
    current_stock as '現在庫数',
    min_stock_level as '最小在庫',
    alert_type as 'アラート種別'
FROM stock_alerts
ORDER BY alert_level, current_stock;

-- 4. 担当者別実績
SELECT 
    staff_name as '担当者名',
    department as '部署',
    total_transactions as '取引件数',
    total_shipped as '出荷数量',
    FORMAT(total_sales, 0) as '売上金額'
FROM staff_performance
WHERE total_sales > 0
ORDER BY total_sales DESC
LIMIT 10;

-- 5. カテゴリ別在庫状況
SELECT 
    c.category_name as 'カテゴリ',
    COUNT(p.product_id) as '商品数',
    SUM(p.current_stock) as '総在庫数',
    SUM(CASE WHEN p.current_stock = 0 THEN 1 ELSE 0 END) as '在庫切れ商品数',
    FORMAT(AVG(p.unit_price), 0) as '平均単価'
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
WHERE p.is_active = TRUE
GROUP BY c.category_id, c.category_name
ORDER BY 総在庫数 DESC;

-- 6. 最近の取引履歴（直近100件）
SELECT 
    it.transaction_date as '取引日',
    p.product_name as '商品名',
    it.transaction_type as '取引種別',
    it.quantity as '数量',
    s.staff_name as '担当者',
    FORMAT(it.total_amount, 0) as '金額'
FROM inventory_transactions it
JOIN products p ON it.product_id = p.product_id
JOIN staff s ON it.staff_id = s.staff_id
ORDER BY it.transaction_date DESC, it.created_at DESC
LIMIT 100;
