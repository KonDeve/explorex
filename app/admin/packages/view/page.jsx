"use client"

import { ArrowLeft, MapPin, Calendar, Users, Star, DollarSign, Edit, Trash2, Loader2, Check, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPackageById, deletePackage } from "@/lib/packages"

export default function AdminPackageView() {
  const router = useRouter()
  const [packageId, setPackageId] = useState(null)
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get package ID from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewId = sessionStorage.getItem('viewPackageId')
      if (viewId) {
        setPackageId(viewId)
      } else {
        setError('No package selected')
        setLoading(false)
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('viewPackageId')
      }
    }
  }, [])

  // Fetch package data when ID is available
  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) return
      
      try {
        setLoading(true)
        const data = await getPackageById(packageId)
        setPackageData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching package:', err)
        setError('Package not found')
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [packageId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return
    }

    try {
      await deletePackage(packageId)
      sessionStorage.removeItem('viewPackageId')
      router.push('/admin/packages')
    } catch (err) {
      console.error('Error deleting package:', err)
      alert('Failed to delete package. Please try again.')
    }
  }

  const handleEdit = () => {
    sessionStorage.setItem('editPackageId', packageId)
    router.push('/admin/packages/add')
  }

  const getDetailsByType = (type) => {
    if (!packageData?.details) return null
    return packageData.details.find(d => d.section_type === type)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading package details...</span>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Package not found'}</p>
          <button
            onClick={() => router.push('/admin/packages')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block"
          >
            Back to Packages
          </button>
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
    <div className="min-h-screen bg-white">
      {/* Minimal Header with Back and Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin/packages')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Previous Page</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Edit Package"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Delete Package"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        {pkg.images && pkg.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-6">
            {/* Main large image */}
            <div className="col-span-1 row-span-2">
              <img
                src={pkg.images[0]}
                alt={pkg.title}
                className="w-full h-full object-cover"
                style={{ height: '400px' }}
              />
            </div>
            {/* Smaller images grid */}
            {pkg.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`${pkg.title} - ${index + 2}`}
                  className="w-full h-full object-cover"
                  style={{ height: '198px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin size={14} />
                <span>{pkg.location}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pkg.title}</h1>
            </div>

          {/* Divider */}
          <hr className="border-t border-gray-200" />

          {/* Hotel Accommodation */}
          {accommodationDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hotel Accommodation</h2>
              {accommodationDetails.description && (
                <p className="text-gray-700 mb-3">{accommodationDetails.description}</p>
              )}
              {accommodationDetails.amenities && accommodationDetails.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Amenities:</p>
                  <ul className="space-y-2">
                    {accommodationDetails.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Transportation */}
          {transportationDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transportation</h2>
              {transportationDetails.description && (
                <p className="text-gray-700 mb-3">{transportationDetails.description}</p>
              )}
              {transportationDetails.amenities && transportationDetails.amenities.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {transportationDetails.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              )}
              {transportationDetails.local && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Local Transportation:</p>
                  <p className="text-sm text-gray-600">{transportationDetails.local}</p>
                </div>
              )}
            </div>
          )}

          {/* Tour Activities */}
          {activitiesDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tour Activities</h2>
              {activitiesDetails.description && (
                <p className="text-gray-700 mb-3">{activitiesDetails.description}</p>
              )}
              {activitiesDetails.tours && activitiesDetails.tours.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Included Tours & Experiences:</p>
                  <ul className="space-y-2">
                    {activitiesDetails.tours.map((tour, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{tour}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activitiesDetails.amenities && activitiesDetails.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Tour Amenities:</p>
                  <ul className="space-y-2">
                    {activitiesDetails.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Other Inclusions */}
          {inclusionsDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Other Inclusions</h2>
              {inclusionsDetails.description && (
                <p className="text-gray-700 mb-3">{inclusionsDetails.description}</p>
              )}
              {inclusionsDetails.items && inclusionsDetails.items.length > 0 && (
                <ul className="space-y-2">
                  {inclusionsDetails.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Trip Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h3>
            
            {/* Duration */}
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-blue-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900">{pkg.duration}</p>
              </div>
            </div>

            {/* Group Size */}
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Group Size</p>
                <p className="text-sm font-semibold text-gray-900">{pkg.people}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-sm font-semibold text-gray-900">{pkg.rating || 0}/5 Stars</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs text-gray-500">Starting price</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {pkg.price || `$${pkg.price_value?.toLocaleString()}`}
              </div>
              <p className="text-xs text-gray-500">per person</p>
            </div>

            {/* Status & Tags */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    pkg.availability === "Available"
                      ? "bg-green-100 text-green-700"
                      : pkg.availability === "Limited"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {pkg.availability}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Category:</span>
                <span className="text-xs font-medium text-gray-900">{pkg.category}</span>
              </div>
              {pkg.hero_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Hero Type:</span>
                  <span className="text-xs font-medium text-gray-900 capitalize">{pkg.hero_type}</span>
                </div>
              )}
              {(pkg.popular || pkg.featured) && (
                <div className="flex gap-2 pt-2">
                  {pkg.popular && <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">Popular</span>}
                  {pkg.featured && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">Featured</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Additional Sections - Full Width Below Main Content */}
        <div className="space-y-8 mt-8">
          {/* Highlights */}
          {pkg.highlights && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Highlights</h2>
              <p className="text-gray-700 leading-relaxed">{pkg.highlights}</p>
            </div>
          )}

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {pkg.itinerary && pkg.itinerary.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Day by Day Itinerary</h2>
            <div className="space-y-3">
              {pkg.itinerary.map((day, index) => (
                <div key={index} className="border-l-3 border-blue-500 bg-gray-50 rounded-r-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {day.day_number}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{day.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{day.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Package Metadata</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Package ID:</span>
              <p className="font-mono text-gray-900 mt-1 text-xs">{pkg.id}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Created:</span>
              <p className="text-gray-700 mt-1">{new Date(pkg.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Last Updated:</span>
              <p className="text-gray-700 mt-1">{new Date(pkg.updated_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Detail Sections:</span>
              <p className="text-gray-700 mt-1">{pkg.details?.length || 0} sections</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
