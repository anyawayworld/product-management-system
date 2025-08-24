// 現在のデータ生成ロジックの分析

console.log("📊 現在のデータ生成仕様の分析")
console.log("=".repeat(50))

// 商品データの分析
console.log("🛍️ 商品データ:")
console.log("  - 件数: 5,000件")
console.log("  - 生成方法: SQLプロシージャで一括生成")
console.log("  - 内容: 商品名、型式、カテゴリ、仕入先、価格、在庫数など")

console.log("\n📋 取引データ:")
console.log("  - 総件数: 約75,000件 (5,000商品 × 平均15取引)")
console.log("  - 期間: 過去12ヶ月間")
console.log("  - 取引種別: 入荷(70%), 出荷(25%), 調整・返品(5%)")
console.log("  - 日付: ランダムに過去365日以内で生成")

console.log("\n🔢 詳細な計算:")
console.log("  - 商品数: 5,000件")
console.log("  - 商品あたり取引数: 15件")
console.log("  - 総取引数: 5,000 × 15 = 75,000件")
console.log("  - 期間: 12ヶ月 (365日)")
console.log("  - 月平均取引数: 75,000 ÷ 12 ≈ 6,250件/月")

console.log("\n📅 取引日の生成ロジック:")
console.log("  ```sql")
console.log("  -- 過去12ヶ月のランダムな日付を生成")
console.log("  SET random_date = DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 365) DAY);")
console.log("  ```")

console.log("\n✅ 結論:")
console.log("  現在のコードは以下を生成します:")
console.log("  - 商品マスタ: 5,000件")
console.log("  - 取引履歴: 約75,000件 (12ヶ月間)")
console.log("  - カテゴリ: 10種類")
console.log("  - 仕入先: 10社")
console.log("  - 担当者: 20名")
