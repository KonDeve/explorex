// Gemini AI Analytics Service
const GEMINI_API_KEY = 'AIzaSyCz8outh51ySIeaD2-Ua6vyPWt7oNDhAhU'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

/**
 * Generate revenue analytics insights using Gemini AI
 * @param {Array} bookings - Array of booking objects
 * @returns {Promise<string>} - AI-generated insights
 */
export const generateRevenueAnalytics = async (bookings) => {
  try {
    // Prepare data for Gemini
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const avgBookingValue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0
    
    // Calculate monthly revenue
    const monthlyRevenue = {}
    confirmedBookings.forEach(b => {
      const month = new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.total_amount || 0)
    })
    
    // Calculate growth trends
    const months = Object.keys(monthlyRevenue).sort()
    const recentMonths = months.slice(-3)
    const revenueData = recentMonths.map(m => monthlyRevenue[m])
    
    // Payment status breakdown
    const paymentStats = {
      paid: confirmedBookings.filter(b => b.payment_status === 'paid').length,
      pending: confirmedBookings.filter(b => b.payment_status === 'pending').length,
      failed: confirmedBookings.filter(b => b.payment_status === 'failed').length
    }

    // Prepare prompt for Gemini
    const prompt = `You are a business analytics expert analyzing travel booking data. Provide concise, actionable insights based on the following data:

Total Revenue: ₱${totalRevenue.toLocaleString()}
Total Confirmed Bookings: ${confirmedBookings.length}
Average Booking Value: ₱${Math.round(avgBookingValue).toLocaleString()}

Recent Monthly Revenue (Last 3 months):
${recentMonths.map((m, i) => `${m}: ₱${revenueData[i].toLocaleString()}`).join('\n')}

Payment Status:
- Paid: ${paymentStats.paid} bookings
- Pending: ${paymentStats.pending} bookings
- Failed: ${paymentStats.failed} bookings

Provide:
1. Key revenue trends and patterns
2. Growth analysis (increasing/decreasing/stable)
3. Payment collection insights
4. 2-3 specific recommendations to improve revenue

Keep it concise (max 150 words) and business-focused.`

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error response:', errorData)
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Gemini API response:', data)
    
    const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate insights at this time.'
    
    return insights

  } catch (error) {
    console.error('Error generating Gemini analytics:', error)
    throw error // Re-throw to be caught by the calling function
  }
}

/**
 * Generate package performance insights using Gemini AI
 * @param {Array} packages - Array of package objects with booking stats
 * @returns {Promise<string>} - AI-generated insights
 */
export const generatePackageInsights = async (packages) => {
  try {
    const prompt = `Analyze this travel package performance data and provide insights:

${packages.slice(0, 5).map((pkg, i) => 
  `${i + 1}. ${pkg.title}
   - Bookings: ${pkg.bookings}
   - Revenue: ₱${pkg.revenue.toLocaleString()}
   - Rating: ${pkg.avgRating}/5`
).join('\n\n')}

Provide:
1. Top performing packages
2. Underperforming packages
3. Pricing optimization suggestions
4. Marketing recommendations

Keep it concise (max 120 words).`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    const data = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || 'Unable to generate insights.'
    
  } catch (error) {
    console.error('Error generating package insights:', error)
    return 'Unable to generate insights at this time.'
  }
}
