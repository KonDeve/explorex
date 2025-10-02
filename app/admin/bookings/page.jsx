"use client"

import { Search, Filter, Download, Eye, Check, X, Grid, List, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllBookings, updateBookingStatus, updatePaymentStatus } from "@/lib/bookings"

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState("list") // Added view mode toggle
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  // Fetch bookings
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const result = await getAllBookings()
      if (result.success) {
        setBookings(result.bookings)
      } else {
        console.error('Failed to fetch bookings:', result.error)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update booking status
  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      return
    }

    setUpdating(bookingId)
    try {
      const result = await updateBookingStatus(bookingId, newStatus)
      if (result.success) {
        alert('Booking status updated successfully!')
        await fetchBookings() // Refresh the list
      } else {
        alert(`Failed to update status: ${result.error}`)
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('An error occurred while updating the status')
    } finally {
      setUpdating(null)
    }
  }

  // Update payment status
  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus) => {
    if (!confirm(`Are you sure you want to change the payment status to "${newPaymentStatus}"?`)) {
      return
    }

    setUpdating(bookingId)
    try {
      const result = await updatePaymentStatus(bookingId, newPaymentStatus)
      if (result.success) {
        alert('Payment status updated successfully!')
        await fetchBookings() // Refresh the list
      } else {
        alert(`Failed to update payment status: ${result.error}`)
      }
    } catch (err) {
      console.error('Error updating payment status:', err)
      alert('An error occurred while updating the payment status')
    } finally {
      setUpdating(null)
    }
  }

  const filteredBookings =
    filterStatus === "all" ? bookings : bookings.filter((booking) => booking.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
            <p className="text-gray-600">View and manage all customer bookings</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={fetchBookings}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold">
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Confirmed</div>
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600">
              ₱{bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by booking ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-semibold text-gray-700">
              <Filter size={20} />
              More Filters
            </button>
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

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <RefreshCw className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
            <p className="text-gray-600 text-lg">Loading bookings...</p>
          </div>
        ) : viewMode === "list" ? (
          // Table View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Booking ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Package</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Travel Dates</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Guests</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center">
                        <div className="text-gray-400 text-lg">No bookings found</div>
                        <p className="text-gray-500 text-sm mt-2">Bookings will appear here when customers make reservations</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => {
                    const bookingNumber = booking.booking_number
                    const bookingDate = new Date(booking.booking_date).toLocaleDateString()
                    const customerName = `${booking.customer_first_name} ${booking.customer_last_name}`
                    const customerEmail = booking.customer_email
                    const packageTitle = booking.package?.title || 'N/A'
                    const checkIn = booking.check_in_date
                    const checkOut = booking.check_out_date
                    const guests = booking.total_guests
                    const amount = `₱${booking.total_amount.toLocaleString()}`
                    const paymentStatus = booking.payment_status

                    return (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{bookingNumber}</div>
                          <div className="text-xs text-gray-500">{bookingDate}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{customerName}</div>
                          <div className="text-sm text-gray-500">{customerEmail}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{packageTitle}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {checkIn} to {checkOut}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">{guests}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{amount}</div>
                          <div
                            className={`text-xs ${paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {paymentStatus}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button 
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {booking.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                disabled={updating === booking.id}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                                title="Confirm Booking"
                              >
                                {updating === booking.id ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                disabled={updating === booking.id}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                title="Cancel Booking"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && booking.payment_status === "pending" && (
                            <button 
                              onClick={() => handlePaymentStatusUpdate(booking.id, 'paid')}
                              disabled={updating === booking.id}
                              className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition disabled:opacity-50 text-xs"
                              title="Mark as Paid"
                            >
                              💳
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Card View
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{booking.id}</div>
                    <div className="text-xs text-gray-500">{booking.bookingDate}</div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.customer}</h3>
                <p className="text-sm text-gray-500 mb-4">{booking.email}</p>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm">
                    <span className="text-gray-500">Package:</span>
                    <span className="ml-2 font-medium text-gray-900">{booking.package}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Travel:</span>
                    <span className="ml-2 text-gray-900">
                      {booking.checkIn} to {booking.checkOut}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Guests:</span>
                    <span className="ml-2 text-gray-900">{booking.guests}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-xl font-bold text-gray-900">{booking.amount}</div>
                  </div>
                  <div
                    className={`text-xs font-semibold ${booking.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {booking.paymentStatus}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2">
                    <Eye size={16} />
                    <span className="text-sm font-semibold">View</span>
                  </button>
                  {booking.status === "pending" && (
                    <>
                      <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                        <Check size={16} />
                      </button>
                      <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
