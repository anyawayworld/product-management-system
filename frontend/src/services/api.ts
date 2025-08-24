import type {
  Product,
  InventoryTransaction,
  Category,
  Supplier,
  Staff,
  InventorySummary,
  StockAlert,
  MonthlySalesReport,
  StaffPerformance,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  ProductFormData,
  TransactionFormData,
} from "../types/types"

const API_BASE_URL = "/api"

// APIクライアントクラス
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log(`API Request: ${API_BASE_URL}${endpoint}`)
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      console.log(`API Response Status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error: ${response.status} - ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("API Response Data:", data)
      return data
    } catch (error) {
      console.error("API request failed:", error)

      // ネットワークエラーの場合の詳細なエラーメッセージ
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: "バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。",
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // 商品関連API
  async getProducts(params?: any): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const queryString = queryParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`
    console.log("Getting products with endpoint:", endpoint)

    return this.request<PaginatedResponse<Product>>(endpoint)
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${productId}`)
  }

  async createProduct(data: ProductFormData): Promise<ApiResponse<Product>> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProduct(productId: string, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    console.log("API: Deleting product with ID:", productId)
    const response = await this.request<void>(`/products/${productId}`, {
      method: "DELETE",
    })
    console.log("API: Delete response:", response)
    return response
  }

  // 在庫取引関連API
  async getTransactions(params?: any): Promise<ApiResponse<PaginatedResponse<InventoryTransaction>>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request<PaginatedResponse<InventoryTransaction>>(`/transactions${queryString ? `?${queryString}` : ""}`)
  }

  async createTransaction(data: TransactionFormData): Promise<ApiResponse<InventoryTransaction>> {
    return this.request<InventoryTransaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // マスタデータ関連API
  async getCategories(): Promise<ApiResponse<Category[]>> {
    console.log("Getting categories...")
    return this.request<Category[]>("/categories")
  }

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    console.log("Getting suppliers...")
    return this.request<Supplier[]>("/suppliers")
  }

  async getStaff(): Promise<ApiResponse<Staff[]>> {
    console.log("Getting staff...")
    return this.request<Staff[]>("/staff")
  }

  // レポート関連API
  async getInventorySummary(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<InventorySummary>>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request<PaginatedResponse<InventorySummary>>(
      `/reports/inventory-summary${queryString ? `?${queryString}` : ""}`,
    )
  }

  async getStockAlerts(): Promise<ApiResponse<StockAlert[]>> {
    return this.request<StockAlert[]>("/reports/stock-alerts")
  }

  async getMonthlySalesReport(): Promise<ApiResponse<MonthlySalesReport[]>> {
    return this.request<MonthlySalesReport[]>("/reports/monthly-sales")
  }

  async getStaffPerformance(): Promise<ApiResponse<StaffPerformance[]>> {
    return this.request<StaffPerformance[]>("/reports/staff-performance")
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>("/dashboard/stats")
  }

  // CSV エクスポート関連API
  async exportProductsCSV(params?: PaginationParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const response = await fetch(`${API_BASE_URL}/export/products${queryString ? `?${queryString}` : ""}`, {
      headers: {
        Accept: "text/csv",
      },
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }

    return response.blob()
  }

  async exportTransactionsCSV(params?: PaginationParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    const response = await fetch(`${API_BASE_URL}/export/transactions${queryString ? `?${queryString}` : ""}`, {
      headers: {
        Accept: "text/csv",
      },
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }

    return response.blob()
  }

  // ヘルスチェック用API
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>("/health")
  }
}

// APIクライアントのインスタンスをエクスポート
export const apiClient = new ApiClient()

// 便利な関数をエクスポート
export const downloadCSV = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}
