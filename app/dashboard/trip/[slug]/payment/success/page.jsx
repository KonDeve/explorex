"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutSession } from '@/lib/paymongo'
import { processPayment, getBookingById } from '@/lib/bookings'
import Header from "@/components/header"
import { Download, CheckCircle, Loader2, XCircle, FileText, Check } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Processing your payment...')
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [bookingNumber, setBookingNumber] = useState(null)
  const hasVerified = useRef(false) // Prevent duplicate verification

  // Function to download receipt as PDF
  const downloadReceipt = async () => {
    if (!paymentDetails?.receipt) return

    const receipt = paymentDetails.receipt
    
    // Dynamically import pdfMake to avoid SSR issues
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    
    const pdfMake = pdfMakeModule.default
    pdfMake.vfs = pdfFontsModule.default
    
    const docDefinition = {
      content: [
        // Header
        {
          table: {
            widths: ['*'],
            body: [
              [{
                text: 'PAYMENT RECEIPT',
                style: 'header',
                alignment: 'center',
                fillColor: '#3b82f6',
                color: 'white',
                margin: [0, 10, 0, 10]
              }]
            ]
          },
          layout: 'noBorders'
        },
        {
          text: 'Xplorex Travel',
          style: 'subheader',
          alignment: 'center',
          color: '#3b82f6',
          margin: [0, 10, 0, 5]
        },
        { text: '\n' },
        
        // Receipt details
        {
          columns: [
            { text: `Receipt Number: ${receipt.receiptNumber}`, style: 'label' },
            { text: `Date: ${receipt.date}`, style: 'label', alignment: 'right' }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        
        // Customer Information
        { text: 'CUSTOMER INFORMATION', style: 'sectionHeader' },
        { text: `Name: ${receipt.customerName}`, style: 'text' },
        { text: `Email: ${receipt.customerEmail}`, style: 'text' },
        { text: `Phone: ${receipt.customerPhone}`, style: 'text' },
        { text: '\n' },
        
        // Booking Details
        { text: 'BOOKING DETAILS', style: 'sectionHeader' },
        { text: `Booking Number: ${receipt.bookingNumber}`, style: 'text' },
        { text: `Package: ${receipt.packageTitle}`, style: 'text' },
        { text: `Travel Dates: ${receipt.travelDates.checkIn} - ${receipt.travelDates.checkOut}`, style: 'text' },
        { text: '\n' },
        
        // Payment Details
        { text: 'PAYMENT DETAILS', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Total Amount:', style: 'text', border: [false, false, false, false] },
                { text: `₱${receipt.paymentDetails.totalAmount.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false] }
              ],
              [
                { text: 'Amount Paid:', style: 'text', border: [false, false, false, false] },
                { text: `₱${receipt.paymentDetails.amountPaid.toLocaleString()}`, style: 'amount', alignment: 'right', border: [false, false, false, false], color: '#16a34a', bold: true }
              ],
              ...(receipt.paymentDetails.remainingAmount > 0 ? [[
                { text: 'Remaining Balance:', style: 'text', border: [false, false, false, false] },
                { text: `₱${receipt.paymentDetails.remainingAmount.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false], color: '#f97316' }
              ]] : [])
            ]
          }
        },
        { text: '\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        { text: 'Thank you for choosing Xplorex Travel!', style: 'footer', alignment: 'center' },
        { text: 'For inquiries, contact us at support@explorex.com', style: 'smallFooter', alignment: 'center' }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true
        },
        subheader: {
          fontSize: 16,
          bold: true
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#1e40af',
          margin: [0, 5, 0, 10]
        },
        label: {
          fontSize: 10,
          color: '#6b7280'
        },
        text: {
          fontSize: 11,
          margin: [0, 2, 0, 2]
        },
        amount: {
          fontSize: 12,
          bold: true
        },
        footer: {
          fontSize: 10,
          color: '#6b7280',
          margin: [0, 2, 0, 2]
        },
        smallFooter: {
          fontSize: 9,
          color: '#9ca3af'
        }
      },
      pageMargins: [40, 40, 40, 40]
    }

    pdfMake.createPdf(docDefinition).download(`Receipt-${receipt.receiptNumber}.pdf`)
  }

  // Function to download invoice as PDF
  const downloadInvoice = async () => {
    if (!paymentDetails?.receipt) return

    const receipt = paymentDetails.receipt
    
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    
    const pdfMake = pdfMakeModule.default
    pdfMake.vfs = pdfFontsModule.default
    
    const docDefinition = {
      content: [
        {
          table: {
            widths: ['*'],
            body: [[{
              text: 'TRAVEL INVOICE',
              style: 'header',
              alignment: 'center',
              fillColor: '#3b82f6',
              color: 'white',
              margin: [0, 10, 0, 10]
            }]]
          },
          layout: 'noBorders'
        },
        { text: 'Xplorex Travel', style: 'subheader', alignment: 'center', color: '#3b82f6', margin: [0, 10, 0, 5] },
        { text: '\n' },
        {
          columns: [
            { text: `Invoice Number: ${receipt.invoiceNumber}`, style: 'label' },
            { text: `Date: ${receipt.date}`, style: 'label', alignment: 'right' }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        { text: 'BILL TO', style: 'sectionHeader' },
        { text: receipt.customerName, style: 'text', bold: true },
        { text: receipt.customerEmail, style: 'text' },
        { text: receipt.customerPhone, style: 'text' },
        { text: '\n' },
        { text: 'TRIP DETAILS', style: 'sectionHeader' },
        { text: `Booking Reference: ${receipt.bookingNumber}`, style: 'text' },
        { text: `Destination: ${receipt.packageTitle}`, style: 'text', bold: true },
        { text: `Travel Period: ${receipt.travelDates.checkIn} - ${receipt.travelDates.checkOut}`, style: 'text' },
        { text: '\n' },
        { text: 'AMOUNT DETAILS', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Package Price', style: 'text', border: [false, false, false, true], borderColor: ['', '', '', '#e5e7eb'] },
                { text: `₱${receipt.paymentDetails.totalAmount.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, true], borderColor: ['', '', '', '#e5e7eb'] }
              ],
              [
                { text: 'Amount Paid', style: 'text', border: [false, false, false, false], color: '#16a34a' },
                { text: `₱${receipt.paymentDetails.amountPaid.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false], color: '#16a34a', bold: true }
              ],
              ...(receipt.paymentDetails.remainingAmount > 0 ? [[
                { text: 'Balance Due', style: 'totalLabel', border: [false, true, false, false], borderColor: ['', '#e5e7eb', '', ''], margin: [0, 10, 0, 0] },
                { text: `₱${receipt.paymentDetails.remainingAmount.toLocaleString()}`, style: 'totalAmount', alignment: 'right', border: [false, true, false, false], borderColor: ['', '#e5e7eb', '', ''], margin: [0, 10, 0, 0], color: '#f97316' }
              ]] : [[
                { text: 'Paid in Full', style: 'totalLabel', border: [false, true, false, false], borderColor: ['', '#e5e7eb', '', ''], margin: [0, 10, 0, 0], color: '#16a34a' },
                { text: '✓', style: 'totalAmount', alignment: 'right', border: [false, true, false, false], borderColor: ['', '#e5e7eb', '', ''], margin: [0, 10, 0, 0], color: '#16a34a', fontSize: 16 }
              ]])
            ]
          }
        },
        { text: '\n\n' },
        { text: 'TERMS & CONDITIONS', style: 'sectionHeader' },
        { text: '• Full payment is required before travel date', style: 'terms' },
        { text: '• Cancellation policy applies as per terms', style: 'terms' },
        { text: '• Changes to booking may incur additional fees', style: 'terms' },
        { text: '\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        { text: 'Thank you for choosing Xplorex Travel!', style: 'footer', alignment: 'center' },
        { text: 'Questions? Contact us at support@explorex.com', style: 'smallFooter', alignment: 'center' }
      ],
      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 16, bold: true },
        sectionHeader: { fontSize: 14, bold: true, color: '#1e40af', margin: [0, 5, 0, 10] },
        label: { fontSize: 10, color: '#6b7280' },
        text: { fontSize: 11, margin: [0, 2, 0, 2] },
        totalLabel: { fontSize: 14, bold: true, color: '#1e40af' },
        totalAmount: { fontSize: 14, bold: true, color: '#1e40af' },
        terms: { fontSize: 10, color: '#6b7280' },
        footer: { fontSize: 10, color: '#6b7280', margin: [0, 2, 0, 2] },
        smallFooter: { fontSize: 9, color: '#9ca3af' }
      },
      pageMargins: [40, 40, 40, 40]
    }

    pdfMake.createPdf(docDefinition).download(`Invoice-${receipt.invoiceNumber}.pdf`)
  }

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent duplicate verification (e.g., when user refreshes page)
      if (hasVerified.current) {
        console.log('Payment already verified, skipping...')
        return
      }
      hasVerified.current = true

      try {
        // Try to get from URL params first (if PayMongo appends them)
        let checkoutSessionId = searchParams.get('session_id')
        let bookingId = searchParams.get('booking_id')

        // If not in URL, get from localStorage
        if (!checkoutSessionId) {
          checkoutSessionId = localStorage.getItem('paymongo_session_id')
        }
        if (!bookingId) {
          bookingId = localStorage.getItem('paymongo_booking_id')
        }

        if (!checkoutSessionId || !bookingId) {
          setStatus('error')
          setMessage('Invalid payment session. Missing required parameters.')
          return
        }

        // Get checkout session from PayMongo
        const sessionResult = await getCheckoutSession(checkoutSessionId)

        if (!sessionResult.success) {
          setStatus('error')
          setMessage('Failed to verify payment with PayMongo.')
          return
        }

        // PayMongo returns data in data.attributes structure
        const session = sessionResult.session.attributes || sessionResult.session

        console.log('PayMongo session:', session) // Debug log

        // Check if payment was successful
        // PayMongo checkout sessions have status "active" even after payment
        // Check for paid_at timestamp or payments array to verify payment
        const isPaid = session.paid_at || (session.payments && session.payments.length > 0)
        
        if (!isPaid) {
          setStatus('error')
          setMessage(`Payment not completed. Please try again or contact support.`)
          return
        }

        // Get payment details
        const payment = session.payments?.[0]
        const paymentAmount = session.line_items?.[0]?.amount / 100 || 0

        // Process the payment in our database
        const paymentData = {
          amount: paymentAmount,
          payment_method: session.payment_method_used || 'paymongo',
          transaction_id: payment?.id || session.payment_intent?.id || sessionResult.session.id || checkoutSessionId,
          checkout_session_id: checkoutSessionId
        }

        const result = await processPayment(bookingId, paymentData)

        if (result.success) {
          // Fetch full booking details
          const bookingResult = await getBookingById(bookingId)
          const booking = bookingResult.success ? bookingResult.booking : result.booking

          // Clear localStorage after successful payment
          localStorage.removeItem('paymongo_session_id')
          localStorage.removeItem('paymongo_booking_id')
          
          setStatus('success')
          setBookingNumber(booking.booking_number)
          
          // Check if payment was already processed
          if (result.alreadyProcessed) {
            setMessage('Payment already confirmed! Your booking has been updated.')
          } else {
            setMessage('Payment successful! Your booking has been confirmed.')
          }
          
          // Generate receipt data
          const receiptData = {
            receiptNumber: `RCP-${booking.booking_number}`,
            invoiceNumber: `INV-${booking.booking_number}`,
            bookingNumber: booking.booking_number,
            date: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            customerName: `${booking.customer_first_name} ${booking.customer_last_name}`,
            customerEmail: booking.customer_email,
            customerPhone: booking.customer_phone,
            packageTitle: booking.package?.title || 'Travel Package',
            travelDates: {
              checkIn: new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              checkOut: new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            },
            paymentDetails: {
              totalAmount: parseFloat(booking.total_amount || 0),
              amountPaid: parseFloat(booking.amount_paid || 0),
              remainingAmount: parseFloat(booking.remaining_balance || 0),
            }
          }
          
          setPaymentDetails({
            amount: paymentData.amount,
            method: paymentData.payment_method,
            transactionId: paymentData.transaction_id,
            booking: booking,
            payment: result.payment,
            receipt: receiptData
          })
        } else {
          setStatus('error')
          setMessage(result.error || 'Failed to update booking. Please contact support.')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage('An error occurred while processing your payment. Please contact support.')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="dashboard" />

      {status === 'verifying' && (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
            <div className="mx-auto w-24 h-24 mb-8 flex items-center justify-center">
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Payment</h1>
            <p className="text-lg text-gray-600">{message}</p>
          </div>
        </div>
      )}

      {status === 'success' && paymentDetails && (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-500" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-2">Your payment has been confirmed</p>
            <p className="text-2xl font-bold text-blue-500 mb-8">
              Booking #{bookingNumber}
            </p>

            {/* Payment Details Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">₱{paymentDetails.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold capitalize">{paymentDetails.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold text-xs">{paymentDetails.transactionId.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-semibold text-green-600 capitalize">{paymentDetails.booking.payment_status}</span>
                </div>
                {paymentDetails.receipt && paymentDetails.receipt.paymentDetails.remainingAmount > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className="font-semibold text-orange-600">
                      ₱{paymentDetails.receipt.paymentDetails.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt and Invoice Download Section - Matching booking success UI */}
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FileText className="text-gray-600" size={20} />
                <h3 className="text-sm font-medium text-gray-900">Documents Generated</h3>
              </div>
              <p className="text-xs text-gray-600 text-center mb-4">
                Your receipt and invoice have been automatically generated
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={downloadReceipt}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-gray-300 rounded-lg hover:border-blue-300 transition"
                >
                  <Download size={16} />
                  Download Receipt
                </button>
                <button
                  onClick={downloadInvoice}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-gray-300 rounded-lg hover:border-blue-300 transition"
                >
                  <Download size={16} />
                  Download Invoice
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Receipt #: {paymentDetails.receipt?.receiptNumber} | Invoice #: {paymentDetails.receipt?.invoiceNumber}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                A confirmation email with your receipt and invoice has been sent to your email address.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View My Bookings
                </Link>
                <Link
                  href="/packages"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Browse More Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Return to Dashboard
              </Link>
              <div className="text-sm text-gray-500">
                Need help? Contact support at{" "}
                <a href="mailto:support@explorex.com" className="text-blue-500 hover:underline">
                  support@explorex.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
