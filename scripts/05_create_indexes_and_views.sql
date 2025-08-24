USE product_management;

-- 追加のインデックス作成
CREATE INDEX idx_products_stock_status ON products(current_stock, min_stock_level);
CREATE INDEX idx_transactions_date_type ON inventory_transactions(transaction_date, transaction_type);
CREATE INDEX idx_staff_department ON staff(department, is_active);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);

-- 月次売上レポート用ビュー
CREATE VIEW monthly_sales_report AS
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') as month,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN transaction_type = '出荷' THEN quantity ELSE 0 END) as total_shipped,
    SUM(CASE WHEN transaction_type = '出荷' THEN total_amount ELSE 0 END) as total_sales,
    SUM(CASE WHEN transaction_type = '入荷' THEN quantity ELSE 0 END) as total_received,
    SUM(CASE WHEN transaction_type = '入荷' THEN total_amount ELSE 0 END) as total_purchases
FROM inventory_transactions
WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
ORDER BY month DESC;

-- 在庫アラート用ビュー
CREATE VIEW stock_alerts AS
SELECT 
    p.product_id,
    p.product_name,
    p.model,
    c.category_name,
    p.current_stock,
    p.min_stock_level,
    p.max_stock_level,
    CASE 
        WHEN p.current_stock = 0 THEN '在庫切れ'
        WHEN p.current_stock <= p.min_stock_level THEN '在庫不足'
        WHEN p.current_stock >= p.max_stock_level THEN '在庫過多'
        ELSE '正常'
    END as alert_type,
    CASE 
        WHEN p.current_stock = 0 THEN 'danger'
        WHEN p.current_stock <= p.min_stock_level THEN 'warning'
        WHEN p.current_stock >= p.max_stock_level THEN 'info'
        ELSE 'success'
    END as alert_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE p.is_active = TRUE
AND (p.current_stock = 0 OR p.current_stock <= p.min_stock_level OR p.current_stock >= p.max_stock_level)
ORDER BY 
    CASE 
        WHEN p.current_stock = 0 THEN 1
        WHEN p.current_stock <= p.min_stock_level THEN 2
        WHEN p.current_stock >= p.max_stock_level THEN 3
        ELSE 4
    END,
    p.current_stock ASC;

-- 担当者別売上実績ビュー
CREATE VIEW staff_performance AS
SELECT 
    s.staff_id,
    s.staff_name,
    s.department,
    COUNT(it.transaction_id) as total_transactions,
    SUM(CASE WHEN it.transaction_type = '出荷' THEN it.quantity ELSE 0 END) as total_shipped,
    SUM(CASE WHEN it.transaction_type = '出荷' THEN it.total_amount ELSE 0 END) as total_sales,
    ROUND(AVG(CASE WHEN it.transaction_type = '出荷' THEN it.total_amount ELSE NULL END), 2) as avg_sale_amount
FROM staff s
LEFT JOIN inventory_transactions it ON s.staff_id = it.staff_id
WHERE s.is_active = TRUE
AND (it.transaction_date IS NULL OR it.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH))
GROUP BY s.staff_id, s.staff_name, s.department
ORDER BY total_sales DESC;
