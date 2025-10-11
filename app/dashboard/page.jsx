"use client"

import Header from "@/components/header"
import { Calendar, MapPin, CreditCard, User, Settings, LogOut, Package, LayoutGrid, Table, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { getUserBookings, autoCancelExpiredBookings } from "@/lib/bookings"
import { createCheckoutSession } from "@/lib/paymongo"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  const [viewMode, setViewMode] = useState("card")
  const [isVisible, setIsVisible] = useState({})
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        setLoadingBookings(true)
        try {
          // First, auto-cancel any expired bookings (with remaining balance < 45 days)
          console.log('Checking for expired bookings to auto-cancel...')
          await autoCancelExpiredBookings()
          
          // Then fetch user bookings
          console.log('Fetching bookings for user:', user.id)
          const result = await getUserBookings(user.id)
          console.log('Bookings result:', result)
          if (result.success) {
            console.log('Bookings data:', result.bookings)
            setBookings(result.bookings)
          } else {
            console.error('Failed to fetch bookings:', result.error)
          }
        } catch (err) {
          console.error('Error fetching bookings:', err)
        } finally {
          setLoadingBookings(false)
        }
      }
    }

    fetchBookings()
  }, [user])

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

  // Separate upcoming and past bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  console.log('Today:', today, 'ISO:', today.toISOString())
  console.log('All bookings:', bookings)

  // Upcoming bookings: check-out date is today or in the future (trip is ongoing or upcoming)
  const upcomingBookings = bookings.filter(booking => {
    const checkOutDate = new Date(booking.check_out_date)
    console.log('Booking:', booking.booking_number, 'Check-out:', booking.check_out_date, 'Parsed:', checkOutDate, 'Status:', booking.status)
    console.log('Is upcoming/active?', checkOutDate >= today, 'Not cancelled?', booking.status !== 'cancelled')
    return checkOutDate >= today && booking.status !== 'cancelled'
  })

  // Past bookings: check-out date has passed, or booking is cancelled/completed
  const pastBookings = bookings.filter(booking => {
    const checkOutDate = new Date(booking.check_out_date)
    console.log('Booking:', booking.booking_number, 'Check-out:', booking.check_out_date, 'Parsed:', checkOutDate)
    const isPast = checkOutDate < today || booking.status === 'cancelled' || booking.status === 'completed'
    console.log('Is past?', isPast)
    return isPast
  })

  console.log('Total bookings:', bookings.length)
  console.log('Upcoming bookings:', upcomingBookings.length, upcomingBookings)
  console.log('Past bookings:', pastBookings.length, pastBookings)

  // Calculate stats - Total spent should be only what customer has actually paid
  const totalSpent = bookings.reduce((sum, booking) => sum + parseFloat(booking.amount_paid || 0), 0)
  const placesVisited = pastBookings.filter(b => b.status === 'completed').length

  const handleViewDetails = (booking) => {
    // Navigate to trip details page using slug
    const slug = booking.package?.slug || booking.id
    router.push(`/dashboard/trip/${slug}`)
  }

  const handlePayNow = async (booking) => {
    try {
      // Calculate remaining balance
      const remainingBalance = parseFloat(booking.remaining_balance || 0)
      
      if (remainingBalance <= 0) {
        alert('No remaining balance to pay')
        return
      }

      // Check if payment deadline has passed (45 days before travel)
      const checkInDate = new Date(booking.check_in_date)
      checkInDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Calculate payment deadline (45 days before travel)
      const paymentDeadline = new Date(checkInDate)
      paymentDeadline.setDate(paymentDeadline.getDate() - 45)
      const daysUntilDeadline = Math.ceil((paymentDeadline - today) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline < 0) {
        alert(
          `This booking cannot be paid. The payment deadline was ${paymentDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ` +
          `(${Math.abs(daysUntilDeadline)} ${Math.abs(daysUntilDeadline) === 1 ? 'day' : 'days'} ago).\n\n` +
          `According to our policy, bookings with remaining balance must be paid at least 45 days before travel.\n\n` +
          `This booking will be automatically cancelled and is non-refundable.`
        )
        // Refresh to show updated booking status
        window.location.reload()
        return
      }

      // Get package info for better description
      const packageTitle = booking.package?.title || 'Travel Package'
      const packageImage = booking.package?.images?.[0]
      const fullImageUrl = packageImage && (packageImage.startsWith('http://') || packageImage.startsWith('https://'))
        ? packageImage
        : null

      // Create PayMongo checkout session for remaining balance
      const result = await createCheckoutSession({
        amount: remainingBalance,
        description: `Remaining Balance Payment - ${packageTitle}`,
        lineItems: [
          {
            name: `${packageTitle} - Remaining Balance`,
            quantity: 1,
            amount: remainingBalance,
            description: `Booking ${booking.booking_number} | ${booking.check_in_date} to ${booking.check_out_date}`,
            images: fullImageUrl ? [fullImageUrl] : []
          }
        ],
        billing: {
          name: `${booking.customer_first_name} ${booking.customer_last_name}`,
          email: booking.customer_email
        },
        successUrl: `${window.location.origin}/dashboard/trip/${booking.package?.slug || booking.id}/payment/success?booking_id=${booking.id}`,
        cancelUrl: `${window.location.origin}/dashboard`
      })

      if (result.success && result.checkoutUrl) {
        // Store session info for verification
        localStorage.setItem('paymongo_session_id', result.sessionId)
        localStorage.setItem('paymongo_booking_id', booking.id)
        
        // Redirect directly to PayMongo checkout
        window.location.href = result.checkoutUrl
      } else {
        console.error('Failed to create checkout session:', result.error)
        alert('Failed to initiate payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    }
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
                    <div className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</div>
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
                    <div className="text-2xl font-bold text-gray-900">{placesVisited}</div>
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
                    <div className="text-2xl font-bold text-gray-900">₱{totalSpent.toLocaleString()}</div>
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

              {loadingBookings ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
                  <p className="text-gray-600 text-lg">Loading your bookings...</p>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming trips</h3>
                  <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
                  <Link href="/packages" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    Browse Packages
                  </Link>
                </div>
              ) : viewMode === "card" ? (
                <div className="space-y-6">
                  {upcomingBookings.map((booking) => {
                    const packageData = booking.package || {}
                    const bookingImage = packageData.images?.[0] || "/placeholder.svg"
                    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    const remainingBalance = booking.remaining_balance || 0
                    
                    // Calculate days until trip and payment deadline
                    const checkInDate = new Date(booking.check_in_date)
                    checkInDate.setHours(0, 0, 0, 0)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const daysUntilTrip = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24))
                    
                    // Calculate payment deadline (45 days before travel)
                    const paymentDeadline = new Date(checkInDate)
                    paymentDeadline.setDate(paymentDeadline.getDate() - 45)
                    const daysUntilDeadline = Math.ceil((paymentDeadline - today) / (1000 * 60 * 60 * 24))
                    
                    // Check if booking is at risk of auto-cancellation
                    const hasRemainingBalance = remainingBalance > 0
                    const isWithin45Days = daysUntilDeadline < 0 // Deadline has passed
                    const isAtRisk = hasRemainingBalance && isWithin45Days
                    
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        <div className="grid md:grid-cols-[280px_1fr] gap-0">
                          <div className="relative h-full overflow-hidden">
                            <img
                              src={bookingImage}
                              alt={packageData.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
                                booking.status === 'confirmed' ? 'bg-emerald-500 text-white' :
                                booking.status === 'pending' ? 'bg-amber-500 text-white' :
                                'bg-slate-500 text-white'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              {booking.payment_status !== 'pending' && (
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
                                  booking.payment_status === 'paid' ? 'bg-emerald-500 text-white' :
                                  booking.payment_status === 'needs_payment' ? 'bg-rose-500 text-white' :
                                  booking.payment_status === 'partial' ? 'bg-orange-500 text-white' :
                                  'bg-amber-500 text-white'
                                }`}>
                                  {booking.payment_status === "needs_payment" ? "Needs Payment" : 
                                   booking.payment_status === "paid" ? "Paid" :
                                   booking.payment_status === "partial" ? "Partial Payment" :
                                   booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                              <h3 className="text-2xl font-bold text-gray-900">{packageData.title}</h3>
                              <div className="text-sm text-gray-500">Booking ID: {booking.booking_number}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                              <div className="flex items-start gap-3">
                                <Calendar size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Travel Date</div>
                                  <div className="text-sm text-gray-900">{booking.check_in_date} - {booking.check_out_date}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Destination</div>
                                  <div className="text-sm text-gray-900">{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <User size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Travellers</div>
                                  <div className="text-sm text-gray-900">{booking.total_guests}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Calendar size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500 mb-1">Booked On</div>
                                  <div className="text-sm text-gray-900">{bookingDate}</div>
                                </div>
                              </div>
                            </div>

                            {/* Warning for bookings at risk of cancellation */}
                            {isAtRisk && (
                              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-bold text-red-900 mb-1">⚠️ Payment Deadline Passed</h4>
                                    <p className="text-xs text-red-800 leading-relaxed">
                                      Payment deadline was <strong>{paymentDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> ({Math.abs(daysUntilDeadline)} {Math.abs(daysUntilDeadline) === 1 ? 'day' : 'days'} ago).
                                      This booking can no longer be paid and will be <strong>automatically cancelled</strong> with <strong>no refund</strong>.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-200">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Total Package</div>
                                <div className="text-lg font-bold text-gray-900">₱{booking.total_amount.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Amount Paid</div>
                                <div className="text-lg font-bold text-green-600">₱{booking.amount_paid.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Remaining Balance</div>
                                <div className="text-lg font-bold text-orange-600">₱{remainingBalance.toLocaleString()}</div>
                                {remainingBalance > 0 && (
                                  <div className="mt-1">
                                    {daysUntilDeadline >= 0 ? (
                                      <div className="text-xs text-gray-600">
                                        Pay before: <span className="font-semibold">{paymentDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                      </div>
                                    ) : null}
                                    <div className={`text-xs font-semibold mt-0.5 ${
                                      daysUntilDeadline < 0 ? 'text-red-600' : 
                                      daysUntilDeadline <= 5 ? 'text-red-600' : 
                                      daysUntilDeadline <= 15 ? 'text-orange-600' : 
                                      'text-blue-600'
                                    }`}>
                                      {daysUntilDeadline >= 0 ? (
                                        `${daysUntilDeadline} ${daysUntilDeadline === 1 ? 'day' : 'days'} left to pay`
                                      ) : (
                                        `Deadline passed (${Math.abs(daysUntilDeadline)} ${Math.abs(daysUntilDeadline) === 1 ? 'day' : 'days'} ago)`
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleViewDetails(booking)}
                              className={`${remainingBalance > 0 && (booking.payment_status === 'needs_payment' || booking.payment_status === 'partial') && !isAtRisk ? 'flex-1' : 'w-full'} bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium`}
                            >
                              View Details
                            </button>
                            {remainingBalance > 0 && (booking.payment_status === 'needs_payment' || booking.payment_status === 'partial') && !isAtRisk && (
                              <button 
                                onClick={() => handlePayNow(booking)}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                              >
                                <CreditCard size={18} />
                                Pay Remaining Balance
                              </button>
                            )}
                            {isAtRisk && (
                              <button 
                                disabled
                                className="bg-gray-300 text-gray-500 px-8 py-3 rounded-lg cursor-not-allowed font-medium flex items-center gap-2"
                                title="Payment deadline has passed"
                              >
                                <CreditCard size={18} />
                                Payment Unavailable
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                        {upcomingBookings.map((booking) => {
                          const packageData = booking.package || {}
                          const bookingImage = packageData.images?.[0] || "/placeholder.svg"
                          const remainingBalance = booking.remaining_balance || 0
                          
                          // Calculate days until trip and payment deadline for table view
                          const checkInDate = new Date(booking.check_in_date)
                          checkInDate.setHours(0, 0, 0, 0)
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const daysUntilTrip = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24))
                          
                          // Calculate payment deadline (45 days before travel)
                          const paymentDeadline = new Date(checkInDate)
                          paymentDeadline.setDate(paymentDeadline.getDate() - 45)
                          const daysUntilDeadline = Math.ceil((paymentDeadline - today) / (1000 * 60 * 60 * 24))
                          
                          return (
                            <tr key={booking.id} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.booking_number}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={bookingImage}
                                    alt={packageData.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <span className="font-semibold text-gray-900">{packageData.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin size={16} />
                                  <span>{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{booking.check_in_date}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{booking.check_out_date}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{booking.total_guests}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {booking.status}
                                </span>
                                {/* Payment deadline indicator in table */}
                                {remainingBalance > 0 && (
                                  <div className={`text-xs font-semibold mt-1 ${
                                    daysUntilDeadline < 0 ? 'text-red-600' :
                                    daysUntilDeadline <= 5 ? 'text-red-600' :
                                    daysUntilDeadline <= 15 ? 'text-orange-600' :
                                    'text-blue-600'
                                  }`}>
                                    {daysUntilDeadline >= 0 ? (
                                      `⏰ ${daysUntilDeadline}d to pay`
                                    ) : (
                                      `⚠️ Deadline passed`
                                    )}
                                  </div>
                                )}
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
                        )
                      })}
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
                        src={booking.package?.images?.[0] || '/placeholder.svg'}
                        alt={booking.package?.title || 'Travel package'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.package?.title || 'Travel Package'}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin size={16} />
                        <span>{booking.package?.location || 'Unknown'}{booking.package?.country ? `, ${booking.package.country}` : ''}</span>
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
