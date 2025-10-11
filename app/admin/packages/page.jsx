"use client"

import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Users, DollarSign, Search, Grid, List, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllPackages, deletePackage } from "@/lib/packages"

export default function AdminPackages() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const data = await getAllPackages()
        setPackages(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError('Failed to load packages')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handleCreatePackage = () => {
    router.push('/admin/packages/add')
  }

  const handleEditPackage = (pkg) => {
    // Store the package ID in sessionStorage for security
    sessionStorage.setItem('editPackageId', pkg.id)
    router.push('/admin/packages/add')
  }

  const handleDeletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return
    }

    try {
      await deletePackage(packageId)
      // Refresh the packages list
      setPackages(packages.filter(pkg => pkg.id !== packageId))
    } catch (err) {
      console.error('Error deleting package:', err)
      alert('Failed to delete package. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Packages</h1>
          <p className="text-gray-600">Manage your travel packages and offerings</p>
        </div>
        <button
          onClick={handleCreatePackage}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add New Package
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            <option>All Locations</option>
            <option>Greece</option>
            <option>Italy</option>
            <option>Switzerland</option>
            <option>Maldives</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            <option>All Status</option>
            <option>Available</option>
            <option>Limited</option>
            <option>Sold Out</option>
          </select>
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading packages...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No packages found. Create your first package to get started!</p>
          <button
            onClick={handleCreatePackage}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Package
          </button>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View - Modern Card Layout
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/placeholder.svg"}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      pkg.availability === "Available"
                        ? "bg-green-500/90 text-white"
                        : pkg.availability === "Limited"
                          ? "bg-yellow-500/90 text-white"
                          : "bg-red-500/90 text-white"
                    }`}
                  >
                    {pkg.availability}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {pkg.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-1">{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                </div>

                {/* Category Badge */}
                {pkg.category && (
                  <div className="mb-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      pkg.category === 'International' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {pkg.category}
                    </span>
                  </div>
                )}

                {/* Deal Info */}
                {pkg.deals && pkg.deals.length > 0 && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{pkg.deals.length} deal period{pkg.deals.length > 1 ? 's' : ''} available</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">
                        {pkg.deals.length === 1 
                          ? `₱${Number(pkg.deals[0].deal_price).toLocaleString()}`
                          : `₱${Math.min(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}`
                        }
                      </span>
                      {pkg.deals.length > 1 && (
                        <span className="text-sm text-gray-500">
                          - ₱{Math.max(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('viewPackageId', pkg.id)
                      router.push('/admin/packages/view')
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition"
                    title="Delete Package"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Package</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Location</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Price Range</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Deals</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/placeholder.svg"}
                          alt={pkg.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="font-semibold text-gray-900">{pkg.title}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {pkg.location}{pkg.country ? `, ${pkg.country}` : ''}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {pkg.category && (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.category === 'International' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {pkg.category}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                      {pkg.deals && pkg.deals.length > 0 ? (
                        pkg.deals.length === 1 
                          ? `₱${Number(pkg.deals[0].deal_price).toLocaleString()}`
                          : `₱${Math.min(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()} - ₱${Math.max(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}`
                      ) : (
                        <span className="text-gray-400 font-normal">No deals</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {pkg.deals && pkg.deals.length > 0 ? (
                        <span>{pkg.deals.length} period{pkg.deals.length > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          pkg.availability === "Available"
                            ? "bg-green-100 text-green-700"
                            : pkg.availability === "Limited"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pkg.availability}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            sessionStorage.setItem('viewPackageId', pkg.id)
                            router.push('/admin/packages/view')
                          }}
                          className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
