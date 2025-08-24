import mysql from "mysql2/promise"

// データベース接続設定
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "7Q_Zwn6p#vX@yS9", // 実際のパスワードを設定
  database: "product_management",
  charset: "utf8mb4",
}

// データベース接続テスト
async function testConnection() {
  let connection

  try {
    console.log("🔌 データベースに接続中...")
    connection = await mysql.createConnection(dbConfig)

    console.log("✅ データベース接続成功!")

    // 基本的な統計情報を取得
    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM inventory_transactions) as total_transactions,
        (SELECT COUNT(*) FROM staff) as total_staff,
        (SELECT COUNT(*) FROM suppliers) as total_suppliers,
        (SELECT COUNT(*) FROM categories) as total_categories
    `)

    console.log("📊 データベース統計:")
    console.log(`   商品数: ${stats[0].total_products.toLocaleString()}件`)
    console.log(`   取引履歴: ${stats[0].total_transactions.toLocaleString()}件`)
    console.log(`   担当者: ${stats[0].total_staff}名`)
    console.log(`   仕入先: ${stats[0].total_suppliers}社`)
    console.log(`   カテゴリ: ${stats[0].total_categories}種類`)

    // 在庫アラートの確認
    const [alerts] = await connection.execute(`
      SELECT alert_type, COUNT(*) as count 
      FROM stock_alerts 
      GROUP BY alert_type
    `)

    console.log("\n🚨 在庫アラート:")
    alerts.forEach((alert) => {
      console.log(`   ${alert.alert_type}: ${alert.count}件`)
    })

    // 最新の取引を表示
    const [recentTransactions] = await connection.execute(`
      SELECT 
        it.transaction_date,
        p.product_name,
        it.transaction_type,
        it.quantity,
        s.staff_name
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.product_id
      JOIN staff s ON it.staff_id = s.staff_id
      ORDER BY it.transaction_date DESC, it.created_at DESC
      LIMIT 5
    `)

    console.log("\n📋 最新の取引履歴:")
    recentTransactions.forEach((tx) => {
      console.log(
        `   ${tx.transaction_date} | ${tx.product_name} | ${tx.transaction_type} ${tx.quantity}個 | ${tx.staff_name}`,
      )
    })
  } catch (error) {
    console.error("❌ データベース接続エラー:", error.message)

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("💡 ヒント: ユーザー名またはパスワードを確認してください")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.log("💡 ヒント: データベースが存在しません。01_create_database.sqlを実行してください")
    } else if (error.code === "ECONNREFUSED") {
      console.log("💡 ヒント: MySQLサーバーが起動していません")
    }
  } finally {
    if (connection) {
      await connection.end()
      console.log("\n🔌 データベース接続を終了しました")
    }
  }
}

// 接続テストを実行
testConnection()
