import Link from "next/link"
import { User, Shield } from "lucide-react"

export default function Header({ activePage = "home" }) {
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
    <header className="container mx-auto px-4 py-6 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold">
        Xplore<span className="text-blue-500 italic">x</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
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

      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}
          <Link
            href="/dashboard"
            className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2"
          >
            <User size={18} />
            <span>My Account</span>
          </Link>
        </div>
      ) : (
        <Link href="/signup" className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
          Sign up
        </Link>
      )}
    </header>
  )
}
