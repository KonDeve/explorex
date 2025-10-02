"use client"

import Link from "next/link"
import { User, Shield, Menu, X, LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/AuthContext"

export default function Header({ activePage = "home" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, profile, isAuthenticated, isAdmin, loading } = useAuth()
  
  // Get user's full name from profile
  const userFullName = profile ? `${profile.first_name} ${profile.last_name}` : 'My Account'

  // Base navigation links always visible
  const baseNavLinks = [
    { name: "Home", href: "/", key: "home" },
    { name: "About", href: "/about", key: "about" },
    { name: "Packages", href: "/packages", key: "packages" },
  ]

  // Add Dashboard only if user is logged in
  const navLinks = isAuthenticated 
    ? [...baseNavLinks, { name: "Dashboard", href: "/dashboard", key: "dashboard" }]
    : baseNavLinks

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
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/Xplorex - BLACK.png" alt="Xplorex" className="h-8 w-auto" />
          </Link>

          {/* Empty div for balance - Right */}
          <div className="w-10 h-10"></div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Xplorex - BLACK.png" alt="Xplorex" className="h-7 w-auto" />
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
            {loading ? (
              <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-full"></div>
            ) : isAuthenticated ? (
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
                  <span className="hidden lg:inline">{userFullName}</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gray-900 text-white px-4 lg:px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </>
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
            <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="/Xplorex - BLACK.png" alt="Xplorex" className="h-8 w-auto" />
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
              {loading ? (
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : isAuthenticated ? (
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
                    <span>{userFullName}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full border border-gray-900 text-gray-900 px-4 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
        </div>
      </div>
    </>
  )
}
