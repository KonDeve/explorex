import { supabase } from './supabase'

/**
 * Bookings Service
 * Handles all booking-related operations
 */

// Generate a unique booking number
const generateBookingNumber = async () => {
  try {
    // Get the latest booking number
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_number')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      // Extract number from format BK-001, BK-002, etc.
      const lastNumber = parseInt(data[0].booking_number.split('-')[1])
      const newNumber = lastNumber + 1
      return `BK-${String(newNumber).padStart(3, '0')}`
    }

    // First booking
    return 'BK-001'
  } catch (error) {
    console.error('Error generating booking number:', error)
    // Fallback to timestamp-based number
    return `BK-${Date.now().toString().slice(-6)}`
  }
}

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    // Generate booking number
    const bookingNumber = await generateBookingNumber()

    // Format total guests string
    const totalGuests = `${bookingData.adults} Adult${bookingData.adults !== 1 ? 's' : ''}${
      bookingData.children > 0 ? `, ${bookingData.children} Child${bookingData.children !== 1 ? 'ren' : ''}` : ''
    }`

    // Prepare booking data
    const booking = {
      booking_number: bookingNumber,
      user_id: bookingData.userId,
      package_id: bookingData.packageId,
      
      // Customer information
      customer_first_name: bookingData.firstName,
      customer_last_name: bookingData.lastName,
      customer_email: bookingData.email,
      customer_phone: bookingData.phone,
      
      // Travel details
      check_in_date: bookingData.checkIn,
      check_out_date: bookingData.checkOut,
      adults_count: bookingData.adults,
      children_count: bookingData.children,
      total_guests: totalGuests,
      
      // Pricing
      base_price: bookingData.totalAmount,
      children_price: 0.00,
      service_fee: 0.00,
      taxes: 0.00,
      discount: 0.00,
      total_amount: bookingData.totalAmount,
      
      // Payment
      payment_status: 'pending',
      amount_paid: 0.00,
      remaining_balance: bookingData.totalAmount,
      
      // Status
      status: 'pending',
      booking_type: 'upcoming',
      
      // Additional info
      special_requests: bookingData.specialRequests || null,
      booking_date: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      booking: data,
      message: 'Booking created successfully'
    }
  } catch (error) {
    console.error('Create booking error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create booking'
    }
  }
}

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    // Get booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    // Fetch package details
    const { data: packageData } = await supabase
      .from('packages')
      .select('id, title, slug, location, country, duration, people, price, price_value, images, features')
      .eq('id', bookingData.package_id)
      .single()

    // Fetch user details
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone')
      .eq('id', bookingData.user_id)
      .single()

    return {
      success: true,
      booking: {
        ...bookingData,
        package: packageData,
        user: userData
      }
    }
  } catch (error) {
    console.error('Get booking error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch booking'
    }
  }
}

// Get bookings by user ID
export const getUserBookings = async (userId) => {
  try {
    // Get bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookingsError) throw bookingsError

    // Fetch package details for each booking
    const bookingsWithPackages = await Promise.all(
      bookingsData.map(async (booking) => {
        const { data: packageData } = await supabase
          .from('packages')
          .select('id, title, slug, location, country, duration, people, price, price_value, images')
          .eq('id', booking.package_id)
          .single()

        return {
          ...booking,
          package: packageData
        }
      })
    )

    return {
      success: true,
      bookings: bookingsWithPackages
    }
  } catch (error) {
    console.error('Get user bookings error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }
  }
}

// Get all bookings (admin only)
export const getAllBookings = async () => {
  try {
    // First get all bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (bookingsError) throw bookingsError

    // Then fetch related package and user data separately
    const bookingsWithDetails = await Promise.all(
      bookingsData.map(async (booking) => {
        // Fetch package details
        const { data: packageData } = await supabase
          .from('packages')
          .select('id, title, slug, location, country, duration, people, price, price_value, images')
          .eq('id', booking.package_id)
          .single()

        // Fetch user details
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, phone')
          .eq('id', booking.user_id)
          .single()

        return {
          ...booking,
          package: packageData,
          user: userData
        }
      })
    )

    return {
      success: true,
      bookings: bookingsWithDetails
    }
  } catch (error) {
    console.error('Get all bookings error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }
  }
}

// Update booking status (admin)
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      booking: data,
      message: 'Booking status updated successfully'
    }
  } catch (error) {
    console.error('Update booking status error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update booking status'
    }
  }
}

// Update payment status (admin)
export const updatePaymentStatus = async (bookingId, paymentStatus, amountPaid = null) => {
  try {
    const updateData = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    }

    if (amountPaid !== null) {
      updateData.amount_paid = amountPaid
      
      // Get booking to calculate remaining balance
      const { data: booking } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('id', bookingId)
        .single()

      if (booking) {
        updateData.remaining_balance = booking.total_amount - amountPaid
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      booking: data,
      message: 'Payment status updated successfully'
    }
  } catch (error) {
    console.error('Update payment status error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update payment status'
    }
  }
}

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      booking: data,
      message: 'Booking cancelled successfully'
    }
  } catch (error) {
    console.error('Cancel booking error:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel booking'
    }
  }
}
