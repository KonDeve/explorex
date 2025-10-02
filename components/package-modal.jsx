"use client"

import { X, Upload, MapPin, Calendar, Users, DollarSign, Star, Building, Plane, Activity, Gift, Plus, Minus, Image, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useState } from "react"

export default function PackageModal({ isOpen, onClose, package: editPackage = null }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Package Information
    title: editPackage?.title || "",
    location: editPackage?.location || "",
    duration: editPackage?.duration || "",
    price: editPackage?.price || "",
    max_guests: editPackage?.max_guests || "",
    description: editPackage?.description || "",
    lead_architect: editPackage?.lead_architect || "",
    tour_operator: editPackage?.tour_operator || "",
    area: editPackage?.area || "",
    category: editPackage?.category || "Beach",
    availability: editPackage?.availability || "Available",
    highlights: editPackage?.highlights || "",
    features: editPackage?.features || [""],
    images: editPackage?.images || [""],
    
    // Package Details Sections
    accommodation: {
      title: "Hotel Accommodation",
      description: "",
      amenities: [""],
      nights_info: ""
    },
    transportation: {
      title: "Transportation",
      description: "",
      amenities: [""],
      flights_info: "",
      local_transport: ""
    },
    activities: {
      title: "Tour Activities",
      description: "Included Tours & Experiences",
      amenities: [""],
      tours: [""]
    },
    inclusions: {
      title: "Other Inclusions",
      description: "Additional services and amenities included in your package",
      items: [""]
    },
    
    // Itinerary
    itinerary: [
      { day: 1, title: "", description: "" }
    ]
  })

  const totalSteps = 5

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Package form submitted:", formData)
    // Handle form submission - this would integrate with Supabase
    onClose()
  }

  const handleStepNavigation = (direction) => {
    if (direction === 'next' && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (direction === 'prev' && currentStep > 1) {
      setCurrentStep(currentStep - 1)
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

  const handleItineraryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }))
  }

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        day: prev.itinerary.length + 1, 
        title: "", 
        description: "" 
      }]
    }))
  }

  const removeItineraryDay = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
        .map((day, i) => ({ ...day, day: i + 1 }))
    }))
  }

  const stepTitles = [
    "Basic Information",
    "Package Details", 
    "Accommodation & Transport",
    "Activities & Inclusions",
    "Itinerary"
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{editPackage ? "Edit Package" : "Create New Package"}</h2>
            <p className="text-sm text-gray-600 mt-1">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div key={index} className={`flex-1 text-center text-sm font-medium ${
                index + 1 === currentStep ? 'text-blue-600' : 
                index + 1 < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}>
                {title}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Package Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Image size={16} />
                  Package Images
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleArrayFieldChange(null, 'images', index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {formData.images.length > 1 && (
                      <button type="button" onClick={() => handleRemoveArrayField(null, 'images', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayField(null, 'images')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Plus size={16} />
                  Add Another Image
                </button>
              </div>

              {/* Basic Package Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Santorini Paradise"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Greece"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="7 Days, 6 Nights"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Max Guests *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                    placeholder="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Beach">Beach</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family">Family</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Historical">Historical</option>
                  </select>
                </div>
              </div>

              {/* Package Features */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Package Features</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayFieldChange(null, 'features', index, e.target.value)}
                      placeholder={`Feature ${index + 1} (e.g., 5-Star Hotel)`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {formData.features.length > 1 && (
                      <button type="button" onClick={() => handleRemoveArrayField(null, 'features', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayField(null, 'features')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Plus size={16} />
                  Add Another Feature
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Package Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Experience the magic of Santorini with its iconic blue-domed churches..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Architect</label>
                  <input
                    type="text"
                    value={formData.lead_architect}
                    onChange={(e) => setFormData({ ...formData, lead_architect: e.target.value })}
                    placeholder="Maria Papadopoulos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Operator</label>
                  <input
                    type="text"
                    value={formData.tour_operator}
                    onChange={(e) => setFormData({ ...formData, tour_operator: e.target.value })}
                    placeholder="Aegean Adventures"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area/Region</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Cyclades Islands"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Status</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package Highlights</label>
                <textarea
                  rows={3}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Key highlights and unique selling points..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Accommodation & Transportation */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Accommodation Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-blue-600" />
                  Accommodation Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.accommodation.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        accommodation: { ...formData.accommodation, description: e.target.value }
                      })}
                      placeholder="6 nights stay at Santorini Blue Resort (Premium Suite)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nights Information</label>
                    <input
                      type="text"
                      value={formData.accommodation.nights_info}
                      onChange={(e) => setFormData({
                        ...formData,
                        accommodation: { ...formData.accommodation, nights_info: e.target.value }
                      })}
                      placeholder="6 nights stay at Santorini Blue Resort (Premium Suite)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Accommodation Amenities</label>
                    {formData.accommodation.amenities.map((amenity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => handleArrayFieldChange('accommodation', 'amenities', index, e.target.value)}
                          placeholder={`Amenity ${index + 1} (e.g., Free Wi-Fi)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.accommodation.amenities.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField('accommodation', 'amenities', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('accommodation', 'amenities')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus size={16} />
                      Add Amenity
                    </button>
                  </div>
                </div>
              </div>

              {/* Transportation Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plane size={20} className="text-blue-600" />
                  Transportation Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.transportation.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportation: { ...formData.transportation, description: e.target.value }
                      })}
                      placeholder="Round-trip flights from major cities to Santorini"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Information</label>
                      <input
                        type="text"
                        value={formData.transportation.flights_info}
                        onChange={(e) => setFormData({
                          ...formData,
                          transportation: { ...formData.transportation, flights_info: e.target.value }
                        })}
                        placeholder="Round-trip flights from major cities"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Local Transportation</label>
                      <input
                        type="text"
                        value={formData.transportation.local_transport}
                        onChange={(e) => setFormData({
                          ...formData,
                          transportation: { ...formData.transportation, local_transport: e.target.value }
                        })}
                        placeholder="Private transfers and local transportation"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Transportation Amenities</label>
                    {formData.transportation.amenities.map((amenity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => handleArrayFieldChange('transportation', 'amenities', index, e.target.value)}
                          placeholder={`Amenity ${index + 1} (e.g., Premium economy seating)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.transportation.amenities.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField('transportation', 'amenities', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('transportation', 'amenities')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus size={16} />
                      Add Amenity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Activities & Inclusions */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Activities Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Tour Activities
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.activities.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        activities: { ...formData.activities, description: e.target.value }
                      })}
                      placeholder="Included Tours & Experiences"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tour Activities</label>
                    {formData.activities.tours.map((tour, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tour}
                          onChange={(e) => handleArrayFieldChange('activities', 'tours', index, e.target.value)}
                          placeholder={`Tour ${index + 1} (e.g., Oia Village sunset tour)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.activities.tours.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField('activities', 'tours', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('activities', 'tours')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus size={16} />
                      Add Tour
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Amenities</label>
                    {formData.activities.amenities.map((amenity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenity}
                          onChange={(e) => handleArrayFieldChange('activities', 'amenities', index, e.target.value)}
                          placeholder={`Amenity ${index + 1} (e.g., Professional tour guide)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.activities.amenities.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField('activities', 'amenities', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('activities', 'amenities')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus size={16} />
                      Add Amenity
                    </button>
                  </div>
                </div>
              </div>

              {/* Inclusions Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift size={20} className="text-blue-600" />
                  Other Inclusions
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.inclusions.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        inclusions: { ...formData.inclusions, description: e.target.value }
                      })}
                      placeholder="Additional services and amenities included in your package"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Inclusion Items</label>
                    {formData.inclusions.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayFieldChange('inclusions', 'items', index, e.target.value)}
                          placeholder={`Inclusion ${index + 1} (e.g., Travel insurance for 7 days)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.inclusions.items.length > 1 && (
                          <button type="button" onClick={() => handleRemoveArrayField('inclusions', 'items', index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('inclusions', 'items')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus size={16} />
                      Add Inclusion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Itinerary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Daily Itinerary
                </h3>
                <button type="button" onClick={addItineraryDay} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                  <Plus size={16} />
                  Add Day
                </button>
              </div>

              <div className="space-y-4">
                {formData.itinerary.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                      {formData.itinerary.length > 1 && (
                        <button type="button" onClick={() => removeItineraryDay(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                          placeholder="Airport pickup and hotel check-in. Welcome dinner with traditional cuisine."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Check size={16} />
                  Create Package
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
