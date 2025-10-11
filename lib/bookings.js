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

    // Format total guests string - default to "1 Adult" if not provided
    const totalGuests = `${bookingData.adults || 1} ${(bookingData.adults || 1) !== 1 ? 's' : ''}${
      (bookingData.children || 0) > 0 ? `, ${bookingData.children} Child${bookingData.children !== 1 ? 'ren' : ''}` : ''
    }`

    // Prepare booking data matching the simplified schema
    const booking = {
      booking_number: bookingNumber,
      user_id: bookingData.userId,
      package_id: bookingData.packageId,
      deal_id: bookingData.dealId || null, // Link to package deal
      
      // Customer information
      customer_first_name: bookingData.firstName,
      customer_last_name: bookingData.lastName,
      customer_email: bookingData.email,
      customer_phone: bookingData.phone,
      
      // Travel details
      check_in_date: bookingData.checkIn,
      check_out_date: bookingData.checkOut,
      total_guests: totalGuests,
      
      // Pricing (simplified schema)
      base_price: bookingData.totalAmount,
      discount: 0.00,
      total_amount: bookingData.totalAmount,
      
      // Payment - IMPORTANT: Set amount_paid from bookingData
      // Determine payment status based on amount paid
      payment_status: (() => {
        const paid = bookingData.amountPaid || bookingData.amountToPay || 0
        const total = bookingData.totalAmount || 0
        if (paid >= total) return 'paid'
        if (paid > 0) return 'partial'
        return 'pending'
      })(),
      amount_paid: bookingData.amountPaid || bookingData.amountToPay || 0,
      remaining_balance: (() => {
        const paid = bookingData.amountPaid || bookingData.amountToPay || 0
        const total = bookingData.totalAmount || 0
        return Math.max(0, total - paid)
      })(),
      
      // Status
      status: 'pending',
      booking_type: 'upcoming',
      
      // Timestamps
      booking_date: new Date().toISOString(),
    }

    console.log('Creating booking with data:', booking) // Debug log

    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) throw error

    // NOTE: Slots are NOT deducted here even if payment is made
    // Slots are only deducted when admin manually confirms the booking
    // This is handled in updateBookingStatus() when status changes to 'confirmed'

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

    // Fetch package details (using NEW schema - no duration, people, price, features fields)
    const { data: packageData } = await supabase
      .from('packages')
      .select('id, title, slug, location, country, images')
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

    // Fetch package details for each booking (using NEW schema - no duration, people, price fields)
    const bookingsWithPackages = await Promise.all(
      bookingsData.map(async (booking) => {
        const { data: packageData } = await supabase
          .from('packages')
          .select('id, title, slug, location, country, images')
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

    // Then fetch related package and user data separately (using NEW schema)
    const bookingsWithDetails = await Promise.all(
      bookingsData.map(async (booking) => {
        // Fetch package details (no duration, people, price fields)
        const { data: packageData } = await supabase
          .from('packages')
          .select('id, title, slug, location, country, images')
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
    // First, get the current booking details
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status, deal_id')
      .eq('id', bookingId)
      .single()

    if (fetchError) throw fetchError

    const oldStatus = currentBooking.status
    const dealId = currentBooking.deal_id

    // Update the booking status
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

    // Handle slot management when status changes to/from confirmed
    if (dealId) {
      // If changing TO confirmed (and wasn't confirmed before)
      if (status === 'confirmed' && oldStatus !== 'confirmed') {
        // Increment slots_booked (reduce available slots)
        // Using fetch-then-update pattern for atomic operation
        const { data: dealData, error: fetchError } = await supabase
          .from('package_deals')
          .select('slots_booked')
          .eq('id', dealId)
          .single()

        if (!fetchError && dealData) {
          const { error: incrementError } = await supabase
            .from('package_deals')
            .update({ 
              slots_booked: (dealData.slots_booked || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', dealId)

          if (incrementError) {
            console.error('Failed to increment slots_booked:', incrementError)
          } else {
            console.log(`Slot booked! Deal ${dealId}: slots_booked increased to ${dealData.slots_booked + 1}`)
          }
        }
      }
      // If changing FROM confirmed to something else (cancelled, pending, etc.)
      else if (status !== 'confirmed' && oldStatus === 'confirmed') {
        // Decrement slots_booked (restore available slots)
        const { data: dealData, error: fetchError } = await supabase
          .from('package_deals')
          .select('slots_booked')
          .eq('id', dealId)
          .single()

        if (!fetchError && dealData) {
          const { error: decrementError } = await supabase
            .from('package_deals')
            .update({ 
              slots_booked: Math.max((dealData.slots_booked || 0) - 1, 0), // Ensure it doesn't go below 0
              updated_at: new Date().toISOString()
            })
            .eq('id', dealId)

          if (decrementError) {
            console.error('Failed to decrement slots_booked:', decrementError)
          } else {
            console.log(`Slot released! Deal ${dealId}: slots_booked decreased to ${Math.max(dealData.slots_booked - 1, 0)}`)
          }
        }
      }
    }

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

// Process payment and update booking
export const processPayment = async (bookingId, paymentData) => {
  try {
    // IDEMPOTENCY CHECK: Verify if this transaction_id already exists
    if (paymentData.transaction_id) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, booking_id, amount, status')
        .eq('transaction_id', paymentData.transaction_id)
        .maybeSingle()

      if (existingPayment) {
        console.log('Payment already processed:', paymentData.transaction_id)
        
        // Return the existing booking and payment data
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        return {
          success: true,
          alreadyProcessed: true,
          booking: booking,
          payment: existingPayment,
          message: 'Payment already processed - no duplicate created'
        }
      }
    }

    // Fetch booking without joining packages (we don't need package data)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    // VALIDATION CHECK: Don't process payment if booking is already fully paid
    if (booking.payment_status === 'paid' && booking.remaining_balance <= 0) {
      console.log('Booking already fully paid:', bookingId)
      return {
        success: true,
        alreadyProcessed: true,
        booking: booking,
        message: 'Booking is already fully paid'
      }
    }

    // Calculate amounts
    const amountPaid = parseFloat(paymentData.amount)
    const newTotalPaid = (booking.amount_paid || 0) + amountPaid
    const remainingBalance = booking.total_amount - newTotalPaid

    // Determine new payment status
    let paymentStatus
    if (remainingBalance <= 0) {
      paymentStatus = 'paid'
    } else if (newTotalPaid > 0) {
      paymentStatus = 'partial'
    } else {
      paymentStatus = 'pending'
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        amount_paid: newTotalPaid,
        remaining_balance: Math.max(0, remainingBalance),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: booking.user_id,
        amount: amountPaid,
        payment_method: 'other', // PayMongo - use 'other' since 'paymongo' is not in the schema constraint
        status: 'completed',
        transaction_id: paymentData.transaction_id || paymentData.checkout_session_id,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    return {
      success: true,
      booking: updatedBooking,
      payment: payment,
      message: 'Payment processed successfully'
    }
  } catch (error) {
    console.error('Process payment error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process payment'
    }
  }
}

// Auto-cancel bookings with remaining balance less than 45 days before travel
export const autoCancelExpiredBookings = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate date 45 days from now
    const deadline = new Date(today)
    deadline.setDate(deadline.getDate() + 45)

    console.log('Checking for bookings to auto-cancel...')
    console.log('Today:', today.toISOString())
    console.log('45-day deadline:', deadline.toISOString())

    // Find bookings that meet cancellation criteria:
    // 1. Status is 'pending' or 'confirmed' (not already cancelled/completed)
    // 2. Has remaining balance > 0
    // 3. Check-in date is within 45 days
    const { data: bookingsToCancel, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_number, check_in_date, remaining_balance, status, deal_id, customer_email, customer_first_name')
      .in('status', ['pending', 'confirmed'])
      .gt('remaining_balance', 0)
      .lte('check_in_date', deadline.toISOString())

    if (fetchError) {
      console.error('Error fetching bookings to cancel:', fetchError)
      throw fetchError
    }

    if (!bookingsToCancel || bookingsToCancel.length === 0) {
      console.log('No bookings to auto-cancel')
      return {
        success: true,
        cancelledCount: 0,
        message: 'No bookings needed cancellation'
      }
    }

    console.log(`Found ${bookingsToCancel.length} bookings to auto-cancel:`, bookingsToCancel)

    const cancelResults = []

    // Cancel each booking
    for (const booking of bookingsToCancel) {
      try {
        // Update booking status to cancelled
        const { error: cancelError } = await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id)

        if (cancelError) {
          console.error(`Failed to cancel booking ${booking.booking_number}:`, cancelError)
          cancelResults.push({
            bookingId: booking.id,
            bookingNumber: booking.booking_number,
            success: false,
            error: cancelError.message
          })
          continue
        }

        // If booking was confirmed, restore the slot
        if (booking.status === 'confirmed' && booking.deal_id) {
          const { data: dealData, error: fetchDealError } = await supabase
            .from('package_deals')
            .select('slots_booked')
            .eq('id', booking.deal_id)
            .single()

          if (!fetchDealError && dealData) {
            await supabase
              .from('package_deals')
              .update({ 
                slots_booked: Math.max((dealData.slots_booked || 0) - 1, 0),
                updated_at: new Date().toISOString()
              })
              .eq('id', booking.deal_id)

            console.log(`Restored slot for deal ${booking.deal_id}`)
          }
        }

        console.log(`✅ Auto-cancelled booking ${booking.booking_number} (non-refundable)`)
        cancelResults.push({
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          success: true,
          customerEmail: booking.customer_email,
          customerName: booking.customer_first_name
        })

        // TODO: Send email notification to customer about cancellation
        // This would notify them that their booking was cancelled due to unpaid balance

      } catch (error) {
        console.error(`Error processing booking ${booking.booking_number}:`, error)
        cancelResults.push({
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = cancelResults.filter(r => r.success).length
    console.log(`Auto-cancelled ${successCount} of ${bookingsToCancel.length} bookings`)

    return {
      success: true,
      cancelledCount: successCount,
      totalChecked: bookingsToCancel.length,
      results: cancelResults,
      message: `Auto-cancelled ${successCount} bookings with unpaid balance`
    }

  } catch (error) {
    console.error('Auto-cancel expired bookings error:', error)
    return {
      success: false,
      error: error.message || 'Failed to auto-cancel expired bookings'
    }
  }
}

