"use client"

import Header from "@/components/header"
import { Calendar, MapPin, CreditCard, User, Settings, LogOut, Package, LayoutGrid, Table } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CustomerDashboard() {
  const [viewMode, setViewMode] = useState("card")
  const [isVisible, setIsVisible] = useState({})

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
      status: "confirmed",
    },
    {
      id: "BK-003",
      package: "Alpine Adventure",
      location: "Switzerland",
      checkIn: "2025-08-10",
      checkOut: "2025-08-16",
      guests: "4 Adults",
      image: "/mountain-lake-sunset-alps.jpg",
      status: "confirmed",
    },
  ]

  const pastBookings = [
    {
      id: "BK-000",
      package: "Venice Romance",
      location: "Italy",
      date: "2024-12-10",
      image: "/venice-italy-canal-buildings.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="dashboard" />

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
              J
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, John!</h1>
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
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition"
                    >
                      <div className="grid md:grid-cols-3 gap-0">
                        <div className="relative h-64 md:h-auto overflow-hidden">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.package}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div className="md:col-span-2 p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{booking.package}</h3>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">Booking ID: {booking.id}</div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Check-in</div>
                              <div className="font-semibold text-gray-900">{booking.checkIn}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Check-out</div>
                              <div className="font-semibold text-gray-900">{booking.checkOut}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Guests</div>
                              <div className="font-semibold text-gray-900">{booking.guests}</div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                              View Details
                            </button>
                            <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-900 hover:text-gray-900 transition font-semibold">
                              Manage Booking
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
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
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
                      <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold">
                        Leave a Review
                      </button>
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
