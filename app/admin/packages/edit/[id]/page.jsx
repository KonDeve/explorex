"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, DollarSign, Building, Plane, Activity, Gift, Plus, Minus, Image, ArrowLeft, Check, Loader2, X } from "lucide-react"
import { getPackageById, updatePackage } from "@/lib/packages"

export default function EditPackagePage({ params }) {
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
  const [currentStep, setCurrentStep] = useState(1)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submitError, setSubmitError] = useState(null)
  const [formData, setFormData] = useState({
    // Basic Package Information
    title: "",
    location: "",
    duration: "",
    price: "",
    max_guests: "",
    category: "Beach",
    description: "",
    highlights: "",
    features: [""],
    images: [],
    
    // Additional Details
    availability: "Available",
    
    // Accommodation Section
    accommodation: {
      description: "",
      nights_info: "",
      amenities: [""]
    },
    
    // Transportation Section
    transportation: {
      description: "",
      flights_info: "",
      local_transport: "",
      amenities: [""]
    },
    
    // Activities Section
    activities: {
      description: "",
      tours: [""],
      amenities: [""]
    },
    
    // Inclusions Section
    inclusions: {
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

  // Fetch existing package data
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setIsLoading(true)
        const data = await getPackageById(params.id)
        
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
          duration: data.duration || "",
          price: data.price?.toString() || "",
          max_guests: data.max_guests?.toString() || "",
          category: data.category || "Beach",
          description: data.description || "",
          highlights: data.highlights || "",
          features: data.features && data.features.length > 0 ? data.features : [""],
          images: data.images || [],
          availability: data.availability || "Available",
          
          accommodation: {
            description: accommodationDetails?.description || "",
            nights_info: accommodationDetails?.nights_info || "",
            amenities: accommodationDetails?.amenities && accommodationDetails.amenities.length > 0 
              ? accommodationDetails.amenities 
              : [""]
          },
          
          transportation: {
            description: transportationDetails?.description || "",
            flights_info: transportationDetails?.flights_info || "",
            local_transport: transportationDetails?.local_transport || "",
            amenities: transportationDetails?.amenities && transportationDetails.amenities.length > 0 
              ? transportationDetails.amenities 
              : [""]
          },
          
          activities: {
            description: activitiesDetails?.description || "",
            tours: activitiesDetails?.tours && activitiesDetails.tours.length > 0 
              ? activitiesDetails.tours 
              : [""],
            amenities: activitiesDetails?.amenities && activitiesDetails.amenities.length > 0 
              ? activitiesDetails.amenities 
              : [""]
          },
          
          inclusions: {
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
        console.error('Error fetching package:', error)
        alert('Failed to load package data')
        router.push('/admin/packages')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPackageData()
    }
  }, [params.id, router])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.duration || !formData.price || !formData.max_guests) {
        throw new Error('Please fill in all required fields')
      }

      // Update the package with new images
      const result = await updatePackage(params.id, formData, imageFiles, imagesToDelete)

      if (result.success) {
        // Show success message
        alert('Package updated successfully!')
        
        // Redirect to packages list
        router.push('/admin/packages')
      }
    } catch (error) {
      console.error('Error updating package:', error)
      setSubmitError(error.message || 'Failed to update package. Please try again.')
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

  // Handle existing image deletion
  const handleDeleteExistingImage = (imageUrl) => {
    setImagesToDelete([...imagesToDelete, imageUrl])
    setExistingImages(existingImages.filter(url => url !== imageUrl))
  }

  // Handle new image file upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const newImageFiles = [...imageFiles, ...files]
      setImageFiles(newImageFiles)
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  // Remove new image (before upload)
  const handleRemoveNewImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newImageFiles)
    setImagePreviews(newPreviews)
  }

  // Handle itinerary changes
  const handleItineraryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleAddItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        day: prev.itinerary.length + 1, 
        title: "", 
        description: "" 
      }]
    }))
  }

  const handleRemoveItineraryDay = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 }))
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading package data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/packages')}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Travel Package</h1>
              <p className="text-gray-600 mt-1">Update package details and information</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  <div className={`text-xs mt-2 font-medium text-center ${
                    currentStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}>
                    {stepTitles[index]}
                  </div>
                </div>
                {index < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Package Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Santorini Paradise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Greece"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 7 Days, 6 Nights"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 2499"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    Maximum Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData({...formData, max_guests: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Beach">Beach</option>
                    <option value="Mountain">Mountain</option>
                    <option value="City">City</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Cruise">Cruise</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Package Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Describe your travel package in detail..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Package Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Package Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability Status
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Limited">Limited</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Package Highlights
                </label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Brief highlights of the package..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Package Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleArrayFieldChange(null, 'features', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={`Feature ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => handleRemoveArrayField(null, 'features', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Minus size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddArrayField(null, 'features')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                  >
                    <Plus size={20} />
                    Add Feature
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Image size={16} className="inline mr-1" />
                  Package Images
                </label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => handleDeleteExistingImage(imageUrl)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-blue-500 outline-none cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload high-quality images (JPG, PNG). Multiple files supported.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Accommodation & Transportation */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Accommodation & Transportation</h2>
              
              {/* Accommodation Section */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="text-blue-600" size={24} />
                  Accommodation Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.accommodation.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        accommodation: {...formData.accommodation, description: e.target.value}
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Describe the accommodation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nights Information
                    </label>
                    <input
                      type="text"
                      value={formData.accommodation.nights_info}
                      onChange={(e) => setFormData({
                        ...formData,
                        accommodation: {...formData.accommodation, nights_info: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., 6 nights at 5-star resort"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Amenities
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {formData.accommodation.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('accommodation', 'amenities', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder={`Amenity ${index + 1}`}
                          />
                          {formData.accommodation.amenities.length > 1 && (
                            <button
                              onClick={() => handleRemoveArrayField('accommodation', 'amenities', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayField('accommodation', 'amenities')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                      >
                        <Plus size={20} />
                        Add Amenity
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transportation Section */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plane className="text-green-600" size={24} />
                  Transportation Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.transportation.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportation: {...formData.transportation, description: e.target.value}
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                      placeholder="Describe transportation arrangements..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Flight Information
                    </label>
                    <input
                      type="text"
                      value={formData.transportation.flights_info}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportation: {...formData.transportation, flights_info: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="e.g., Round-trip flights from major cities"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Local Transportation
                    </label>
                    <input
                      type="text"
                      value={formData.transportation.local_transport}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportation: {...formData.transportation, local_transport: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="e.g., Private transfers and local transport"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Transportation Amenities
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {formData.transportation.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('transportation', 'amenities', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            placeholder={`Amenity ${index + 1}`}
                          />
                          {formData.transportation.amenities.length > 1 && (
                            <button
                              onClick={() => handleRemoveArrayField('transportation', 'amenities', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayField('transportation', 'amenities')}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-100 rounded-lg transition font-medium"
                      >
                        <Plus size={20} />
                        Add Amenity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Activities & Inclusions */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Activities & Inclusions</h2>
              
              {/* Activities Section */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="text-purple-600" size={24} />
                  Tour Activities
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.activities.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        activities: {...formData.activities, description: e.target.value}
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                      placeholder="Describe the activities and tours..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Included Tours & Experiences
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {formData.activities.tours.map((tour, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tour}
                            onChange={(e) => handleArrayFieldChange('activities', 'tours', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder={`Tour ${index + 1}`}
                          />
                          {formData.activities.tours.length > 1 && (
                            <button
                              onClick={() => handleRemoveArrayField('activities', 'tours', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayField('activities', 'tours')}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg transition font-medium"
                      >
                        <Plus size={20} />
                        Add Tour
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tour Amenities
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {formData.activities.amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={amenity}
                            onChange={(e) => handleArrayFieldChange('activities', 'amenities', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder={`Amenity ${index + 1}`}
                          />
                          {formData.activities.amenities.length > 1 && (
                            <button
                              onClick={() => handleRemoveArrayField('activities', 'amenities', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayField('activities', 'amenities')}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg transition font-medium"
                      >
                        <Plus size={20} />
                        Add Amenity
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inclusions Section */}
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="text-orange-600" size={24} />
                  What's Included
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.inclusions.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        inclusions: {...formData.inclusions, description: e.target.value}
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                      placeholder="Describe what's included..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Inclusion Items
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {formData.inclusions.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayFieldChange('inclusions', 'items', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder={`Item ${index + 1}`}
                          />
                          {formData.inclusions.items.length > 1 && (
                            <button
                              onClick={() => handleRemoveArrayField('inclusions', 'items', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddArrayField('inclusions', 'items')}
                        className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-100 rounded-lg transition font-medium"
                      >
                        <Plus size={20} />
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Daily Itinerary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Day by Day Itinerary</h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {formData.itinerary.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Day {day.day}</h3>
                      {formData.itinerary.length > 1 && (
                        <button
                          onClick={() => handleRemoveItineraryDay(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Minus size={20} />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Day Title
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="e.g., Arrival & Check-in"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Day Description
                        </label>
                        <textarea
                          value={day.description}
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                          placeholder="Describe the day's activities..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={handleAddItineraryDay}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Plus size={20} />
                  Add Day
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{submitError}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of 5
            </p>
          </div>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Next
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Update Package
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
