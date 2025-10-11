"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LayoutDashboard, Package, Calendar, Users, FileText, LogOut, Settings, ChevronDown, DollarSign, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const [reportsOpen, setReportsOpen] = useState(pathname?.startsWith('/admin/reports'))

  // Get user display name and initials
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : user?.email?.split('@')[0] || "Admin User"
  
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (profile?.first_name) {
      return profile.first_name.substring(0, 2).toUpperCase()
    }
    return "A"
  }

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ]

  const reportLinks = [
    { name: "Sales", href: "/admin/reports?type=sales", icon: DollarSign },
    { name: "Bookings", href: "/admin/reports?type=bookings", icon: Calendar },
    { name: "Customers", href: "/admin/reports?type=customers", icon: Users },
    { name: "Packages", href: "/admin/reports?type=packages", icon: Package },
    { name: "Revenue Analytics", href: "/admin/reports?type=revenue", icon: TrendingUp },
    { name: "Custom", href: "/admin/reports?type=custom", icon: FileText },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/admin/dashboard" className="flex items-center">
              <img src="/Xplorex - BLACK.png" alt="Xplorex" className="h-8 w-auto" />
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

            {/* Reports Dropdown */}
            <div>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
                  pathname?.startsWith('/admin/reports')
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span>Reports</span>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform ${reportsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {reportsOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                  {reportLinks.map((report) => {
                    const Icon = report.icon
                    const reportType = report.href.split('type=')[1]
                    const currentType = searchParams?.get('type')
                    const isActive = pathname === '/admin/reports' && currentType === reportType
                    return (
                      <Link
                        key={report.href}
                        href={report.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{report.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                <div className="text-xs text-gray-500">{user?.email || "admin@xplorex.com"}</div>
              </div>
            </div>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition mb-2"
            >
              <Settings size={18} />
              <span className="text-sm">Profile</span>
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
            <Link href="/admin/dashboard" className="flex items-center" onClick={onClose}>
              <img src="/Xplorex - BLACK.png" alt="Xplorex" className="h-10 w-auto" />
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

            {/* Reports Dropdown - Mobile */}
            <div>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
                  pathname?.startsWith('/admin/reports')
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span>Reports</span>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform ${reportsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu - Mobile */}
              {reportsOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                  {reportLinks.map((report) => {
                    const Icon = report.icon
                    const reportType = report.href.split('type=')[1]
                    const currentType = searchParams?.get('type')
                    const isActive = pathname === '/admin/reports' && currentType === reportType
                    return (
                      <Link
                        key={report.href}
                        href={report.href}
                        onClick={onClose}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{report.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                <div className="text-xs text-gray-500">{user?.email || "admin@xplorex.com"}</div>
              </div>
            </div>

            <Link
              href="/admin/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition mb-2"
            >
              <Settings size={18} />
              <span className="text-sm">Profile</span>
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
