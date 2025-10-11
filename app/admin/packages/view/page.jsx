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
  // NEW SCHEMA: Updated section types
  const transportationDetails = getDetailsByType('transportation')
  const inclusionsDetails = pkg.details?.filter(d => d.section_type === 'inclusions') || []
  const exclusionsDetails = getDetailsByType('exclusions')

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
                <span>{pkg.location}, {pkg.country}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pkg.title}</h1>
              {pkg.description && (
                <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
              )}
            </div>

          {/* Divider */}
          <hr className="border-t border-gray-200" />

          {/* Deal Periods - NEW SCHEMA (Minimal Design) */}
          {pkg.deals && pkg.deals.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Deal Periods</h2>
              <div className="space-y-2">
                {pkg.deals.map((deal, index) => (
                  <div key={index} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group">
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
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <hr className="border-t border-gray-200" />

          {/* Transportation - NEW SCHEMA (simplified) */}
          {transportationDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transportation</h2>
              {transportationDetails.local && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Local Transportation:</p>
                  <p className="text-sm text-gray-700">{transportationDetails.local}</p>
                </div>
              )}
              {transportationDetails.amenities && transportationDetails.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Amenities & Features:</p>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {transportationDetails.amenities.map((amenity, index) => (
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

          {/* Inclusions - NEW SCHEMA (consolidated from accommodation) */}
          {inclusionsDetails.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Inclusions</h2>
              <div className="space-y-4">
                {inclusionsDetails.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {section.title && section.title !== 'Inclusions' && (
                      <h3 className="text-base font-semibold text-gray-800 mb-2">{section.title}</h3>
                    )}
                    {section.items && section.items.length > 0 && (
                      <ul className="grid md:grid-cols-2 gap-2">
                        {section.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exclusions - NEW SCHEMA (consolidated from activities) */}
          {exclusionsDetails && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Exclusions</h2>
              {exclusionsDetails.items && exclusionsDetails.items.length > 0 && (
                <ul className="grid md:grid-cols-2 gap-2">
                  {exclusionsDetails.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 flex-shrink-0 mt-0.5">✕</span>
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
            
            {/* Price Range from Deals - NEW SCHEMA */}
            {pkg.deals && pkg.deals.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Price Range</p>
                {pkg.deals.length === 1 ? (
                  <div className="text-3xl font-bold text-blue-600">
                    ₱{Number(pkg.deals[0].deal_price).toLocaleString()}
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      ₱{Math.min(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      to ₱{Math.max(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}
                    </div>
                  </>
                )}
                <p className="text-xs text-gray-500 mt-2">{pkg.deals.length} deal period{pkg.deals.length > 1 ? 's' : ''} available</p>
              </div>
            )}

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
          {/* Itinerary */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Day by Day Itinerary</h2>
              <div className="space-y-3">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4 hover:bg-blue-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {day.day_number}
                      </div>
                      <div className="flex-1">
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
              <p className="font-mono text-gray-900 mt-1 text-xs break-all">{pkg.id}</p>
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
              <span className="text-gray-500 text-xs">Deal Periods:</span>
              <p className="text-gray-700 mt-1">{pkg.deals?.length || 0} period{pkg.deals?.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Detail Sections:</span>
              <p className="text-gray-700 mt-1">{pkg.details?.length || 0} section{pkg.details?.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Itinerary Days:</span>
              <p className="text-gray-700 mt-1">{pkg.itinerary?.length || 0} day{pkg.itinerary?.length !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Images:</span>
              <p className="text-gray-700 mt-1">{pkg.images?.length || 0} image{pkg.images?.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
