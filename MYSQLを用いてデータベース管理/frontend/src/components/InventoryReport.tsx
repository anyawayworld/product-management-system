"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiClient, formatCurrency } from "../services/api"
import type { InventorySummary, StockAlert, MonthlySalesReport, StaffPerformance, Notification } from "../types/types"

interface InventoryReportProps {
  onNotify: (notification: Omit<Notification, "id">) => void
}

const InventoryReport: React.FC<InventoryReportProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "alerts" | "sales" | "staff">("inventory")
  const [inventorySummary, setInventorySummary] = useState<InventorySummary[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [salesReport, setSalesReport] = useState<MonthlySalesReport[]>([])
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [activeTab])

  

  const loadReportData = async () => {
    try {
      setLoading(true)

      switch (activeTab) {
        case "inventory":
          const inventoryRes = await apiClient.getInventorySummary({ page: "1", limit: "100" })
          if (inventoryRes.success && inventoryRes.data) {
            setInventorySummary(inventoryRes.data.data)
          }
          break

        case "alerts":
          const alertsRes = await apiClient.getStockAlerts()
          if (alertsRes.success && alertsRes.data) {
            setStockAlerts(alertsRes.data)
          }
          break

        case "sales":
          const salesRes = await apiClient.getMonthlySalesReport()
          if (salesRes.success && salesRes.data) {
            setSalesReport(salesRes.data)
          }
          break

        case "staff":
          const staffRes = await apiClient.getStaffPerformance()
          if (staffRes.success && staffRes.data) {
            setStaffPerformance(staffRes.data)
          }
          break
      }
    } catch (error) {
      onNotify({
        type: "error",
        title: "エラー",
        message: "レポートデータの取得に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStockStatusBadge = (status: string) => {
    const badgeClass =
      {
        在庫切れ: "danger",
        在庫少: "warning",
        正常: "success",
        在庫過多: "info",
      }[status] || "success"

    return <span className={`status-badge ${badgeClass}`}>{status}</span>
  }

  const tabs = [
    { id: "inventory", label: "在庫サマリー", icon: "📦" },
    { id: "alerts", label: "在庫アラート", icon: "⚠️" },
    { id: "sales", label: "売上レポート", icon: "📈" },
    { id: "staff", label: "担当者実績", icon: "👥" },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">レポート</h1>
        <button onClick={loadReportData} className="btn btn-outline">
          🔄 更新
        </button>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="animate-fade-in">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
            <span className="ml-2 text-muted-foreground">読み込み中...</span>
          </div>
        ) : (
          <>
            {/* 在庫サマリー */}
            {activeTab === "inventory" && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">在庫サマリー</h3>
                </div>
                <div className="p-0 card-content">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>商品名</th>
                          <th>型式</th>
                          <th>カテゴリ</th>
                          <th>単価</th>
                          <th>現在庫</th>
                          <th>最小在庫</th>
                          <th>最大在庫</th>
                          <th>在庫状況</th>
                          <th>在庫価値</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventorySummary.map((item) => (
                          <tr key={item.product_id}>
                            <td className="font-medium">{item.product_name}</td>
                            <td className="text-sm text-muted-foreground">{item.model}</td>
                            <td className="text-sm">{item.category_name}</td>
                            <td className="text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="text-right">{item.current_stock.toLocaleString()}</td>
                            <td className="text-right">{item.min_stock_level.toLocaleString()}</td>
                            <td className="text-right">{item.max_stock_level.toLocaleString()}</td>
                            <td>{getStockStatusBadge(item.stock_status)}</td>
                            <td className="font-medium text-right">
                              {formatCurrency(item.current_stock * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 在庫アラート */}
            {activeTab === "alerts" && (
              <div className="space-y-4">
                {stockAlerts.length === 0 ? (
                  <div className="card">
                    <div className="py-12 text-center card-content">
                      <div className="mb-4 text-6xl">✅</div>
                      <h3 className="mb-2 text-lg font-medium">アラートはありません</h3>
                      <p className="text-muted-foreground">すべての商品の在庫状況は正常です</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {stockAlerts.map((alert) => (
                      <div
                        key={alert.product_id}
                        className={`
                          card border-l-4
                          ${
                            alert.alert_level === "danger"
                              ? "border-l-red-500 bg-red-50"
                              : alert.alert_level === "warning"
                                ? "border-l-yellow-500 bg-yellow-50"
                                : alert.alert_level === "info"
                                  ? "border-l-blue-500 bg-blue-50"
                                  : "border-l-green-500 bg-green-50"
                          }
                        `}
                      >
                        <div className="card-content">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{alert.product_name}</h4>
                              <p className="text-sm text-muted-foreground">{alert.model}</p>
                              <p className="text-sm">
                                現在庫: {alert.current_stock} / 最小在庫: {alert.min_stock_level}
                              </p>
                            </div>
                            <div className="text-right">{getStockStatusBadge(alert.alert_type)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 売上レポート */}
            {activeTab === "sales" && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">月次売上レポート</h3>
                </div>
                <div className="p-0 card-content">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>年月</th>
                          <th>取引件数</th>
                          <th>入荷数量</th>
                          <th>出荷数量</th>
                          <th>仕入金額</th>
                          <th>売上金額</th>
                          <th>粗利</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReport.map((report) => {
                          const grossProfit = report.total_sales - report.total_purchases
                          return (
                            <tr key={report.month}>
                              <td className="font-medium">{report.month}</td>
                              <td className="text-right">{report.transaction_count.toLocaleString()}</td>
                              <td className="text-right">{report.total_received.toLocaleString()}</td>
                              <td className="text-right">{report.total_shipped.toLocaleString()}</td>
                              <td className="text-right">{formatCurrency(report.total_purchases)}</td>
                              <td className="text-right">{formatCurrency(report.total_sales)}</td>
                              <td
                                className={`text-right font-medium ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {formatCurrency(grossProfit)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 担当者実績 */}
            {activeTab === "staff" && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">担当者別実績</h3>
                </div>
                <div className="p-0 card-content">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>担当者</th>
                          <th>部署</th>
                          <th>取引件数</th>
                          <th>出荷数量</th>
                          <th>売上金額</th>
                          <th>平均取引額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffPerformance.map((staff) => (
                          <tr key={staff.staff_id}>
                            <td className="font-medium">{staff.staff_name}</td>
                            <td className="text-sm">{staff.department}</td>
                            <td className="text-right">{staff.total_transactions.toLocaleString()}</td>
                            <td className="text-right">{staff.total_shipped.toLocaleString()}</td>
                            <td className="text-right">{formatCurrency(staff.total_sales)}</td>
                            <td className="text-right">{formatCurrency(staff.avg_sale_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default InventoryReport
