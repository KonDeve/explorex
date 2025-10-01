"use client"

import Link from "next/link"
import { User, Shield, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header({ activePage = "home" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isLoggedIn = true // In production, this would come from auth context
  const isAdmin = true // In production, this would come from user role in auth context

  const navLinks = [
    { name: "Home", href: "/", key: "home" },
    { name: "About", href: "/about", key: "about" },
    { name: "Packages", href: "/packages", key: "packages" },
    { name: "Community", href: "/community", key: "community" },
  ]

  if (isLoggedIn) {
    navLinks.push({ name: "Dashboard", href: "/dashboard", key: "dashboard" })
  }

  return (
    <>
      <header className="container mx-auto px-4 py-6">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          {/* Mobile Menu Button - Left */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Logo - Center */}
          <Link href="/" className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Xplore<span className="text-blue-500 italic">x</span>
          </Link>

          {/* Empty div for balance - Right */}
          <div className="w-10 h-10"></div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Xplore<span className="text-blue-500 italic">x</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={activePage === link.key ? "text-orange-500 font-medium" : "text-gray-600 hover:text-gray-900"}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Shield size={16} />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="bg-gray-900 text-white px-3 lg:px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <User size={18} />
                  <span className="hidden lg:inline">My Account</span>
                </Link>
              </>
            ) : (
              <Link href="/signup" className="bg-gray-900 text-white px-4 lg:px-6 py-2 rounded-full hover:bg-gray-800 transition">
                Sign up
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
        isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}>
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sliding Menu Panel */}
        <div className={`bg-white w-80 h-full shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`} onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
              Xplore<span className="text-blue-500 italic">x</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={24} />
            </button>
          </div>

            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition ${
                    activePage === link.key 
                      ? "bg-orange-50 text-orange-500 font-medium" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Shield size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    <span>My Account</span>
                  </Link>
                </>
              ) : (
                <Link 
                  href="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition text-center block"
                >
                  Sign up
                </Link>
              )}
            </div>
        </div>
      </div>
    </>
  )
}
