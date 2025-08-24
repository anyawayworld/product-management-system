"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiClient, formatCurrency, formatDate, downloadCSV } from "../services/api"
import type { InventoryTransaction, Product, Staff, PaginationParams, Notification } from "../types/types"

interface TransactionListProps {
  onNotify: (notification: Omit<Notification, "id">) => void
}

const TransactionList: React.FC<TransactionListProps> = ({ onNotify }) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
    has_next: false,
    has_prev: false,
  })

  const [filters, setFilters] = useState<PaginationParams>({
    page: "1",
    limit: "20",
    search: "",
    category: "",
    supplier: "",
    stock_status: "",
    sort_by: "transaction_date",
    sort_order: "desc",
  })

  const [newTransaction, setNewTransaction] = useState({
    product_id: "",
    transaction_type: "入荷" as "入荷" | "出荷" | "調整" | "返品",
    quantity: "",
    transaction_date: new Date().toISOString().split("T")[0],
    staff_id: "",
    order_date: "",
    unit_price: "",
    notes: "",
  })

  useEffect(() => {
    loadTransactions()
    loadMasterData()
  }, [filters])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      // API呼び出し時に必要な値を数値に変換
      const apiParams = {
        ...filters,
        page: Number.parseInt(filters.page),
        limit: Number.parseInt(filters.limit),
      }
      const response = await apiClient.getTransactions(apiParams)

      if (response.success && response.data) {
        setTransactions(response.data.data)
        setPagination(response.data.pagination)
      } else {
        onNotify({
          type: "error",
          title: "エラー",
          message: "取引データの取得に失敗しました",
        })
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "取引データの取得中にエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMasterData = async () => {
    try {
      const [productsRes, staffRes] = await Promise.all([
        apiClient.getProducts({ page: 1, limit: 1000 }), // 数値で直接指定
        apiClient.getStaff(),
      ])

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.data)
      }

      if (staffRes.success && staffRes.data) {
        setStaff(staffRes.data)
      }
    } catch (error) {
      console.error("Master data loading error:", error)
    }
  }

  const handleFilterChange = (key: keyof PaginationParams, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: String(value), // すべて文字列に変換
      page: key === "page" ? String(value) : "1",
    }))
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const transactionData = {
        ...newTransaction,
        quantity: Number.parseInt(newTransaction.quantity),
        staff_id: Number.parseInt(newTransaction.staff_id),
        unit_price: newTransaction.unit_price ? Number.parseFloat(newTransaction.unit_price) : undefined,
      }

      const response = await apiClient.createTransaction(transactionData)

      if (response.success) {
        onNotify({
          type: "success",
          title: "成功",
          message: "取引を登録しました",
        })

        setShowAddForm(false)
        setNewTransaction({
          product_id: "",
          transaction_type: "入荷",
          quantity: "",
          transaction_date: new Date().toISOString().split("T")[0],
          staff_id: "",
          order_date: "",
          unit_price: "",
          notes: "",
        })

        loadTransactions()
      } else {
        onNotify({
          type: "error",
          title: "エラー",
          message: response.error || "取引の登録に失敗しました",
        })
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "取引の登録中にエラーが発生しました",
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await apiClient.exportTransactionsCSV(filters)
      downloadCSV(blob, `transactions_${new Date().toISOString().split("T")[0]}.csv`)

      onNotify({
        type: "success",
        title: "成功",
        message: "CSVファイルをダウンロードしました",
      })
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "CSVエクスポートに失敗しました",
      })
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    const badgeClass =
      {
        入荷: "info",
        出荷: "success",
        調整: "warning",
        返品: "danger",
      }[type] || "info"

    return <span className={`status-badge ${badgeClass}`}>{type}</span>
  }

  // ページネーション関数
  const goToFirstPage = () => {
    if (pagination.current_page > 1) {
      handleFilterChange("page", 1)
    }
  }

  const goToLastPage = () => {
    if (pagination.current_page < pagination.total_pages) {
      handleFilterChange("page", pagination.total_pages)
    }
  }

  const goToPrevPage = () => {
    if (pagination.has_prev) {
      handleFilterChange("page", pagination.current_page - 1)
    }
  }

  const goToNextPage = () => {
    if (pagination.has_next) {
      handleFilterChange("page", pagination.current_page + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">取引履歴</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportCSV} className="btn btn-outline">
            📊 CSV出力
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            ➕ 新規取引
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium">検索</label>
              <input
                type="text"
                placeholder="商品名・型式で検索"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">開始日</label>
              <input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">終了日</label>
              <input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 新規取引フォーム */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">新規取引登録</h3>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                ✕
              </button>
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">商品 *</label>
                  <select
                    value={newTransaction.product_id}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, product_id: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">商品を選択</option>
                    {products.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.product_name} ({product.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">取引種別 *</label>
                  <select
                    value={newTransaction.transaction_type}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({ ...prev, transaction_type: e.target.value as any }))
                    }
                    className="input"
                    required
                  >
                    <option value="入荷">入荷</option>
                    <option value="出荷">出荷</option>
                    <option value="調整">調整</option>
                    <option value="返品">返品</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">数量 *</label>
                  <input
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="input"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">取引日 *</label>
                  <input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, transaction_date: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">担当者 *</label>
                  <select
                    value={newTransaction.staff_id}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, staff_id: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">担当者を選択</option>
                    {staff.map((member) => (
                      <option key={member.staff_id} value={member.staff_id}>
                        {member.staff_name} ({member.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">単価</label>
                  <input
                    type="number"
                    value={newTransaction.unit_price}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, unit_price: e.target.value }))}
                    className="input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">備考</label>
                <textarea
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction((prev) => ({ ...prev, notes: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 取引履歴テーブル */}
      <div className="card">
        <div className="p-0 card-content">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner"></div>
              <span className="ml-2 text-muted-foreground">読み込み中...</span>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>取引日</th>
                    <th>商品名</th>
                    <th>取引種別</th>
                    <th>数量</th>
                    <th>単価</th>
                    <th>金額</th>
                    <th>担当者</th>
                    <th>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td>{formatDate(transaction.transaction_date)}</td>
                      <td className="font-medium">{transaction.product_name}</td>
                      <td>{getTransactionTypeBadge(transaction.transaction_type)}</td>
                      <td className="text-right">{transaction.quantity.toLocaleString()}</td>
                      <td className="text-right">
                        {transaction.unit_price ? formatCurrency(transaction.unit_price) : "-"}
                      </td>
                      <td className="text-right">
                        {transaction.total_amount ? formatCurrency(transaction.total_amount) : "-"}
                      </td>
                      <td>{transaction.staff_name}</td>
                      <td className="text-sm text-muted-foreground">{transaction.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 改良されたページネーション */}
      {pagination.total_pages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          {/* ページ情報 */}
          <div className="text-sm text-muted-foreground">
            {pagination.total_items.toLocaleString()}件中{" "}
            {((pagination.current_page - 1) * pagination.items_per_page + 1).toLocaleString()}-
            {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items).toLocaleString()}
            件を表示
          </div>

          {/* ページネーションボタン */}
          <div className="flex items-center space-x-2">
            {/* 最初のページボタン */}
            <button
              onClick={goToFirstPage}
              disabled={pagination.current_page === 1}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              title="最初のページ"
            >
              ⏮️ 最初
            </button>

            {/* 前のページボタン */}
            <button
              onClick={goToPrevPage}
              disabled={!pagination.has_prev}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              title="前のページ"
            >
              ◀️ 前へ
            </button>

            {/* ページ情報表示 */}
            <div className="flex items-center px-4 py-2 text-sm rounded-md bg-muted">
              <span className="font-medium">{pagination.current_page}</span>
              <span className="mx-2 text-muted-foreground">/</span>
              <span>{pagination.total_pages}</span>
            </div>

            {/* 次のページボタン */}
            <button
              onClick={goToNextPage}
              disabled={!pagination.has_next}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              title="次のページ"
            >
              次へ ▶️
            </button>

            {/* 最後のページボタン */}
            <button
              onClick={goToLastPage}
              disabled={pagination.current_page === pagination.total_pages}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              title="最後のページ"
            >
              最後 ⏭️
            </button>
          </div>

          {/* ページ数が多い場合の追加情報 */}
          {pagination.total_pages > 10 && (
            <div className="text-xs text-muted-foreground">
              💡 ヒント: 検索やフィルターを使用して結果を絞り込むことができます
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionList
