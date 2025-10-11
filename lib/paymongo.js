/**
 * PayMongo Payment Gateway Integration
 * API Documentation: https://developers.paymongo.com/reference
 */

const PAYMONGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY || 'your_public_key_here'
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || 'your_secret_key_here'

// Base64 encode the secret key for API authentication
const getAuthHeader = () => {
  return `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
}

/**
 * Create a PayMongo checkout session
 * @param {Object} paymentData - Payment details
 * @returns {Object} Checkout session data
 */
export const createCheckoutSession = async (paymentData) => {
  try {
    const {
      amount,
      description,
      lineItems,
      billing,
      successUrl,
      cancelUrl
    } = paymentData

    // Build line items array
    const items = lineItems || [
      {
        currency: 'PHP',
        amount: Math.round(amount * 100), // Convert to centavos
        description: description,
        name: 'Travel Package Payment',
        quantity: 1
      }
    ]

    // Convert custom line items format to PayMongo format
    const paymongoLineItems = items.map(item => {
      // Filter images to only include valid HTTP/HTTPS URLs
      const validImages = (item.images || []).filter(img => 
        img && (img.startsWith('http://') || img.startsWith('https://'))
      )
      
      return {
        currency: 'PHP',
        amount: Math.round(item.amount * 100), // Convert to centavos
        description: item.description || '',
        name: item.name || 'Travel Package',
        quantity: item.quantity || 1,
        // Only include images if we have valid URLs
        ...(validImages.length > 0 && { images: validImages })
      }
    })

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: paymongoLineItems,
            payment_method_types: [
              'card',
              'gcash',
              'paymaya',
              'grab_pay'
            ],
            description: description || 'Travel Package Payment',
            billing: billing ? {
              email: billing.email,
              name: billing.name
            } : undefined,
            success_url: successUrl,
            cancel_url: cancelUrl || successUrl.replace('/success', '')
          }
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session')
    }

    return {
      success: true,
      checkoutUrl: data.data.attributes.checkout_url,
      sessionId: data.data.id,
      session: data.data
    }
  } catch (error) {
    console.error('PayMongo checkout error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create checkout session'
    }
  }
}

/**
 * Retrieve checkout session details
 * @param {string} sessionId - Checkout session ID
 * @returns {Object} Session details
 */
export const getCheckoutSession = async (sessionId) => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader()
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to retrieve session')
    }

    console.log('PayMongo API Response:', data) // Debug log

    return {
      success: true,
      session: data.data,
      rawData: data
    }
  } catch (error) {
    console.error('Get session error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Create a payment intent (alternative method)
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment intent data
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const {
      amount,
      description,
      metadata
    } = paymentData

    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert to centavos
            payment_method_allowed: ['card', 'paymaya', 'gcash'],
            payment_method_options: {
              card: {
                request_three_d_secure: 'any'
              }
            },
            currency: 'PHP',
            description: description,
            statement_descriptor: 'Xplorex Travel',
            metadata: metadata
          }
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to create payment intent')
    }

    return {
      success: true,
      intent: data.data
    }
  } catch (error) {
    console.error('Payment intent error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  createCheckoutSession,
  getCheckoutSession,
  createPaymentIntent,
  PAYMONGO_PUBLIC_KEY
}
