import fs from "fs"

// 商品名のサンプルデータ
const productNames = [
  "ワイヤレスイヤホン",
  "スマートフォンケース",
  "ノートパソコン",
  "タブレット端末",
  "デジタルカメラ",
  "プリンター",
  "モニター",
  "キーボード",
  "マウス",
  "スピーカー",
  "ヘッドホン",
  "Webカメラ",
  "USBメモリ",
  "外付けHDD",
  "SSD",
  "ルーター",
  "LANケーブル",
  "電源アダプター",
  "バッテリー",
  "充電器",
  "スマートウォッチ",
  "フィットネストラッカー",
  "ゲーミングチェア",
  "デスクライト",
  "マウスパッド",
  "ドキュメントスキャナー",
  "プロジェクター",
  "スクリーン",
  "ケーブル",
  "アダプター",
  "メモリーカード",
  "カードリーダー",
  "ハブ",
  "スタンド",
  "ホルダー",
  "クリーナー",
  "保護フィルム",
  "ケーブルボックス",
  "延長コード",
  "タップ",
]

// カテゴリのサンプルデータ
const categories = [
  "オーディオ機器",
  "PC周辺機器",
  "モバイル機器",
  "ネットワーク機器",
  "ストレージ",
  "ディスプレイ",
  "入力機器",
  "電源・ケーブル",
  "アクセサリー",
  "オフィス機器",
]

// 担当者名のサンプルデータ
const staffNames = [
  "田中太郎",
  "佐藤花子",
  "鈴木一郎",
  "高橋美咲",
  "伊藤健太",
  "渡辺由美",
  "山本大輔",
  "中村さくら",
  "小林雄介",
  "加藤恵子",
  "吉田拓也",
  "山田麻衣",
  "佐々木翔",
  "松本優子",
  "井上和也",
  "木村真理",
  "林大樹",
  "清水愛",
  "山崎浩二",
  "森田智子",
]

// 仕入先のサンプルデータ
const suppliers = [
  "テクノロジー商事",
  "デジタル機器販売",
  "エレクトロニクス卸",
  "ITソリューションズ",
  "コンピューター商会",
  "モバイルデバイス",
  "オーディオ専門店",
  "ネットワーク機器",
  "ストレージ販売",
  "アクセサリー卸",
]

// ランダムな日付を生成（過去12ヶ月）
function getRandomDate(monthsAgo = 12) {
  const now = new Date()
  const pastDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime())
  return new Date(randomTime)
}

// 日付をYYYY-MM-DD形式でフォーマット
function formatDate(date) {
  return date.toISOString().split("T")[0]
}

// ランダムな要素を配列から選択
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// ランダムな数値を生成
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 型式を生成
function generateModel(productName, index) {
  const prefixes = ["PRO", "MAX", "LITE", "PLUS", "ULTRA"]
  const prefix = getRandomElement(prefixes)
  const number = String(index).padStart(4, "0")
  return `${prefix}-${number}`
}

// CSVデータを生成
function generateProductData() {
  const data = []

  // ヘッダー行
  const headers = [
    "No",
    "商品ID",
    "商品名",
    "型式",
    "カテゴリ",
    "在庫数",
    "入荷数",
    "入荷日",
    "出荷数",
    "出荷日",
    "注文担当者",
    "注文日",
    "単価",
    "仕入先",
    "備考",
  ]

  data.push(headers.join(","))

  // データ行を生成
  for (let i = 1; i <= 5000; i++) {
    const productName = getRandomElement(productNames)
    const model = generateModel(productName, i)
    const category = getRandomElement(categories)
    const stock = getRandomNumber(0, 500)
    const incoming = getRandomNumber(10, 200)
    const incomingDate = formatDate(getRandomDate(12))
    const outgoing = getRandomNumber(5, 150)
    const outgoingDate = formatDate(getRandomDate(6))
    const staff = getRandomElement(staffNames)
    const orderDate = formatDate(getRandomDate(12))
    const unitPrice = getRandomNumber(1000, 50000)
    const supplier = getRandomElement(suppliers)
    const note = Math.random() > 0.7 ? "要確認" : ""

    const row = [
      i,
      `P${String(i).padStart(6, "0")}`,
      `"${productName}"`,
      model,
      `"${category}"`,
      stock,
      incoming,
      incomingDate,
      outgoing,
      outgoingDate,
      `"${staff}"`,
      orderDate,
      unitPrice,
      `"${supplier}"`,
      `"${note}"`,
    ]

    data.push(row.join(","))
  }

  return data.join("\n")
}

// CSVファイルを保存
function saveCSVFile() {
  try {
    const csvData = generateProductData()
    const fileName = "product_data_sample.csv"

    // UTF-8 BOMを追加して文字化けを防ぐ
    const bom = "\uFEFF"
    const csvWithBom = bom + csvData

    fs.writeFileSync(fileName, csvWithBom, "utf8")

    console.log(`✅ CSVファイルが正常に生成されました: ${fileName}`)
    console.log(`📊 データ件数: 5,000件`)
    console.log(`📅 期間: 過去12ヶ月`)
    console.log(`🔤 エンコーディング: UTF-8 (BOM付き)`)

    // ファイルサイズを表示
    const stats = fs.statSync(fileName)
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`📁 ファイルサイズ: ${fileSizeInMB} MB`)
  } catch (error) {
    console.error("❌ エラーが発生しました:", error.message)
  }
}

// データ生成を実行
console.log("🚀 商品管理データの生成を開始します...")
saveCSVFile()
