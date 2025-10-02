"use client"

import Header from "@/components/header"
import { Calendar, MapPin, CreditCard, User, Settings, LogOut, Package, LayoutGrid, Table } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  const [viewMode, setViewMode] = useState("card")
  const [isVisible, setIsVisible] = useState({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Get first name for welcome message
  const firstName = profile?.first_name || "User"
  const profileImageUrl = profile?.profile_image_url
  
  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return "U"
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const sections = document.querySelectorAll("[data-animate]")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const upcomingBookings = [
    {
      id: "BK-001",
      package: "Santorini Paradise",
      location: "Greece",
      checkIn: "2025-06-15",
      checkOut: "2025-06-22",
      guests: "2 Adults",
      image: "/santorini-blue-domes-greece.jpg",
      status: "confirmed"
    },
    {
      id: "BK-003",
      package: "Alpine Adventure",
      location: "Switzerland",
      checkIn: "2025-08-10",
      checkOut: "2025-08-16",
      guests: "4 Adults",
      image: "/mountain-lake-sunset-alps.jpg",
      status: "confirmed"
    },
  ]

  const pastBookings = [
    {
      id: "BK-000",
      package: "Venice Romance",
      location: "Italy",
      date: "2024-12-10",
      image: "/venice-italy-canal-buildings.jpg"
    },
  ]

  const handleViewDetails = (booking) => {
    // Navigate to trip details page
    window.location.href = `/dashboard/trip/${booking.id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="dashboard" />

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                {getInitials()}
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {firstName}!</h1>
              <p className="text-blue-100">Ready for your next adventure?</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold"
                >
                  <Package size={20} />
                  <span>My Bookings</span>
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Stats */}
            <div
              id="stats"
              data-animate
              className={`grid md:grid-cols-3 gap-6 mb-8 transition-all duration-700 ${
                isVisible.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Upcoming Trips</div>
                    <div className="text-2xl font-bold text-gray-900">2</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Places Visited</div>
                    <div className="text-2xl font-bold text-gray-900">3</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="text-2xl font-bold text-gray-900">$7,497</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div
              id="upcoming"
              data-animate
              className={`mb-8 transition-all duration-700 ${
                isVisible.upcoming ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
                <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                      viewMode === "card" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LayoutGrid size={18} />
                    <span className="font-medium">Cards</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                      viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Table size={18} />
                    <span className="font-medium">Table</span>
                  </button>
                </div>
              </div>

              {viewMode === "card" ? (
                <div className="space-y-6">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <div className="grid md:grid-cols-[280px_1fr] gap-0">
                        <div className="relative h-full overflow-hidden">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.package}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold">
                              Partial Payment
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{booking.package}</h3>
                            <div className="text-sm text-gray-500">Booking ID: {booking.id}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="flex items-start gap-3">
                              <Calendar size={20} className="text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Travel Date</div>
                                <div className="text-sm text-gray-900">{booking.checkIn} - {booking.checkOut}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin size={20} className="text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Destination</div>
                                <div className="text-sm text-gray-900">{booking.location}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <User size={20} className="text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Travellers</div>
                                <div className="text-sm text-gray-900">{booking.guests}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Calendar size={20} className="text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Booked On</div>
                                <div className="text-sm text-gray-900">February 6, 2026</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-200">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Total Package</div>
                              <div className="text-lg font-bold text-gray-900">₱50,000</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Amount Paid</div>
                              <div className="text-lg font-bold text-green-600">₱25,000</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Remaining Balance</div>
                              <div className="text-lg font-bold text-orange-600">₱25,000</div>
                              <div className="text-xs text-gray-400">Due: 2/23/26</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium"
                            >
                              View Details
                            </button>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                              <CreditCard size={18} />
                              Pay Remaining Balance
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Package</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-in</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-out</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guests</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {upcomingBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={booking.image || "/placeholder.svg"}
                                  alt={booking.package}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <span className="font-semibold text-gray-900">{booking.package}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                <span>{booking.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{booking.checkIn}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{booking.checkOut}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{booking.guests}</td>
                            <td className="px-6 py-4">
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewDetails(booking)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                                >
                                  View
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-900 hover:text-gray-900 transition text-sm font-semibold">
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div
              id="past"
              data-animate
              className={`transition-all duration-700 ${
                isVisible.past ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Trips</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden transition"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={booking.image || "/placeholder.svg"}
                        alt={booking.package}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.package}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin size={16} />
                        <span>{booking.location}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-4">Traveled on {booking.date}</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold">
                          Leave Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
