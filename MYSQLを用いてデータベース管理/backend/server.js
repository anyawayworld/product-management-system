import express from "express"
import cors from "cors"
import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ミドルウェア
app.use(cors())
app.use(express.json())

// データベース接続設定
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "7Q_Zwn6p#vX@yS9",
  database: process.env.DB_NAME || "product_management",
  charset: "utf8mb4",
  timezone: "+09:00",
}

// データベース接続プール
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// データベース接続テスト
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ データベース接続成功!")

    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM inventory_transactions) as total_transactions,
        (SELECT COUNT(*) FROM categories) as total_categories
    `)

    console.log("📊 データベース統計:")
    console.log(`   商品数: ${stats[0].total_products}件`)
    console.log(`   取引履歴: ${stats[0].total_transactions}件`)
    console.log(`   カテゴリ数: ${stats[0].total_categories}件`)

    connection.release()
  } catch (error) {
    console.error("❌ データベース接続エラー:", error.message)
  }
}

// ヘルスチェック
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// API情報エンドポイント
app.get("/api", (req, res) => {
  res.json({
    message: "商品管理システム API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  })
})

// 商品関連API（LIMIT/OFFSET問題を修正）
app.get("/api/products", async (req, res) => {
  try {
    console.log("Products API called with query:", req.query)

    const {
      page = 1,
      limit = 20,
      search = "",
      category = "",
      supplier = "",
      stock_status = "",
      sort_by = "product_id",
      sort_order = "asc",
    } = req.query

    // パラメータを数値に変換
    const pageNum = Number.parseInt(page) || 1
    const limitNum = Number.parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum

    console.log("Parsed parameters:", { pageNum, limitNum, offset, search, category, supplier, stock_status })

    // WHERE条件とパラメータを構築
    const whereConditions = ["p.is_active = TRUE"]
    const queryParams = []

    if (search && search.trim() !== "") {
      whereConditions.push("(p.product_name LIKE ? OR p.model LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (category && category !== "") {
      whereConditions.push("p.category_id = ?")
      queryParams.push(Number.parseInt(category))
    }

    if (supplier && supplier !== "") {
      whereConditions.push("p.supplier_id = ?")
      queryParams.push(Number.parseInt(supplier))
    }

    if (stock_status && stock_status !== "") {
      switch (stock_status) {
        case "在庫切れ":
          whereConditions.push("p.current_stock = 0")
          break
        case "在庫少":
          whereConditions.push("p.current_stock > 0 AND p.current_stock <= p.min_stock_level")
          break
        case "在庫過多":
          whereConditions.push("p.current_stock >= p.max_stock_level")
          break
        case "正常":
          whereConditions.push("p.current_stock > p.min_stock_level AND p.current_stock < p.max_stock_level")
          break
      }
    }

    const whereClause = whereConditions.join(" AND ")
    console.log("WHERE clause:", whereClause)
    console.log("Query parameters for WHERE:", queryParams)

    // 総件数を取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE ${whereClause}
    `

    console.log("Count query:", countQuery)
    const [countResult] = await pool.execute(countQuery, queryParams)
    const totalItems = countResult[0].total
    console.log("Total items:", totalItems)

    // データを取得（LIMIT/OFFSETを文字列で直接埋め込み）
    const dataQuery = `
      SELECT 
        p.*,
        c.category_name,
        s.supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE ${whereClause}
      ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ${limitNum} OFFSET ${offset}
    `

    console.log("Data query:", dataQuery)
    console.log("Data query parameters:", queryParams)

    // WHERE条件のパラメータのみを使用（LIMIT/OFFSETは直接埋め込み済み）
    const [rows] = await pool.execute(dataQuery, queryParams)
    console.log("Retrieved rows:", rows.length)

    const totalPages = Math.ceil(totalItems / limitNum)

    const response = {
      success: true,
      data: {
        data: rows,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1,
        },
      },
    }

    console.log("Sending response with", rows.length, "items")
    res.json(response)
  } catch (error) {
    console.error("Products API error:", error)
    res.status(500).json({
      success: false,
      error: "データの取得に失敗しました: " + error.message,
    })
  }
})

// 商品詳細取得
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        p.*,
        c.category_name,
        s.supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = ?
    `

    const [rows] = await pool.execute(query, [id])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "商品が見つかりません",
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    console.error("Product detail API error:", error)
    res.status(500).json({
      success: false,
      error: "データの取得に失敗しました",
    })
  }
})

// 商品作成
app.post("/api/products", async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const {
      product_name,
      model,
      category_id,
      supplier_id,
      unit_price,
      current_stock,
      min_stock_level,
      max_stock_level,
      description,
    } = req.body

    // 入力値検証
    if (!product_name || !model || !category_id || !supplier_id || unit_price === undefined) {
      throw new Error("必須項目が入力されていません")
    }

    // 新しい商品IDを生成
    const [maxIdResult] = await connection.execute(
      "SELECT MAX(CAST(SUBSTRING(product_id, 2) AS UNSIGNED)) as max_id FROM products",
    )
    const nextId = (maxIdResult[0].max_id || 0) + 1
    const productId = `P${String(nextId).padStart(6, "0")}`

    // 商品を挿入
    const [result] = await connection.execute(
      `
      INSERT INTO products (
        product_id, product_name, model, category_id, supplier_id,
        unit_price, current_stock, min_stock_level, max_stock_level, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productId,
        product_name,
        model,
        Number.parseInt(category_id),
        Number.parseInt(supplier_id),
        Number.parseFloat(unit_price),
        Number.parseInt(current_stock) || 0,
        Number.parseInt(min_stock_level) || 10,
        Number.parseInt(max_stock_level) || 1000,
        description || null,
      ],
    )

    await connection.commit()

    // 作成された商品を取得
    const [newProduct] = await connection.execute(
      `
      SELECT 
        p.*,
        c.category_name,
        s.supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = ?
      `,
      [productId],
    )

    res.status(201).json({
      success: true,
      data: newProduct[0],
      message: "商品を作成しました",
    })
  } catch (error) {
    await connection.rollback()
    console.error("Product creation error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "商品の作成に失敗しました",
    })
  } finally {
    connection.release()
  }
})

// 商品更新
app.put("/api/products/:id", async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params
    const {
      product_name,
      model,
      category_id,
      supplier_id,
      unit_price,
      current_stock,
      min_stock_level,
      max_stock_level,
      description,
    } = req.body

    // 商品の存在確認
    const [existingProduct] = await connection.execute("SELECT * FROM products WHERE product_id = ?", [id])

    if (existingProduct.length === 0) {
      throw new Error("商品が見つかりません")
    }

    // 商品を更新
    await connection.execute(
      `
      UPDATE products SET
        product_name = ?,
        model = ?,
        category_id = ?,
        supplier_id = ?,
        unit_price = ?,
        current_stock = ?,
        min_stock_level = ?,
        max_stock_level = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
      `,
      [
        product_name,
        model,
        Number.parseInt(category_id),
        Number.parseInt(supplier_id),
        Number.parseFloat(unit_price),
        Number.parseInt(current_stock),
        Number.parseInt(min_stock_level),
        Number.parseInt(max_stock_level),
        description || null,
        id,
      ],
    )

    await connection.commit()

    // 更新された商品を取得
    const [updatedProduct] = await connection.execute(
      `
      SELECT 
        p.*,
        c.category_name,
        s.supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = ?
      `,
      [id],
    )

    res.json({
      success: true,
      data: updatedProduct[0],
      message: "商品を更新しました",
    })
  } catch (error) {
    await connection.rollback()
    console.error("Product update error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "商品の更新に失敗しました",
    })
  } finally {
    connection.release()
  }
})

// 商品削除（論理削除）
app.delete("/api/products/:id", async (req, res) => {
  console.log("DELETE /api/products/:id called with ID:", req.params.id)

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id } = req.params
    console.log("Attempting to delete product with ID:", id)

    // 商品の存在確認
    const [existingProduct] = await connection.execute(
      "SELECT * FROM products WHERE product_id = ? AND is_active = TRUE",
      [id],
    )

    console.log("Existing product check result:", existingProduct.length)

    if (existingProduct.length === 0) {
      await connection.rollback()
      console.log("Product not found for deletion:", id)
      return res.status(404).json({
        success: false,
        error: "商品が見つかりません",
      })
    }

    // 取引履歴の確認
    const [transactionCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM inventory_transactions WHERE product_id = ?",
      [id],
    )

    console.log("Transaction check result:", transactionCheck[0].count)

    if (transactionCheck[0].count > 0) {
      // 取引履歴がある場合は論理削除
      console.log("Performing logical delete for product:", id)
      await connection.execute(
        "UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?",
        [id],
      )
    } else {
      // 取引履歴がない場合は物理削除
      console.log("Performing physical delete for product:", id)
      await connection.execute("DELETE FROM products WHERE product_id = ?", [id])
    }

    await connection.commit()
    console.log("Product deletion successful:", id)

    res.json({
      success: true,
      message: "商品を削除しました",
    })
  } catch (error) {
    await connection.rollback()
    console.error("Product deletion error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "商品の削除に失敗しました",
    })
  } finally {
    connection.release()
  }
})

// 取引履歴関連API
app.get("/api/transactions", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      product_id = "",
      transaction_type = "",
      date_from = "",
      date_to = "",
      sort_by = "transaction_date",
      sort_order = "desc",
    } = req.query

    const pageNum = Number.parseInt(page) || 1
    const limitNum = Number.parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum

    const whereConditions = []
    const queryParams = []

    if (search && search.trim() !== "") {
      whereConditions.push("(p.product_name LIKE ? OR p.model LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (product_id && product_id !== "") {
      whereConditions.push("it.product_id = ?")
      queryParams.push(product_id)
    }

    if (transaction_type && transaction_type !== "") {
      whereConditions.push("it.transaction_type = ?")
      queryParams.push(transaction_type)
    }

    if (date_from && date_from !== "") {
      whereConditions.push("it.transaction_date >= ?")
      queryParams.push(date_from)
    }

    if (date_to && date_to !== "") {
      whereConditions.push("it.transaction_date <= ?")
      queryParams.push(date_to)
    }

    const whereClause = whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1"

    // 総件数を取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.product_id
      LEFT JOIN staff s ON it.staff_id = s.staff_id
      WHERE ${whereClause}
    `

    const [countResult] = await pool.execute(countQuery, queryParams)
    const totalItems = countResult[0].total

    // データを取得（LIMIT/OFFSETを直接埋め込み）
    const dataQuery = `
      SELECT 
        it.*,
        p.product_name,
        s.staff_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.product_id
      LEFT JOIN staff s ON it.staff_id = s.staff_id
      WHERE ${whereClause}
      ORDER BY it.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ${limitNum} OFFSET ${offset}
    `

    const [rows] = await pool.execute(dataQuery, queryParams)

    const totalPages = Math.ceil(totalItems / limitNum)

    res.json({
      success: true,
      data: {
        data: rows,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1,
        },
      },
    })
  } catch (error) {
    console.error("Transactions API error:", error)
    res.status(500).json({
      success: false,
      error: "データの取得に失敗しました",
    })
  }
})

// 取引作成
app.post("/api/transactions", async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { product_id, transaction_type, quantity, transaction_date, staff_id, order_date, unit_price, notes } =
      req.body

    // 商品の存在確認
    const [productCheck] = await connection.execute(
      "SELECT current_stock, unit_price FROM products WHERE product_id = ? AND is_active = TRUE",
      [product_id],
    )

    if (productCheck.length === 0) {
      throw new Error("商品が見つかりません")
    }

    const currentStock = productCheck[0].current_stock
    const productUnitPrice = unit_price || productCheck[0].unit_price

    // 在庫数の計算
    let stockChange = 0
    switch (transaction_type) {
      case "入荷":
      case "返品":
        stockChange = quantity
        break
      case "出荷":
        stockChange = -quantity
        if (currentStock < quantity) {
          throw new Error("在庫が不足しています")
        }
        break
      case "調整":
        stockChange = quantity
        break
    }

    // 取引履歴を挿入
    const [transactionResult] = await connection.execute(
      `
      INSERT INTO inventory_transactions (
        product_id, transaction_type, quantity, transaction_date,
        staff_id, order_date, unit_price, total_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        product_id,
        transaction_type,
        quantity,
        transaction_date,
        staff_id,
        order_date,
        productUnitPrice,
        productUnitPrice * quantity,
        notes,
      ],
    )

    // 商品の在庫数を更新
    await connection.execute("UPDATE products SET current_stock = current_stock + ? WHERE product_id = ?", [
      stockChange,
      product_id,
    ])

    await connection.commit()

    // 作成された取引を取得
    const [newTransaction] = await connection.execute(
      `
      SELECT 
        it.*,
        p.product_name,
        s.staff_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.product_id
      LEFT JOIN staff s ON it.staff_id = s.staff_id
      WHERE it.transaction_id = ?
    `,
      [transactionResult.insertId],
    )

    res.status(201).json({
      success: true,
      data: newTransaction[0],
    })
  } catch (error) {
    await connection.rollback()
    console.error("Transaction creation error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "取引の作成に失敗しました",
    })
  } finally {
    connection.release()
  }
})

// マスタデータ関連API
app.get("/api/categories", async (req, res) => {
  try {
    console.log("Categories API called")
    const [rows] = await pool.execute("SELECT * FROM categories ORDER BY category_name")
    console.log("Categories retrieved:", rows.length)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Categories API error:", error)
    res.status(500).json({
      success: false,
      error: "カテゴリデータの取得に失敗しました",
    })
  }
})

app.get("/api/suppliers", async (req, res) => {
  try {
    console.log("Suppliers API called")
    const [rows] = await pool.execute("SELECT * FROM suppliers ORDER BY supplier_name")
    console.log("Suppliers retrieved:", rows.length)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Suppliers API error:", error)
    res.status(500).json({
      success: false,
      error: "仕入先データの取得に失敗しました",
    })
  }
})

app.get("/api/staff", async (req, res) => {
  try {
    console.log("Staff API called")
    const [rows] = await pool.execute("SELECT * FROM staff WHERE is_active = TRUE ORDER BY staff_name")
    console.log("Staff retrieved:", rows.length)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Staff API error:", error)
    res.status(500).json({
      success: false,
      error: "担当者データの取得に失敗しました",
    })
  }
})

// ダッシュボード統計API
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    // 基本統計
    const [basicStats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_products,
        (SELECT COUNT(*) FROM inventory_transactions) as total_transactions,
        (SELECT COUNT(*) FROM products WHERE current_stock <= min_stock_level AND current_stock > 0 AND is_active = TRUE) as low_stock_count,
        (SELECT COUNT(*) FROM products WHERE current_stock = 0 AND is_active = TRUE) as out_of_stock_count,
        (SELECT COALESCE(SUM(current_stock * unit_price), 0) FROM products WHERE is_active = TRUE) as total_inventory_value
    `)

    // 今月の売上・仕入
    const [monthlyStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = '出荷' THEN total_amount ELSE 0 END), 0) as monthly_sales,
        COALESCE(SUM(CASE WHEN transaction_type = '入荷' THEN total_amount ELSE 0 END), 0) as monthly_purchases
      FROM inventory_transactions
      WHERE DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    `)

    // 売れ筋商品
    const [topProducts] = await pool.execute(`
      SELECT 
        p.product_name,
        SUM(it.quantity) as total_sold
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.product_id
      WHERE it.transaction_type = '出荷'
      AND it.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.product_id, p.product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `)

    // 最近の取引履歴
    const [recentTransactions] = await pool.execute(`
      SELECT 
        it.*,
        p.product_name,
        s.staff_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.product_id
      LEFT JOIN staff s ON it.staff_id = s.staff_id
      ORDER BY it.transaction_date DESC, it.created_at DESC
      LIMIT 10
    `)

    const stats = {
      ...basicStats[0],
      monthly_sales: monthlyStats[0].monthly_sales || 0,
      monthly_purchases: monthlyStats[0].monthly_purchases || 0,
      top_selling_products: topProducts,
      recent_transactions: recentTransactions,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({
      success: false,
      error: "統計データの取得に失敗しました",
    })
  }
})

// レポート関連API（404エラー対策）
app.get("/api/reports/inventory-summary", async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "", category = "", supplier = "", stock_status = "" } = req.query

    const pageNum = Number.parseInt(page) || 1
    const limitNum = Number.parseInt(limit) || 100
    const offset = (pageNum - 1) * limitNum

    const whereConditions = ["p.is_active = TRUE"]
    const queryParams = []

    if (search && search.trim() !== "") {
      whereConditions.push("(p.product_name LIKE ? OR p.model LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (category && category !== "") {
      whereConditions.push("p.category_id = ?")
      queryParams.push(Number.parseInt(category))
    }

    if (supplier && supplier !== "") {
      whereConditions.push("p.supplier_id = ?")
      queryParams.push(Number.parseInt(supplier))
    }

    const whereClause = whereConditions.join(" AND ")

    // 総件数を取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE ${whereClause}
    `

    const [countResult] = await pool.execute(countQuery, queryParams)
    const totalItems = countResult[0].total

    // データを取得
    const dataQuery = `
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
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE ${whereClause}
      ORDER BY p.product_id
      LIMIT ${limitNum} OFFSET ${offset}
    `

    const [rows] = await pool.execute(dataQuery, queryParams)
    const totalPages = Math.ceil(totalItems / limitNum)

    res.json({
      success: true,
      data: {
        data: rows,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1,
        },
      },
    })
  } catch (error) {
    console.error("Inventory summary API error:", error)
    res.status(500).json({
      success: false,
      error: "在庫サマリーの取得に失敗しました",
    })
  }
})

app.get("/api/reports/stock-alerts", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
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
        p.current_stock ASC
    `)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Stock alerts API error:", error)
    res.status(500).json({
      success: false,
      error: "在庫アラートの取得に失敗しました",
    })
  }
})

app.get("/api/reports/monthly-sales", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
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
      ORDER BY month DESC
    `)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Monthly sales API error:", error)
    res.status(500).json({
      success: false,
      error: "月次売上レポートの取得に失敗しました",
    })
  }
})

app.get("/api/reports/staff-performance", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
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
      ORDER BY total_sales DESC
    `)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Staff performance API error:", error)
    res.status(500).json({
      success: false,
      error: "担当者実績の取得に失敗しました",
    })
  }
})

// CSV エクスポート関連API（404エラー対策）
app.get("/api/export/products", async (req, res) => {
  try {
    const { search = "", category = "", supplier = "", stock_status = "" } = req.query

    const whereConditions = ["p.is_active = TRUE"]
    const queryParams = []

    if (search && search.trim() !== "") {
      whereConditions.push("(p.product_name LIKE ? OR p.model LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (category && category !== "") {
      whereConditions.push("p.category_id = ?")
      queryParams.push(Number.parseInt(category))
    }

    if (supplier && supplier !== "") {
      whereConditions.push("p.supplier_id = ?")
      queryParams.push(Number.parseInt(supplier))
    }

    const whereClause = whereConditions.join(" AND ")

    const query = `
      SELECT 
        p.product_id as '商品ID',
        p.product_name as '商品名',
        p.model as '型式',
        c.category_name as 'カテゴリ',
        s.supplier_name as '仕入先',
        p.unit_price as '単価',
        p.current_stock as '在庫数',
        p.min_stock_level as '最小在庫',
        p.max_stock_level as '最大在庫',
        CASE 
          WHEN p.current_stock = 0 THEN '在庫切れ'
          WHEN p.current_stock <= p.min_stock_level THEN '在庫少'
          WHEN p.current_stock >= p.max_stock_level THEN '在庫過多'
          ELSE '正常'
        END as '在庫状況',
        p.description as '説明'
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE ${whereClause}
      ORDER BY p.product_id
    `

    const [rows] = await pool.execute(query, queryParams)

    // CSVヘッダーを作成
    const headers = Object.keys(rows[0] || {})
    let csv = headers.join(",") + "\n"

    // データ行を追加
    rows.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header]
        // 値にカンマや改行が含まれる場合はダブルクォートで囲む
        if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      csv += values.join(",") + "\n"
    })

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", 'attachment; filename="products.csv"')
    res.send("\uFEFF" + csv) // BOM付きUTF-8
  } catch (error) {
    console.error("Products CSV export error:", error)
    res.status(500).json({
      success: false,
      error: "CSV出力に失敗しました",
    })
  }
})

app.get("/api/export/transactions", async (req, res) => {
  try {
    const { search = "", product_id = "", transaction_type = "", date_from = "", date_to = "" } = req.query

    const whereConditions = []
    const queryParams = []

    if (search && search.trim() !== "") {
      whereConditions.push("(p.product_name LIKE ? OR p.model LIKE ?)")
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (product_id && product_id !== "") {
      whereConditions.push("it.product_id = ?")
      queryParams.push(product_id)
    }

    if (transaction_type && transaction_type !== "") {
      whereConditions.push("it.transaction_type = ?")
      queryParams.push(transaction_type)
    }

    if (date_from && date_from !== "") {
      whereConditions.push("it.transaction_date >= ?")
      queryParams.push(date_from)
    }

    if (date_to && date_to !== "") {
      whereConditions.push("it.transaction_date <= ?")
      queryParams.push(date_to)
    }

    const whereClause = whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1"

    const query = `
      SELECT 
        it.transaction_date as '取引日',
        p.product_name as '商品名',
        p.model as '型式',
        it.transaction_type as '取引種別',
        it.quantity as '数量',
        it.unit_price as '単価',
        it.total_amount as '金額',
        s.staff_name as '担当者',
        it.notes as '備考'
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.product_id
      LEFT JOIN staff s ON it.staff_id = s.staff_id
      WHERE ${whereClause}
      ORDER BY it.transaction_date DESC
    `

    const [rows] = await pool.execute(query, queryParams)

    // CSVヘッダーを作成
    const headers = Object.keys(rows[0] || {})
    let csv = headers.join(",") + "\n"

    // データ行を追加
    rows.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header]
        // 値にカンマや改行が含まれる場合はダブルクォートで囲む
        if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      csv += values.join(",") + "\n"
    })

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"')
    res.send("\uFEFF" + csv) // BOM付きUTF-8
  } catch (error) {
    console.error("Transactions CSV export error:", error)
    res.status(500).json({
      success: false,
      error: "CSV出力に失敗しました",
    })
  }
})

// 404エラーハンドラー
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`)
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.url}`,
    available_endpoints: [
      "GET /api/health",
      "GET /api/products",
      "POST /api/products",
      "PUT /api/products/:id",
      "DELETE /api/products/:id",
      "GET /api/transactions",
      "POST /api/transactions",
      "GET /api/categories",
      "GET /api/suppliers",
      "GET /api/staff",
      "GET /api/dashboard/stats",
      "GET /api/reports/inventory-summary",
      "GET /api/reports/stock-alerts",
      "GET /api/reports/monthly-sales",
      "GET /api/reports/staff-performance",
      "GET /api/export/products",
      "GET /api/export/transactions",
    ],
  })
})

// サーバー起動時にデータベース接続をテスト
testDatabaseConnection()

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`)
  console.log(`🔧 Available endpoints:`)
  console.log(`   GET  /api/health`)
  console.log(`   GET  /api/products`)
  console.log(`   POST /api/products`)
  console.log(`   PUT  /api/products/:id`)
  console.log(`   DELETE /api/products/:id`)
  console.log(`   GET  /api/transactions`)
  console.log(`   POST /api/transactions`)
  console.log(`   GET  /api/categories`)
  console.log(`   GET  /api/suppliers`)
  console.log(`   GET  /api/staff`)
  console.log(`   GET  /api/dashboard/stats`)
  console.log(`   GET  /api/reports/*`)
  console.log(`   GET  /api/export/*`)
})

// グレースフルシャットダウン
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")
  await pool.end()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully")
  await pool.end()
  process.exit(0)
})
