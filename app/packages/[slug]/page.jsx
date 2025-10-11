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
  const transportationDetails = getDetailsByType('transportation')
  const inclusionsDetails = pkg.details?.filter(d => d.section_type === 'inclusions') || []
  const exclusionsDetails = getDetailsByType('exclusions')

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
              <h1 className="text-4xl font-bold mb-3">{pkg.title}</h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                </div>
              </div>

              {pkg.description && (
                <p className="text-gray-600 text-base leading-relaxed mb-6">{pkg.description}</p>
              )}
            </div>

            {/* Deal Periods - Minimal Design */}
            {pkg.deals && pkg.deals.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Available Deal Periods</h2>
                <div className="space-y-2">
                  {pkg.deals.map((deal, index) => (
                    <div key={index} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(deal.deal_start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                            {' - '}
                            {new Date(deal.deal_end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Users size={12} />
                            <span>{deal.slots_available - (deal.slots_booked || 0)} slots available</span>
                            {deal.slots_booked > 0 && (
                              <span className="text-gray-400">• {deal.slots_booked} booked</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-gray-900">
                          ₱{Number(deal.deal_price).toLocaleString()}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {deal.is_active ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Package Details Sections */}
            {!transportationDetails && inclusionsDetails.length === 0 && !exclusionsDetails && (
              <div className="py-8 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-2">
                    <strong>Package details are being finalized.</strong>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Full details about transportation, inclusions, and exclusions will be available soon.
                  </p>
                </div>
              </div>
            )}
            
            {/* Transportation */}
            {transportationDetails && (
              <div className="py-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Transportation</h2>
                
                {transportationDetails.local && (
                  <div className="mb-6 bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Local Transportation:</h4>
                    <p className="text-gray-700">{transportationDetails.local}</p>
                  </div>
                )}
                
                {transportationDetails.amenities && transportationDetails.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Amenities & Features:</h4>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                      {transportationDetails.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inclusions */}
            {inclusionsDetails.length > 0 && (
              <div className="py-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Inclusions</h2>
                <div className="space-y-6">
                  {inclusionsDetails.map((section, idx) => (
                    <div key={idx}>
                      {section.title && section.title !== 'Inclusions' && inclusionsDetails.length > 1 && (
                        <h4 className="font-semibold text-gray-900 mb-3">{section.title}</h4>
                      )}
                      {section.items && section.items.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                          {section.items.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions */}
            {exclusionsDetails && exclusionsDetails.items && exclusionsDetails.items.length > 0 && (
              <div className="py-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Exclusions</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {exclusionsDetails.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold">✕</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div className="py-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Day {day.day_number}: {day.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing and Booking */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              {/* Price Box */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Price Range</div>
                {pkg.deals && pkg.deals.length > 0 ? (
                  <div>
                    {pkg.deals.length === 1 ? (
                      <div className="text-3xl font-bold text-gray-900">
                        ₱{Number(pkg.deals[0].deal_price).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">
                        ₱{Math.min(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()} - 
                        ₱{Math.max(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {pkg.deals.length} deal period{pkg.deals.length > 1 ? 's' : ''} available
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">₱0</div>
                )}
              </div>

              {/* Booking Button */}
              {authLoading ? (
                <div className="w-full bg-gray-200 py-3 rounded-lg mb-4 animate-pulse h-[48px]"></div>
              ) : isAuthenticated ? (
                <Link
                  href={`/packages/${pkg.slug}/book`}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-center block mb-3"
                >
                  Book This Package
                </Link>
              ) : (
                <div className="mb-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 mb-2"
                  >
                    <Lock size={18} />
                    Login to Book
                  </button>
                  <p className="text-gray-500 text-xs text-center">
                    Please log in or sign up to book this package
                  </p>
                </div>
              )}

              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">
                Contact Us
              </button>

              {/* Package Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium text-gray-900">
                    {pkg.location}{pkg.country ? `, ${pkg.country}` : ''}
                  </div>
                </div>
                {pkg.category && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <div className="font-medium text-gray-900">{pkg.category}</div>
                  </div>
                )}
                {pkg.availability && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Availability</div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      pkg.availability === 'Available' 
                        ? 'bg-green-100 text-green-700'
                        : pkg.availability === 'Limited'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {pkg.availability}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Need help?</div>
                <div className="font-semibold text-gray-900">Call us: +1 (555) 123-4567</div>
              </div>
            </div>

            {/* Package Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Package Information</h3>
              <div className="space-y-3 text-sm">
                {pkg.deals && pkg.deals.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deal Periods:</span>
                    <span className="font-medium text-gray-900">{pkg.deals.length}</span>
                  </div>
                )}
                {pkg.itinerary && pkg.itinerary.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Itinerary Days:</span>
                    <span className="font-medium text-gray-900">{pkg.itinerary.length}</span>
                  </div>
                )}
                {pkg.images && pkg.images.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium text-gray-900">{pkg.images.length}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Package ID:</span>
                  <span className="font-mono text-xs text-gray-900">{pkg.id?.substring(0, 8)}</span>
                </div>
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
