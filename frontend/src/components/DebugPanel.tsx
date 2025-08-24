"use client"

import type React from "react"
import { useState } from "react"
import { apiClient } from "../services/api"

interface DebugPanelProps {
  notifications?: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
  }>
  onClearNotification?: (id: string) => void
}

const DebugPanel: React.FC<DebugPanelProps> = ({ notifications = [], onClearNotification }) => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addLog = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testHealthCheck = async () => {
    try {
      addLog("🔍 ヘルスチェック開始...")
      const response = await apiClient.healthCheck()
      addLog(`✅ ヘルスチェック成功: ${JSON.stringify(response)}`)
    } catch (error) {
      addLog(`❌ ヘルスチェック失敗: ${error}`)
    }
  }

  const testProductsAPI = async () => {
    try {
      addLog("📦 商品API テスト開始...")
      const response = await apiClient.getProducts({ page: 1, limit: 5 })
      addLog(`✅ 商品取得成功: ${response.data?.data.length}件`)

      if (response.data?.data && response.data.data.length > 0) {
        const firstProduct = response.data.data[0]
        addLog(`📋 最初の商品: ${firstProduct.product_name} (ID: ${firstProduct.product_id})`)
      }
    } catch (error) {
      addLog(`❌ 商品API失敗: ${error}`)
    }
  }

  const testDeleteAPI = async () => {
    try {
      addLog("🗑️ 削除API テスト開始...")

      // まず商品一覧を取得
      const productsResponse = await apiClient.getProducts({ page: 1, limit: 1 })

      if (!productsResponse.success || !productsResponse.data?.data.length) {
        addLog("❌ テスト用商品が見つかりません")
        return
      }

      const testProduct = productsResponse.data.data[0]
      addLog(`🎯 テスト対象商品: ${testProduct.product_name} (ID: ${testProduct.product_id})`)

      // 削除APIをテスト（実際には削除しない - ログのみ）
      addLog(`🔗 削除URL: /api/products/${testProduct.product_id}`)
      addLog("⚠️ 実際の削除はスキップ（テストモード）")
    } catch (error) {
      addLog(`❌ 削除APIテスト失敗: ${error}`)
    }
  }

  const clearLogs = () => {
    setTestResults([])
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed z-50 px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg bottom-4 right-4 hover:bg-blue-600"
      >
        🔧 デバッグ
      </button>
    )
  }

  return (
    <div className="fixed z-50 p-4 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg bottom-4 right-4 w-96 max-h-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🔧 デバッグパネル</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {/* 通知表示エリア */}
      {notifications.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">📢 通知</h4>
          <div className="space-y-1 overflow-y-auto max-h-32">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center justify-between p-2 rounded text-xs ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : notification.type === "error"
                      ? "bg-red-100 text-red-800"
                      : notification.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>
                    {notification.type === "success"
                      ? "✅"
                      : notification.type === "error"
                        ? "❌"
                        : notification.type === "warning"
                          ? "⚠️"
                          : "ℹ️"}
                  </span>
                  <span className="font-medium">{notification.title}:</span>
                  <span>{notification.message}</span>
                </div>
                {onClearNotification && (
                  <button
                    onClick={() => onClearNotification(notification.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 space-y-2">
        <button
          onClick={testHealthCheck}
          className="w-full px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
        >
          ヘルスチェック
        </button>
        <button
          onClick={testProductsAPI}
          className="w-full px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          商品API テスト
        </button>
        <button
          onClick={testDeleteAPI}
          className="w-full px-3 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
        >
          削除API テスト
        </button>
        <button
          onClick={clearLogs}
          className="w-full px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
        >
          ログクリア
        </button>
      </div>

      <div className="p-2 overflow-y-auto text-xs bg-gray-100 rounded max-h-48">
        {testResults.length === 0 ? (
          <p className="text-gray-500">ログはありません</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1 font-mono">
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DebugPanel
