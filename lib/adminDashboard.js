import { supabase } from './supabase'

/**
 * Admin Dashboard Service
 * Handles all admin dashboard-related operations
 */

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get current date and calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Get current period bookings (last 30 days)
    const { data: currentBookings, error: currentBookingsError } = await supabase
      .from('bookings')
      .select('total_amount, status, payment_status, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (currentBookingsError) throw currentBookingsError

    // Get previous period bookings (30-60 days ago)
    const { data: previousBookings, error: previousBookingsError } = await supabase
      .from('bookings')
      .select('total_amount, status, payment_status, created_at')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (previousBookingsError) throw previousBookingsError

    // Get all bookings for total revenue
    const { data: allBookings, error: allBookingsError } = await supabase
      .from('bookings')
      .select('total_amount, status, payment_status')

    if (allBookingsError) throw allBookingsError

    // Calculate total revenue (from all bookings)
    const totalRevenue = allBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    
    // Calculate current and previous period revenue
    const currentRevenue = currentBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    const previousRevenue = previousBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    
    // Calculate revenue change percentage
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0

    // Count active bookings (confirmed or pending)
    const activeBookings = allBookings?.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length || 0

    const currentActiveBookings = currentBookings?.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length || 0

    const previousActiveBookings = previousBookings?.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length || 0

    // Calculate active bookings change percentage
    const activeBookingsChange = previousActiveBookings > 0
      ? ((currentActiveBookings - previousActiveBookings) / previousActiveBookings * 100).toFixed(1)
      : currentActiveBookings > 0 ? 100 : 0

    // Get current period customers
    const { data: currentCustomers, error: currentCustomersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'customer')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (currentCustomersError) throw currentCustomersError

    // Get previous period customers
    const { data: previousCustomers, error: previousCustomersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'customer')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (previousCustomersError) throw previousCustomersError

    // Get total customers count
    const { count: totalCustomersCount, error: totalCustomersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    if (totalCustomersError) throw totalCustomersError

    // Calculate customers change percentage
    const currentCustomersCount = currentCustomers?.length || 0
    const previousCustomersCount = previousCustomers?.length || 0
    const customersChange = previousCustomersCount > 0
      ? ((currentCustomersCount - previousCustomersCount) / previousCustomersCount * 100).toFixed(1)
      : currentCustomersCount > 0 ? 100 : 0

    // Get current period packages
    const { data: currentPackages, error: currentPackagesError } = await supabase
      .from('packages')
      .select('id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (currentPackagesError) throw currentPackagesError

    // Get previous period packages
    const { data: previousPackages, error: previousPackagesError } = await supabase
      .from('packages')
      .select('id')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (previousPackagesError) throw previousPackagesError

    // Get total packages count
    const { count: totalPackagesCount, error: totalPackagesError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })

    if (totalPackagesError) throw totalPackagesError

    // Calculate packages change percentage
    const currentPackagesCount = currentPackages?.length || 0
    const previousPackagesCount = previousPackages?.length || 0
    const packagesChange = previousPackagesCount > 0
      ? ((currentPackagesCount - previousPackagesCount) / previousPackagesCount * 100).toFixed(1)
      : currentPackagesCount > 0 ? 100 : previousPackagesCount === 0 && currentPackagesCount === 0 ? 0 : -100

    return {
      success: true,
      stats: {
        totalRevenue,
        revenueChange: parseFloat(revenueChange),
        activeBookings,
        activeBookingsChange: parseFloat(activeBookingsChange),
        totalCustomers: totalCustomersCount || 0,
        customersChange: parseFloat(customersChange),
        totalPackages: totalPackagesCount || 0,
        packagesChange: parseFloat(packagesChange)
      }
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard statistics'
    }
  }
}

// Get recent bookings (last 5)
export const getRecentBookings = async () => {
  try {
    // First, get bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, booking_number, customer_first_name, customer_last_name, total_amount, status, check_in_date, created_at, package_id')
      .order('created_at', { ascending: false })
      .limit(5)

    if (bookingsError) throw bookingsError

    // Get package IDs
    const packageIds = [...new Set(bookings.map(b => b.package_id).filter(Boolean))]

    // Fetch packages
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id, title')
      .in('id', packageIds)

    if (packagesError) throw packagesError

    // Create package lookup
    const packageMap = {}
    packages?.forEach(pkg => {
      packageMap[pkg.id] = pkg.title
    })

    // Format bookings with package titles
    const formattedBookings = bookings.map(booking => ({
      id: booking.booking_number,
      customer: `${booking.customer_first_name} ${booking.customer_last_name}`,
      package: packageMap[booking.package_id] || 'N/A',
      date: booking.check_in_date,
      amount: booking.total_amount,
      status: booking.status
    }))

    return {
      success: true,
      bookings: formattedBookings
    }
  } catch (error) {
    console.error('Get recent bookings error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch recent bookings'
    }
  }
}

// Get top performing packages
export const getTopPackages = async () => {
  try {
    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('package_id, total_amount')

    if (bookingsError) throw bookingsError

    // Get unique package IDs
    const packageIds = [...new Set(bookings.map(b => b.package_id).filter(Boolean))]

    if (packageIds.length === 0) {
      return {
        success: true,
        packages: []
      }
    }

    // Fetch package details (removed rating as it's not in the updated schema)
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id, title')
      .in('id', packageIds)

    if (packagesError) throw packagesError

    // Fetch reviews to calculate average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('package_id, rating')
      .in('package_id', packageIds)

    if (reviewsError) {
      console.warn('Failed to fetch reviews:', reviewsError)
    }

    // Calculate average rating per package
    const ratingMap = {}
    reviews?.forEach(review => {
      if (!ratingMap[review.package_id]) {
        ratingMap[review.package_id] = {
          total: 0,
          count: 0
        }
      }
      ratingMap[review.package_id].total += review.rating
      ratingMap[review.package_id].count += 1
    })

    // Create package lookup with calculated ratings
    const packageMap = {}
    packages?.forEach(pkg => {
      const ratingData = ratingMap[pkg.id]
      const avgRating = ratingData ? ratingData.total / ratingData.count : 0
      
      packageMap[pkg.id] = {
        title: pkg.title,
        rating: avgRating
      }
    })

    // Group by package and calculate stats
    const packageStats = {}
    
    bookings?.forEach(booking => {
      const packageId = booking.package_id
      const packageInfo = packageMap[packageId]
      
      if (!packageInfo) return // Skip if package not found
      
      if (!packageStats[packageId]) {
        packageStats[packageId] = {
          name: packageInfo.title,
          bookings: 0,
          revenue: 0,
          rating: packageInfo.rating
        }
      }
      
      packageStats[packageId].bookings += 1
      packageStats[packageId].revenue += booking.total_amount || 0
    })

    // Convert to array and sort by bookings
    const topPackages = Object.values(packageStats)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 4) // Top 4 packages

    return {
      success: true,
      packages: topPackages
    }
  } catch (error) {
    console.error('Get top packages error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch top packages'
    }
  }
}

// Get all dashboard data at once
export const getDashboardData = async () => {
  try {
    const [statsResult, bookingsResult, packagesResult] = await Promise.all([
      getDashboardStats(),
      getRecentBookings(),
      getTopPackages()
    ])

    if (!statsResult.success || !bookingsResult.success || !packagesResult.success) {
      throw new Error('Failed to fetch some dashboard data')
    }

    return {
      success: true,
      data: {
        stats: statsResult.stats,
        recentBookings: bookingsResult.bookings,
        topPackages: packagesResult.packages
      }
    }
  } catch (error) {
    console.error('Get dashboard data error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard data'
    }
  }
}
