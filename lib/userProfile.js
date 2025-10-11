import { supabase } from './supabase'

/**
 * User Profile Service
 * Handles all user profile-related operations
 */

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      success: true,
      profile: data
    }

  } catch (error) {
    console.error('Get user profile error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch user profile'
    }
  }
}

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const updateData = {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone: profileData.phone || null,
      address: profileData.address || null,
      city: profileData.city || null,
      country: profileData.country || null,
      date_of_birth: profileData.dateOfBirth || null,
      preferences: profileData.preferences || null,
      updated_at: new Date().toISOString()
    }

    // Only include profile_image_url if provided
    if (profileData.profileImageUrl !== undefined) {
      updateData.profile_image_url = profileData.profileImageUrl
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      profile: data,
      message: 'Profile updated successfully!'
    }

  } catch (error) {
    console.error('Update user profile error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    }
  }
}

// Upload profile image to Supabase storage
export const uploadProfileImage = async (userId, file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided')
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profile/${fileName}`

    // Delete old profile image if exists
    const { data: userData } = await supabase
      .from('users')
      .select('profile_image_url')
      .eq('id', userId)
      .single()

    if (userData?.profile_image_url) {
      // Extract filename from URL
      const oldFileName = userData.profile_image_url.split('/').pop()
      const oldFilePath = `profile/${oldFileName}`
      
      // Delete old file (ignore errors if file doesn't exist)
      await supabase.storage
        .from('media')
        .remove([oldFilePath])
    }

    // Upload new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}. Make sure the 'media' bucket exists and is public.`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update user profile with new image URL
    const updateResult = await updateUserProfile(userId, {
      profileImageUrl: publicUrl
    })

    if (!updateResult.success) {
      throw new Error(updateResult.error)
    }

    return {
      success: true,
      imageUrl: publicUrl,
      message: 'Profile image uploaded successfully!'
    }

  } catch (error) {
    console.error('Upload profile image error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload profile image'
    }
  }
}

// Delete profile image
export const deleteProfileImage = async (userId) => {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('profile_image_url')
      .eq('id', userId)
      .single()

    if (!userData?.profile_image_url) {
      throw new Error('No profile image to delete')
    }

    // Extract filename from URL
    const fileName = userData.profile_image_url.split('/').pop()
    const filePath = `profile/${fileName}`

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (deleteError) throw deleteError

    // Update user profile to remove image URL
    const updateResult = await updateUserProfile(userId, {
      profileImageUrl: null
    })

    if (!updateResult.success) {
      throw new Error(updateResult.error)
    }

    return {
      success: true,
      message: 'Profile image deleted successfully!'
    }

  } catch (error) {
    console.error('Delete profile image error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete profile image'
    }
  }
}

// Get user statistics (bookings, spending)
export const getUserStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('total_bookings, total_spent')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      success: true,
      statistics: {
        totalBookings: data.total_bookings || 0,
        totalSpent: data.total_spent || 0
      }
    }

  } catch (error) {
    console.error('Get user statistics error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch user statistics'
    }
  }
}

// Get all customers (Admin only)
export const getAllCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        city,
        country,
        role,
        status,
        total_bookings,
        total_spent,
        profile_image_url,
        created_at
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get booking stats and last booking date for each customer
    const customersWithBookings = await Promise.all(
      data.map(async (customer) => {
        // Get last booking date
        const { data: lastBooking } = await supabase
          .from('bookings')
          .select('booking_date')
          .eq('user_id', customer.id)
          .order('booking_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get actual booking statistics (fallback if database values are wrong)
        const { data: bookingStats } = await supabase
          .from('bookings')
          .select('total_amount')
          .eq('user_id', customer.id)

        const actualBookingCount = bookingStats?.length || 0
        const actualTotalSpent = bookingStats?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0

        return {
          ...customer,
          // Use actual calculated values if database values are 0 or null
          total_bookings: customer.total_bookings || actualBookingCount,
          total_spent: customer.total_spent || actualTotalSpent,
          lastBookingDate: lastBooking?.booking_date || null
        }
      })
    )

    return {
      success: true,
      customers: customersWithBookings
    }

  } catch (error) {
    console.error('Get all customers error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch customers'
    }
  }
}
