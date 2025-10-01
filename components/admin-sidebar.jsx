"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Calendar, Users, FileText, LogOut, Settings, Home } from "lucide-react"

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: FileText },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/admin/dashboard" className="text-2xl font-bold">
              Xplore<span className="text-blue-500 italic">x</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">admin@xplorex.com</div>
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition mb-2"
            >
              <Home size={18} />
              <span className="text-sm">User Home</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition mb-2"
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/admin/dashboard" className="text-2xl font-bold" onClick={onClose}>
              Xplore<span className="text-blue-500 italic">x</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">admin@xplorex.com</div>
              </div>
            </div>

            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition mb-2"
            >
              <Home size={18} />
              <span className="text-sm">User Home</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition mb-2"
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </Link>

            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
