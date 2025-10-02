"use client"

import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Star, Check, Lock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"

export default function PackageDetailPage({ params }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

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

  const packages = {
    1: {
      id: 1,
      title: "Santorini Paradise",
      location: "Greece",
      duration: "7 Days",
      people: "2-4 People",
      price: "$2,499",
      rating: 4.9,
      reviews: 342,
      images: [
        "/santorini-blue-domes-greece.jpg",
        "/santorini-greece-infinity-pool-ocean.jpg",
        "/white-greek-buildings-blue-doors.jpg",
      ],
      features: ["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"],
      leadArchitect: "Maria Papadopoulos",
      tourOperator: "Aegean Adventures",
      area: "Cyclades Islands",
      description:
        "Experience the magic of Santorini with its iconic blue-domed churches, stunning sunsets, and pristine beaches. This comprehensive package includes luxury accommodation, guided tours, and authentic Greek dining experiences.",
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
      }
    },
    2: {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      people: "2 People",
      price: "$1,899",
      rating: 4.8,
      reviews: 256,
      images: ["/venice-italy-canal-buildings.jpg", "/santorini-blue-domes-greece.jpg"],
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"],
      leadArchitect: "Giovanni Rossi",
      tourOperator: "Italian Escapes",
      area: "Veneto Region",
      description:
        "Discover the romantic charm of Venice with its winding canals, historic architecture, and world-class art. Perfect for couples seeking an unforgettable Italian getaway.",
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
      }
    },
    3: {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      people: "2-6 People",
      price: "$2,799",
      rating: 5.0,
      reviews: 189,
      images: ["/mountain-lake-sunset-alps.jpg", "/tropical-beach-palm-trees-resort.jpg"],
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"],
      leadArchitect: "Hans Mueller",
      tourOperator: "Alpine Explorers",
      area: "Swiss Alps",
      description:
        "Embark on an unforgettable alpine adventure with breathtaking mountain views, pristine lakes, and world-class skiing. Perfect for nature lovers and adventure seekers.",
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
      }
    },
    4: {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      people: "2 People",
      price: "$3,299",
      rating: 4.9,
      reviews: 421,
      images: ["/tropical-beach-palm-trees-resort.jpg", "/santorini-greece-infinity-pool-ocean.jpg"],
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"],
      leadArchitect: "Ahmed Hassan",
      tourOperator: "Island Paradise Tours",
      area: "Maldives Atolls",
      description:
        "Escape to paradise with crystal-clear waters, white sand beaches, and luxury overwater villas. The ultimate tropical getaway for relaxation and romance.",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "7 nights stay at Maldives Paradise Resort (Overwater Villa)",
          amenities: ["Free Wi-Fi", "Private deck with ocean access", "All meals and beverages", "Butler service", "Spa treatments", "Water sports equipment"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights with seaplane transfer to resort",
          amenities: ["Business class upgrade available", "Champagne service", "Priority check-in", "Scenic seaplane flight"],
          local: "Resort boat transfers and island hopping excursions included"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Snorkeling and diving expeditions", "Dolphin watching cruise", "Sunset fishing trip", "Island hopping to local villages", "Couples spa treatments and beach dining"],
          amenities: ["PADI certified dive instructors", "All water sports equipment", "Underwater photography", "Traditional Maldivian cultural show", "Private beach access"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel insurance for 8 days", "Underwater camera rental", "$200 spa credit", "Romantic beachside dinner setup", "24/7 resort concierge service"]
        }
      }
    },
    5: {
      id: 5,
      title: "Greek Islands Tour",
      location: "Greece",
      duration: "10 Days",
      people: "4-8 People",
      price: "$2,199",
      rating: 4.7,
      reviews: 298,
      images: ["/white-greek-buildings-blue-doors.jpg", "/santorini-blue-domes-greece.jpg"],
      features: ["Island Hopping", "Hotels", "Ferry Tickets", "Local Guide"],
      leadArchitect: "Dimitris Kostas",
      tourOperator: "Hellenic Voyages",
      area: "Greek Islands",
      description:
        "Explore multiple Greek islands on this comprehensive tour. Experience diverse landscapes, ancient history, and authentic Greek culture across the Aegean Sea.",
      highlights: [
        "Visit 5 different Greek islands",
        "Explore ancient archaeological sites",
        "Traditional Greek taverna experiences",
        "Beach time on pristine shores",
        "Local market visits",
      ],
      included: [
        "All ferry transfers",
        "10 nights accommodation",
        "Daily breakfast",
        "Island tours",
        "Local guide",
        "Some lunches and dinners",
      ],
    },
    6: {
      id: 6,
      title: "Mediterranean Cruise",
      location: "Multiple",
      duration: "12 Days",
      people: "2-4 People",
      price: "$3,899",
      rating: 4.8,
      reviews: 512,
      images: ["/santorini-greece-infinity-pool-ocean.jpg", "/venice-italy-canal-buildings.jpg"],
      features: ["Luxury Cruise", "All Inclusive", "Shore Excursions", "Entertainment"],
      leadArchitect: "Captain Marco Bellini",
      tourOperator: "Mediterranean Cruises Ltd",
      area: "Mediterranean Sea",
      description:
        "Sail the Mediterranean in luxury, visiting iconic ports across multiple countries. Enjoy world-class dining, entertainment, and shore excursions.",
      details: {
        accommodation: {
          title: "Cruise Accommodation",
          nights: "11 nights aboard luxury cruise ship (Balcony Stateroom)",
          amenities: ["Private balcony with ocean views", "24-hour room service", "All meals and beverages included", "Nightly turndown service", "Concierge services", "Premium bedding and amenities"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Barcelona with cruise port transfers",
          amenities: ["Premium economy flights", "Priority boarding", "Airport lounge access", "Cruise terminal transfers"],
          local: "Luxury cruise ship with stops in Barcelona, Monaco, Rome, Santorini, Mykonos, and Naples"
        },
        activities: {
          title: "Shore Excursions & Activities",
          tours: ["Guided tours in each port city", "Vatican Museums and Sistine Chapel (Rome)", "Monte Carlo casino and palace visit", "Santorini wine tasting and sunset viewing", "Pompeii archaeological site exploration"],
          amenities: ["Professional shore excursion guides", "All entrance fees included", "Onboard entertainment and shows", "Multiple dining venues", "Spa and fitness facilities"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive cruise and travel insurance for 12 days", "Onboard WiFi package", "$300 onboard credit for spa and shopping", "Captain's gala dinner", "24/7 guest services and medical facilities"]
        }
      }
    },
  }

  const pkg = packages[params.id] || packages[1]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pkg.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + pkg.images.length) % pkg.images.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="packages" />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/packages" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <ArrowLeft size={20} />
          <span className="font-medium">Specifications</span>
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 pb-8 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Image */}
          <div className="md:col-span-2 relative h-[500px] rounded-2xl overflow-hidden">
            <img
              src={pkg.images[currentImageIndex] || "/placeholder.svg"}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            {pkg.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {pkg.images.length}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="space-y-4">
            {pkg.images.slice(0, 3).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-full h-[158px] rounded-xl overflow-hidden transition ${
                  currentImageIndex === index ? "ring-4 ring-blue-500" : ""
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* See All Button */}
        {pkg.images.length > 3 && (
          <div className="mt-4 text-right">
            <button className="text-blue-500 font-semibold hover:underline flex items-center gap-2 ml-auto">
              See All →
            </button>
          </div>
        )}
      </section>

      {/* Package Details */}
      <section
        id="details"
        data-animate
        className={`container mx-auto px-4 py-8 transition-all duration-700 ${
          isVisible.details ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="text-sm text-gray-500 mb-2">(01) Specifications</div>
              <h1 className="text-5xl font-bold mb-4">{pkg.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{pkg.description}</p>

              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{pkg.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{pkg.people}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">{pkg.rating}</span>
                  <span className="text-sm">({pkg.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Detailed Package Information */}
            {pkg.details && (
              <>
                {/* Hotel Accommodation */}
                <div
                  id="accommodation"
                  data-animate
                  className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                    isVisible.accommodation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                >
                  <h2 className="text-2xl font-bold mb-6">{pkg.details.accommodation.title}</h2>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">{pkg.details.accommodation.nights}</h3>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Amenities:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {pkg.details.accommodation.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="text-green-500 flex-shrink-0" size={16} />
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
                  <h2 className="text-2xl font-bold mb-6">{pkg.details.transportation.title}</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{pkg.details.transportation.flights}</h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {pkg.details.transportation.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="text-blue-500 flex-shrink-0" size={16} />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Local Transportation:</h4>
                      <p className="text-gray-700">{pkg.details.transportation.local}</p>
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
                  <h2 className="text-2xl font-bold mb-6">{pkg.details.activities.title}</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Included Tours & Experiences:</h3>
                      <div className="space-y-2 mb-4">
                        {pkg.details.activities.tours.map((tour, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="text-purple-500 flex-shrink-0 mt-1" size={16} />
                            <span className="text-gray-700">{tour}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Tour Amenities:</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {pkg.details.activities.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="text-orange-500 flex-shrink-0" size={16} />
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
                  <h2 className="text-2xl font-bold mb-6">{pkg.details.inclusions.title}</h2>
                  <div className="space-y-2">
                    {pkg.details.inclusions.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="text-red-500 flex-shrink-0 mt-1" size={16} />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Features Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-none border border-gray-200">
              <h3 className="font-bold text-lg mb-4">What this trip includes</h3>
              <div className="space-y-3">
                {pkg.features && pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Trip Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-lg mb-4">Trip Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-semibold text-gray-900">{pkg.duration}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Group Size</div>
                        <div className="font-semibold text-gray-900">{pkg.people}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">{pkg.rating}/5 Stars</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Booking */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white sticky top-4">
              <div className="mb-6">
                <div className="text-blue-100 text-sm mb-1">Starting from</div>
                <div className="text-4xl font-bold">{pkg.price}</div>
                <div className="text-blue-100 text-sm">per person</div>
              </div>

              {loading ? (
                <div className="w-full bg-white/20 py-3 rounded-lg mb-4 animate-pulse h-[48px]"></div>
              ) : isAuthenticated ? (
                <Link
                  href={`/packages/${params.id}/book`}
                  className="w-full bg-white text-blue-500 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg mb-4 block text-center"
                >
                  Book This Package
                </Link>
              ) : (
                <div className="mb-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full bg-white text-blue-500 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg mb-3 flex items-center justify-center gap-2"
                  >
                    <Lock size={18} />
                    Login to Book
                  </button>
                  <p className="text-blue-100 text-xs text-center">
                    Please log in or sign up to book this package
                  </p>
                </div>
              )}

              <button className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold">
                Contact Us
              </button>

              <div className="mt-6 pt-6 border-t border-blue-400">
                <div className="text-sm text-blue-100 mb-2">Need help?</div>
                <div className="font-semibold">Call us: +1 (555) 123-4567</div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
