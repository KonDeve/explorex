"use client"

import Header from "@/components/header"
import { ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle, Phone, Mail, Download, Edit3, Share, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

// Mock data - in a real app this would come from an API
const getBookingById = (id) => {
  const allBookings = {
    "BK-001": {
      id: "BK-001",
      package: "Santorini Paradise",
      location: "Greece",
      checkIn: "2025-06-15",
      checkOut: "2025-06-22",
      guests: "2 Adults",
      image: "/santorini-blue-domes-greece.jpg",
      status: "confirmed",
      type: "upcoming",
      totalPrice: "$2,499",
      duration: "7 Days, 6 Nights",
      hotelName: "Santorini Blue Resort",
      hotelRating: 5,
      confirmation: "XPL-SAN-2025-001",
      features: ["5-Star Hotel", "All Meals Included", "Airport Transfer", "Tour Guide", "Spa Access"],
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "6 nights stay at Santorini Blue Resort (Premium Suite)",
          amenities: ["Free Wi-Fi", "Private balcony with caldera view", "Daily breakfast", "Infinity pool access", "Concierge service", "Airport transfers"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights from major cities to Santorini",
          amenities: ["Premium economy seating", "In-flight meals", "Airport lounge access", "Travel insurance"],
          local: "Private transfers and local transportation for all tour activities"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Oia Village sunset tour", "Wine tasting at traditional wineries", "Caldera boat cruise", "Red Beach and Kamari Beach visits", "Fira town exploration"],
          amenities: ["Professional tour guide", "All entrance fees included", "Photography sessions", "Traditional Greek lunch", "Bottled water and snacks"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel insurance for 7 days", "Free welcome dinner with live music", "Souvenir shopping voucher worth $100", "24/7 customer support"]
        }
      },
      itinerary: [
        { day: 1, title: "Arrival & Check-in", description: "Airport pickup and hotel check-in. Welcome dinner with traditional Greek cuisine and live music." },
        { day: 2, title: "Oia Village Tour", description: "Explore the famous blue-domed churches and sunset views. Professional photography session included." },
        { day: 3, title: "Beach Day", description: "Relax at Red Beach and Kamari Beach. Beach equipment and refreshments provided." },
        { day: 4, title: "Wine Tasting", description: "Visit local wineries and traditional villages. Learn about Santorini's unique volcanic soil wines." },
        { day: 5, title: "Boat Tour", description: "Caldera cruise with swimming and snorkeling. BBQ lunch on board included." },
        { day: 6, title: "Free Day", description: "Shopping and exploring at your own pace. Optional spa treatments available." },
        { day: 7, title: "Departure", description: "Check-out and airport transfer. Late checkout available upon request." }
      ]
    },
    "BK-003": {
      id: "BK-003",
      package: "Alpine Adventure",
      location: "Switzerland",
      checkIn: "2025-08-10",
      checkOut: "2025-08-16",
      guests: "4 Adults",
      image: "/mountain-lake-sunset-alps.jpg",
      status: "confirmed",
      type: "upcoming",
      totalPrice: "$2,799",
      duration: "6 Days, 5 Nights",
      hotelName: "Alpine Grand Lodge",
      hotelRating: 4,
      confirmation: "XPL-ALP-2025-003",
      features: ["Mountain Lodge", "All Meals", "Ski Equipment", "Cable Car Pass", "Hiking Guide"],
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "5 nights stay at Alpine Grand Lodge (Mountain View Suite)",
          amenities: ["Free Wi-Fi", "Mountain panorama views", "All meals included", "Spa and wellness center", "Heated indoor pool", "Ski equipment storage"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Zurich Airport with connecting train to resort",
          amenities: ["Premium economy seating", "Swiss Travel Pass included", "Mountain railway tickets", "Airport and resort transfers"],
          local: "Cable car passes and local shuttle service to ski slopes and attractions"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Guided mountain hiking with professional alpine guide", "Jungfraujoch - Top of Europe excursion", "Lake Geneva boat cruise", "Traditional Swiss cheese and chocolate factory tours", "Paragliding experience (weather permitting)"],
          amenities: ["Certified mountain guide", "All safety equipment provided", "Alpine photography sessions", "Swiss traditional lunch", "Emergency mountain rescue insurance"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel and adventure insurance for 6 days", "Swiss knife souvenir", "$120 shopping voucher for Swiss products", "Traditional Swiss fondue dinner", "24/7 mountain rescue support"]
        }
      },
      itinerary: [
        { day: 1, title: "Arrival", description: "Check-in at Alpine Lodge. Equipment fitting and welcome orientation." },
        { day: 2, title: "Mountain Hiking", description: "Guided hike to scenic viewpoints with professional mountain guide." },
        { day: 3, title: "Cable Car Adventure", description: "Journey to mountain peaks via cable car. Alpine restaurant lunch." },
        { day: 4, title: "Lake Activities", description: "Boat tour and lakeside lunch with water sports activities." },
        { day: 5, title: "Village Tour", description: "Explore traditional Alpine villages and local crafts workshops." },
        { day: 6, title: "Departure", description: "Final breakfast and departure with souvenir shopping time." }
      ]
    },
    "BK-000": {
      id: "BK-000",
      package: "Venice Romance",
      location: "Italy",
      date: "2024-12-10",
      image: "/venice-italy-canal-buildings.jpg",
      type: "past",
      totalPrice: "$1,899",
      duration: "5 Days, 4 Nights",
      hotelName: "Hotel Danieli Venice",
      hotelRating: 4,
      confirmation: "XPL-VEN-2024-000",
      rating: 4.5,
      review: "Amazing trip! The gondola rides were magical and the hotel was fantastic. Would definitely book again.",
      features: ["4-Star Hotel", "Breakfast Included", "Gondola Ride", "City Tours", "Water Taxi"],
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "4 nights stay at Hotel Danieli Venice (Canal View Room)",
          amenities: ["Free Wi-Fi", "Canal view balcony", "Continental breakfast", "Room service", "Historic palazzo setting", "24-hour front desk"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Venice Marco Polo Airport",
          amenities: ["Economy plus seating", "Checked baggage included", "Airport transfers via water taxi"],
          local: "Vaporetto passes for Venice public water transport and walking tours"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Private gondola ride through Grand Canal", "St. Mark's Basilica and Doge's Palace tour", "Murano and Burano islands excursion", "Traditional Venetian glass-making workshop", "Romantic dinner at canal-side restaurant"],
          amenities: ["Licensed tour guide", "Skip-the-line tickets", "Traditional mask painting class", "Welcome prosecco", "Photography assistance"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Travel insurance for 5 days", "Venice city map and guidebook", "$75 restaurant voucher", "Free souvenir Venetian mask", "Emergency support hotline"]
        }
      },
      highlights: [
        "St. Mark's Square tour",
        "Doge's Palace visit", 
        "Romantic gondola rides",
        "Murano glass factory tour",
        "Traditional Italian dining"
      ]
    }
  }
  return allBookings[id] || null
}

export default function TripDetailsPage({ params }) {
  const { id } = params
  const booking = getBookingById(id)
  const [activeTab, setActiveTab] = useState('property-details')
  const [isLoaded, setIsLoaded] = useState(false)
  const [tabContentLoaded, setTabContentLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState({})

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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">The booking you're looking for doesn't exist.</p>
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
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{booking.package}</h1>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin size={16} />
            <span>{booking.location}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className={`flex gap-2 h-96 mb-8 rounded-xl overflow-hidden transition-all duration-700 ease-out delay-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Main large image - left side */}
          <div className="flex-1 overflow-hidden rounded-l-xl">
            <img
              src={booking.image}
              alt={booking.package}
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out delay-400 ${
                isLoaded ? 'scale-100' : 'scale-110'
              }`}
            />
          </div>
          
          {/* Right side - 2x2 grid of smaller images */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <img
                src={booking.image}
                alt={booking.package}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={booking.image}
                alt={booking.package}
                className="w-full h-full object-cover rounded-tr-xl"
              />
            </div>
            <div>
              <img
                src={booking.image}
                alt={booking.package}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <img
                src={booking.image}
                alt={booking.package}
                className="w-full h-full object-cover rounded-br-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-br-xl">
                <button className="text-white font-medium">See all photos (24)</button>
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
                  <h2 className="text-2xl font-semibold mb-2">{booking.package} hosted by {booking.hotelName}</h2>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{booking.guests}</span>
                    <span>•</span>
                    <span>{booking.duration}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {[...Array(booking.hotelRating)].map((_, i) => (
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
                  <div className="font-semibold">{booking.id}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Confirmation</div>
                  <div className="font-semibold text-blue-600">{booking.confirmation}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Total Paid</div>
                  <div className="font-bold text-green-600">{booking.totalPrice}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className={`font-semibold ${booking.type === 'upcoming' ? 'text-green-600' : 'text-blue-600'}`}>
                    {booking.type === 'upcoming' ? 'Confirmed' : 'Completed'}
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
                  data-animate
                  className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                    isVisible.details ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                >
                  <div className="text-sm text-gray-500 mb-2">(01) Specifications</div>
                  <h1 className="text-5xl font-bold mb-4">{booking.package}</h1>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Experience the ultimate {booking.location} getaway with our carefully curated {booking.package.toLowerCase()} package. 
                      This exceptional journey combines luxury accommodation with authentic local experiences, 
                      creating memories that will last a lifetime.
                    </p>
                    <p>
                      Nestled in the heart of {booking.location}, our {booking.hotelName} offers breathtaking views and world-class amenities. 
                      From the moment you arrive, you'll be immersed in the local culture while enjoying premium comfort and service.
                    </p>
                    <p>
                      Our expertly crafted itinerary includes guided tours, authentic dining experiences, and plenty of free time 
                      to explore at your own pace. Whether you're seeking adventure or relaxation, this trip offers the perfect balance.
                    </p>
                  </div>
                </div>

                {/* What this trip includes */}
                <div
                  id="trip-includes"
                  data-animate
                  className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                    isVisible['trip-includes'] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-4">What this trip includes</h3>
                  
                  {/* Trip Features from booking data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {booking.features.map((feature, index) => (
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
                        <div className="font-semibold text-gray-900">{booking.duration}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Users size={24} className="text-purple-600" />
                        </div>
                        <div className="text-sm text-gray-500">Group Size</div>
                        <div className="font-semibold text-gray-900">{booking.guests}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Star size={24} className="text-yellow-600" />
                        </div>
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">{booking.hotelRating}/5 Stars</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Package Information */}
                {booking.details && (
                  <>
                    {/* Hotel Accommodation */}
                    <div
                      id="accommodation"
                      data-animate
                      className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                        isVisible.accommodation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                      }`}
                    >
                      <h2 className="text-2xl font-bold mb-6">{booking.details.accommodation.title}</h2>
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">{booking.details.accommodation.nights}</h3>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Amenities:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {booking.details.accommodation.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Transportation */}
                    <div
                      id="transportation"
                      data-animate
                      className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                        isVisible.transportation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                      }`}
                    >
                      <h2 className="text-2xl font-bold mb-6">{booking.details.transportation.title}</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{booking.details.transportation.flights}</h3>
                          <div className="grid md:grid-cols-2 gap-2">
                            {booking.details.transportation.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="text-blue-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Local Transportation:</h4>
                          <p className="text-gray-700">{booking.details.transportation.local}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tour Activities */}
                    <div
                      id="activities"
                      data-animate
                      className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                        isVisible.activities ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                      }`}
                    >
                      <h2 className="text-2xl font-bold mb-6">{booking.details.activities.title}</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Included Tours & Experiences:</h3>
                          <div className="space-y-2 mb-4">
                            {booking.details.activities.tours.map((tour, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="text-purple-500 flex-shrink-0 mt-1" size={16} />
                                <span className="text-gray-700">{tour}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Tour Amenities:</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {booking.details.activities.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="text-orange-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Inclusions */}
                    <div
                      id="inclusions"
                      data-animate
                      className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                        isVisible.inclusions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                      }`}
                    >
                      <h2 className="text-2xl font-bold mb-6">{booking.details.inclusions.title}</h2>
                      <div className="space-y-2">
                        {booking.details.inclusions.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="text-red-500 flex-shrink-0 mt-1" size={16} />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'daily-itinerary' && booking.type === 'upcoming' && (
              <div 
                id="daily-itinerary"
                data-animate
                className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                  (isVisible['daily-itinerary'] && activeTab === 'daily-itinerary') || (activeTab === 'daily-itinerary' && tabContentLoaded) 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
              >
                <h2 className="text-2xl font-bold mb-6">Daily Itinerary</h2>
                <div className="space-y-6">
                  {booking.itinerary.map((day, index) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{day.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'daily-itinerary' && booking.type === 'past' && (
              <div 
                id="trip-highlights"
                data-animate
                className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                  (isVisible['trip-highlights'] && activeTab === 'daily-itinerary') || (activeTab === 'daily-itinerary' && tabContentLoaded) 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
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
                data-animate
                className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                  (isVisible.reviews && activeTab === 'reviews') || (activeTab === 'reviews' && tabContentLoaded) 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
                }`}
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
                  data-animate
                  className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                    (isVisible.messages && activeTab === 'messages') || (activeTab === 'messages' && tabContentLoaded) 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-10"
                  }`}
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
            <div className={`sticky top-20 border border-gray-300 rounded-xl p-6 bg-white transition-all duration-700 ease-out delay-600 ${
              isLoaded ? 'opacity-100 translate-x-0 shadow-lg' : 'opacity-0 translate-x-8 shadow-none'
            }`}>
              {/* Pricing Header */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-semibold text-gray-900">{booking.totalPrice}</span>
                <span className="text-gray-600 font-normal">/night</span>
              </div>
              
              {/* Total before taxes */}
              <div className="text-gray-600 mb-4">Total before taxes</div>
              
              {/* Date and Guest Selection */}
              <div className="border border-gray-300 rounded-lg mb-4">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="p-4 border-r border-gray-300">
                    <div className="text-xs font-semibold text-gray-900 mb-1">CHECK-IN</div>
                    <div className="text-gray-900">{booking.type === 'upcoming' ? booking.checkIn : booking.date}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-semibold text-gray-900 mb-1">CHECKOUT</div>
                    <div className="text-gray-900">{booking.type === 'upcoming' ? booking.checkOut : booking.date}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold text-gray-900 mb-1">GUESTS</div>
                  <div className="text-gray-900">{booking.guests}</div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">5% day discount</span>
                  <span className="text-green-600 font-medium">-$217</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Refundable deposit</span>
                  <span className="text-gray-900 font-medium">$500</span>
                </div>
              </div>

              {/* Total Section */}
              <div className="border-t border-gray-300 pt-4 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-900 font-semibold text-lg">Total Price Due</span>
                  <span className="text-gray-900 font-semibold text-xl">{booking.totalPrice}</span>
                </div>
                <div className="text-gray-600">Deductible by Our 14th</div>
              </div>

              {/* Action Buttons */}
              <div className="mb-4">
                {booking.type === 'upcoming' ? (
                  <Link href={`/dashboard/trip/${booking.id}/payment`}>
                    <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 transform">
                      Continue to checkout
                    </button>
                  </Link>
                ) : (
                  <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 transform">
                    Book Again
                  </button>
                )}
              </div>

              {/* Contact Host Section */}
              <div className="border-t border-gray-300 pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Host</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">24/7 Support</div>
                      <div className="font-medium text-gray-900">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-600 text-sm">Email Support</div>
                      <div className="font-medium text-gray-900">support@xplorex.com</div>
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