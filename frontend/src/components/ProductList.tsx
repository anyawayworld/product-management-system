"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiClient, formatCurrency, downloadCSV } from "../services/api"
import type { Product, Category, Supplier, PaginationParams, Notification, ProductFormData } from "../types/types"

interface ProductListProps {
  onNotify: (notification: Omit<Notification, "id">) => void
}

const ProductList: React.FC<ProductListProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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
    sort_by: "product_id",
    sort_order: "asc",
  })

  const [newProduct, setNewProduct] = useState<ProductFormData>({
    product_name: "",
    model: "",
    category_id: 0,
    supplier_id: 0,
    unit_price: 0,
    current_stock: 0,
    min_stock_level: 10,
    max_stock_level: 1000,
    description: "",
  })

  useEffect(() => {
    console.log("ProductList: useEffect triggered with filters:", filters)
    loadProducts()
    loadMasterData()
  }, [filters])

  const loadProducts = async () => {
    try {
      console.log("ProductList: Loading products...")
      setLoading(true)
      setError(null)

      // API呼び出し時に必要な値を数値に変換
      const apiParams = {
        ...filters,
        page: Number.parseInt(filters.page),
        limit: Number.parseInt(filters.limit),
      }

      console.log("ProductList: API params:", apiParams)
      const response = await apiClient.getProducts(apiParams)
      console.log("ProductList: API response:", response)

      if (response.success && response.data) {
        setProducts(response.data.data)
        setPagination(response.data.pagination)
        console.log("ProductList: Products loaded:", response.data.data.length, "items")

        if (response.data.data.length === 0) {
          onNotify({
            type: "info",
            title: "情報",
            message: "商品データが見つかりませんでした",
          })
        }
      } else {
        const errorMessage = response.error || "商品データの取得に失敗しました"
        setError(errorMessage)
        console.error("ProductList: API error:", errorMessage)
        onNotify({
          type: "error",
          title: "エラー",
          message: errorMessage,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "商品データの取得中にエラーが発生しました"
      setError(errorMessage)
      console.error("ProductList: Exception:", error)
      onNotify({
        type: "error",
        title: "エラー",
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMasterData = async () => {
    try {
      console.log("ProductList: Loading master data...")
      const [categoriesRes, suppliersRes] = await Promise.all([apiClient.getCategories(), apiClient.getSuppliers()])

      console.log("ProductList: Categories response:", categoriesRes)
      console.log("ProductList: Suppliers response:", suppliersRes)

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data)
        console.log("ProductList: Categories loaded:", categoriesRes.data.length)
      }

      if (suppliersRes.success && suppliersRes.data) {
        setSuppliers(suppliersRes.data)
        console.log("ProductList: Suppliers loaded:", suppliersRes.data.length)
      }
    } catch (error) {
      console.error("ProductList: Master data loading error:", error)
    }
  }

  const handleFilterChange = (key: keyof PaginationParams, value: string | number) => {
    console.log("ProductList: Filter change:", key, "=", value)
    setFilters((prev) => ({
      ...prev,
      [key]: String(value), // すべて文字列に変換
      page: key === "page" ? String(value) : "1", // ページ以外の変更時は1ページ目に戻る
    }))
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await apiClient.createProduct(newProduct)

      if (response.success) {
        onNotify({
          type: "success",
          title: "成功",
          message: "商品を追加しました",
        })

        setShowAddForm(false)
        setNewProduct({
          product_name: "",
          model: "",
          category_id: 0,
          supplier_id: 0,
          unit_price: 0,
          current_stock: 0,
          min_stock_level: 10,
          max_stock_level: 1000,
          description: "",
        })

        loadProducts()
      } else {
        onNotify({
          type: "error",
          title: "エラー",
          message: response.error || "商品の追加に失敗しました",
        })
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "商品の追加中にエラーが発生しました",
      })
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingProduct) return

    try {
      const response = await apiClient.updateProduct(editingProduct.product_id, {
        product_name: editingProduct.product_name,
        model: editingProduct.model,
        category_id: editingProduct.category_id,
        supplier_id: editingProduct.supplier_id,
        unit_price: editingProduct.unit_price,
        current_stock: editingProduct.current_stock,
        min_stock_level: editingProduct.min_stock_level,
        max_stock_level: editingProduct.max_stock_level,
        description: editingProduct.description,
      })

      if (response.success) {
        onNotify({
          type: "success",
          title: "成功",
          message: "商品を更新しました",
        })

        setShowEditForm(false)
        setEditingProduct(null)
        loadProducts()
      } else {
        onNotify({
          type: "error",
          title: "エラー",
          message: response.error || "商品の更新に失敗しました",
        })
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "商品の更新中にエラーが発生しました",
      })
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`商品「${productName}」を削除しますか？`)) {
      return
    }

    try {
      console.log("Attempting to delete product:", productId)
      const response = await apiClient.deleteProduct(productId)
      console.log("Delete response:", response)

      if (response.success) {
        onNotify({
          type: "success",
          title: "成功",
          message: "商品を削除しました",
        })

        loadProducts()
      } else {
        console.error("Delete failed:", response.error)
        onNotify({
          type: "error",
          title: "削除エラー",
          message: response.error || "商品の削除に失敗しました",
        })
      }
    } catch (error) {
      console.error("Delete exception:", error)
      onNotify({
        type: "error",
        title: "通信エラー",
        message: error instanceof Error ? error.message : "商品の削除中にエラーが発生しました",
      })
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await apiClient.exportProductsCSV(filters)
      downloadCSV(blob, `products_${new Date().toISOString().split("T")[0]}.csv`)

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

  const getStockStatusBadge = (product: Product) => {
    if (product.current_stock === 0) {
      return <span className="status-badge danger">在庫切れ</span>
    } else if (product.current_stock <= product.min_stock_level) {
      return <span className="status-badge warning">在庫少</span>
    } else if (product.current_stock >= product.max_stock_level) {
      return <span className="status-badge info">在庫過多</span>
    } else {
      return <span className="status-badge success">正常</span>
    }
  }

  const openEditForm = (product: Product) => {
    setEditingProduct({ ...product })
    setShowEditForm(true)
  }

  // 編集中の商品データを更新するヘルパー関数
  const updateEditingProduct = (field: keyof Product, value: string | number) => {
    setEditingProduct((prev: Product | null) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
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

  // デバッグ情報の表示
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="p-4 mb-4 text-xs bg-gray-100 rounded">
          <strong>デバッグ情報:</strong>
          <br />
          Loading: {loading.toString()}
          <br />
          Error: {error || "なし"}
          <br />
          Products count: {products.length}
          <br />
          Categories count: {categories.length}
          <br />
          Suppliers count: {suppliers.length}
          <br />
          API Base URL: /api
          <br />
          Current filters: {JSON.stringify(filters)}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">商品管理</h1>
        <div className="flex space-x-2">
          <button onClick={handleExportCSV} className="btn btn-outline">
            📊 CSV出力
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            ➕ 新規商品
          </button>
        </div>
      </div>

      {renderDebugInfo()}

      {/* フィルター */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <label className="block mb-1 text-sm font-medium">カテゴリ</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="input"
              >
                <option value="">すべて</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">仕入先</label>
              <select
                value={filters.supplier}
                onChange={(e) => handleFilterChange("supplier", e.target.value)}
                className="input"
              >
                <option value="">すべて</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">在庫状況</label>
              <select
                value={filters.stock_status}
                onChange={(e) => handleFilterChange("stock_status", e.target.value)}
                className="input"
              >
                <option value="">すべて</option>
                <option value="在庫切れ">在庫切れ</option>
                <option value="在庫少">在庫少</option>
                <option value="正常">正常</option>
                <option value="在庫過多">在庫過多</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 新規商品追加フォーム */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">新規商品追加</h3>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                ✕
              </button>
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">商品名 *</label>
                  <input
                    type="text"
                    value={newProduct.product_name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, product_name: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">型式 *</label>
                  <input
                    type="text"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, model: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">カテゴリ *</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, category_id: Number.parseInt(e.target.value) }))
                    }
                    className="input"
                    required
                  >
                    <option value={0}>カテゴリを選択</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">仕入先 *</label>
                  <select
                    value={newProduct.supplier_id}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, supplier_id: Number.parseInt(e.target.value) }))
                    }
                    className="input"
                    required
                  >
                    <option value={0}>仕入先を選択</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">単価 *</label>
                  <input
                    type="number"
                    value={newProduct.unit_price}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, unit_price: Number.parseFloat(e.target.value) }))
                    }
                    className="input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">現在庫数</label>
                  <input
                    type="number"
                    value={newProduct.current_stock}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, current_stock: Number.parseInt(e.target.value) }))
                    }
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">最小在庫</label>
                  <input
                    type="number"
                    value={newProduct.min_stock_level}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, min_stock_level: Number.parseInt(e.target.value) }))
                    }
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">最大在庫</label>
                  <input
                    type="number"
                    value={newProduct.max_stock_level}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, max_stock_level: Number.parseInt(e.target.value) }))
                    }
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">説明</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 商品編集フォーム */}
      {showEditForm && editingProduct && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">商品編集</h3>
              <button onClick={() => setShowEditForm(false)} className="btn btn-ghost">
                ✕
              </button>
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">商品名 *</label>
                  <input
                    type="text"
                    value={editingProduct.product_name}
                    onChange={(e) => updateEditingProduct("product_name", e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">型式 *</label>
                  <input
                    type="text"
                    value={editingProduct.model}
                    onChange={(e) => updateEditingProduct("model", e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">カテゴリ *</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => updateEditingProduct("category_id", Number.parseInt(e.target.value))}
                    className="input"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">仕入先 *</label>
                  <select
                    value={editingProduct.supplier_id}
                    onChange={(e) => updateEditingProduct("supplier_id", Number.parseInt(e.target.value))}
                    className="input"
                    required
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">単価 *</label>
                  <input
                    type="number"
                    value={editingProduct.unit_price}
                    onChange={(e) => updateEditingProduct("unit_price", Number.parseFloat(e.target.value))}
                    className="input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">現在庫数</label>
                  <input
                    type="number"
                    value={editingProduct.current_stock}
                    onChange={(e) => updateEditingProduct("current_stock", Number.parseInt(e.target.value))}
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">最小在庫</label>
                  <input
                    type="number"
                    value={editingProduct.min_stock_level}
                    onChange={(e) => updateEditingProduct("min_stock_level", Number.parseInt(e.target.value))}
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">最大在庫</label>
                  <input
                    type="number"
                    value={editingProduct.max_stock_level}
                    onChange={(e) => updateEditingProduct("max_stock_level", Number.parseInt(e.target.value))}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">説明</label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) => updateEditingProduct("description", e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEditForm(false)} className="btn btn-outline">
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 商品一覧テーブル */}
      <div className="card">
        <div className="p-0 card-content">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner"></div>
              <span className="ml-2 text-muted-foreground">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="mb-4 text-6xl">❌</div>
              <h3 className="mb-2 text-lg font-medium text-red-600">データの取得に失敗しました</h3>
              <p className="mb-4 text-sm text-muted-foreground">{error}</p>
              <button onClick={loadProducts} className="btn btn-primary">
                再試行
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="mb-4 text-6xl">📦</div>
              <h3 className="mb-2 text-lg font-medium">商品データがありません</h3>
              <p className="text-sm text-muted-foreground">
                データベースに商品が登録されていないか、フィルター条件に一致する商品がありません
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>商品ID</th>
                    <th>商品名</th>
                    <th>型式</th>
                    <th>カテゴリ</th>
                    <th>仕入先</th>
                    <th>単価</th>
                    <th>在庫数</th>
                    <th>在庫状況</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td className="font-mono text-sm">{product.product_id}</td>
                      <td className="font-medium">{product.product_name}</td>
                      <td className="text-sm text-muted-foreground">{product.model}</td>
                      <td className="text-sm">{product.category_name || "未分類"}</td>
                      <td className="text-sm">{product.supplier_name || "未設定"}</td>
                      <td className="text-right">{formatCurrency(product.unit_price)}</td>
                      <td className="text-right">{product.current_stock.toLocaleString()}</td>
                      <td>{getStockStatusBadge(product)}</td>
                      <td>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditForm(product)}
                            className="px-2 py-1 text-xs btn btn-ghost hover:bg-blue-50"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id, product.product_name)}
                            className="px-2 py-1 text-xs text-red-600 btn btn-ghost hover:bg-red-50"
                          >
                            削除
                          </button>
                        </div>
                      </td>
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

export default ProductList
