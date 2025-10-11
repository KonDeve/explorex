"use client"

import { Search, Download, Eye, Mail, Phone, MapPin, Calendar, Grid, List, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllCustomers } from "@/lib/userProfile"
import { getProfilePictureUrl } from "@/lib/supabase"

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid") // Added view mode toggle
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch customers from database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const result = await getAllCustomers()
        
        if (result.success) {
          setCustomers(result.customers)
          setError(null)
        } else {
          setError(result.error)
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Calculate stats from real data
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === "active").length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  const avgBookings = totalCustomers > 0 
    ? (customers.reduce((sum, c) => sum + (c.total_bookings || 0), 0) / totalCustomers).toFixed(1)
    : 0

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
    return (
      fullName.includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower))
    )
  })

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Get location string
  const getLocation = (customer) => {
    const parts = []
    if (customer.city) parts.push(customer.city)
    if (customer.country) parts.push(customer.country)
    return parts.length > 0 ? parts.join(', ') : 'Not specified'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

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
            <div className="text-3xl font-bold text-gray-900">{totalCustomers}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Active Customers</div>
            <div className="text-3xl font-bold text-green-600">{activeCustomers}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600">₱{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Avg. Bookings</div>
            <div className="text-3xl font-bold text-purple-600">{avgBookings}</div>
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
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-6 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {customer.profile_image_url ? (
                        <img 
                          src={getProfilePictureUrl(customer.profile_image_url)} 
                          alt={`${customer.first_name} ${customer.last_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = customer.first_name?.charAt(0) || customer.email.charAt(0).toUpperCase()
                          }}
                        />
                      ) : (
                        customer.first_name?.charAt(0) || customer.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Customer since {formatDate(customer.created_at)}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400" />
                      <span>{customer.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Last booking: {formatDate(customer.lastBookingDate)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                      <div className="text-2xl font-bold text-gray-900">{customer.total_bookings || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Spent</div>
                      <div className="text-2xl font-bold text-blue-600">₱{(customer.total_spent || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-semibold">
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              ))
            )}
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
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                              {customer.profile_image_url ? (
                                <img 
                                  src={getProfilePictureUrl(customer.profile_image_url)} 
                                  alt={`${customer.first_name} ${customer.last_name}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.parentElement.innerHTML = customer.first_name?.charAt(0) || customer.email.charAt(0).toUpperCase()
                                  }}
                                />
                              ) : (
                                customer.first_name?.charAt(0) || customer.email.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {customer.first_name} {customer.last_name}
                              </div>
                              <div className="text-xs text-gray-500">Since {formatDate(customer.created_at)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                          <div className="text-xs text-gray-500">{customer.phone || 'Not provided'}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{getLocation(customer)}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">{customer.total_bookings || 0}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-blue-600">₱{(customer.total_spent || 0).toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
