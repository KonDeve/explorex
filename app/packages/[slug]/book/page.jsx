"use client"

import { ArrowLeft, Calendar, Users, MapPin, Check, User, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useState, useEffect } from "react"
import { getPackageBySlug } from "@/lib/packages"
import { useAuth } from "@/lib/AuthContext"
import { getUserProfile } from "@/lib/userProfile"
import { createBooking } from "@/lib/bookings"
import { createCheckoutSession } from "@/lib/paymongo"

export default function BookingPage({ params }) {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adults: 1, // Number of adults (default 1)
    children: 0, // Number of children (default 0)
    selectedDealId: "", // NEW: Select a specific deal instead of free dates
    paymentOption: "", // "full" or "partial" - no default selection
    paymentMethod: "paymongo", // Payment method
    specialRequests: "",
  })
  const [isVisible, setIsVisible] = useState({})
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const result = await getUserProfile(user.id)
          if (result.success && result.profile) {
            setFormData(prev => ({
              ...prev,
              firstName: result.profile.first_name || "",
              lastName: result.profile.last_name || "",
              email: result.profile.email || user.email || "",
              phone: result.profile.phone || "",
            }))
          }
        } catch (err) {
          console.error('Error fetching user profile:', err)
        }
      }
    }

    fetchUserData()
  }, [user])

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true)
        console.log('Booking page - Fetching package with slug:', params.slug)
        const data = await getPackageBySlug(params.slug)
        console.log('Booking page - Package data received:', data)
        setPackageData(data)
        setError(null)
      } catch (err) {
        console.error('Booking page - Error fetching package:', err)
        console.error('Booking page - Error message:', err.message)
        setError('Failed to load package details')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchPackage()
    }
  }, [params.slug])

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

  // Auto-switch to full payment if selected deal is less than 45 days away
  useEffect(() => {
    if (formData.selectedDealId && !isPartialPaymentAvailable() && formData.paymentOption === 'partial') {
      setFormData(prev => ({ ...prev, paymentOption: 'full' }))
    }
  }, [formData.selectedDealId])

  console.log('Render state - loading:', loading, 'error:', error, 'packageData:', packageData)

  if (loading) {
    console.log('Showing loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="packages" />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading booking details...</span>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    console.log('Showing error state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="packages" />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Package not found'}</p>
          <Link href="/packages" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block">
            Back to Packages
          </Link>
        </div>
      </div>
    )
  }

  console.log('Rendering main booking UI with package:', packageData.title)
  const pkg = packageData

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // NEW SCHEMA: Get available deals (only active deals)
  const getAvailableDeals = () => {
    if (!packageData?.deals) return []
    return packageData.deals.filter(deal => deal.is_active !== false)
  }

  // Get selected deal details
  const getSelectedDeal = () => {
    if (!formData.selectedDealId || !packageData?.deals) return null
    return packageData.deals.find(deal => deal.id === formData.selectedDealId)
  }

  // NEW SCHEMA: Calculate price from selected deal
  const getPackagePrice = () => {
    const selectedDeal = getSelectedDeal()
    if (selectedDeal) {
      return parseFloat(selectedDeal.deal_price) || 0
    }
    // If no deal selected, show minimum price
    if (!packageData?.deals || packageData.deals.length === 0) return 0
    const prices = packageData.deals.map(deal => parseFloat(deal.deal_price) || 0)
    return Math.min(...prices)
  }

  // Check if partial payment is available (deal must be 45+ days away)
  const isPartialPaymentAvailable = () => {
    const selectedDeal = getSelectedDeal()
    if (!selectedDeal) return false
    
    const dealStartDate = new Date(selectedDeal.deal_start_date)
    const currentDate = new Date()
    const daysUntilDeal = Math.ceil((dealStartDate - currentDate) / (1000 * 60 * 60 * 24))
    
    return daysUntilDeal >= 45
  }

  const calculateTotal = () => {
    // NEW SCHEMA: Get price from deals instead of package.price_value
    const priceValue = getPackagePrice()
    console.log('Calculating total with deal price:', priceValue)
    
    // Calculate based on payment option
    let amountToPay = priceValue
    let remaining = 0
    
    if (formData.paymentOption === 'partial') {
      // Partial payment: 50% now, rest later
      amountToPay = priceValue * 0.50
      remaining = priceValue - amountToPay
    }
    
    const result = {
      subtotal: priceValue,
      amountToPay: amountToPay,
      remaining: remaining,
      total: priceValue,
    }
    console.log('Total calculated:', result)
    return result
  }

  const totals = calculateTotal()
  console.log('Totals assigned:', totals)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      alert('Please log in to make a booking')
      router.push('/login')
      return
    }

    // Validate deal selection
    if (!formData.selectedDealId) {
      alert('Please select a travel deal period')
      return
    }

    // Validate payment option selection
    if (!formData.paymentOption) {
      alert('Please choose a payment option')
      return
    }

    const selectedDeal = getSelectedDeal()
    if (!selectedDeal) {
      alert('Selected deal is no longer available')
      return
    }

    // Check if deal has available slots
    const availableSlots = (selectedDeal.slots_available || 0) - (selectedDeal.slots_booked || 0)
    if (availableSlots <= 0) {
      alert('This deal is fully booked. Please select another date.')
      return
    }

    setSubmitting(true)

    try {
      // Store booking data in session storage to be created after payment
      const bookingData = {
        userId: user.id,
        packageId: packageData.id,
        packageTitle: packageData.title,
        dealId: selectedDeal.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        adults: parseInt(formData.adults) || 1,
        children: parseInt(formData.children) || 0,
        checkIn: selectedDeal.deal_start_date,
        checkOut: selectedDeal.deal_end_date,
        totalAmount: totals.total,
        amountToPay: totals.amountToPay,
        remainingAmount: totals.remaining,
        paymentOption: formData.paymentOption,
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests,
      }

      console.log('Creating PayMongo checkout session for booking:', bookingData)
      
      // Store in sessionStorage to create booking after payment
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))

      // Get the current URL origin for success/cancel URLs
      const origin = window.location.origin

      // Create PayMongo checkout session
      const paymentData = {
        amount: totals.amountToPay,
        description: `${packageData.title} - ${formData.paymentOption === 'full' ? 'Full Payment' : 'Partial Payment (50%)'}`,
        lineItems: [
          {
            currency: 'PHP',
            amount: totals.amountToPay,
            description: `Travel dates: ${new Date(selectedDeal.deal_start_date).toLocaleDateString()} - ${new Date(selectedDeal.deal_end_date).toLocaleDateString()}`,
            name: packageData.title,
            quantity: 1,
            images: packageData.images && packageData.images.length > 0 
              ? packageData.images.filter(img => img.startsWith('http')).slice(0, 1)
              : []
          }
        ],
        billing: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        },
        successUrl: `${origin}/packages/${params.slug}/book/payment/success`,
        cancelUrl: `${origin}/packages/${params.slug}/book`
      }

      const result = await createCheckoutSession(paymentData)

      if (result.success) {
        console.log('Checkout session created, redirecting to:', result.checkoutUrl)
        // Store session ID for verification
        sessionStorage.setItem('paymentSessionId', result.sessionId)
        // Redirect to PayMongo checkout
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
      
    } catch (err) {
      console.error('Booking submission error:', err)
      alert('An error occurred while creating your booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Header activePage="packages" />
      </div>

      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/packages/${params.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Package Details</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div
            id="form"
            data-animate
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-8 shadow-none">
              <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="text-gray-600 mb-8">Fill in your details to reserve your dream vacation</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User size={24} className="text-blue-500" />
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar size={24} className="text-blue-500" />
                    Select Travel Deal Period
                  </h2>
                  <div className="space-y-2">
                    {getAvailableDeals().length > 0 ? (
                      getAvailableDeals().map((deal) => {
                        const availableSlots = (deal.slots_available || 0) - (deal.slots_booked || 0)
                        const isSelected = formData.selectedDealId === deal.id
                        const isSoldOut = availableSlots <= 0
                        
                        // Calculate days until deal starts
                        const dealStartDate = new Date(deal.deal_start_date)
                        dealStartDate.setHours(0, 0, 0, 0) // Set to midnight
                        const currentDate = new Date()
                        currentDate.setHours(0, 0, 0, 0) // Set to midnight
                        const daysUntilDeal = Math.round((dealStartDate - currentDate) / (1000 * 60 * 60 * 24))
                        
                        return (
                          <label
                            key={deal.id}
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                              isSoldOut 
                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                                : isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedDeal"
                              value={deal.id}
                              checked={isSelected}
                              onChange={() => !isSoldOut && setFormData(prev => ({ ...prev, selectedDealId: deal.id }))}
                              disabled={isSoldOut}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {new Date(deal.deal_start_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                  {' → '}
                                  {new Date(deal.deal_end_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                  {isSoldOut ? (
                                    <span className="text-red-600">Sold Out</span>
                                  ) : (
                                    <>
                                      <span>{availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} left</span>
                                      <span className="text-gray-400">•</span>
                                      <span className={daysUntilDeal >= 45 ? 'text-green-600' : 'text-orange-600'}>
                                        {daysUntilDeal > 0 
                                          ? `${daysUntilDeal} ${daysUntilDeal === 1 ? 'day' : 'days'} away`
                                          : daysUntilDeal === 0 
                                            ? 'Starts today'
                                            : 'Started'
                                        }
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₱{parseFloat(deal.deal_price).toLocaleString()}
                              </div>
                            </div>
                          </label>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No available deals at the moment. Please check back later.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4">Choose Payment Option</h2>
                  {!formData.selectedDealId && (
                    <p className="text-sm text-gray-500 mb-4">Please select a travel deal first</p>
                  )}
                  <div className="space-y-2">
                    {/* Full Payment Option */}
                    <label
                      className={`flex items-center justify-between p-4 border rounded-lg transition ${
                        !formData.selectedDealId
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : formData.paymentOption === 'full'
                            ? 'border-blue-500 bg-blue-50 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="full"
                        checked={formData.paymentOption === 'full'}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentOption: e.target.value }))}
                        disabled={!formData.selectedDealId}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.paymentOption === 'full' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {formData.paymentOption === 'full' && <Check size={14} className="text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Full Payment</div>
                          <div className="text-sm text-gray-600">Pay the complete amount now</div>
                        </div>
                      </div>
                      {formData.selectedDealId && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ₱{totals.total.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </label>

                    {/* Partial Payment Option */}
                    <label
                      className={`flex items-center justify-between p-4 border rounded-lg transition ${
                        !formData.selectedDealId || !isPartialPaymentAvailable()
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : formData.paymentOption === 'partial'
                            ? 'border-blue-500 bg-blue-50 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="partial"
                        checked={formData.paymentOption === 'partial'}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentOption: e.target.value }))}
                        disabled={!formData.selectedDealId || !isPartialPaymentAvailable()}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.paymentOption === 'partial' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {formData.paymentOption === 'partial' && <Check size={14} className="text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Partial Payment</div>
                          <div className="text-sm text-gray-600">
                            {!formData.selectedDealId
                              ? 'Select a deal to see payment options'
                              : isPartialPaymentAvailable() 
                                ? 'Pay 50% now, rest before travel'
                                : 'Only available for bookings 45+ days in advance'
                            }
                          </div>
                        </div>
                      </div>
                      {formData.selectedDealId && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ₱{(totals.total * 0.50).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Remaining: ₱{(totals.total * 0.50).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paymongo"
                      checked={formData.paymentMethod === 'paymongo'}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="font-semibold text-gray-900">Secure Payment via PayMongo</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        You'll be redirected to PayMongo's secure checkout
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Supports all major credit cards, debit cards, and digital wallets</span>
                      </div>
                    </div>
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By confirming, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>

          <div
            id="summary"
            data-animate
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 sticky top-24 shadow-none">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>

              <div className="rounded-xl overflow-hidden mb-6">
                <img 
                  src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/placeholder.svg"} 
                  alt={pkg.title} 
                  className="w-full h-48 object-cover" 
                />
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-lg">{pkg.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                </div>
                {/* Show selected deal dates */}
                {formData.selectedDealId && getSelectedDeal() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-900 text-sm font-medium mb-1">
                      <Calendar size={16} />
                      <span>Selected Travel Period</span>
                    </div>
                    <div className="text-sm text-blue-800 pl-6">
                      {new Date(getSelectedDeal().deal_start_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      {' - '}
                      {new Date(getSelectedDeal().deal_end_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* NEW SCHEMA: Show inclusions instead of features */}
              {pkg.details && pkg.details.some(d => d.section_type === 'inclusions') && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Included Features</h4>
                  <div className="space-y-2">
                    {pkg.details
                      .filter(d => d.section_type === 'inclusions')
                      .map(section => section.items || [])
                      .flat()
                      .slice(0, 5) // Show first 5 inclusions
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check size={16} className="text-green-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-semibold">₱{totals.subtotal.toLocaleString()}</span>
                </div>
                
                {formData.paymentOption === 'partial' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pay Now (50%)</span>
                      <span className="font-semibold">₱{totals.amountToPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold">₱{totals.remaining.toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-lg">
                    {formData.paymentOption === 'partial' ? 'Pay Now' : 'Total'}
                  </span>
                  <span className="font-bold text-2xl text-blue-500">₱{totals.amountToPay.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Free cancellation up to 48 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Best price guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
