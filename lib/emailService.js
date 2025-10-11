import emailjs from '@emailjs/browser'

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_0pmflxm'
const EMAILJS_TEMPLATE_ID = 'template_jz3sq6m'
const EMAILJS_PUBLIC_KEY = 'asRqMN6TQm_X6kjuh'

/**
 * Send booking confirmation email
 * @param {Object} emailData - Email data
 * @param {string} emailData.to_email - Recipient email address
 * @param {string} emailData.name - Customer name
 * @param {string} emailData.package_name - Package/trip name
 * @param {string} emailData.time - Check-in date/time
 */
export const sendBookingConfirmationEmail = async (emailData) => {
  try {
    const templateParams = {
      to_email: emailData.to_email,      // Recipient email
      to_name: emailData.name,            // Recipient name
      name: emailData.name,               // For template {{name}}
      package_name: emailData.package_name,
      time: emailData.time,
      reply_to: emailData.to_email        // Reply-to address
    }

    console.log('Sending booking confirmation email to:', emailData.to_email)
    console.log('Template params:', templateParams)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('Email sent successfully:', response)
    return { success: true, response }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.text || error.message || error }
  }
}

/**
 * Initialize EmailJS (call this once in your app)
 */
export const initEmailJS = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}
