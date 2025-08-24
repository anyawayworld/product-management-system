import type React from "react"

// 商品関連の型定義
export interface Product {
  product_id: string
  product_name: string
  model: string
  category_id: number
  category_name?: string
  supplier_id: number
  supplier_name?: string
  unit_price: number
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 在庫取引の型定義
export interface InventoryTransaction {
  transaction_id: number
  product_id: string
  product_name?: string
  transaction_type: "入荷" | "出荷" | "調整" | "返品"
  quantity: number
  transaction_date: string
  staff_id: number
  staff_name?: string
  order_date?: string
  unit_price?: number
  total_amount?: number
  notes?: string
  created_at: string
}

// カテゴリの型定義
export interface Category {
  category_id: number
  category_name: string
  description?: string
  created_at: string
  updated_at: string
}

// 仕入先の型定義
export interface Supplier {
  supplier_id: number
  supplier_name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  created_at: string
  updated_at: string
}

// 担当者の型定義
export interface Staff {
  staff_id: number
  staff_name: string
  department?: string
  email?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 在庫サマリーの型定義
export interface InventorySummary {
  product_id: string
  product_name: string
  model: string
  category_name?: string
  supplier_name?: string
  unit_price: number
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  stock_status: "在庫切れ" | "在庫少" | "正常" | "在庫過多"
  monthly_incoming?: number
  monthly_outgoing?: number
}

// 在庫アラートの型定義
export interface StockAlert {
  product_id: string
  product_name: string
  model: string
  category_name?: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  alert_type: "在庫切れ" | "在庫不足" | "在庫過多" | "正常"
  alert_level: "danger" | "warning" | "info" | "success"
}

// 月次売上レポートの型定義
export interface MonthlySalesReport {
  month: string
  transaction_count: number
  total_shipped: number
  total_sales: number
  total_received: number
  total_purchases: number
}

// 担当者別実績の型定義
export interface StaffPerformance {
  staff_id: number
  staff_name: string
  department?: string
  total_transactions: number
  total_shipped: number
  total_sales: number
  avg_sale_amount: number
}

// API レスポンスの型定義
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// ページネーション用の型定義
export interface PaginationParams {
　page?: string      
  limit?: string     
  search?: string    
  category?: string  
  supplier?: string  
  stock_status?: string  
  sort_by?: string   
  sort_order?: string 
  date_from?: string
  date_to?: string
  transaction_type?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
    has_next: boolean
    has_prev: boolean
  }
}

// フォーム用の型定義
export interface ProductFormData {
  product_name: string
  model: string
  category_id: number
  supplier_id: number
  unit_price: number
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  description?: string
}

export interface TransactionFormData {
  product_id: string
  transaction_type: "入荷" | "出荷" | "調整" | "返品"
  quantity: number
  transaction_date: string
  staff_id: number
  order_date?: string
  unit_price?: number
  notes?: string
}

// ダッシュボード統計の型定義
export interface DashboardStats {
  total_products: number
  total_transactions: number
  low_stock_count: number
  out_of_stock_count: number
  total_inventory_value: number
  monthly_sales: number
  monthly_purchases: number
  top_selling_products: Array<{
    product_name: string
    total_sold: number
  }>
  recent_transactions: InventoryTransaction[]
}

// 検索・フィルター用の型定義
export interface SearchFilters {
  search: string
  category: string
  supplier: string
  stock_status: string
  date_from: string
  date_to: string
  transaction_type: string
}

// ソート用の型定義
export interface SortConfig {
  key: string
  direction: "asc" | "desc"
}

// テーブル列の型定義
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: any, row: any) => React.ReactNode
}

// モーダル用の型定義
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

// 通知用の型定義
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
}

