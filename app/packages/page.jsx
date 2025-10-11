"use client"

import { MapPin, Calendar, Users, Star, Check, ArrowRight, Sparkles, Award, Shield, Search, Filter, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { useEffect, useState } from "react"
import { getAllPackages } from "@/lib/packages"

export default function PackagesPage() {
  const [isVisible, setIsVisible] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [expandedFilters, setExpandedFilters] = useState({
    search: true,
    category: false,
    priceRange: false
  })
  const [heroFilter, setHeroFilter] = useState("All")
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
        setError('Failed to load packages. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Function to handle hero filter and scroll to packages
  const handleHeroFilter = (filter) => {
    setHeroFilter(filter)
    // Scroll to packages section with smooth behavior
    const packagesSection = document.getElementById('packages')
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Add custom styles for animations
  const customStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 30px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `

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

  // Filtering logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pkg.country && pkg.country.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory
    
    // Get the price from deals or price_value
    let packagePrice = 0
    if (pkg.deals && pkg.deals.length > 0) {
      // Use the minimum deal price
      packagePrice = Math.min(...pkg.deals.map(d => Number(d.deal_price) || 0))
    } else {
      packagePrice = pkg.price_value || 0
    }
    
    // Price filtering in Peso (₱)
    const matchesPrice = priceRange === "All" ||
      (priceRange === "Under ₱50,000" && packagePrice < 50000) ||
      (priceRange === "₱50,000 - ₱100,000" && packagePrice >= 50000 && packagePrice <= 100000) ||
      (priceRange === "₱100,000 - ₱150,000" && packagePrice > 100000 && packagePrice <= 150000) ||
      (priceRange === "Above ₱150,000" && packagePrice > 150000)

    // Hero filter logic - simplified for now, can be enhanced based on package categories
    const matchesHeroFilter = heroFilter === "All" || 
      (heroFilter === "Popular" && pkg.rating >= 4.5) ||
      (heroFilter === "Beach" && (pkg.category?.toLowerCase().includes('beach') || pkg.location?.toLowerCase().includes('beach'))) ||
      (heroFilter === "Mountain" && (pkg.category?.toLowerCase().includes('mountain') || pkg.location?.toLowerCase().includes('alps') || pkg.location?.toLowerCase().includes('mountain'))) ||
      (heroFilter === "City" && (pkg.category?.toLowerCase().includes('city') || pkg.location?.toLowerCase().includes('city')))

    return matchesSearch && matchesCategory && matchesPrice && matchesHeroFilter
  })
  
  const regularPackages = filteredPackages

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <style jsx>{customStyles}</style>
      <Header activePage="packages" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 pt-16 pb-12 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-8">
            <Sparkles size={16} />
            <span>Curated Travel Experiences</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] text-balance">
            Explore Our Travel{" "}
            <span className="italic bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Packages
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-14 max-w-2xl mx-auto leading-relaxed text-pretty">
            Handpicked destinations and experiences designed to create unforgettable memories. Every detail carefully
            planned for your perfect journey.
          </p>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                const packagesSection = document.getElementById('packages')
                if (packagesSection) {
                  packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-semibold hover:scale-105 shadow-lg"
            >
              Explore All Packages
            </button>
          </div>
        </div>
      </section>

      <section
        id="packages"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-16 pb-24 transition-all duration-700 ${
          isVisible.packages ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Sidebar */}
          <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              
              {/* Search Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, search: !prev.search }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Search</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.search ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.search && (
                  <div className="px-6 pb-6">
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Filter size={18} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Category</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.category && (
                  <div className="px-6 pb-6">
                    {/* Quick Filter Buttons */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Quick Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Popular", "Beach", "Mountain", "City"].map((filter) => (
                          <button 
                            key={filter}
                            onClick={() => setHeroFilter(filter)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                              heroFilter === filter 
                                ? 'bg-blue-500 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Traditional Category Filter */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Package Type</h4>
                      {['All', 'Adventure', 'Beach', 'City', 'Cultural', 'Luxury', 'Nature'].map((category) => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="radio"
                              name="category"
                              value={category}
                              checked={selectedCategory === category}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                              selectedCategory === category
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 group-hover:border-blue-300'
                            }`}>
                              {selectedCategory === category && (
                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            selectedCategory === category ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                          }`}>
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div>
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, priceRange: !prev.priceRange }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-lg">₱</span>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Price Range</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.priceRange ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.priceRange && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      {[
                        'All',
                        'Under ₱50,000',
                        '₱50,000 - ₱100,000',
                        '₱100,000 - ₱150,000', 
                        'Above ₱150,000'
                      ].map((range) => (
                        <label key={range} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="radio"
                              name="priceRange"
                              value={range}
                              checked={priceRange === range}
                              onChange={(e) => setPriceRange(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                              priceRange === range
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 group-hover:border-blue-300'
                            }`}>
                              {priceRange === range && (
                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            priceRange === range ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                          }`}>
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              <div className="p-6 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setPriceRange("All")
                    setHeroFilter("All")
                  }}
                  className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between transition-all duration-500">
              <div>
                <h2 className="text-3xl font-bold transition-all duration-300">
                  {heroFilter === "All" ? "All Packages" : `${heroFilter} Packages`}
                </h2>
                {(heroFilter !== "All" || selectedCategory !== "All" || priceRange !== "All" || searchQuery) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {heroFilter !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {heroFilter}
                        <button 
                          onClick={() => setHeroFilter("All")}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCategory !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedCategory}
                        <button 
                          onClick={() => setSelectedCategory("All")}
                          className="ml-1.5 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {priceRange !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {priceRange}
                        <button 
                          onClick={() => setPriceRange("All")}
                          className="ml-1.5 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        "{searchQuery}"
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="ml-1.5 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-gray-600 transition-all duration-300 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
                {filteredPackages.length} packages found
              </div>
            </div>
            
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 transition-all duration-700 ease-out">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <span className="ml-3 text-gray-600 text-lg">Loading packages...</span>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-red-600 text-lg mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : regularPackages.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-600 text-lg">No packages found matching your criteria.</p>
                </div>
              ) : regularPackages.map((pkg, index) => (
            <Link key={pkg.id} href={`/packages/${pkg.slug}`}>
              <div 
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col transform hover:scale-[1.02] hover:-translate-y-2"
                style={{
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Image */}
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/placeholder.svg"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/70 group-hover:via-black/30" />

                  {/* Price Badge - Top Left */}
                  <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 shadow-lg">
                    {pkg.deals && pkg.deals.length > 0 
                      ? (pkg.deals.length === 1 
                          ? `₱${Number(pkg.deals[0].deal_price).toLocaleString()}`
                          : `₱${Math.min(...pkg.deals.map(d => Number(d.deal_price))).toLocaleString()}+`
                        )
                      : pkg.price || `$${pkg.price_value?.toLocaleString()}`
                    }
                  </div>

                  {/* Popular Badge - Top Right */}
                  {pkg.rating >= 4.5 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:bg-orange-600 shadow-lg">
                      Popular
                    </div>
                  )}

                  {/* Content Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-500 group-hover:p-6">
                    <h3 className="text-xl font-bold mb-2 leading-tight transition-all duration-300 group-hover:text-2xl">
                      {pkg.title.toUpperCase()}
                    </h3>
                    {pkg.description && (
                      <p className="text-sm text-white/90 mb-3 line-clamp-2 transition-all duration-300 group-hover:text-base group-hover:text-white">
                        {pkg.description}
                      </p>
                    )}
                    
                    {/* Location and Category Tags */}
                    <div className="flex gap-2 mb-3 transition-all duration-300 flex-wrap">
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                        <MapPin size={12} className="transition-all duration-300 group-hover:scale-110" />
                        <span className="text-xs font-medium">{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                      </div>
                      {pkg.category && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                          <span className="text-xs font-medium">{pkg.category}</span>
                        </div>
                      )}
                      {/* Deal Dates Badge - Show first available deal or count */}
                      {pkg.deals && pkg.deals.length > 0 && pkg.deals.some(d => d.deal_start_date && d.deal_end_date) && (
                        <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-green-500 group-hover:scale-105">
                          <Calendar size={12} className="transition-all duration-300 group-hover:scale-110" />
                          <span className="text-xs font-medium">
                            {pkg.deals.length} {pkg.deals.length === 1 ? 'deal' : 'deals'} available
                          </span>
                        </div>
                      )}
                      {/* Slots Available Badge - Show minimum slots from all deals */}
                      {/* {pkg.deals && pkg.deals.length > 0 && pkg.deals.some(d => d.slots_available > 0) && (
                        (() => {
                          const minSlots = Math.min(...pkg.deals.filter(d => d.slots_available > 0).map(d => d.slots_available - (d.slots_booked || 0)))
                          return minSlots > 0 ? (
                            <div className="flex items-center gap-1 bg-orange-500/90 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-orange-500 group-hover:scale-105">
                              <Users size={12} className="transition-all duration-300 group-hover:scale-110" />
                              <span className="text-xs font-medium">
                                {minSlots} slots left
                              </span>
                            </div>
                          ) : null
                        })()
                      )} */}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between transition-all duration-300">
                      {(pkg.rating || pkg.reviews_count) && (
                        <div className="flex items-center gap-2 transition-all duration-300 group-hover:scale-105">
                          <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400 transition-all duration-300 group-hover:scale-110" size={14} />
                            <span className="font-bold text-sm transition-all duration-300 group-hover:text-base">{pkg.rating || 0}</span>
                            <span className="text-xs text-white/80 transition-all duration-300 group-hover:text-sm group-hover:text-white/90">({pkg.reviews_count || 0})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Why Book With Us */}
      <section
        id="whybook"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-20 border-t-2 border-gray-200 transition-all duration-700 ${
          isVisible.whybook ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
            <Shield size={16} />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
            Why Book{" "}
            <span className="italic bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              With Xplorex
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-blue-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="text-blue-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Best Price Guarantee</h3>
            <p className="text-gray-600 leading-relaxed">
              We guarantee the best prices on all our packages. Find it cheaper elsewhere and we'll match it.
            </p>
          </div>

          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-orange-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="text-orange-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Handpicked Experiences</h3>
            <p className="text-gray-600 leading-relaxed">
              Every package is carefully curated by our travel experts to ensure unforgettable experiences.
            </p>
          </div>

          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-green-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="text-green-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated support team is available around the clock to assist you during your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-3xl font-bold">
              Xplore<span className="text-blue-400 italic">x</span>
            </div>
            <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
