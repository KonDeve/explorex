"use client"

import Header from "@/components/header"
import { User, Mail, Calendar, Save, Camera, Upload, X, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/AuthContext"
import { getUserProfile, updateUserProfile, uploadProfileImage, deleteProfileImage } from "@/lib/userProfile"
import { useRouter } from "next/navigation"

export default function CustomerProfile() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading: authLoading, refreshUser } = useAuth()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    preferences: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dataLoaded, setDataLoaded] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user && profile && !dataLoaded) {
        setFormData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.date_of_birth || "",
          preferences: profile.preferences || "",
        })
        setProfileImage(profile.profile_image_url)
        setDataLoaded(true)
      }
    }

    loadProfile()
  }, [user, profile, dataLoaded])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      
      // Upload image immediately
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file) => {
    setImageLoading(true)
    setError("")
    
    try {
      const result = await uploadProfileImage(user.id, file)
      
      if (result.success) {
        setProfileImage(result.imageUrl)
        setImagePreview(null)
        setSuccess('Profile image updated successfully!')
        
        // Refresh user context to update header
        await refreshUser()
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error)
        setImagePreview(null)
      }
    } catch (err) {
      setError('Failed to upload image')
      setImagePreview(null)
    } finally {
      setImageLoading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return
    }

    setImageLoading(true)
    setError("")
    
    try {
      const result = await deleteProfileImage(user.id)
      
      if (result.success) {
        setProfileImage(null)
        setSuccess('Profile image deleted successfully!')
        
        // Refresh user context
        await refreshUser()
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to delete image')
    } finally {
      setImageLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await updateUserProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        preferences: formData.preferences,
      })

      if (result.success) {
        setSuccess(result.message)
        
        // Refresh user context to update header with new name
        await refreshUser()
        
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (authLoading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    }
    return "U"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="dashboard" />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8">
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
                  <X size={18} />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center justify-between">
                <span>{success}</span>
                <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {imageLoading ? (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {imagePreview || profileImage ? (
                      <img
                        src={imagePreview || profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                        {getInitials()}
                      </div>
                    )}
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      <Camera size={16} />
                    </button>
                    
                    {(profileImage || imagePreview) && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={imageLoading}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
                <p className="text-sm text-gray-500 mt-1">Max image size: 5MB (JPEG, PNG, WebP)</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={24} className="text-blue-500" />
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail size={24} className="text-blue-500" />
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                      title="Email cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Preferences */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={24} className="text-blue-500" />
                  Travel Preferences
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferences</label>
                  <textarea
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about your travel preferences..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-900 hover:text-gray-900 transition font-semibold flex items-center justify-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
