"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, DollarSign, Building, Plane, Activity, Gift, Plus, Minus, Image, ArrowLeft, Check, Loader2, X } from "lucide-react"
import { createPackage, getPackageById, updatePackage } from "@/lib/packages"

export default function AddPackagePage() {
  // Add custom scrollbar styles
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    if (!document.head.querySelector('#custom-scrollbar-style')) {
      style.id = 'custom-scrollbar-style';
      document.head.appendChild(style);
    }
  }
  const router = useRouter()
  
  // Get edit ID from sessionStorage (more secure than URL)
  const [editId, setEditId] = useState(null)
  const isEditMode = !!editId
  
  // Check for edit mode on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const packageId = sessionStorage.getItem('editPackageId')
      if (packageId) {
        setEditId(packageId)
      }
    }
    
    // Cleanup: Clear session storage when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('editPackageId')
      }
    }
  }, [])

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const response = await fetch('https://api.first.org/data/v1/countries')
        const data = await response.json()
        
        if (data.status === 'OK' && data.data) {
          // Convert object to array and sort by country name
          const countriesArray = Object.entries(data.data).map(([code, info]) => ({
            code,
            name: info.country
          }))
          countriesArray.sort((a, b) => a.name.localeCompare(b.name))
          setCountries(countriesArray)
        }
      } catch (error) {
        console.error('Error fetching countries:', error)
        // Fallback to basic list if API fails
        setCountries([
          { code: 'US', name: 'United States' },
          { code: 'GB', name: 'United Kingdom' },
          { code: 'GR', name: 'Greece' },
          { code: 'IT', name: 'Italy' },
          { code: 'PH', name: 'Philippines' }
        ])
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [countries, setCountries] = useState([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Package Information
    title: "",
    location: "",
    country: "",
    people: "",
    price: "",
    category: "International",
    description: "",
    highlights: "",
    features: [""],
    images: [],
    popular: false,
    featured: false,
    hero_type: "beach",
    
    // Deal dates and slots (multiple deals)
    deals: [
      { deal_start_date: "", deal_end_date: "", slots_available: "" }
    ],
    
    // Additional Details
    availability: "Available",
    
    // Accommodation Section
    accommodation: {
      title: "Hotel Accommodation",
      description: "",
      amenities: [""]
    },
    
    // Transportation Section
    transportation: {
      title: "Transportation",
      description: "",
      local: "",
      amenities: [""]
    },
    
    // Activities Section
    activities: {
      title: "Tour Activities",
      description: "",
      tours: [""],
      amenities: [""]
    },
    
    // Inclusions Section
    inclusions: {
      title: "Other Inclusions",
      description: "",
      items: [""]
    },
    
    // Itinerary
    itinerary: [
      { day: 1, title: "", description: "" }
    ]
  })

  const stepTitles = [
    "Basic Information",
    "Package Details", 
    "Accommodation & Transportation",
    "Activities & Inclusions",
    "Daily Itinerary"
  ]

  // Load package data when in edit mode
  useEffect(() => {
    const loadPackageData = async () => {
      if (!editId) return
      
      try {
        setIsLoading(true)
        const data = await getPackageById(editId)
        
        // Helper function to get details by type
        const getDetailsByType = (type) => {
          return data.details?.find(d => d.section_type === type) || null
        }

        const accommodationDetails = getDetailsByType('accommodation')
        const transportationDetails = getDetailsByType('transportation')
        const activitiesDetails = getDetailsByType('activities')
        const inclusionsDetails = getDetailsByType('inclusions')

        // Populate form with existing data
        setFormData({
          title: data.title || "",
          location: data.location || "",
          country: data.country || "",
          people: data.people?.toString() || "",
          price: data.price_value?.toString() || data.price?.toString() || "",
          category: data.category || "International",
          description: data.description || "",
          highlights: data.highlights || "",
          features: data.features && data.features.length > 0 ? data.features : [""],
          images: data.images || [],
          availability: data.availability || "Available",
          popular: data.popular || false,
          featured: data.featured || false,
          hero_type: data.hero_type || "beach",
          deals: data.deals && data.deals.length > 0 
            ? data.deals.map(deal => ({
                deal_start_date: deal.deal_start_date || "",
                deal_end_date: deal.deal_end_date || "",
                slots_available: deal.slots_available?.toString() || ""
              }))
            : [{ deal_start_date: "", deal_end_date: "", slots_available: "" }],
          
          accommodation: {
            title: accommodationDetails?.title || "Hotel Accommodation",
            description: accommodationDetails?.description || "",
            amenities: accommodationDetails?.amenities && accommodationDetails.amenities.length > 0 
              ? accommodationDetails.amenities 
              : [""]
          },
          
          transportation: {
            title: transportationDetails?.title || "Transportation",
            description: transportationDetails?.description || "",
            local: transportationDetails?.local || "",
            amenities: transportationDetails?.amenities && transportationDetails.amenities.length > 0 
              ? transportationDetails.amenities 
              : [""]
          },
          
          activities: {
            title: activitiesDetails?.title || "Tour Activities",
            description: activitiesDetails?.description || "",
            tours: activitiesDetails?.tours && activitiesDetails.tours.length > 0 
              ? activitiesDetails.tours 
              : [""],
            amenities: activitiesDetails?.amenities && activitiesDetails.amenities.length > 0 
              ? activitiesDetails.amenities 
              : [""]
          },
          
          inclusions: {
            title: inclusionsDetails?.title || "Other Inclusions",
            description: inclusionsDetails?.description || "",
            items: inclusionsDetails?.items && inclusionsDetails.items.length > 0 
              ? inclusionsDetails.items 
              : [""]
          },
          
          itinerary: data.itinerary && data.itinerary.length > 0
            ? data.itinerary.map(day => ({
                day: day.day_number,
                title: day.title,
                description: day.description
              }))
            : [{ day: 1, title: "", description: "" }]
        })

        // Set existing images
        setExistingImages(data.images || [])
      } catch (error) {
        console.error('Error loading package:', error)
        alert('Failed to load package data')
        router.push('/admin/packages')
      } finally {
        setIsLoading(false)
      }
    }

    loadPackageData()
  }, [editId, router])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.price || !formData.country || !formData.people) {
        throw new Error('Please fill in all required fields')
      }

      // Validate people is a number
      if (isNaN(parseInt(formData.people)) || parseInt(formData.people) <= 0) {
        throw new Error('Please enter a valid number of people')
      }

      let result
      if (isEditMode) {
        // Update existing package
        result = await updatePackage(editId, formData, imageFiles, imagesToDelete)
        if (result.success) {
          alert('Package updated successfully!')
        }
      } else {
        // Create new package
        result = await createPackage(formData, imageFiles)
        if (result.success) {
          alert('Package created successfully!')
        }
      }

      if (result.success) {
        // Clear session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('editPackageId')
        }
        // Redirect to packages list
        router.push('/admin/packages')
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} package:`, error)
      setSubmitError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} package. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleArrayFieldChange = (section, field, index, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: prev[section][field].map((item, i) => i === index ? value : item)
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }))
    }
  }

  const handleAddArrayField = (section, field) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], ""]
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ""]
      }))
    }
  }

  const handleRemoveArrayField = (section, field, index) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: prev[section][field].filter((_, i) => i !== index)
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  // Handle existing image deletion (for edit mode)
  const handleDeleteExistingImage = (imageUrl) => {
    setImagesToDelete([...imagesToDelete, imageUrl])
    setExistingImages(existingImages.filter(url => url !== imageUrl))
  }

  // Handle image file upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const newImageFiles = [...imageFiles, ...files]
      setImageFiles(newImageFiles)
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setImagePreviews([...imagePreviews, ...newPreviews])
      
      // Update formData with file names for reference (only for new mode)
      if (!isEditMode) {
        const newImageNames = files.map(file => file.name)
        setFormData({ ...formData, images: [...formData.images, ...newImageNames] })
      }
    }
  }

  // Remove new image file (before upload)
  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[index])
    
    setImageFiles(newImageFiles)
    setImagePreviews(newPreviews)
    setFormData({ ...formData, images: newImages })
  }

  // Handle itinerary changes
  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...formData.itinerary]
    newItinerary[index] = { ...newItinerary[index], [field]: value }
    setFormData({ ...formData, itinerary: newItinerary })
  }

  // Add new day to itinerary
  const addItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: "",
      description: ""
    }
    setFormData({ ...formData, itinerary: [...formData.itinerary, newDay] })
  }

  // Remove day from itinerary
  const removeItineraryDay = (index) => {
    const newItinerary = formData.itinerary.filter((_, i) => i !== index)
    const renumberedItinerary = newItinerary.map((day, i) => ({ ...day, day: i + 1 }))
    setFormData({ ...formData, itinerary: renumberedItinerary })
  }

  // Show loading state when fetching data in edit mode
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="text-gray-600 text-lg">Loading package data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Row - Above Both Containers */}
      <div className="max-w-[1920px] mx-auto px-24 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/packages')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Previous Page</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Package' : 'Add Package'}
          </h1>
          <div className="w-32"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-[1920px] mx-auto flex h-[calc(100vh-80px)] gap-0">
        {/* Left Panel - Form Fields */}
        <div className="w-1/2 overflow-y-auto custom-scrollbar">
          <div className="py-6 pl-24 pr-12">
            {/* Step Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {stepTitles[currentStep - 1]}
                </h2>
                <span className="text-sm text-gray-500">
                  Step {currentStep} of 5
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Package Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Images</label>
                    
                    {/* Existing Images (Edit Mode) */}
                    {isEditMode && existingImages.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={imageUrl} 
                                alt={`Existing ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingImage(imageUrl)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mb-3">
                        {isEditMode && <p className="text-xs text-gray-500 mb-2">New Images to Upload:</p>}
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                              <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded">
                                {imageFiles[index]?.name.slice(0, 15)}...
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* File Upload Button */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Image size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-600">Choose images or drag and drop</span>
                      </label>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Santorini Paradise"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Location & Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Santorini"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
                      <select
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={isLoadingCountries}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* People & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of People *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={formData.people}
                        onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                        placeholder="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the maximum number of people</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (USD) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2499"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Deal Periods (Multiple) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Deal Periods</label>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          deals: [...formData.deals, { deal_start_date: "", deal_end_date: "", slots_available: "" }]
                        })}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Deal Period
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Add multiple date ranges when this package is available</p>
                    
                    {formData.deals.map((deal, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={deal.deal_start_date}
                                onChange={(e) => {
                                  const newDeals = [...formData.deals]
                                  newDeals[index].deal_start_date = e.target.value
                                  setFormData({ ...formData, deals: newDeals })
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={deal.deal_end_date}
                                onChange={(e) => {
                                  const newDeals = [...formData.deals]
                                  newDeals[index].deal_end_date = e.target.value
                                  setFormData({ ...formData, deals: newDeals })
                                }}
                                min={deal.deal_start_date}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Available Slots</label>
                            <input
                              type="number"
                              min="0"
                              value={deal.slots_available}
                              onChange={(e) => {
                                const newDeals = [...formData.deals]
                                newDeals[index].slots_available = e.target.value
                                setFormData({ ...formData, deals: newDeals })
                              }}
                              placeholder="10"
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                        {formData.deals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newDeals = formData.deals.filter((_, i) => i !== index)
                              setFormData({ ...formData, deals: newDeals })
                            }}
                            className="mt-6 text-red-500 hover:text-red-700"
                          >
                            <Minus size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Category & Hero Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      >
                        <option value="International">International</option>
                        <option value="Domestic">Domestic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Type</label>
                      <select
                        value={formData.hero_type}
                        onChange={(e) => setFormData({ ...formData, hero_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      >
                        <option value="beach">Beach</option>
                        <option value="mountain">Mountain</option>
                        <option value="city">City</option>
                        <option value="forest">Forest</option>
                        <option value="desert">Desert</option>
                      </select>
                    </div>
                  </div>

                  {/* Package Flags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.popular}
                          onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Popular Package</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured Package</span>
                      </label>
                    </div>
                  </div>

                  {/* Package Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Features</label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayFieldChange(null, 'features', index, e.target.value)}
                          placeholder={`Feature ${index + 1} (e.g., 5-Star Hotel)`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                        />
                        {formData.features.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField(null, 'features', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField(null, 'features')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      + Add Another Feature
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Package Details */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Experience the magic of Santorini with its iconic blue-domed churches..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability Status</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Limited">Limited</option>
                      <option value="Sold Out">Sold Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Highlights</label>
                    <textarea
                      rows={3}
                      value={formData.highlights}
                      onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                      placeholder="Key highlights and unique selling points..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Accommodation & Transportation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Hotel Accommodation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Hotel Accommodation</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <input
                        type="text"
                        value={formData.accommodation.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          accommodation: { ...formData.accommodation, description: e.target.value }
                        })}
                        placeholder="4 nights stay at Hotel Danieli Venice (Canal View Room)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities</label>
                      {formData.accommodation.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('accommodation', 'amenities', index, e.target.value)}
                            placeholder={`Amenity ${index + 1} (e.g., Free Wi-Fi)`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                          />
                          {formData.accommodation.amenities.length > 1 && (
                            <button type="button" onClick={() => handleRemoveArrayField('accommodation', 'amenities', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayField('accommodation', 'amenities')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        + Add Amenity
                      </button>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Transportation Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <input
                        type="text"
                        value={formData.transportation.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          transportation: { ...formData.transportation, description: e.target.value }
                        })}
                        placeholder="Round-trip flights to Venice Marco Polo Airport"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Local Transportation</label>
                      <input
                        type="text"
                        value={formData.transportation.local}
                        onChange={(e) => setFormData({
                          ...formData,
                          transportation: { ...formData.transportation, local: e.target.value }
                        })}
                        placeholder="Vaporetto passes for Venice public water transport and guided walking tours"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities</label>
                      {formData.transportation.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('transportation', 'amenities', index, e.target.value)}
                            placeholder={`Amenity ${index + 1} (e.g., Economy plus seating)`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                          />
                          {formData.transportation.amenities.length > 1 && (
                            <button type="button" onClick={() => handleRemoveArrayField('transportation', 'amenities', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayField('transportation', 'amenities')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        + Add Amenity
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Activities & Inclusions */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Activities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Tour Activities</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <input
                        type="text"
                        value={formData.activities.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          activities: { ...formData.activities, description: e.target.value }
                        })}
                        placeholder="Included tours & experiences exploring Venice highlights"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tour Activities</label>
                      {formData.activities.tours.map((tour, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tour}
                            onChange={(e) => handleArrayFieldChange('activities', 'tours', index, e.target.value)}
                            placeholder={`Tour ${index + 1} (e.g., Oia Village sunset tour)`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                          />
                          {formData.activities.tours.length > 1 && (
                            <button type="button" onClick={() => handleRemoveArrayField('activities', 'tours', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayField('activities', 'tours')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        + Add Tour
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities</label>
                      {formData.activities.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('activities', 'amenities', index, e.target.value)}
                            placeholder={`Amenity ${index + 1} (e.g., Licensed tour guide)`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                          />
                          {formData.activities.amenities.length > 1 && (
                            <button type="button" onClick={() => handleRemoveArrayField('activities', 'amenities', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayField('activities', 'amenities')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        + Add Amenity
                      </button>
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Other Inclusions</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <input
                        type="text"
                        value={formData.inclusions.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          inclusions: { ...formData.inclusions, description: e.target.value }
                        })}
                        placeholder="Extra benefits and travel essentials for your Venice trip"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Inclusion Items</label>
                      {formData.inclusions.items.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayFieldChange('inclusions', 'items', index, e.target.value)}
                            placeholder={`Inclusion ${index + 1} (e.g., Travel insurance for 7 days)`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                          />
                          {formData.inclusions.items.length > 1 && (
                            <button type="button" onClick={() => handleRemoveArrayField('inclusions', 'items', index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayField('inclusions', 'items')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        + Add Inclusion
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Itinerary */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Daily Itinerary</h3>
                    <button type="button" onClick={addItineraryDay} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      + Add Day
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.itinerary.map((day, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                          {formData.itinerary.length > 1 && (
                            <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                              <Minus size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                              placeholder="Arrival & Check-in"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={day.description}
                              onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                              placeholder="Airport pickup and hotel check-in. Welcome dinner with traditional cuisine."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t mt-8">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Package' : 'Create Package'
                    )}
                  </button>
                )}
              </div>
              
              {/* Error Message */}
              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto custom-scrollbar">
          <div className="py-6 pl-12 pr-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Package Preview</h3>
            
            {/* Package Preview Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Package Image */}
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                {imagePreviews.length > 0 ? (
                  <img 
                    src={imagePreviews[0]} 
                    alt="Package" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No image uploaded</span>
                )}
              </div>
              
              {/* Package Details */}
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.title || "Package Title"}
                </h4>
                
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span className="text-sm">{formData.location || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span className="text-sm">Up to {formData.people || "0"} People</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    ₱{formData.price ? Number(formData.price).toLocaleString() : "0"} 
                    <span className="text-sm font-normal text-gray-600">/night</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.availability === 'Available' ? 'bg-green-100 text-green-800' :
                    formData.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.availability}
                  </span>
                </div>
                
                {formData.description && (
                  <p className="text-gray-600 mb-4">{formData.description}</p>
                )}
                
                {formData.features.filter(f => f).length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Package Features</h5>
                    <ul className="space-y-1">
                      {formData.features.filter(f => f).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check size={14} className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Sections Preview */}
                {(formData.accommodation.title || formData.accommodation.description || formData.accommodation.amenities.some(a => a)) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-gray-900">{formData.accommodation.title || "Hotel Accommodation"}</h5>
                    </div>
                    {formData.accommodation.description && (
                      <p className="text-sm text-gray-600 mb-2">{formData.accommodation.description}</p>
                    )}
                    {formData.accommodation.amenities.filter(a => a).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                        <div className="space-y-1">
                          {formData.accommodation.amenities.filter(a => a).map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check size={12} className="text-green-500 flex-shrink-0" />
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(formData.transportation.title || formData.transportation.description || formData.transportation.amenities.some(a => a)) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-gray-900">{formData.transportation.title || "Transportation"}</h5>
                    </div>
                    {formData.transportation.description && (
                      <p className="text-sm text-gray-600 mb-2">{formData.transportation.description}</p>
                    )}
                    {formData.transportation.amenities.filter(a => a).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                        <div className="space-y-1">
                          {formData.transportation.amenities.filter(a => a).map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check size={12} className="text-green-500 flex-shrink-0" />
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.transportation.local && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Local Transportation:</span>
                        <p className="mt-1">{formData.transportation.local}</p>
                      </div>
                    )}
                  </div>
                )}

                {(formData.activities.title || formData.activities.description || formData.activities.tours.some(t => t) || formData.activities.amenities.some(a => a)) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-gray-900">{formData.activities.title || "Tour Activities"}</h5>
                    </div>
                    {formData.activities.description && (
                      <p className="text-sm text-gray-600 mb-2">{formData.activities.description}</p>
                    )}
                    {formData.activities.tours.filter(t => t).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Included Tours & Experiences:</p>
                        <div className="space-y-1">
                          {formData.activities.tours.filter(t => t).map((tour, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check size={12} className="text-green-500 flex-shrink-0" />
                              {tour}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.activities.amenities.filter(a => a).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                        <div className="space-y-1">
                          {formData.activities.amenities.filter(a => a).map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check size={12} className="text-green-500 flex-shrink-0" />
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(formData.inclusions.title || formData.inclusions.description || formData.inclusions.items.some(i => i)) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-gray-900">{formData.inclusions.title || "Other Inclusions"}</h5>
                    </div>
                    {formData.inclusions.description && (
                      <p className="text-sm text-gray-600 mb-2">{formData.inclusions.description}</p>
                    )}
                    {formData.inclusions.items.filter(i => i).length > 0 && (
                      <div className="space-y-1 mt-2">
                        {formData.inclusions.items.filter(i => i).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check size={12} className="text-green-500 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {formData.itinerary.some(day => day.title || day.description) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Daily Itinerary</h5>
                    <div className="space-y-2">
                      {formData.itinerary.slice(0, 3).map((day, index) => (
                        <div key={index} className="text-sm">
                          {day.title && (
                            <div className="font-medium text-gray-900">Day {day.day}: {day.title}</div>
                          )}
                          {day.description && (
                            <div className="text-gray-600">{day.description}</div>
                          )}
                        </div>
                      ))}
                      {formData.itinerary.length > 3 && (
                        <div className="text-sm text-gray-500">+ {formData.itinerary.length - 3} more days</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
