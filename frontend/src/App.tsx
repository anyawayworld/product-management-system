"use client"

import { useState } from "react"
import Dashboard from "./components/Dashboard"
import ProductList from "./components/ProductList"
import TransactionList from "./components/TransactionList"
import InventoryReport from "./components/InventoryReport"
import Navigation from "./components/Navigation"
import DebugPanel from "./components/DebugPanel"
import type { Notification as NotificationType } from "./types/types"

type Page = "dashboard" | "products" | "transactions" | "reports"

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  const addNotification = (notification: Omit<NotificationType, "id">) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    setNotifications((prev) => [...prev, newNotification])

    // 自動削除（デフォルト5秒）
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNotify={addNotification} />
      case "products":
        return <ProductList onNotify={addNotification} />
      case "transactions":
        return <TransactionList onNotify={addNotification} />
      case "reports":
        return <InventoryReport onNotify={addNotification} />
      default:
        return <Dashboard onNotify={addNotification} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="container px-4 py-8 mx-auto">
        <div className="animate-fade-in">{renderPage()}</div>
      </main>

      {/* デバッグパネル（開発環境のみ） */}
      {process.env.NODE_ENV === "development" && (
        <DebugPanel notifications={notifications} onClearNotification={removeNotification} />
      )}

      {/* 通知システム - デバッグパネルに移動 */}
      {/* 
      <div className="fixed z-50 space-y-2 top-4 right-4">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
      */}
    </div>
  )
}

export default App
