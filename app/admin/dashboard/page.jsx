"use client"

import { TrendingUp, Users, Package, DollarSign, Calendar, Star, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Active Bookings",
      value: "48",
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Total Customers",
      value: "1,234",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Available Packages",
      value: "24",
      change: "-2.1%",
      trend: "down",
      icon: Package,
      color: "bg-orange-500",
    },
  ]

  const recentBookings = [
    {
      id: "BK-001",
      customer: "John Doe",
      package: "Santorini Paradise",
      date: "2025-06-15",
      amount: "$2,499",
      status: "confirmed",
    },
    {
      id: "BK-002",
      customer: "Jane Smith",
      package: "Venice Romance",
      date: "2025-07-20",
      amount: "$1,899",
      status: "pending",
    },
    {
      id: "BK-003",
      customer: "Mike Johnson",
      package: "Alpine Adventure",
      date: "2025-08-10",
      amount: "$2,799",
      status: "confirmed",
    },
    {
      id: "BK-004",
      customer: "Sarah Williams",
      package: "Tropical Escape",
      date: "2025-09-05",
      amount: "$3,299",
      status: "confirmed",
    },
    {
      id: "BK-005",
      customer: "David Brown",
      package: "Greek Islands Tour",
      date: "2025-10-12",
      amount: "$2,199",
      status: "pending",
    },
  ]

  const topPackages = [
    { name: "Santorini Paradise", bookings: 45, revenue: "$112,455", rating: 4.9 },
    { name: "Tropical Escape", bookings: 38, revenue: "$125,362", rating: 4.9 },
    { name: "Alpine Adventure", bookings: 32, revenue: "$89,568", rating: 5.0 },
    { name: "Venice Romance", bookings: 28, revenue: "$53,172", rating: 4.8 },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your travel business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <a href="/admin/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Booking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Package</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{booking.customer}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{booking.package}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{booking.date}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">{booking.amount}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Packages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Packages</h2>

          <div className="space-y-4">
            {topPackages.map((pkg, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{pkg.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="fill-yellow-400 text-yellow-400" size={14} />
                    <span className="text-sm font-semibold text-gray-900">{pkg.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{pkg.bookings} bookings</span>
                  <span className="font-semibold text-gray-900">{pkg.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <a
          href="/admin/packages"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition group"
        >
          <Package size={32} className="mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Packages</h3>
          <p className="text-blue-100 text-sm mb-4">Add, edit, or remove travel packages</p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
            Go to Packages <ArrowUpRight size={16} />
          </span>
        </a>

        <a
          href="/admin/bookings"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:from-orange-600 hover:to-orange-700 transition group"
        >
          <Calendar size={32} className="mb-4" />
          <h3 className="text-xl font-bold mb-2">View Bookings</h3>
          <p className="text-orange-100 text-sm mb-4">Manage and confirm customer bookings</p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
            Go to Bookings <ArrowUpRight size={16} />
          </span>
        </a>

        <a
          href="/admin/reports"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition group"
        >
          <TrendingUp size={32} className="mb-4" />
          <h3 className="text-xl font-bold mb-2">Generate Reports</h3>
          <p className="text-purple-100 text-sm mb-4">View analytics and download reports</p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
            Go to Reports <ArrowUpRight size={16} />
          </span>
        </a>
      </div>
    </div>
  )
}
