"use client"

import Header from "@/components/header"
import { ArrowLeft, MapPin, Calendar, Users, Star, CreditCard, Lock, Shield, CheckCircle, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// Mock data - in a real app this would come from an API
const getBookingById = (id) => {
  const allBookings = {
    "BK-001": {
      id: "BK-001",
      package: "Santorini Paradise",
      location: "Greece",
      checkIn: "2025-06-15",
      checkOut: "2025-06-22",
      guests: "2 Adults",
      image: "/santorini-blue-domes-greece.jpg",
      status: "confirmed",
      type: "upcoming",
      totalPrice: "$2,499",
      priceNumeric: 2499,
      duration: "7 Days, 6 Nights",
      hotelName: "Santorini Blue Resort",
      hotelRating: 5,
      confirmation: "XPL-SAN-2025-001",
      features: ["5-Star Hotel", "All Meals Included", "Airport Transfer", "Tour Guide", "Spa Access"],
      priceBreakdown: {
        basePrice: 2199,
        taxes: 300,
        serviceFee: 150,
        discount: 150,
        total: 2499
      }
    },
    "BK-003": {
      id: "BK-003",
      package: "Alpine Adventure",
      location: "Switzerland",
      checkIn: "2025-08-10",
      checkOut: "2025-08-16",
      guests: "4 Adults",
      image: "/mountain-lake-sunset-alps.jpg",
      status: "confirmed",
      type: "upcoming",
      totalPrice: "$2,799",
      priceNumeric: 2799,
      duration: "6 Days, 5 Nights",
      hotelName: "Alpine Grand Lodge",
      hotelRating: 4,
      confirmation: "XPL-ALP-2025-003",
      features: ["Mountain Lodge", "All Meals", "Ski Equipment", "Cable Car Pass", "Hiking Guide"],
      priceBreakdown: {
        basePrice: 2399,
        taxes: 400,
        serviceFee: 180,
        discount: 180,
        total: 2799
      }
    }
  }
  return allBookings[id] || null
}

export default function PaymentPage({ params }) {
  const { id } = params
  const booking = getBookingById(id)
  const [paymentOption, setPaymentOption] = useState('full')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activePage="dashboard" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">The booking you're looking for doesn't exist.</p>
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

  const partialPayment = Math.round(booking.priceNumeric * 0.3) // 30% down payment
  const remainingPayment = booking.priceNumeric - partialPayment

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activePage="dashboard" />

      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Back Button */}
        <div className={`mb-6 transition-all duration-500 ease-out delay-100 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          <Link 
            href={`/dashboard/trip/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Trip Details</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className={`mb-8 transition-all duration-600 ease-out delay-200 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure your booking for {booking.package}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Left Column */}
          <div className={`lg:col-span-2 space-y-8 transition-all duration-700 ease-out delay-300 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
          }`}>
            
            {/* Payment Options */}
            <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-500 ease-out delay-400 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Payment Option</h2>
              
              <div className="space-y-4">
                {/* Full Payment Option */}
                <div 
                  onClick={() => setPaymentOption('full')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentOption === 'full' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentOption === 'full' 
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {paymentOption === 'full' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Full Payment</h3>
                        <p className="text-sm text-gray-600">Pay the complete amount now</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${booking.priceNumeric.toLocaleString()}</div>
                      <div className="text-sm text-green-600 font-medium">Save 5% • No additional fees</div>
                    </div>
                  </div>
                </div>

                {/* Partial Payment Option */}
                <div 
                  onClick={() => setPaymentOption('partial')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentOption === 'partial' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentOption === 'partial' 
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {paymentOption === 'partial' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Partial Payment</h3>
                        <p className="text-sm text-gray-600">Pay 30% now, rest before travel</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${partialPayment.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        Remaining: ${remainingPayment.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {paymentOption === 'partial' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Payment Schedule</span>
                      </div>
                      <div className="text-xs text-blue-800 space-y-1">
                        <div>• Today: ${partialPayment.toLocaleString()} (30% down payment)</div>
                        <div>• Due 30 days before travel: ${remainingPayment.toLocaleString()} (remaining balance)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-500 ease-out delay-500 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2 border-blue-600 bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <CreditCard size={20} className="text-gray-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Secure Payment via PayMongo</span>
                      <p className="text-sm text-gray-600">You'll be redirected to PayMongo's secure checkout</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} className="text-green-600" />
                  <span>Supports all major credit cards, debit cards, and digital wallets</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className={`bg-green-50 border border-green-200 rounded-xl p-4 transition-all duration-500 ease-out delay-600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Secure Payment</h3>
                  <p className="text-sm text-green-700">Your payment information is encrypted and secure. We never store your card details.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Package Overview - Right Column */}
          <div className={`lg:col-span-1 transition-all duration-700 ease-out delay-400 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
          }`}>
            <div className="sticky top-8 space-y-6">
              
              {/* Package Overview Card */}
              <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-500 ease-out delay-500 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Overview</h3>
                
                <div className="space-y-4">
                  {/* Package Image & Basic Info */}
                  <div className="flex gap-4">
                    <img 
                      src={booking.image} 
                      alt={booking.package}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{booking.package}</h4>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin size={14} />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(booking.hotelRating)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>Check-in</span>
                        </div>
                        <span className="font-medium text-gray-900">{booking.checkIn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>Check-out</span>
                        </div>
                        <span className="font-medium text-gray-900">{booking.checkOut}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={14} />
                          <span>Guests</span>
                        </div>
                        <span className="font-medium text-gray-900">{booking.guests}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="border-t border-gray-100 pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Included Features</h5>
                    <div className="space-y-2">
                      {booking.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {booking.features.length > 4 && (
                        <div className="text-sm text-blue-600 font-medium">
                          +{booking.features.length - 4} more features
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-500 ease-out delay-600 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base price ({booking.duration})</span>
                    <span className="font-medium">${booking.priceBreakdown.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span className="font-medium">${booking.priceBreakdown.taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">${booking.priceBreakdown.serviceFee}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-${booking.priceBreakdown.discount}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        {paymentOption === 'full' ? 'Total Amount' : 'Amount Due Today'}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${paymentOption === 'full' ? booking.priceNumeric.toLocaleString() : partialPayment.toLocaleString()}
                      </span>
                    </div>
                    {paymentOption === 'partial' && (
                      <div className="mt-2 text-sm text-gray-600">
                        Remaining balance: ${remainingPayment.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Payment Button */}
              <div className={`transition-all duration-500 ease-out delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <Link href={`/dashboard/trip/${id}/payment/success`}>
                  <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                    <Lock size={20} />
                    Complete {paymentOption === 'full' ? 'Payment' : 'Down Payment'}
                  </button>
                </Link>
              </div>

              {/* Terms */}
              <div className={`text-xs text-gray-500 text-center transition-all duration-500 ease-out delay-800 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                By completing this payment, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}