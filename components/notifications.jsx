"use client"

import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } from "@/lib/notifications"
import { useAuth } from "@/lib/AuthContext"

export default function Notifications() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
        fetchUnreadCount()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user?.id) return
    
    setLoading(true)
    const result = await getUserNotifications(user.id)
    if (result.success) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }

  const fetchUnreadCount = async () => {
    if (!user?.id) return
    
    const result = await getUnreadCount(user.id)
    if (result.success) {
      setUnreadCount(result.count)
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id)
      await fetchNotifications()
      await fetchUnreadCount()
    }

    // Navigate based on reference type and package_slug
    if (notification.reference_type === 'booking' && notification.package_slug) {
      // Navigate using package slug
      router.push(`/dashboard/trip/${notification.package_slug}`)
    } else if (notification.reference_type === 'booking' && notification.reference_id) {
      // Fallback: use reference_id if package_slug not available
      router.push(`/dashboard/trip/${notification.reference_id}`)
    }

    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return
    
    await markAllAsRead(user.id)
    await fetchNotifications()
    await fetchUnreadCount()
  }

  const getIcon = (type) => {
    switch (type) {
      case "booking":
        return <CheckCircle className="text-green-500" size={20} />
      case "payment":
        return <AlertCircle className="text-blue-500" size={20} />
      case "system":
        return <Info className="text-gray-500" size={20} />
      default:
        return <Bell className="text-blue-500" size={20} />
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const notifDate = new Date(timestamp)
    const diff = Math.floor((now - notifDate) / 1000) // difference in seconds

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return notifDate.toLocaleDateString()
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        !notif.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notif.title}
                            </h4>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    setIsOpen(false)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
