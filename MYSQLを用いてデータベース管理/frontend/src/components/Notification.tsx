"use client"

import type React from "react"
import { useEffect } from "react"
import type { Notification as NotificationType } from "../types/types"

interface NotificationProps {
  notification: NotificationType
  onClose: () => void
}

export const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.duration, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "info":
        return "ℹ️"
      default:
        return "ℹ️"
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      case "info":
        return "text-blue-800"
      default:
        return "text-gray-800"
    }
  }

  return (
    <div
      className={`
      max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border
      ${getBgColor()} ${getTextColor()}
      animate-slide-in-right
    `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-xl">{getIcon()}</span>
          </div>
          <div className="flex-1 w-0 ml-3">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          </div>
          <div className="flex flex-shrink-0 ml-4">
            <button onClick={onClose} className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
              <span className="sr-only">閉じる</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
