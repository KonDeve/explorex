"use client"

import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Users, DollarSign, Search, Grid, List } from "lucide-react"
import { useState } from "react"
import PackageModal from "@/components/package-modal"

export default function AdminPackages() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid") // Added view mode toggle
  const [isModalOpen, setIsModalOpen] = useState(false) // Added modal state
  const [editingPackage, setEditingPackage] = useState(null) // Track package being edited

  const packages = [
    {
      id: 1,
      title: "Santorini Paradise",
      location: "Greece",
      duration: "7 Days",
      price: 2499,
      availability: "Available",
      bookings: 45,
      image: "/santorini-blue-domes-greece.jpg",
    },
    {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      price: 1899,
      availability: "Available",
      bookings: 28,
      image: "/venice-italy-canal-buildings.jpg",
    },
    {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      price: 2799,
      availability: "Limited",
      bookings: 32,
      image: "/mountain-lake-sunset-alps.jpg",
    },
    {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      price: 3299,
      availability: "Available",
      bookings: 38,
      image: "/tropical-beach-palm-trees-resort.jpg",
    },
  ]

  const handleCreatePackage = () => {
    setEditingPackage(null)
    setIsModalOpen(true)
  }

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg)
    setIsModalOpen(true)
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

      {viewMode === "grid" ? (
        // Grid View
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pkg.image || "/placeholder.svg"}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{pkg.title}</h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>{pkg.bookings} bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <DollarSign size={16} className="text-gray-400" />
                    <span>${pkg.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <Eye size={16} />
                  </button>
                  <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
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
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Duration</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Bookings</th>
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
                          src={pkg.image || "/placeholder.svg"}
                          alt={pkg.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="font-semibold text-gray-900">{pkg.title}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{pkg.location}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{pkg.duration}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">${pkg.price.toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{pkg.bookings}</td>
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
                        <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
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

      <PackageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} package={editingPackage} />
    </div>
  )
}
