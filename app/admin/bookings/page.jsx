"use client"

import { Search, Filter, Download, Eye, Check, X, Grid, List, RefreshCw, MoreVertical } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllBookings, updateBookingStatus, updatePaymentStatus } from "@/lib/bookings"
import { createNotification } from "@/lib/notifications"
import { sendBookingConfirmationEmail } from "@/lib/emailService"

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState("list") // Added view mode toggle
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null) // Track which menu is open
  const [selectedBooking, setSelectedBooking] = useState(null) // Track selected booking for modal
  const [showModal, setShowModal] = useState(false) // Track modal visibility
  const [toast, setToast] = useState({ show: false, message: '', type: '' }) // Toast notification state

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

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
    setUpdating(bookingId)
    try {
      const result = await updateBookingStatus(bookingId, newStatus)
      if (result.success) {
        // Get the booking details to send notification
        const booking = bookings.find(b => b.id === bookingId)
        
        // Create notification for the customer if status is confirmed
        if (newStatus === 'confirmed' && booking?.user_id && booking?.package?.slug) {
          try {
            console.log('Creating notification with data:', {
              userId: booking.user_id,
              bookingId: bookingId,
              packageSlug: booking.package.slug,
              packageTitle: booking.package.title
            })
            
            // Create in-app notification
            const notificationResult = await createNotification({
              userId: booking.user_id,
              title: 'Booking Confirmed! 🎉',
              message: `Your booking for ${booking.package?.title || 'your trip'} has been confirmed! Check-in date: ${booking.check_in_date}`,
              type: 'booking',
              referenceType: 'booking',
              referenceId: bookingId,  // Store booking ID (UUID)
              packageSlug: booking.package.slug  // Pass slug separately for navigation
            })
            
            if (!notificationResult.success) {
              console.error('Notification creation failed:', notificationResult.error)
            }
            
            // Send email notification
            if (booking.user?.email) {
              const customerName = `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() || 'Customer'
              
              console.log('Preparing to send email to customer:', {
                email: booking.user.email,
                name: customerName,
                package: booking.package.title
              })
              
              const emailResult = await sendBookingConfirmationEmail({
                to_email: booking.user.email,
                name: customerName,
                package_name: booking.package.title,
                time: new Date(booking.check_in_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              })
              
              if (emailResult.success) {
                console.log('✅ Email sent successfully to:', booking.user.email)
                showToast('Booking confirmed and email sent!', 'success')
              } else {
                console.error('❌ Email sending failed:', emailResult.error)
                showToast('Booking confirmed but email failed to send', 'warning')
              }
            } else {
              console.warn('⚠️ No email address found for user:', booking.user_id)
            }
          } catch (notifError) {
            console.error('Error creating notification:', notifError)
          }
        }
        
        await fetchBookings() // Refresh the list
        showToast(`Booking status updated to ${newStatus}`, 'success')
      } else {
        console.error('Failed to update status:', result.error)
        showToast('Failed to update booking status', 'error')
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdating(null)
    }
  }

  // Update payment status
  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus) => {
    setUpdating(bookingId)
    try {
      const result = await updatePaymentStatus(bookingId, newPaymentStatus)
      if (result.success) {
        // Get the booking details to send notification
        const booking = bookings.find(b => b.id === bookingId)
        
        // Create notification for the customer if payment is confirmed
        if (newPaymentStatus === 'paid' && booking?.user_id && booking?.package?.slug) {
          try {
            console.log('Creating payment notification with data:', {
              userId: booking.user_id,
              bookingId: bookingId,
              packageSlug: booking.package.slug,
              packageTitle: booking.package.title
            })
            
            const notificationResult = await createNotification({
              userId: booking.user_id,
              title: 'Payment Received! 💳',
              message: `We have received your payment for ${booking.package?.title || 'your booking'}. Thank you!`,
              type: 'payment',
              referenceType: 'booking',
              referenceId: bookingId,  // Store booking ID (UUID)
              packageSlug: booking.package.slug  // Pass slug separately for navigation
            })
            
            if (!notificationResult.success) {
              console.error('Notification creation failed:', notificationResult.error)
            }
          } catch (notifError) {
            console.error('Error creating payment notification:', notifError)
          }
        }
        
        await fetchBookings() // Refresh the list
        showToast(`Payment status updated to ${newPaymentStatus}`, 'success')
      } else {
        console.error('Failed to update payment status:', result.error)
        showToast('Failed to update payment status', 'error')
      }
    } catch (err) {
      console.error('Error updating payment status:', err)
      showToast('An error occurred while updating', 'error')
    } finally {
      setUpdating(null)
    }
  }

  // View booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowModal(true)
    setOpenMenuId(null)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
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
                            className={`text-xs font-medium mt-1 ${
                              paymentStatus === "paid" 
                                ? "text-green-600" 
                                : paymentStatus === "needs_payment"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {paymentStatus === "needs_payment" ? "Needs Payment" : 
                             paymentStatus === "paid" ? "Paid" :
                             paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
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
                      <td className="py-4 px-6 relative">
                        <button 
                          data-booking-id={booking.id}
                          onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
                </tbody>
              </table>
            </div>
            
            {/* Dropdown Menu - Positioned absolutely outside of table */}
            {openMenuId && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setOpenMenuId(null)}
                />
                
                {/* Dropdown Menu */}
                <div 
                  className="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 w-44"
                  style={{
                    top: `${document.querySelector(`[data-booking-id="${openMenuId}"]`)?.getBoundingClientRect().bottom + window.scrollY + 4}px`,
                    left: `${document.querySelector(`[data-booking-id="${openMenuId}"]`)?.getBoundingClientRect().right + window.scrollX - 176}px`
                  }}
                >
                  <button 
                    onClick={() => {
                      const booking = bookings.find(b => b.id === openMenuId)
                      handleViewDetails(booking)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  
                  {bookings.find(b => b.id === openMenuId)?.status === "pending" && (
                    <button 
                      onClick={() => {
                        setOpenMenuId(null)
                        handleStatusUpdate(openMenuId, 'confirmed')
                      }}
                      disabled={updating === openMenuId}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {updating === openMenuId ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Confirm Booking
                    </button>
                  )}
                  
                  {bookings.find(b => b.id === openMenuId)?.status === "confirmed" && 
                   (bookings.find(b => b.id === openMenuId)?.payment_status === "pending" || 
                    bookings.find(b => b.id === openMenuId)?.payment_status === "needs_payment") && (
                    <button 
                      onClick={() => {
                        setOpenMenuId(null)
                        handlePaymentStatusUpdate(openMenuId, 'paid')
                      }}
                      disabled={updating === openMenuId}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      💳 Mark as Paid
                    </button>
                  )}
                </div>
              </>
            )}
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

        {/* Booking Details Modal - Minimal Design */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={closeModal}>
            <div 
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Section */}
              <div className="border-b border-gray-200 px-8 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-md font-medium">
                        #{selectedBooking.booking_number}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Booked on {new Date(selectedBooking.booking_date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg ml-4"
                  >
                    <X size={22} />
                  </button>
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2 mt-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedBooking.status === "confirmed" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : selectedBooking.status === "pending" 
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    Booking: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedBooking.payment_status === "paid" 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : selectedBooking.payment_status === "partial" 
                        ? "bg-orange-50 text-orange-700 border border-orange-200" 
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                  }`}>
                    Payment: {selectedBooking.payment_status === "needs_payment" ? "Pending" : 
                            selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid grid-cols-2 gap-8">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Customer Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Full Name</div>
                          <div className="text-base font-semibold text-gray-900">
                            {selectedBooking.customer_first_name} {selectedBooking.customer_last_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Email Address</div>
                          <div className="text-sm text-gray-700">
                            {selectedBooking.customer_email}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                          <div className="text-sm text-gray-700">
                            {selectedBooking.customer_phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Information */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Package Details
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="font-semibold text-gray-900 mb-2">
                          {selectedBooking.package?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedBooking.total_guests} {selectedBooking.total_guests === 1 ? 'guest' : 'guests'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Travel Information */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Travel Dates
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Check-in Date</div>
                          <div className="text-base font-semibold text-gray-900">{selectedBooking.check_in_date}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Check-out Date</div>
                          <div className="text-base font-semibold text-gray-900">{selectedBooking.check_out_date}</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Payment Summary
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 space-y-2.5">
                          {parseFloat(selectedBooking.base_price || 0) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Base Price</span>
                              <span className="font-medium text-gray-900">₱{parseFloat(selectedBooking.base_price || 0).toLocaleString()}</span>
                            </div>
                          )}
                          {parseFloat(selectedBooking.discount || 0) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Discount</span>
                              <span className="font-medium text-green-600">-₱{parseFloat(selectedBooking.discount || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="bg-white px-4 py-3 border-t border-gray-200 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                            <span className="text-lg font-bold text-gray-900">₱{parseFloat(selectedBooking.total_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Amount Paid</span>
                            <span className="text-base font-semibold text-green-600">₱{parseFloat(selectedBooking.amount_paid || 0).toLocaleString()}</span>
                          </div>
                          {parseFloat(selectedBooking.remaining_balance || 0) > 0 ? (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                              <span className="text-sm text-gray-600">Remaining Balance</span>
                              <span className="text-base font-semibold text-orange-600">₱{parseFloat(selectedBooking.remaining_balance || 0).toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
                                <span className="text-sm font-medium text-green-700">✓ Fully Paid</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex items-center justify-end gap-3">
                {selectedBooking.status === "pending" && (
                  <button
                    onClick={() => {
                      closeModal()
                      handleStatusUpdate(selectedBooking.id, 'confirmed')
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition font-medium text-sm"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedBooking.status === "confirmed" && 
                 (selectedBooking.payment_status === "pending" || selectedBooking.payment_status === "partial") && (
                  <button
                    onClick={() => {
                      closeModal()
                      handlePaymentStatusUpdate(selectedBooking.id, 'paid')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition font-medium text-sm"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-lg transition font-medium text-sm border border-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className={`flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="font-medium text-sm">{toast.message}</p>
              <button
                onClick={() => setToast({ show: false, message: '', type: '' })}
                className={`ml-4 ${
                  toast.type === 'success' 
                    ? 'text-green-600 hover:text-green-800' 
                    : 'text-red-600 hover:text-red-800'
                } transition-colors`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
