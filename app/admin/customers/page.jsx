"use client"

import { Search, Download, Eye, Mail, Phone, MapPin, Calendar, Grid, List } from "lucide-react"
import { useState } from "react"

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid") // Added view mode toggle

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      totalBookings: 3,
      totalSpent: "$7,497",
      joinDate: "2024-03-15",
      lastBooking: "2025-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, USA",
      totalBookings: 2,
      totalSpent: "$5,198",
      joinDate: "2024-05-20",
      lastBooking: "2025-01-16",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "+1 (555) 345-6789",
      location: "Chicago, USA",
      totalBookings: 1,
      totalSpent: "$2,799",
      joinDate: "2024-08-10",
      lastBooking: "2025-01-17",
      status: "active",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.w@email.com",
      phone: "+1 (555) 456-7890",
      location: "Miami, USA",
      totalBookings: 4,
      totalSpent: "$12,896",
      joinDate: "2024-02-05",
      lastBooking: "2025-01-18",
      status: "active",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.b@email.com",
      phone: "+1 (555) 567-8901",
      location: "Seattle, USA",
      totalBookings: 1,
      totalSpent: "$2,199",
      joinDate: "2024-11-12",
      lastBooking: "2025-01-19",
      status: "active",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
            <p className="text-gray-600">View and manage customer information</p>
          </div>
          <button className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold">
            <Download size={20} />
            Export Customers
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Active Customers</div>
            <div className="text-3xl font-bold text-green-600">
              {customers.filter((c) => c.status === "active").length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600">$30,589</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Avg. Bookings</div>
            <div className="text-3xl font-bold text-purple-600">2.2</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          // Card View
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-6 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {customer.name.charAt(0)}
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {customer.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Customer since {customer.joinDate}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{customer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Last booking: {customer.lastBooking}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                    <div className="text-2xl font-bold text-gray-900">{customer.totalBookings}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-blue-600">{customer.totalSpent}</div>
                  </div>
                </div>

                <button className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-semibold">
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Bookings</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Total Spent</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">Since {customer.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{customer.location}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">{customer.totalBookings}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-blue-600">{customer.totalSpent}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
