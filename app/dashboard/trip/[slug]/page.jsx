"use client"

import Header from "@/components/header"
import { ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle, Phone, Mail, Download, Edit3, Share, RotateCcw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { getPackageBySlug } from "@/lib/packages"
import { getUserBookings } from "@/lib/bookings"
import { useAuth } from "@/lib/AuthContext"

export default function TripDetailsPage({ params }) {
  const { slug } = params
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('property-details')
  const [isLoaded, setIsLoaded] = useState(false)
  const [tabContentLoaded, setTabContentLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState({})

  // Fetch booking and package data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !slug) return

      try {
        setLoading(true)
        
        // Fetch package by slug
        const pkgData = await getPackageBySlug(slug)
        setPackageData(pkgData)

        // Fetch user's bookings to find the one for this package
        const result = await getUserBookings(user.id)
        if (result.success) {
          const foundBooking = result.bookings.find(b => b.package?.slug === slug)
          setBooking(foundBooking)
        }
      } catch (err) {
        console.error('Error fetching trip data:', err)
        setError('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, slug])

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true)
      setTabContentLoaded(true) // Initialize tab content as loaded for default tab
    }, 100)
    return () => clearTimeout(timer)
  }, [])

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



  // Handle tab switching with animation reset
  const handleTabChange = (newTab) => {
    setTabContentLoaded(false)
    setActiveTab(newTab)
    
    // Trigger content animation after a short delay
    setTimeout(() => {
      setTabContentLoaded(true)
    }, 50)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading trip details...</span>
        </div>
      </div>
    )
  }

  if (error || !booking || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Trip Not Found'}</h1>
            <p className="text-gray-600 mb-8">The trip you're looking for doesn't exist or you don't have access to it.</p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="dashboard" />

      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Back Button */}
        <div className={`mb-6 transition-all duration-500 ease-out delay-100 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Title and Location */}
        <div className={`mb-6 transition-all duration-600 ease-out delay-200 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{packageData.title}</h1>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin size={16} />
            <span>{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className={`flex gap-2 h-96 mb-8 rounded-xl overflow-hidden transition-all duration-700 ease-out delay-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Main large image - left side */}
          <div className="flex-1 overflow-hidden rounded-l-xl">
            <img
              src={packageData.images?.[0] || '/placeholder.svg'}
              alt={packageData.title}
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out delay-400 ${
                isLoaded ? 'scale-100' : 'scale-110'
              }`}
            />
          </div>
          
          {/* Right side - 2x2 grid of smaller images */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <img
                src={packageData.images?.[1] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={packageData.images?.[2] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover rounded-tr-xl"
              />
            </div>
            <div>
              <img
                src={packageData.images?.[3] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <img
                src={packageData.images?.[4] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover rounded-br-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-br-xl">
                <button className="text-white font-medium">See all photos ({packageData.images?.length || 0})</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 transition-all duration-800 ease-out delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Host Info */}
            <div className="pb-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{packageData.title}</h2>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{booking.total_guests}</span>
                    <span>•</span>
                    <span>{packageData.duration}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {packageData.rating && [...Array(Math.floor(packageData.rating))].map((_, i) => (
                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="py-8 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Booking ID</div>
                  <div className="font-semibold">{booking.booking_number}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Check-in</div>
                  <div className="font-semibold text-blue-600">{booking.check_in_date}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="font-bold text-green-600">₱{booking.total_amount.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className={`font-semibold ${
                    booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="pt-8 pb-4">
              <div className="flex space-x-8">
                <button 
                  onClick={() => handleTabChange('property-details')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'property-details' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Property details
                </button>
                <button 
                  onClick={() => handleTabChange('daily-itinerary')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'daily-itinerary' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Daily Itinerary
                </button>
                <button 
                  onClick={() => handleTabChange('reviews')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'reviews' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Reviews
                </button>
                <button 
                  onClick={() => handleTabChange('messages')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                    activeTab === 'messages' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Messages
                  <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">2</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'property-details' && (
              <>
                {/* Description */}
                <div
                  id="details"
                  className="py-8 border-b border-gray-200"
                >
                  <div className="text-sm text-gray-500 mb-2">(01) Specifications</div>
                  <h1 className="text-5xl font-bold mb-4">{packageData.title}</h1>
                  {packageData.description && (
                    <div className="text-gray-700 leading-relaxed">
                      <p>{packageData.description}</p>
                    </div>
                  )}
                </div>

                {/* What this trip includes */}
                <div
                  id="trip-includes"
                  className="py-8 border-b border-gray-200"
                >
                  <h3 className="font-bold text-lg mb-4">What this trip includes</h3>
                  
                  {/* Trip Features from package data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {packageData.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 py-2">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Additional Trip Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Trip Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Calendar size={24} className="text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-semibold text-gray-900">{packageData.duration}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Users size={24} className="text-purple-600" />
                        </div>
                        <div className="text-sm text-gray-500">Group Size</div>
                        <div className="font-semibold text-gray-900">{booking.total_guests}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Star size={24} className="text-yellow-600" />
                        </div>
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">{packageData.rating || '5'}/5 Stars</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hotel Accommodation */}
                <div className="py-8 border-b border-gray-200">
                  <h2 className="text-xl font-bold mb-4">Hotel Accommodation</h2>
                  <p className="text-gray-700 mb-4">
                    {packageData.accommodation_nights || '6'} nights stay at {packageData.accommodation_name || packageData.title} {packageData.accommodation_type ? `(${packageData.accommodation_type})` : ''}
                  </p>
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-3">Amenities:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {packageData.accommodation_amenities && packageData.accommodation_amenities.length > 0 ? (
                        packageData.accommodation_amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Free Wi-Fi</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Private balcony with caldera view</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Daily breakfast</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Infinity pool access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Concierge service</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Airport transfers</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transportation */}
                <div className="py-8 border-b border-gray-200">
                  <h2 className="text-xl font-bold mb-4">Transportation</h2>
                  <p className="text-gray-700 mb-4">
                    {packageData.transportation_flights || `Round-trip flights from major cities to ${packageData.location}`}
                  </p>
                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {packageData.transportation_amenities && packageData.transportation_amenities.length > 0 ? (
                        packageData.transportation_amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Premium economy seating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">In-flight meals</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Airport lounge access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">Travel insurance</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Local Transportation:</h3>
                    <p className="text-gray-700">
                      {packageData.local_transportation || 'Private transfers and local transportation for all tour activities'}
                    </p>
                  </div>
                </div>

                {/* Tour Activities */}
                <div className="py-8 border-b border-gray-200">
                  <h2 className="text-xl font-bold mb-4">Tour Activities</h2>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Included Tours & Experiences:</h3>
                    <div className="space-y-2 mb-4">
                      {packageData.tour_activities && packageData.tour_activities.length > 0 ? (
                        packageData.tour_activities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{activity}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Oia Village sunset tour</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Wine tasting at traditional wineries</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Caldera boat cruise</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Red Beach and Kamari Beach visits</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Fira town exploration</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tour Amenities:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {packageData.tour_amenities && packageData.tour_amenities.length > 0 ? (
                        packageData.tour_amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">Professional tour guide</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">All entrance fees included</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">Photography sessions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">Traditional Greek lunch</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />
                            <span className="text-gray-700">Bottled water and snacks</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Inclusions */}
                <div className="py-8 border-b border-gray-200">
                  <h2 className="text-xl font-bold mb-4">Other Inclusions</h2>
                  <div className="space-y-2">
                    {packageData.other_inclusions && packageData.other_inclusions.length > 0 ? (
                      packageData.other_inclusions.map((inclusion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{inclusion}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Comprehensive travel insurance for {packageData.duration || '7 days'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Free welcome dinner with live music</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Souvenir shopping voucher worth $100</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">24/7 customer support</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'daily-itinerary' && (
              <div 
                id="daily-itinerary"
                className="py-8 border-b border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6">Daily Itinerary</h2>
                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{day.day || `Day ${index + 1}`}: {day.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Detailed itinerary will be provided closer to your departure date.</p>
                )}
              </div>
            )}

            {activeTab === 'daily-itinerary' && booking.type === 'past' && (
              <div 
                id="trip-highlights"
                className="py-8 border-b border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6">Trip Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 py-2">
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div 
                id="reviews"
                className="py-8 border-b border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                {booking.type === 'past' && booking.rating ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(Math.floor(booking.rating))].map((_, i) => (
                          <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                        ))}
                        {booking.rating % 1 !== 0 && (
                          <Star size={20} className="fill-yellow-200 text-yellow-400" />
                        )}
                      </div>
                      <span className="font-semibold text-lg">{booking.rating}/5</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{booking.review}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Star size={48} className="mx-auto" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                    <p className="text-gray-600">
                      {booking.type === 'upcoming' 
                        ? 'You can leave a review after your trip is completed.' 
                        : 'Be the first to leave a review for this trip!'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <>
                <div 
                  id="messages"
                  className="py-8 border-b border-gray-200"
                >
                  <h2 className="text-2xl font-bold mb-6">Messages</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          H
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">Host</span>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-gray-700">Welcome! We're excited to have you stay with us. Please let us know if you have any questions before your arrival.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          S
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">Support Team</span>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-gray-700">Your booking has been confirmed! Check your email for detailed information about your trip.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className={`sticky top-20 border border-gray-200 rounded-xl p-6 bg-white shadow-md transition-all duration-700 ease-out delay-600 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              {/* Pricing Header
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-gray-900">₱{booking.total_amount.toLocaleString()}</span>
              </div> */}
              
                            
              {/* Date and Guest Selection */}
              <div className="border border-gray-200 rounded-lg mb-4">
                <div className="grid grid-cols-2 border-b border-gray-200">
                  <div className="p-3 border-r border-gray-200">
                    <div className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Check-in</div>
                    <div className="text-sm text-gray-900">{booking.check_in_date}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Checkout</div>
                    <div className="text-sm text-gray-900">{booking.check_out_date}</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Guests</div>
                  <div className="text-sm text-gray-900">{booking.total_guests} Adults</div>
                </div>
              </div>

              {/* Total Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-900 font-bold text-base">Total Price Due</span>
                  <span className="text-gray-900 font-bold text-2xl">₱{booking.total_amount.toLocaleString()}</span>
                </div>
                <div className="text-gray-500 text-xs">
                  Deductible by {booking.payment_due_date ? new Date(booking.payment_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Our 14th'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                {booking.remaining_balance > 0 ? (
                  <Link href={`/dashboard/trip/${slug}/payment`}>
                    <button className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                      Continue to checkout
                    </button>
                  </Link>
                ) : (
                  <button className="w-full bg-green-600 text-white py-3.5 px-6 rounded-lg font-semibold cursor-default">
                    Fully Paid
                  </button>
                )}
              </div>

              {/* Contact Host Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Contact Host</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">24/7 Support</div>
                      <div className="font-medium text-gray-900 text-sm">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Email Support</div>
                      <div className="font-medium text-gray-900 text-sm">support@xplorex.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-gray-600">© 2025 Xplorex. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}