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

export default function BookingPage({ params }) {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
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
    
    // Validate check-out date is not before check-in date
    if (name === 'checkOut' && formData.checkIn && value < formData.checkIn) {
      alert('Check-out date cannot be earlier than check-in date')
      return
    }
    
    // Validate check-in date is not after check-out date
    if (name === 'checkIn' && formData.checkOut && value > formData.checkOut) {
      alert('Check-in date cannot be later than check-out date')
      return
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Parse max people from package (e.g., "2-4 People" -> 4)
  const getMaxPeople = () => {
    if (!packageData?.people) return 10 // Default max if not specified
    const match = packageData.people.match(/(\d+)\s*-\s*(\d+)|\b(\d+)\b/)
    if (match) {
      // If range like "2-4", return the max (4)
      return match[2] ? parseInt(match[2]) : parseInt(match[3] || match[1])
    }
    return 10 // Default fallback
  }

  const handleNumberChange = (field, increment) => {
    setFormData((prev) => {
      const newValue = prev[field] + increment
      const totalTravelers = field === 'adults' 
        ? newValue + prev.children 
        : prev.adults + newValue
      
      const maxPeople = getMaxPeople()
      
      // Don't allow total to exceed max people
      if (totalTravelers > maxPeople && increment > 0) {
        return prev
      }
      
      // Adults: minimum 1, children: minimum 0
      const minValue = field === 'adults' ? 1 : 0
      
      return {
        ...prev,
        [field]: Math.max(minValue, newValue)
      }
    })
  }

  const calculateTotal = () => {
    console.log('Calculating total with pkg.price_value:', pkg.price_value)
    const priceValue = pkg.price_value || 0
    // Fixed package price - doesn't change with number of travelers
    const result = {
      subtotal: priceValue,
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

    // Validate dates
    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates')
      return
    }

    if (formData.checkOut <= formData.checkIn) {
      alert('Check-out date must be after check-in date')
      return
    }

    setSubmitting(true)

    try {
      // Prepare booking data
      const bookingData = {
        userId: user.id,
        packageId: packageData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: formData.adults,
        children: formData.children,
        totalAmount: totals.total,
        specialRequests: formData.specialRequests,
      }

      console.log('Submitting booking:', bookingData)

      // Create booking
      const result = await createBooking(bookingData)

      if (result.success) {
        alert(`Booking confirmed! Your booking number is: ${result.booking.booking_number}`)
        // Redirect to user dashboard or booking details
        router.push('/dashboard')
      } else {
        alert(`Booking failed: ${result.error}`)
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
            <div className="bg-white rounded-2xl p-8">
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
                    Travel Dates
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users size={24} className="text-blue-500" />
                    Number of Travelers
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Adults (18+)</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleNumberChange("adults", -1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.adults}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange("adults", 1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Children (0-17)</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleNumberChange("children", -1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.children}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange("children", 1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Maximum capacity:</span> {getMaxPeople()} people total
                    <br />
                    <span className="text-xs">This is a bundle package - price stays the same for all travelers</span>
                  </p>
                  {(formData.adults + formData.children) >= getMaxPeople() && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ You've reached the maximum capacity for this package
                    </p>
                  )}
                </div>
              </div>                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare size={24} className="text-blue-500" />
                    Special Requests
                  </h2>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Any dietary restrictions, accessibility needs, or special occasions we should know about?"
                  />
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
            <div className="bg-white rounded-2xl p-6 sticky top-24">
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
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar size={16} />
                  <span>{pkg.duration}</span>
                </div>
                {pkg.people && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users size={16} />
                    <span>{pkg.people}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Included Features</h4>
                <div className="space-y-2">
                  {pkg.features && pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package Price (for {formData.adults + formData.children} {formData.adults + formData.children === 1 ? 'person' : 'people'})</span>
                  <span className="font-semibold">₱{pkg.price_value?.toLocaleString()}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 my-2">
                  <p className="text-xs text-green-700">
                    ✓ Fixed bundle price - includes all travelers
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-500">₱{totals.total.toLocaleString()}</span>
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
