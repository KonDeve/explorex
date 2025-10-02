"use client"

import AdminSidebar from "@/components/admin-sidebar"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  // Check if current page should hide sidebar
  const shouldHideSidebar = pathname?.includes('/packages/add') || pathname?.includes('/packages/edit')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hide mobile header and sidebar when on add/edit pages */}
      {!shouldHideSidebar && (
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/admin/dashboard" className="text-xl font-bold">
              Xplore<span className="text-blue-500 italic">x</span>
            </Link>

            {/* Empty div for spacing */}
            <div className="w-10"></div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar - Hide when on add/edit pages */}
        {!shouldHideSidebar && (
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <div className={`flex-1 ${!shouldHideSidebar ? 'lg:ml-64' : ''}`}>{children}</div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && !shouldHideSidebar && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
