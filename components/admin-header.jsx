"use client"

import Link from "next/link"
import { LayoutDashboard, Package, Calendar, Users, FileText, Bell, LogOut, Menu } from "lucide-react"
import { useState } from "react"

export default function AdminHeader({ activePage = "dashboard" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", key: "dashboard", icon: LayoutDashboard },
    { name: "Packages", href: "/admin/packages", key: "packages", icon: Package },
    { name: "Bookings", href: "/admin/bookings", key: "bookings", icon: Calendar },
    { name: "Customers", href: "/admin/customers", key: "customers", icon: Users },
    { name: "Reports", href: "/admin/reports", key: "reports", icon: FileText },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/admin/dashboard" className="text-2xl font-bold">
            Xplore<span className="text-blue-500 italic">x</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">ADMIN</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activePage === link.key
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">admin@xplorex.com</div>
              </div>
            </div>

            <Link
              href="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
                    activePage === link.key
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition mt-4"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
