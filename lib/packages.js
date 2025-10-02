import { supabase } from './supabase'

/**
 * Upload package images to Supabase Storage (media/package_images)
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<string[]>} - Array of public URLs for uploaded images
 */
export async function uploadPackageImages(imageFiles) {
  if (!imageFiles || imageFiles.length === 0) {
    return []
  }

  const uploadedUrls = []

  for (const file of imageFiles) {
    try {
      // Generate unique filename with timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `package_images/${fileName}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    } catch (error) {
      console.error('Failed to upload image:', file.name, error)
      throw new Error(`Failed to upload image: ${file.name}`)
    }
  }

  return uploadedUrls
}

/**
 * Delete package image from Supabase Storage
 * @param {string} imageUrl - Full public URL of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deletePackageImage(imageUrl) {
  try {
    // Extract file path from public URL
    const urlParts = imageUrl.split('/media/')
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format')
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to delete image:', error)
    return false
  }
}

/**
 * Create a new package with all details, itinerary, and images
 * @param {Object} packageData - Complete package information
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<Object>} - Created package data
 */
export async function createPackage(packageData, imageFiles = []) {
  try {
    // 1. Upload images first
    let imageUrls = []
    if (imageFiles.length > 0) {
      imageUrls = await uploadPackageImages(imageFiles)
    }

    // 2. Create the main package record
    const priceValue = parseFloat(packageData.price)
    const packageInsertData = {
      title: packageData.title,
      location: packageData.location,
      country: packageData.country?.toUpperCase() || packageData.location?.toUpperCase(),
      duration: packageData.duration,
      people: packageData.people,
      price: `$${priceValue.toLocaleString()}`,
      price_value: priceValue,
      category: packageData.category,
      description: packageData.description,
      highlights: packageData.highlights,
      availability: packageData.availability || 'Available',
      features: packageData.features.filter(f => f.trim() !== ''),
      images: imageUrls,
      popular: packageData.popular || false,
      featured: packageData.featured || false,
      hero_type: packageData.hero_type || 'beach',
      rating: 0.0,
      reviews_count: 0
    }

    const { data: packageRecord, error: packageError } = await supabase
      .from('packages')
      .insert([packageInsertData])
      .select()
      .single()

    if (packageError) {
      console.error('Error creating package:', packageError)
      // Cleanup uploaded images if package creation fails
      if (imageUrls.length > 0) {
        await Promise.all(imageUrls.map(url => deletePackageImage(url)))
      }
      throw packageError
    }

    const packageId = packageRecord.id

    // 3. Create package details sections
    const detailsSections = []

    // Accommodation section
    if (packageData.accommodation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'accommodation',
        title: packageData.accommodation.title || 'Hotel Accommodation',
        description: packageData.accommodation.description,
        amenities: packageData.accommodation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Transportation section
    if (packageData.transportation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'transportation',
        title: packageData.transportation.title || 'Transportation',
        description: packageData.transportation.description,
        local: packageData.transportation.local,
        amenities: packageData.transportation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Activities section
    if (packageData.activities) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'activities',
        title: packageData.activities.title || 'Tour Activities',
        description: packageData.activities.description,
        tours: packageData.activities.tours.filter(t => t.trim() !== ''),
        amenities: packageData.activities.amenities.filter(a => a.trim() !== '')
      })
    }

    // Inclusions section
    if (packageData.inclusions) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'inclusions',
        title: packageData.inclusions.title || 'Other Inclusions',
        description: packageData.inclusions.description,
        items: packageData.inclusions.items.filter(i => i.trim() !== '')
      })
    }

    // Insert all package details
    if (detailsSections.length > 0) {
      const { error: detailsError } = await supabase
        .from('package_details')
        .insert(detailsSections)

      if (detailsError) {
        console.error('Error creating package details:', detailsError)
        // Note: Package is already created, so we don't rollback
      }
    }

    // 4. Create itinerary entries
    if (packageData.itinerary && packageData.itinerary.length > 0) {
      const itineraryEntries = packageData.itinerary
        .filter(day => day.title.trim() !== '' && day.description.trim() !== '')
        .map(day => ({
          package_id: packageId,
          day_number: day.day,
          title: day.title,
          description: day.description
        }))

      if (itineraryEntries.length > 0) {
        const { error: itineraryError } = await supabase
          .from('package_itinerary')
          .insert(itineraryEntries)

        if (itineraryError) {
          console.error('Error creating itinerary:', itineraryError)
          // Note: Package is already created, so we don't rollback
        }
      }
    }

    return {
      success: true,
      package: packageRecord,
      message: 'Package created successfully'
    }

  } catch (error) {
    console.error('Error in createPackage:', error)
    throw error
  }
}

/**
 * Update an existing package
 * @param {string} packageId - UUID of the package to update
 * @param {Object} packageData - Updated package information
 * @param {File[]} newImageFiles - New images to add
 * @param {string[]} imagesToDelete - URLs of images to remove
 * @returns {Promise<Object>} - Updated package data
 */
export async function updatePackage(packageId, packageData, newImageFiles = [], imagesToDelete = []) {
  try {
    // 1. Handle image deletions
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map(url => deletePackageImage(url)))
    }

    // 2. Upload new images
    let newImageUrls = []
    if (newImageFiles.length > 0) {
      newImageUrls = await uploadPackageImages(newImageFiles)
    }

    // 3. Combine existing images (excluding deleted ones) with new images
    const currentImages = packageData.images || []
    const remainingImages = currentImages.filter(url => !imagesToDelete.includes(url))
    const updatedImages = [...remainingImages, ...newImageUrls]

    // 4. Update the main package record
    const priceValue = parseFloat(packageData.price)
    const packageUpdateData = {
      title: packageData.title,
      location: packageData.location,
      country: packageData.country?.toUpperCase() || packageData.location?.toUpperCase(),
      duration: packageData.duration,
      people: packageData.people,
      price: `$${priceValue.toLocaleString()}`,
      price_value: priceValue,
      category: packageData.category,
      description: packageData.description,
      highlights: packageData.highlights,
      availability: packageData.availability,
      features: packageData.features.filter(f => f.trim() !== ''),
      images: updatedImages,
      popular: packageData.popular || false,
      featured: packageData.featured || false,
      hero_type: packageData.hero_type || 'beach',
      updated_at: new Date().toISOString()
    }

    const { data: packageRecord, error: packageError } = await supabase
      .from('packages')
      .update(packageUpdateData)
      .eq('id', packageId)
      .select()
      .single()

    if (packageError) {
      console.error('Error updating package:', packageError)
      throw packageError
    }

    // 5. Delete existing package details and itinerary
    await supabase.from('package_details').delete().eq('package_id', packageId)
    await supabase.from('package_itinerary').delete().eq('package_id', packageId)

    // 6. Create updated package details sections
    const detailsSections = []
    
    // Accommodation details
    if (packageData.accommodation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'accommodation',
        title: packageData.accommodation.title || 'Hotel Accommodation',
        description: packageData.accommodation.description,
        amenities: packageData.accommodation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Transportation details
    if (packageData.transportation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'transportation',
        title: packageData.transportation.title || 'Transportation',
        description: packageData.transportation.description,
        local: packageData.transportation.local,
        amenities: packageData.transportation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Activities details
    if (packageData.activities) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'activities',
        title: packageData.activities.title || 'Tour Activities',
        description: packageData.activities.description,
        tours: packageData.activities.tours.filter(t => t.trim() !== ''),
        amenities: packageData.activities.amenities.filter(a => a.trim() !== '')
      })
    }

    // Inclusions details
    if (packageData.inclusions) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'inclusions',
        title: packageData.inclusions.title || 'Other Inclusions',
        description: packageData.inclusions.description,
        items: packageData.inclusions.items.filter(i => i.trim() !== '')
      })
    }

    if (detailsSections.length > 0) {
      const { error: detailsError } = await supabase
        .from('package_details')
        .insert(detailsSections)

      if (detailsError) {
        console.error('Error updating package details:', detailsError)
        throw detailsError
      }
    }

    // 7. Create updated itinerary
    if (packageData.itinerary && packageData.itinerary.length > 0) {
      const itineraryData = packageData.itinerary
        .filter(day => day.title.trim() !== '' || day.description.trim() !== '')
        .map(day => ({
          package_id: packageId,
          day_number: day.day,
          title: day.title,
          description: day.description
        }))

      if (itineraryData.length > 0) {
        const { error: itineraryError } = await supabase
          .from('package_itinerary')
          .insert(itineraryData)

        if (itineraryError) {
          console.error('Error updating itinerary:', itineraryError)
          throw itineraryError
        }
      }
    }

    return {
      success: true,
      package: packageRecord,
      message: 'Package updated successfully'
    }

  } catch (error) {
    console.error('Error in updatePackage:', error)
    throw error
  }
}

/**
 * Get all packages
 * @returns {Promise<Array>} - Array of all packages
 */
export async function getAllPackages() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllPackages:', error)
    throw error
  }
}

/**
 * Get a single package by ID with all details
 * @param {string} packageId - UUID of the package
 * @returns {Promise<Object>} - Complete package data with details and itinerary
 */
export async function getPackageById(packageId) {
  try {
    // Get main package data
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError) {
      console.error('Error fetching package:', packageError)
      throw packageError
    }

    // Get package details
    const { data: details, error: detailsError } = await supabase
      .from('package_details')
      .select('*')
      .eq('package_id', packageId)

    // Get itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from('package_itinerary')
      .select('*')
      .eq('package_id', packageId)
      .order('day_number', { ascending: true })

    return {
      ...packageData,
      details: details || [],
      itinerary: itinerary || []
    }
  } catch (error) {
    console.error('Error in getPackageById:', error)
    throw error
  }
}

/**
 * Get a single package by slug with all details (SEO-friendly)
 * @param {string} slug - URL-friendly slug of the package
 * @returns {Promise<Object>} - Complete package data with details and itinerary
 */
export async function getPackageBySlug(slug) {
  try {
    // Get main package data by slug
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (packageError) {
      console.error('Error fetching package by slug:', packageError)
      throw packageError
    }

    // Get package details
    const { data: details, error: detailsError } = await supabase
      .from('package_details')
      .select('*')
      .eq('package_id', packageData.id)

    // Get itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from('package_itinerary')
      .select('*')
      .eq('package_id', packageData.id)
      .order('day_number', { ascending: true })

    return {
      ...packageData,
      details: details || [],
      itinerary: itinerary || []
    }
  } catch (error) {
    console.error('Error in getPackageBySlug:', error)
    throw error
  }
}

/**
 * Delete a package and all its associated data
 * @param {string} packageId - UUID of the package to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deletePackage(packageId) {
  try {
    // Get package to find images to delete
    const { data: packageData } = await supabase
      .from('packages')
      .select('images')
      .eq('id', packageId)
      .single()

    // Delete the package (cascade will handle details and itinerary)
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId)

    if (error) {
      console.error('Error deleting package:', error)
      throw error
    }

    // Delete associated images from storage
    if (packageData && packageData.images && packageData.images.length > 0) {
      await Promise.all(packageData.images.map(url => deletePackageImage(url)))
    }

    return true
  } catch (error) {
    console.error('Error in deletePackage:', error)
    throw error
  }
}

/**
 * Get package statistics for admin dashboard
 * @returns {Promise<Object>} - Package statistics
 */
export async function getPackageStats() {
  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('price, availability, rating')

    if (error) throw error

    const stats = {
      total: packages.length,
      available: packages.filter(p => p.availability === 'Available').length,
      limited: packages.filter(p => p.availability === 'Limited').length,
      soldOut: packages.filter(p => p.availability === 'Sold Out').length,
      averagePrice: packages.length > 0 
        ? (packages.reduce((sum, p) => sum + parseFloat(p.price), 0) / packages.length).toFixed(2)
        : 0,
      averageRating: packages.length > 0
        ? (packages.reduce((sum, p) => sum + parseFloat(p.rating || 0), 0) / packages.length).toFixed(1)
        : 0
    }

    return stats
  } catch (error) {
    console.error('Error in getPackageStats:', error)
    throw error
  }
}
