"use client"

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Booking Confirmed",
      message: "Your booking for Santorini Paradise has been confirmed.",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      type: "info",
      title: "Payment Received",
      message: "Payment of $2,499 has been successfully processed.",
      timestamp: "1 hour ago",
    },
  ])

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />
      case "error":
        return <AlertCircle className="text-red-500" size={20} />
      case "warning":
        return <AlertTriangle className="text-orange-500" size={20} />
      case "info":
      default:
        return <Info className="text-blue-500" size={20} />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-orange-50 border-orange-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getBgColor(notif.type)} border rounded-lg p-4 animate-in slide-in-from-right`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{notif.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
              <p className="text-xs text-gray-500">{notif.timestamp}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
