-- 文字エンコーディング問題を修正したデータベース作成スクリプト

-- セッションの文字エンコーディングを設定
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- データベースの作成（UTF8MB4で明示的に指定）
DROP DATABASE IF EXISTS product_management;
CREATE DATABASE product_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE product_management;

-- 既存のテーブルを削除（再実行時のため）
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;

-- カテゴリマスタテーブル
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 仕入先マスタテーブル
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 担当者マスタテーブル
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商品マスタテーブル
CREATE TABLE products (
    product_id VARCHAR(20) PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category_id INT,
    supplier_id INT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    INDEX idx_product_name (product_name),
    INDEX idx_model (model),
    INDEX idx_current_stock (current_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 在庫取引履歴テーブル
CREATE TABLE inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(20) NOT NULL,
    transaction_type ENUM('入荷', '出荷', '調整', '返品') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    quantity INT NOT NULL,
    transaction_date DATE NOT NULL,
    staff_id INT,
    order_date DATE,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    INDEX idx_product_transaction (product_id, transaction_date),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 在庫サマリービュー
CREATE VIEW inventory_summary AS
SELECT 
    p.product_id,
    p.product_name,
    p.model,
    c.category_name,
    s.supplier_name,
    p.unit_price,
    p.current_stock,
    p.min_stock_level,
    p.max_stock_level,
    CASE 
        WHEN p.current_stock = 0 THEN '在庫切れ'
        WHEN p.current_stock <= p.min_stock_level THEN '在庫少'
        WHEN p.current_stock >= p.max_stock_level THEN '在庫過多'
        ELSE '正常'
    END as stock_status,
    (SELECT SUM(quantity) FROM inventory_transactions 
     WHERE product_id = p.product_id AND transaction_type = '入荷' 
     AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as monthly_incoming,
    (SELECT SUM(quantity) FROM inventory_transactions 
     WHERE product_id = p.product_id AND transaction_type = '出荷' 
     AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as monthly_outgoing
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE p.is_active = TRUE;

-- 文字エンコーディング設定の確認
SELECT 'データベース作成完了 - 文字エンコーディング確認:' as message;
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';
