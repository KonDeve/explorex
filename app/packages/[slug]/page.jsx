"use client"

import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Star, Check, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { getPackageBySlug } from "@/lib/packages"

export default function PackageDetailPage({ params }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState({
    details: true,
    gallery: true,
    accommodation: true,
    transportation: true,
    activities: true,
    inclusions: true,
    itinerary: true,
    booking: true
  })
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch package data by slug
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true)
        console.log('Fetching package with slug:', params.slug)
        const data = await getPackageBySlug(params.slug)
        console.log('Package data received:', data)
        setPackageData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching package:', err)
        console.error('Error details:', err.message)
        setError(`Package not found: ${err.message}`)
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

  // Helper function to get package details by section type
  const getDetailsByType = (type) => {
    if (!packageData?.details) return null
    return packageData.details.find(d => d.section_type === type)
  }

  const nextImage = () => {
    if (!packageData?.images || packageData.images.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % packageData.images.length)
  }

  const prevImage = () => {
    if (!packageData?.images || packageData.images.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + packageData.images.length) % packageData.images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="packages" />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading package details...</span>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
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

  const pkg = packageData
  const accommodationDetails = getDetailsByType('accommodation')
  const transportationDetails = getDetailsByType('transportation')
  const activitiesDetails = getDetailsByType('activities')
  const inclusionsDetails = getDetailsByType('inclusions')

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
                  <span>{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{pkg.people || 2} People</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">{pkg.rating || 0}</span>
                  <span className="text-sm">({pkg.reviews_count || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Detailed Package Information */}
            {!accommodationDetails && !transportationDetails && !activitiesDetails && !inclusionsDetails && (
              <div className="py-8 border-b border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-2">
                    <strong>Package details are being finalized.</strong>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Full details about accommodation, transportation, activities, and inclusions will be available soon.
                  </p>
                </div>
              </div>
            )}
            
            {/* Hotel Accommodation */}
            {accommodationDetails && (
              <div
                id="accommodation"
                data-animate
                className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                  isVisible.accommodation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <h2 className="text-2xl font-bold mb-6">{accommodationDetails.title}</h2>
                {accommodationDetails.description && (
                  <p className="text-gray-600 mb-4">{accommodationDetails.description}</p>
                )}
                {accommodationDetails.nights_info && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">{accommodationDetails.nights_info}</h3>
                  </div>
                )}
                {accommodationDetails.amenities && accommodationDetails.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Amenities:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {accommodationDetails.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="text-green-500 flex-shrink-0" size={16} />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

                {/* Transportation */}
                {transportationDetails && (
                  <div
                    id="transportation"
                    data-animate
                    className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                      isVisible.transportation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                  >
                    <h2 className="text-2xl font-bold mb-6">{transportationDetails.title}</h2>
                    {transportationDetails.description && (
                      <p className="text-gray-600 mb-4">{transportationDetails.description}</p>
                    )}
                    <div className="space-y-4">
                      {transportationDetails.flights_info && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{transportationDetails.flights_info}</h3>
                        </div>
                      )}
                      {transportationDetails.amenities && transportationDetails.amenities.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-2">
                          {transportationDetails.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="text-blue-500 flex-shrink-0" size={16} />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {transportationDetails.local_transport && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Local Transportation:</h4>
                          <p className="text-gray-700">{transportationDetails.local_transport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tour Activities */}
                {activitiesDetails && (
                  <div
                    id="activities"
                    data-animate
                    className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                      isVisible.activities ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                  >
                    <h2 className="text-2xl font-bold mb-6">{activitiesDetails.title}</h2>
                    {activitiesDetails.description && (
                      <p className="text-gray-600 mb-4">{activitiesDetails.description}</p>
                    )}
                    <div className="space-y-4">
                      {activitiesDetails.tours && activitiesDetails.tours.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Included Tours & Experiences:</h3>
                          <div className="space-y-2 mb-4">
                            {activitiesDetails.tours.map((tour, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Check className="text-purple-500 flex-shrink-0 mt-1" size={16} />
                                <span className="text-gray-700">{tour}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activitiesDetails.amenities && activitiesDetails.amenities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Tour Amenities:</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {activitiesDetails.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Check className="text-orange-500 flex-shrink-0" size={16} />
                                <span className="text-gray-700">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Inclusions */}
                {inclusionsDetails && (
                  <div
                    id="inclusions"
                    data-animate
                    className={`py-8 border-b border-gray-200 transition-all duration-700 ${
                      isVisible.inclusions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                  >
                    <h2 className="text-2xl font-bold mb-6">{inclusionsDetails.title}</h2>
                    {inclusionsDetails.description && (
                      <p className="text-gray-600 mb-4">{inclusionsDetails.description}</p>
                    )}
                    {inclusionsDetails.items && inclusionsDetails.items.length > 0 && (
                      <div className="space-y-2">
                        {inclusionsDetails.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="text-red-500 flex-shrink-0 mt-1" size={16} />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                        <div className="font-semibold text-gray-900">{pkg.people || 2} People</div>
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
                        <div className="font-semibold text-gray-900">{pkg.rating || 0}/5 Stars</div>
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
                <div className="text-4xl font-bold">{pkg.price || `₱${pkg.price_value?.toLocaleString()}`}</div>
              </div>

              {authLoading ? (
                <div className="w-full bg-white/20 py-3 rounded-lg mb-4 animate-pulse h-[48px]"></div>
              ) : isAuthenticated ? (
                <Link
                  href={`/packages/${pkg.slug}/book`}
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
