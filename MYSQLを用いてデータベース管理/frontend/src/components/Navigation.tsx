"use client"

import type React from "react"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: "dashboard" | "products" | "transactions" | "reports") => void
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: "dashboard", label: "ダッシュボード", icon: "📊" },
    { id: "products", label: "商品管理", icon: "📦" },
    { id: "transactions", label: "取引履歴", icon: "📋" },
    { id: "reports", label: "レポート", icon: "📈" },
  ] as const

  return (
    <nav className="border-b shadow-sm bg-card border-border">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">📦 商品管理システム</div>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
