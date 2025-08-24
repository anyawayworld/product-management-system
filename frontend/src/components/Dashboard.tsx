"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiClient, formatCurrency } from "../services/api"
import type { DashboardStats, Notification } from "../types/types"

interface DashboardProps {
  onNotify: (notification: Omit<Notification, "id">) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNotify }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDashboardStats()

      if (response.success && response.data) {
        setStats(response.data)
      } else {
        onNotify({
          type: "error",
          title: "エラー",
          message: "ダッシュボードデータの取得に失敗しました",
        })
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "ダッシュボードデータの取得中にエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-muted-foreground">読み込み中...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">データを取得できませんでした</p>
        <button onClick={loadDashboardStats} className="mt-4 btn btn-primary">
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
        <button onClick={loadDashboardStats} className="btn btn-outline">
          🔄 更新
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium card-title">総商品数</h3>
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{stats.total_products.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">登録商品数</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium card-title">総取引数</h3>
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{stats.total_transactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">全取引履歴</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium card-title">在庫アラート</h3>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-red-600">{stats.low_stock_count + stats.out_of_stock_count}</div>
            <p className="text-xs text-muted-foreground">
              在庫切れ: {stats.out_of_stock_count} / 在庫少: {stats.low_stock_count}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium card-title">在庫総額</h3>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{formatCurrency(stats.total_inventory_value)}</div>
            <p className="text-xs text-muted-foreground">現在の在庫価値</p>
          </div>
        </div>
      </div>

      {/* 月次売上・仕入 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">今月の実績</h3>
          </div>
          <div className="space-y-4 card-content">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
              <div>
                <p className="text-sm font-medium text-green-800">売上</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.monthly_sales)}</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
              <div>
                <p className="text-sm font-medium text-blue-800">仕入</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.monthly_purchases)}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">売れ筋商品 TOP5</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {stats.top_selling_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium">{product.product_name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.total_sold}個</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 最近の取引履歴 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">最近の取引履歴</h3>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>取引日</th>
                  <th>商品名</th>
                  <th>取引種別</th>
                  <th>数量</th>
                  <th>担当者</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{new Date(transaction.transaction_date).toLocaleDateString("ja-JP")}</td>
                    <td className="font-medium">{transaction.product_name}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          transaction.transaction_type === "入荷"
                            ? "info"
                            : transaction.transaction_type === "出荷"
                              ? "success"
                              : transaction.transaction_type === "調整"
                                ? "warning"
                                : "danger"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td>{transaction.quantity.toLocaleString()}</td>
                    <td>{transaction.staff_name}</td>
                    <td>{transaction.total_amount ? formatCurrency(transaction.total_amount) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
