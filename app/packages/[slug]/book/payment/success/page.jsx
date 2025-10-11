"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2, XCircle, Download, FileText } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { getCheckoutSession } from "@/lib/paymongo"
import { createBooking } from "@/lib/bookings"

export default function PaymentSuccessPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [bookingNumber, setBookingNumber] = useState(null)
  const [error, setError] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
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
                { text: `₱${receipt.paymentDetails.remainingAmount.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false], color: '#dc2626', bold: true }
              ]] : [])
            ]
          },
          layout: 'noBorders'
        },
        { text: '\n' },
        { text: `Payment Method: ${receipt.paymentDetails.paymentMethod}`, style: 'text' },
        { text: `Transaction ID: ${receipt.paymentDetails.transactionId}`, style: 'text', fontSize: 9 },
        { text: '\n\n' },
        
        // Footer
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        { text: 'Thank you for choosing Xplorex Travel!', style: 'footer', alignment: 'center' },
        { text: 'For inquiries, contact us at support@explorex.com', style: 'footer', alignment: 'center' },
        { text: '\n' },
        { text: 'This is a computer-generated receipt.', style: 'smallFooter', alignment: 'center', italics: true }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true
        },
        subheader: {
          fontSize: 18,
          bold: true
        },
        sectionHeader: {
          fontSize: 14,
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
          fontSize: 11
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

    const invoice = paymentDetails.receipt
    const paymentStatus = invoice.paymentDetails.remainingAmount > 0 ? 'Partially Paid' : 'Fully Paid'
    
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
                text: 'INVOICE',
                style: 'header',
                alignment: 'center',
                fillColor: '#3b82f6',
                color: 'white',
                margin: [0, 15, 0, 15]
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
        {
          text: 'support@explorex.com',
          style: 'subtext',
          alignment: 'center',
          color: '#6b7280',
          margin: [0, 0, 0, 10]
        },
        { text: '\n' },
        
        // Invoice details
        {
          columns: [
            { text: `Invoice Number: ${invoice.invoiceNumber}`, style: 'label' },
            { text: `Invoice Date: ${invoice.date}`, style: 'label', alignment: 'right' }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        
        // Bill To
        { text: 'BILL TO:', style: 'sectionHeader' },
        { text: invoice.customerName, style: 'text', bold: true },
        { text: invoice.customerEmail, style: 'text' },
        { text: invoice.customerPhone, style: 'text' },
        { text: '\n' },
        
        // Invoice Details
        { text: 'INVOICE DETAILS', style: 'sectionHeader' },
        { text: `Booking Reference: ${invoice.bookingNumber}`, style: 'text' },
        { text: `Item Description: ${invoice.packageTitle}`, style: 'text' },
        { text: `Travel Period: ${invoice.travelDates.checkIn} to ${invoice.travelDates.checkOut}`, style: 'text' },
        { text: '\n' },
        
        // Amount Breakdown
        { text: 'AMOUNT BREAKDOWN', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: '', border: [false, true, false, false] },
                { text: '', border: [false, true, false, false] }
              ],
              [
                { text: 'Subtotal:', style: 'text', border: [false, false, false, false] },
                { text: `₱${invoice.paymentDetails.totalAmount.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false] }
              ],
              [
                { text: 'Tax (Included):', style: 'text', border: [false, false, false, false] },
                { text: '₱0.00', style: 'text', alignment: 'right', border: [false, false, false, false] }
              ],
              [
                { text: '', border: [false, true, false, false] },
                { text: '', border: [false, true, false, false] }
              ],
              [
                { text: 'TOTAL AMOUNT:', style: 'totalLabel', border: [false, false, false, false] },
                { text: `₱${invoice.paymentDetails.totalAmount.toLocaleString()}`, style: 'totalAmount', alignment: 'right', border: [false, false, false, false] }
              ],
              [{ text: '\n', border: [false, false, false, false], colSpan: 2 }, {}],
              [
                { text: 'Amount Paid:', style: 'text', border: [false, false, false, false] },
                { text: `₱${invoice.paymentDetails.amountPaid.toLocaleString()}`, style: 'text', alignment: 'right', border: [false, false, false, false], color: '#16a34a', bold: true }
              ],
              [
                { text: 'Balance Due:', style: 'text', border: [false, false, false, false] },
                { 
                  text: `₱${invoice.paymentDetails.remainingAmount.toLocaleString()}`, 
                  style: 'text', 
                  alignment: 'right', 
                  border: [false, false, false, false],
                  color: invoice.paymentDetails.remainingAmount > 0 ? '#dc2626' : '#16a34a',
                  bold: true
                }
              ]
            ]
          }
        },
        { text: '\n' },
        
        // Payment Information
        { text: 'PAYMENT INFORMATION', style: 'sectionHeader' },
        { text: `Payment Status: ${paymentStatus}`, style: 'text' },
        { text: `Payment Method: ${invoice.paymentDetails.paymentMethod}`, style: 'text' },
        { text: `Transaction ID: ${invoice.paymentDetails.transactionId}`, style: 'text', fontSize: 9 },
        { text: '\n' },
        
        // Important notice if balance remaining
        ...(invoice.paymentDetails.remainingAmount > 0 ? [
          {
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'IMPORTANT:', bold: true, color: '#92400e', margin: [0, 0, 0, 5] },
                  { 
                    text: `The remaining balance of ₱${invoice.paymentDetails.remainingAmount.toLocaleString()} must be paid before your travel date.`,
                    color: '#92400e',
                    fontSize: 10
                  }
                ],
                fillColor: '#fef3c7',
                margin: [10, 10, 10, 10]
              }]]
            },
            layout: {
              hLineWidth: () => 2,
              vLineWidth: () => 2,
              hLineColor: () => '#f59e0b',
              vLineColor: () => '#f59e0b'
            }
          },
          { text: '\n' }
        ] : []),
        
        // Terms & Conditions
        { text: 'TERMS & CONDITIONS', style: 'sectionHeader' },
        { 
          ol: [
            'This invoice is valid for the specified travel dates only.',
            'Cancellation terms apply as per our booking policy.',
            'Full payment must be received before travel commencement.'
          ],
          style: 'terms'
        },
        { text: '\n\n' },
        
        // Footer
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }] },
        { text: '\n' },
        { text: 'Thank you for your business!', style: 'footer', alignment: 'center' },
        { text: 'For questions regarding this invoice, please contact: support@explorex.com', style: 'footer', alignment: 'center' },
        { text: '\n' },
        { text: 'This is a computer-generated invoice and is valid without signature.', style: 'smallFooter', alignment: 'center', italics: true }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true
        },
        subheader: {
          fontSize: 18,
          bold: true
        },
        subtext: {
          fontSize: 11
        },
        sectionHeader: {
          fontSize: 14,
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
        totalLabel: {
          fontSize: 14,
          bold: true,
          color: '#1e40af'
        },
        totalAmount: {
          fontSize: 14,
          bold: true,
          color: '#1e40af'
        },
        terms: {
          fontSize: 10,
          color: '#6b7280'
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

    pdfMake.createPdf(docDefinition).download(`Invoice-${invoice.invoiceNumber}.pdf`)
  }

  useEffect(() => {
    // Prevent duplicate execution (React Strict Mode runs effects twice in dev)
    if (hasVerified.current) {
      console.log('Already verified payment, skipping duplicate execution')
      return
    }

    const verifyPaymentAndCreateBooking = async () => {
      try {
        // Mark as verified immediately to prevent race conditions
        hasVerified.current = true

        // Get session ID from sessionStorage
        const sessionId = sessionStorage.getItem('paymentSessionId')
        const pendingBookingData = sessionStorage.getItem('pendingBooking')

        if (!sessionId) {
          throw new Error('No payment session found')
        }

        if (!pendingBookingData) {
          throw new Error('No booking data found')
        }

        const bookingData = JSON.parse(pendingBookingData)

        console.log('Verifying PayMongo payment session:', sessionId)

        // Verify payment with PayMongo
        const sessionResult = await getCheckoutSession(sessionId)

        if (!sessionResult.success) {
          throw new Error(sessionResult.error || 'Failed to verify payment')
        }

        const session = sessionResult.session
        console.log('Payment session retrieved:', session)
        console.log('Payment status:', session.attributes.payment_status)
        console.log('Full session attributes:', session.attributes)

        // Check payment status - PayMongo uses different statuses
        const paymentStatus = session.attributes.payment_status
        
        // Accept 'paid' or if payments array exists with successful payment
        const isPaid = paymentStatus === 'paid' || 
                       (session.attributes.payments && 
                        session.attributes.payments.length > 0 &&
                        session.attributes.payments[0].attributes?.status === 'paid')
        
        if (!isPaid) {
          console.error('Payment not completed. Status:', paymentStatus)
          console.error('Payments array:', session.attributes.payments)
          
          // Provide more helpful error message based on status
          if (paymentStatus === 'unpaid') {
            throw new Error('Payment has not been completed yet. Please complete the payment on PayMongo checkout page.')
          } else if (paymentStatus === 'expired') {
            throw new Error('Payment session has expired. Please try booking again.')
          } else {
            throw new Error(`Payment was not completed. Status: ${paymentStatus || 'unknown'}`)
          }
        }

        // Create booking in database
        console.log('Creating booking with data:', bookingData)
        const bookingResult = await createBooking({
          ...bookingData,
          paymentSessionId: sessionId,
          paymentStatus: 'paid',
          amountPaid: bookingData.amountToPay, // The amount that was just paid via PayMongo
          remainingAmount: bookingData.remainingAmount || 0 // Remaining balance if partial payment
        })

        if (!bookingResult.success) {
          throw new Error(bookingResult.error || 'Failed to create booking')
        }

        console.log('Booking created successfully:', bookingResult.booking)

        // Generate receipt and invoice data
        const receiptData = {
          receiptNumber: `RCP-${bookingResult.booking.booking_number}`,
          invoiceNumber: `INV-${bookingResult.booking.booking_number}`,
          bookingNumber: bookingResult.booking.booking_number,
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          customerName: `${bookingData.firstName} ${bookingData.lastName}`,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          packageTitle: bookingData.packageTitle,
          travelDates: {
            checkIn: new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            checkOut: new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          },
          paymentDetails: {
            totalAmount: bookingData.totalAmount,
            amountPaid: bookingData.amountToPay,
            remainingAmount: bookingData.remainingAmount,
            paymentOption: bookingData.paymentOption,
            paymentMethod: 'PayMongo',
            transactionId: sessionId,
            paymentDate: new Date().toISOString()
          }
        }

        // Set success state
        setBookingNumber(bookingResult.booking.booking_number)
        setPaymentDetails({
          amount: bookingData.amountToPay,
          method: 'PayMongo',
          transactionId: sessionId,
          receipt: receiptData
        })
        setStatus('success')

        // Clear session storage
        sessionStorage.removeItem('pendingBooking')
        sessionStorage.removeItem('paymentSessionId')

      } catch (err) {
        console.error('Payment verification error:', err)
        setError(err.message || 'Failed to verify payment')
        setStatus('error')
      }
    }

    verifyPaymentAndCreateBooking()
  }, [])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="packages" />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="packages" />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-y-4">
              {error?.includes('not been completed yet') ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    It looks like you left the payment page before completing the transaction.
                  </p>
                  <Link
                    href={`/packages/${params.slug}/book`}
                    className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Return to Booking Page
                  </Link>
                </>
              ) : (
                <Link
                  href={`/packages/${params.slug}/book`}
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Try Again
                </Link>
              )}
              <div className="text-sm text-gray-500">
                Need help? Contact support at{" "}
                <a href="mailto:support@explorex.com" className="text-blue-500 hover:underline">
                  support@explorex.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="packages" />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-500" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-2">Your booking has been confirmed</p>
          <p className="text-2xl font-bold text-blue-500 mb-8">
            Booking #{bookingNumber}
          </p>

          {paymentDetails && (
            <>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">₱{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{paymentDetails.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-semibold text-xs">{paymentDetails.transactionId}</span>
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

              {/* Receipt and Invoice Download Section - Minimal UI */}
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
            </>
          )}

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
    </div>
  )
}
