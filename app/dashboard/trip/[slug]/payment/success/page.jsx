"use client"

import Header from "@/components/header"
import { Download, Mail, Phone, CheckCircle, Calendar, MapPin, Users, Star, Award, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

// Mock data - in a real app this would come from URL params or API
const getBookingConfirmation = () => {
  return {
    id: "BK-001",
    package: "Santorini Paradise",
    location: "Greece",
    checkIn: "2025-06-15",
    checkOut: "2025-06-22",
    guests: "2 Adults",
    image: "/santorini-blue-domes-greece.jpg",
    confirmation: "XPL-SAN-2025-001",
    totalPaid: 2499,
    paymentMethod: "Credit Card",
    bookingDate: new Date().toLocaleDateString(),
    hotelName: "Santorini Blue Resort",
    hotelRating: 5,
    duration: "7 Days, 6 Nights"
  }
}

export default function PaymentSuccessPage() {
  const booking = getBookingConfirmation()
  const lottieRef = useRef(null)

  useEffect(() => {
    // Load Lottie animation
    const loadLottie = async () => {
      try {
        const lottie = await import('lottie-web')
        const response = await fetch('/Success.json')
        const animationData = await response.json()
        
        if (lottieRef.current) {
          // Clear any existing animations
          lottieRef.current.innerHTML = ''
          
          lottie.default.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: animationData
          })
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error)
      }
    }

    loadLottie()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="dashboard" />

      {/* Success Message */}
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-40 h-40 mx-auto mb-8 overflow-hidden" ref={lottieRef}></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-2">Your trip to <span className="font-semibold text-blue-600">{booking.location}</span> is confirmed</p>
        <p className="text-gray-500 mb-12">Stay tuned in your email for detailed information and updates</p>
        
        {/* Trip Details Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{booking.package}</h2>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
              Confirmed
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-2">Check-in</div>
              <div className="font-semibold text-gray-900">{booking.checkIn}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-2">Check-out</div>
              <div className="font-semibold text-gray-900">{booking.checkOut}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Guests</div>
              <div className="font-medium text-gray-900">{booking.guests}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Total Paid</div>
              <div className="text-xl font-bold text-gray-900">${booking.totalPaid.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Confirmation Number</div>
                <div className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  {booking.confirmation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          <Link href="/dashboard" className="block">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-sm">
              View My Bookings
            </button>
          </Link>
          
          <Link href="/packages" className="block">
            <button className="w-full border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-3 px-8 rounded-xl font-medium transition-all duration-200">
              Book Another Trip
            </button>
          </Link>
        </div>

        {/* Contact & Download */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-gray-700 mb-1">Need assistance?</p>
              <p className="text-blue-600 font-medium">support@explorex.com</p>
            </div>
            <div className="text-center md:text-right">
              <button className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <Download size={16} />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}