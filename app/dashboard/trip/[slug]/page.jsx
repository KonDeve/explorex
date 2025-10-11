"use client"

import Header from "@/components/header"
import { ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle, Phone, Mail, Download, Edit3, Share, RotateCcw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { getPackageBySlug } from "@/lib/packages"
import { getUserBookings } from "@/lib/bookings"
import { useAuth } from "@/lib/AuthContext"
import { createCheckoutSession } from "@/lib/paymongo"
import { useRouter } from "next/navigation"

export default function TripDetailsPage({ params }) {
  const { slug } = params
  const { user } = useAuth()
  const router = useRouter()
  const [booking, setBooking] = useState(null)
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('property-details')
  const [isLoaded, setIsLoaded] = useState(false)
  const [tabContentLoaded, setTabContentLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState({})
  const [processingPayment, setProcessingPayment] = useState(false)

  // Fetch booking and package data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !slug) return

      try {
        setLoading(true)
        
        // Fetch package by slug
        const pkgData = await getPackageBySlug(slug)
        setPackageData(pkgData)

        // Fetch user's bookings to find the one for this package
        const result = await getUserBookings(user.id)
        if (result.success) {
          const foundBooking = result.bookings.find(b => b.package?.slug === slug)
          // Remove the package object from booking to avoid rendering issues
          if (foundBooking) {
            const { package: pkg, ...bookingWithoutPackage } = foundBooking
            setBooking(bookingWithoutPackage)
          }
        }
      } catch (err) {
        console.error('Error fetching trip data:', err)
        setError('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, slug])

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true)
      setTabContentLoaded(true) // Initialize tab content as loaded for default tab
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const sections = document.querySelectorAll("[data-animate]")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])



  // Handle tab switching with animation reset
  const handleTabChange = (newTab) => {
    setTabContentLoaded(false)
    setActiveTab(newTab)
    
    // Trigger content animation after a short delay
    setTimeout(() => {
      setTabContentLoaded(true)
    }, 50)
  }

  // Handle payment checkout
  const handlePayNow = async () => {
    if (!booking || !packageData) return

    const remainingBalance = parseFloat(booking.remaining_balance || 0)
    
    if (remainingBalance <= 0) {
      alert('No remaining balance to pay')
      return
    }

    // Check payment deadline (45 days before travel)
    const checkInDate = new Date(booking.check_in_date)
    checkInDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const paymentDeadline = new Date(checkInDate)
    paymentDeadline.setDate(paymentDeadline.getDate() - 45)
    const daysUntilDeadline = Math.ceil((paymentDeadline - today) / (1000 * 60 * 60 * 24))

    if (daysUntilDeadline < 0) {
      alert(
        `This booking cannot be paid. The payment deadline was ${paymentDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ` +
        `(${Math.abs(daysUntilDeadline)} ${Math.abs(daysUntilDeadline) === 1 ? 'day' : 'days'} ago).\n\n` +
        `This booking will be automatically cancelled and is non-refundable.`
      )
      return
    }

    setProcessingPayment(true)

    try {
      const packageImage = packageData.images?.[0]
      const fullImageUrl = packageImage && (packageImage.startsWith('http://') || packageImage.startsWith('https://'))
        ? packageImage
        : null

      const result = await createCheckoutSession({
        amount: remainingBalance,
        description: `Remaining Balance Payment - ${packageData.title}`,
        lineItems: [
          {
            name: `${packageData.title} - Remaining Balance`,
            quantity: 1,
            amount: remainingBalance,
            description: `Booking ${booking.booking_number} | ${booking.check_in_date} to ${booking.check_out_date}`,
            images: fullImageUrl ? [fullImageUrl] : []
          }
        ],
        billing: {
          name: `${booking.customer_first_name} ${booking.customer_last_name}`,
          email: booking.customer_email
        },
        successUrl: `${window.location.origin}/dashboard/trip/${slug}/payment/success?booking_id=${booking.id}`,
        cancelUrl: `${window.location.origin}/dashboard/trip/${slug}`
      })

      if (result.success && result.checkoutUrl) {
        localStorage.setItem('paymongo_session_id', result.sessionId)
        localStorage.setItem('paymongo_booking_id', booking.id)
        
        // Redirect to PayMongo checkout
        window.location.href = result.checkoutUrl
      } else {
        console.error('Failed to create checkout session:', result.error)
        alert('Failed to initiate payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Download Receipt PDF
  const downloadReceipt = async () => {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
      const pdfMake = pdfMakeModule.default
      
      // Properly assign vfs fonts
      if (pdfFontsModule.default && pdfFontsModule.default.pdfMake && pdfFontsModule.default.pdfMake.vfs) {
        pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs
      }

      const receiptNumber = `RCP-${booking.booking_number}`
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })

      const docDefinition = {
        content: [
          // Header
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'Xplorex Travel', style: 'header', color: '#2563eb' },
                  { text: 'Receipt', style: 'subheader' }
                ]
              },
              {
                width: 'auto',
                stack: [
                  { text: receiptNumber, style: 'receiptNumber' },
                  { text: currentDate, style: 'date' }
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          },
          
          // Customer Info
          { text: 'Customer Information', style: 'sectionHeader' },
          {
            columns: [
              { text: 'Name:', bold: true, width: 80 },
              { text: user?.email || 'N/A', width: '*' }
            ],
            margin: [0, 0, 0, 5]
          },
          {
            columns: [
              { text: 'Booking ID:', bold: true, width: 80 },
              { text: booking.booking_number, width: '*' }
            ],
            margin: [0, 0, 0, 20]
          },

          // Booking Details
          { text: 'Booking Details', style: 'sectionHeader' },
          {
            columns: [
              { text: 'Package:', bold: true, width: 80 },
              { text: packageData.title, width: '*' }
            ],
            margin: [0, 0, 0, 5]
          },
          {
            columns: [
              { text: 'Location:', bold: true, width: 80 },
              { text: `${packageData.location}, ${packageData.country || ''}`, width: '*' }
            ],
            margin: [0, 0, 0, 5]
          },
          {
            columns: [
              { text: 'Check-in:', bold: true, width: 80 },
              { text: booking.check_in_date, width: '*' }
            ],
            margin: [0, 0, 0, 5]
          },
          {
            columns: [
              { text: 'Check-out:', bold: true, width: 80 },
              { text: booking.check_out_date, width: '*' }
            ],
            margin: [0, 0, 0, 20]
          },

          // Payment Details
          { text: 'Payment Details', style: 'sectionHeader' },
          {
            style: 'table',
            table: {
              widths: ['*', 100],
              body: [
                [{ text: 'Total Amount', bold: true }, { text: `₱${booking.total_amount.toLocaleString()}`, alignment: 'right' }],
                [{ text: 'Amount Paid', bold: true }, { text: `₱${booking.amount_paid.toLocaleString()}`, alignment: 'right', color: '#16a34a' }],
                [{ text: 'Remaining Balance', bold: true }, { text: `₱${booking.remaining_balance.toLocaleString()}`, alignment: 'right', color: '#dc2626' }]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb'
            },
            margin: [0, 0, 0, 20]
          },

          // Footer
          {
            text: 'Thank you for booking with Xplorex Travel!',
            style: 'footer',
            alignment: 'center',
            margin: [0, 30, 0, 0]
          },
          {
            text: 'For inquiries, contact us at support@xplorex.com',
            style: 'footer',
            alignment: 'center'
          }
        ],
        styles: {
          header: { fontSize: 24, bold: true, margin: [0, 0, 0, 5] },
          subheader: { fontSize: 14, color: '#6b7280' },
          receiptNumber: { fontSize: 12, bold: true },
          date: { fontSize: 10, color: '#6b7280' },
          sectionHeader: { fontSize: 14, bold: true, color: '#2563eb', margin: [0, 10, 0, 10] },
          footer: { fontSize: 10, color: '#6b7280' }
        },
        defaultStyle: {
          fontSize: 11
        }
      }

      pdfMake.createPdf(docDefinition).download(`Receipt-${receiptNumber}.pdf`)
    } catch (error) {
      console.error('Error generating receipt:', error)
      alert('Failed to generate receipt. Please try again.')
    }
  }

  // Download Invoice PDF
  const downloadInvoice = async () => {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
      const pdfMake = pdfMakeModule.default
      
      // Properly assign vfs fonts
      if (pdfFontsModule.default && pdfFontsModule.default.pdfMake && pdfFontsModule.default.pdfMake.vfs) {
        pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs
      }

      const invoiceNumber = `INV-${booking.booking_number}`
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })

      const docDefinition = {
        content: [
          // Header
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'Xplorex Travel', style: 'header', color: '#16a34a' },
                  { text: 'Invoice', style: 'subheader' }
                ]
              },
              {
                width: 'auto',
                stack: [
                  { text: invoiceNumber, style: 'invoiceNumber' },
                  { text: `Date: ${currentDate}`, style: 'date' }
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          },
          
          // Bill To
          { text: 'Bill To:', style: 'sectionHeader' },
          { text: user?.email || 'N/A', margin: [0, 0, 0, 5] },
          { text: `Booking ID: ${booking.booking_number}`, margin: [0, 0, 0, 20] },

          // Trip Details
          { text: 'Trip Details', style: 'sectionHeader' },
          {
            style: 'table',
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Package', bold: true }, packageData.title],
                [{ text: 'Destination', bold: true }, `${packageData.location}, ${packageData.country || ''}`],
                [{ text: 'Check-in Date', bold: true }, booking.check_in_date],
                [{ text: 'Check-out Date', bold: true }, booking.check_out_date],
                [{ text: 'Status', bold: true }, booking.status.charAt(0).toUpperCase() + booking.status.slice(1)]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb'
            },
            margin: [0, 0, 0, 20]
          },

          // Amount Details
          { text: 'Amount Details', style: 'sectionHeader' },
          {
            style: 'table',
            table: {
              widths: ['*', 100],
              body: [
                [{ text: 'Package Total', bold: true }, { text: `₱${booking.total_amount.toLocaleString()}`, alignment: 'right' }],
                [{ text: 'Amount Paid', style: 'paid' }, { text: `₱${booking.amount_paid.toLocaleString()}`, alignment: 'right', color: '#16a34a', bold: true }],
                [{ text: 'Balance Due', style: 'balance' }, { text: `₱${booking.remaining_balance.toLocaleString()}`, alignment: 'right', color: '#dc2626', bold: true, fontSize: 12 }]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb',
              fillColor: (rowIndex) => rowIndex === 2 ? '#f3f4f6' : null
            },
            margin: [0, 0, 0, 20]
          },

          // Payment Instructions
          {
            text: booking.remaining_balance > 0 ? 
              'Please complete your payment to confirm your booking.' : 
              'Payment Complete - Thank you!',
            style: 'paymentNote',
            color: booking.remaining_balance > 0 ? '#dc2626' : '#16a34a',
            margin: [0, 10, 0, 20]
          },

          // Footer
          {
            text: 'Terms & Conditions',
            style: 'termsHeader',
            margin: [0, 20, 0, 10]
          },
          {
            text: [
              '• Full payment must be received before travel dates.\n',
              '• Cancellation policy applies as per booking terms.\n',
              '• Contact support@xplorex.com for any inquiries.'
            ],
            style: 'terms'
          },
          {
            text: 'Thank you for choosing Xplorex Travel!',
            style: 'footer',
            alignment: 'center',
            margin: [0, 30, 0, 0]
          }
        ],
        styles: {
          header: { fontSize: 24, bold: true, margin: [0, 0, 0, 5] },
          subheader: { fontSize: 14, color: '#6b7280' },
          invoiceNumber: { fontSize: 12, bold: true },
          date: { fontSize: 10, color: '#6b7280' },
          sectionHeader: { fontSize: 14, bold: true, color: '#16a34a', margin: [0, 10, 0, 10] },
          paymentNote: { fontSize: 12, bold: true, alignment: 'center' },
          termsHeader: { fontSize: 12, bold: true, color: '#374151' },
          terms: { fontSize: 9, color: '#6b7280' },
          footer: { fontSize: 10, color: '#6b7280' }
        },
        defaultStyle: {
          fontSize: 11
        }
      }

      pdfMake.createPdf(docDefinition).download(`Invoice-${invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Failed to generate invoice. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <span className="ml-3 text-gray-600 text-lg">Loading trip details...</span>
        </div>
      </div>
    )
  }

  if (error || !booking || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Trip Not Found'}</h1>
            <p className="text-gray-600 mb-8">The trip you're looking for doesn't exist or you don't have access to it.</p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="dashboard" />

      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Back Button */}
        <div className={`mb-6 transition-all duration-500 ease-out delay-100 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Title and Location */}
        <div className={`mb-6 transition-all duration-600 ease-out delay-200 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{packageData.title}</h1>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin size={16} />
            <span>{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className={`flex gap-2 h-96 mb-8 rounded-xl overflow-hidden transition-all duration-700 ease-out delay-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Main large image - left side */}
          <div className="flex-1 overflow-hidden rounded-l-xl">
            <img
              src={packageData.images?.[0] || '/placeholder.svg'}
              alt={packageData.title}
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out delay-400 ${
                isLoaded ? 'scale-100' : 'scale-110'
              }`}
            />
          </div>
          
          {/* Right side - 2x2 grid of smaller images */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <img
                src={packageData.images?.[1] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src={packageData.images?.[2] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover rounded-tr-xl"
              />
            </div>
            <div>
              <img
                src={packageData.images?.[3] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <img
                src={packageData.images?.[4] || packageData.images?.[0] || '/placeholder.svg'}
                alt={packageData.title}
                className="w-full h-full object-cover rounded-br-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-br-xl">
                <button className="text-white font-medium">See all photos ({packageData.images?.length || 0})</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 transition-all duration-800 ease-out delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Host Info */}
            <div className="pb-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{packageData.title}</h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="py-8 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Booking ID</div>
                  <div className="font-semibold">{booking.booking_number}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Check-in</div>
                  <div className="font-semibold text-blue-600">{booking.check_in_date}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="font-bold text-green-600">₱{booking.total_amount.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className={`font-semibold ${
                    booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="pt-8 pb-4">
              <div className="flex space-x-8">
                <button 
                  onClick={() => handleTabChange('property-details')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'property-details' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Details 
                </button>
                <button 
                  onClick={() => handleTabChange('daily-itinerary')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'daily-itinerary' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Daily Itinerary
                </button>
                <button 
                  onClick={() => handleTabChange('documents')}
                  className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'documents' 
                      ? 'border-black text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Documents
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'property-details' && (
              <>
                {/* Description */}
                <div
                  id="details"
                  className="py-8 border-b border-gray-200"
                >
                  <div className="text-sm text-gray-500 mb-2">(01) Specifications</div>
                  <h1 className="text-5xl font-bold mb-4">{packageData.title}</h1>
                  {packageData.description && (
                    <div className="text-gray-700 leading-relaxed">
                      <p>{packageData.description}</p>
                    </div>
                  )}
                </div>


                {/* Transportation Section (NEW SCHEMA) */}
                {packageData.details?.filter(d => d.section_type === 'transportation').map((section, idx) => (
                  <div key={idx} className="py-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">{section.title || 'Transportation'}</h2>
                    
                    {section.local && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Local Transportation:</h3>
                        <p className="text-gray-700">{section.local}</p>
                      </div>
                    )}
                    
                    {section.amenities && section.amenities.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Amenities & Features:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.amenities.map((amenity, amenityIdx) => (
                            <div key={amenityIdx} className="flex items-center gap-2">
                              <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Inclusions Section (NEW SCHEMA) */}
                {packageData.details?.filter(d => d.section_type === 'inclusions').map((section, idx) => (
                  <div key={idx} className="py-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-6">What this trip includes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {section.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Exclusions Section (NEW SCHEMA) */}
                {packageData.details?.filter(d => d.section_type === 'exclusions').map((section, idx) => (
                  <div key={idx} className="py-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-6">What this trip excludes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {section.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-3">
                          <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold">✕</span>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'daily-itinerary' && (
              <div 
                id="daily-itinerary"
                className="py-8 border-b border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6">Daily Itinerary</h2>
                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {day.day_number || index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Day {day.day_number || index + 1}: {day.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Detailed itinerary will be provided closer to your departure date.</p>
                )}
              </div>
            )}

            {activeTab === 'daily-itinerary' && booking.type === 'past' && booking.highlights && Array.isArray(booking.highlights) && (
              <div 
                id="trip-highlights"
                className="py-8 border-b border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6">Trip Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 py-2">
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <>
                {/* Payment Receipt Section */}
                <div className="py-8 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Payment Receipt</h2>
                    <button
                      onClick={() => downloadReceipt()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download size={18} />
                      <span className="font-medium">Download PDF</span>
                    </button>
                  </div>

                  {/* Receipt Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Xplorex Travel</h3>
                      <p className="text-gray-600">Receipt</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">RCP-{booking.booking_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-32 text-gray-600">Name:</span>
                        <span className="text-gray-900">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Booking ID:</span>
                        <span className="text-gray-900">{booking.booking_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-32 text-gray-600">Package:</span>
                        <span className="text-gray-900">{packageData.title}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Location:</span>
                        <span className="text-gray-900">{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Check-in:</span>
                        <span className="text-gray-900">{booking.check_in_date}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Check-out:</span>
                        <span className="text-gray-900">{booking.check_out_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Total Amount</td>
                            <td className="px-4 py-3 text-right text-gray-900">₱{booking.total_amount.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Amount Paid</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">₱{booking.amount_paid.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-gray-900">Remaining Balance</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">₱{booking.remaining_balance.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Travel Invoice Section */}
                <div className="py-8 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Travel Invoice</h2>
                    <button
                      onClick={() => downloadInvoice()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download size={18} />
                      <span className="font-medium">Download PDF</span>
                    </button>
                  </div>

                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Xplorex Travel</h3>
                      <p className="text-gray-600">Invoice</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">INV-{booking.booking_number}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <p className="text-gray-900">{user?.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Booking ID: {booking.booking_number}</p>
                  </div>

                  {/* Trip Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600 w-40">Package</td>
                            <td className="px-4 py-3 text-gray-900">{packageData.title}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Destination</td>
                            <td className="px-4 py-3 text-gray-900">{packageData.location}{packageData.country ? `, ${packageData.country}` : ''}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Check-in Date</td>
                            <td className="px-4 py-3 text-gray-900">{booking.check_in_date}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Check-out Date</td>
                            <td className="px-4 py-3 text-gray-900">{booking.check_out_date}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-600">Status</td>
                            <td className="px-4 py-3 text-gray-900">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Amount Details</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Package Total</td>
                            <td className="px-4 py-3 text-right text-gray-900">₱{booking.total_amount.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-600">Amount Paid</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">₱{booking.amount_paid.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-gray-900">Balance Due</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">₱{booking.remaining_balance.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Note */}
                  {booking.remaining_balance > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <p className="text-center font-medium text-gray-900">
                        Please complete your payment to confirm your booking.
                      </p>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full payment must be received before travel dates.</li>
                      <li>• Cancellation policy applies as per booking terms.</li>
                      <li>• Contact support@xplorex.com for any inquiries.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className={`sticky top-20 border border-gray-200 rounded-xl p-6 bg-white shadow-md transition-all duration-700 ease-out delay-600 ${
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              {/* Pricing Header
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-gray-900">₱{booking.total_amount.toLocaleString()}</span>
              </div> */}
              
                            
              {/* Date Selection */}
              <div className="border border-gray-200 rounded-lg mb-4">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-gray-200">
                    <div className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Check-in</div>
                    <div className="text-sm text-gray-900">{booking.check_in_date}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-bold text-gray-900 mb-1 uppercase tracking-wide">Checkout</div>
                    <div className="text-sm text-gray-900">{booking.check_out_date}</div>
                  </div>
                </div>
              </div>

              {/* Total Section */}
              <div className="mb-6">
                {booking.remaining_balance > 0 ? (
                  <>
                    {/* Show breakdown when there's remaining balance */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Package</span>
                        <span className="text-gray-900 font-semibold">₱{booking.total_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="text-green-600 font-semibold">₱{booking.amount_paid.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-bold text-base">Remaining Balance</span>
                          <span className="text-orange-600 font-bold text-2xl">₱{booking.remaining_balance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {/* {(() => {
                        const checkInDate = new Date(booking.check_in_date)
                        checkInDate.setHours(0, 0, 0, 0)
                        const paymentDeadline = new Date(checkInDate)
                        paymentDeadline.setDate(paymentDeadline.getDate() - 45)
                        return `Deductible by ${paymentDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      })()} */}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Show only total when fully paid */}
                    {/* <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-900 font-bold text-base">Total Price Due</span>
                      <span className="text-gray-900 font-bold text-2xl">₱{booking.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      Deductible by {booking.payment_due_date ? new Date(booking.payment_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Our 14th'}
                    </div> */}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                {booking.remaining_balance > 0 ? (
                  <button 
                    onClick={handlePayNow}
                    disabled={processingPayment}
                    className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      'Continue to checkout'
                    )}
                  </button>
                ) : (
                  <button className="w-full bg-green-600 text-white py-3.5 px-6 rounded-lg font-semibold cursor-default">
                    Fully Paid
                  </button>
                )}
              </div>

              {/* Contact Host Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Contact Host</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">24/7 Support</div>
                      <div className="font-medium text-gray-900 text-sm">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Email Support</div>
                      <div className="font-medium text-gray-900 text-sm">support@xplorex.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-gray-600">© 2025 Xplorex. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}