import { supabase } from './supabase'

/**
 * Upload package images to Supabase Storage (media/package_images)
 * @param {File[]} imageFiles - Array o    // Transportation section
    if (packageData.transportation) {
      const transportationAmenities = packageData.transportation.amenities.filter(a => a.trim() !== '')
      if (packageData.transportation.local || transportationAmenities.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'transportation',
          title: packageData.transportation.title || 'Transportation',
          local: packageData.transportation.local,
          amenities: transportationAmenities
        })
      }
    }

    // Inclusions section (consolidated from accommodation)
    if (packageData.accommodation) {
      const inclusionItems = packageData.accommodation.amenities.filter(a => a.trim() !== '')
      if (inclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'inclusions',
          title: packageData.accommodation.title || 'Inclusions',
          items: inclusionItems
        })
      }
    }oad
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

    // 2. Create the main package record (NEW SCHEMA - removed people, price, rating, reviews_count, highlights, features)
    const packageInsertData = {
      title: packageData.title,
      location: packageData.location,
      country: packageData.country || packageData.location?.toUpperCase(),
      category: packageData.category || 'International',
      hero_type: packageData.hero_type || 'beach',
      popular: packageData.popular || false,
      featured: packageData.featured || false,
      description: packageData.description,
      availability: packageData.availability || 'Available',
      images: imageUrls
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

    // 3. Create package deals (multiple date ranges with individual pricing)
    if (packageData.deals && packageData.deals.length > 0) {
      const dealEntries = packageData.deals
        .filter(deal => deal.deal_start_date && deal.deal_end_date)
        .map(deal => ({
          package_id: packageId,
          deal_start_date: deal.deal_start_date,
          deal_end_date: deal.deal_end_date,
          slots_available: deal.slots_available ? parseInt(deal.slots_available) : 0,
          slots_booked: 0,
          deal_price: deal.deal_price ? parseFloat(deal.deal_price) : 0, // Individual price per deal in PHP
          is_active: true
        }))

      if (dealEntries.length > 0) {
        const { error: dealsError } = await supabase
          .from('package_deals')
          .insert(dealEntries)

        if (dealsError) {
          console.error('Error creating package deals:', dealsError)
          // Note: Package is already created, so we don't rollback
        }
      }
    }

    // 4. Create package details sections (NEW SCHEMA - simplified sections)
    const detailsSections = []

    // Transportation section (simplified - no description field)
    if (packageData.transportation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'transportation',
        title: packageData.transportation.title || 'Transportation',
        local: packageData.transportation.local,
        amenities: packageData.transportation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Inclusions section (consolidated from accommodation)
    if (packageData.accommodation) {
      detailsSections.push({
        package_id: packageId,
        section_type: 'inclusions',
        title: packageData.accommodation.title || 'Inclusions',
        items: packageData.accommodation.amenities.filter(a => a.trim() !== '')
      })
    }

    // Exclusions section (consolidated from activities)
    if (packageData.activities) {
      const exclusionItems = packageData.activities.tours.filter(t => t.trim() !== '')
      if (exclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'exclusions',
          title: packageData.activities.title || 'Exclusions',
          items: exclusionItems
        })
      }
    }

    // Other Inclusions section
    if (packageData.inclusions) {
      const otherInclusionItems = packageData.inclusions.items.filter(i => i.trim() !== '')
      if (otherInclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'inclusions',
          title: packageData.inclusions.title || 'Other Inclusions',
          items: otherInclusionItems
        })
      }
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


    // 5. Create itinerary entries
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

    // 4. Update the main package record (NEW SCHEMA - removed people, price, rating, highlights, features)
    const packageUpdateData = {
      title: packageData.title,
      location: packageData.location,
      country: packageData.country || packageData.location?.toUpperCase(),
      category: packageData.category || 'International',
      hero_type: packageData.hero_type || 'beach',
      popular: packageData.popular || false,
      featured: packageData.featured || false,
      description: packageData.description,
      availability: packageData.availability,
      images: updatedImages,
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

    // 5. Delete existing package details, itinerary, and deals
    await supabase.from('package_details').delete().eq('package_id', packageId)
    await supabase.from('package_itinerary').delete().eq('package_id', packageId)
    await supabase.from('package_deals').delete().eq('package_id', packageId)

    // 6. Create updated package deals (multiple date ranges with individual pricing)
    if (packageData.deals && packageData.deals.length > 0) {
      const dealEntries = packageData.deals
        .filter(deal => deal.deal_start_date && deal.deal_end_date)
        .map(deal => ({
          package_id: packageId,
          deal_start_date: deal.deal_start_date,
          deal_end_date: deal.deal_end_date,
          slots_available: deal.slots_available ? parseInt(deal.slots_available) : 0,
          slots_booked: deal.slots_booked || 0, // Preserve existing bookings if updating
          deal_price: deal.deal_price ? parseFloat(deal.deal_price) : 0, // Individual price per deal in PHP
          is_active: deal.is_active !== undefined ? deal.is_active : true
        }))

      if (dealEntries.length > 0) {
        const { error: dealsError } = await supabase
          .from('package_deals')
          .insert(dealEntries)

        if (dealsError) {
          console.error('Error creating package deals:', dealsError)
          // Note: Package is already updated, so we don't rollback
        }
      }
    }

    // 7. Create updated package details sections (NEW SCHEMA - simplified sections)
    const detailsSections = []
    
    // Transportation details (simplified - no description field)
    if (packageData.transportation) {
      const transportationAmenities = packageData.transportation.amenities.filter(a => a.trim() !== '')
      if (packageData.transportation.local || transportationAmenities.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'transportation',
          title: packageData.transportation.title || 'Transportation',
          local: packageData.transportation.local,
          amenities: transportationAmenities
        })
      }
    }

    // Inclusions details (consolidated from accommodation)
    if (packageData.accommodation) {
      const inclusionItems = packageData.accommodation.amenities.filter(a => a.trim() !== '')
      if (inclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'inclusions',
          title: packageData.accommodation.title || 'Inclusions',
          items: inclusionItems
        })
      }
    }

    // Exclusions details (consolidated from activities)
    if (packageData.activities) {
      const exclusionItems = packageData.activities.tours.filter(t => t.trim() !== '')
      if (exclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'exclusions',
          title: packageData.activities.title || 'Exclusions',
          items: exclusionItems
        })
      }
    }

    // Other Inclusions details
    if (packageData.inclusions) {
      const otherInclusionItems = packageData.inclusions.items.filter(i => i.trim() !== '')
      if (otherInclusionItems.length > 0) {
        detailsSections.push({
          package_id: packageId,
          section_type: 'inclusions',
          title: packageData.inclusions.title || 'Other Inclusions',
          items: otherInclusionItems
        })
      }
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
    // Get all packages
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching packages:', error)
      throw error
    }

    // Get all deals for all packages
    const { data: allDeals, error: dealsError } = await supabase
      .from('package_deals')
      .select('*')
      .order('deal_start_date', { ascending: true })

    // Attach deals to their respective packages
    const packagesWithDeals = (packages || []).map(pkg => ({
      ...pkg,
      deals: (allDeals || []).filter(deal => deal.package_id === pkg.id)
    }))

    return packagesWithDeals
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
    const { data: packageData, error: packageError} = await supabase
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

    // Get package deals (multiple date ranges)
    const { data: deals, error: dealsError } = await supabase
      .from('package_deals')
      .select('*')
      .eq('package_id', packageId)
      .order('deal_start_date', { ascending: true })

    return {
      ...packageData,
      details: details || [],
      itinerary: itinerary || [],
      deals: deals || []
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

    // Get package deals (multiple date ranges)
    const { data: deals, error: dealsError } = await supabase
      .from('package_deals')
      .select('*')
      .eq('package_id', packageData.id)
      .order('deal_start_date', { ascending: true })

    return {
      ...packageData,
      details: details || [],
      itinerary: itinerary || [],
      deals: deals || []
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
    // Get packages and their deals for price calculation
    const { data: packages, error } = await supabase
      .from('packages')
      .select('id, availability')

    if (error) throw error

    // Get all deals to calculate average price
    const { data: deals, error: dealsError } = await supabase
      .from('package_deals')
      .select('deal_price')

    if (dealsError) throw dealsError

    // Get reviews for average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')

    if (reviewsError) throw reviewsError

    const stats = {
      total: packages.length,
      available: packages.filter(p => p.availability === 'Available').length,
      limited: packages.filter(p => p.availability === 'Limited').length,
      soldOut: packages.filter(p => p.availability === 'Sold Out').length,
      averagePrice: deals.length > 0 
        ? (deals.reduce((sum, d) => sum + parseFloat(d.deal_price || 0), 0) / deals.length).toFixed(2)
        : 0,
      averageRating: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0
    }

    return stats
  } catch (error) {
    console.error('Error in getPackageStats:', error)
    throw error
  }
}
