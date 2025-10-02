"use client"

import { ArrowLeft, CreditCard, Lock, Check, Calendar, MapPin, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getPackageBySlug } from "@/lib/packages"

export default function PaymentPage({ params }) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  })
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true)
        const data = await getPackageBySlug(params.slug)
        setPackageData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching package:', err)
        setError('Failed to load package details')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchPackage()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <span className="ml-3 text-gray-600 text-lg">Loading payment details...</span>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Package not found'}</p>
          <Link href="/packages" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block">
            Back to Packages
          </Link>
        </div>
      </div>
    )
  }

  const pkg = packageData
  // Get booking details from sessionStorage or use defaults
  const bookingDetails = {
    adults: 2,
    children: 0,
    checkIn: "2025-06-15",
    checkOut: "2025-06-22",
  }

  const calculateTotal = () => {
    const priceValue = pkg.price_value || 0
    const basePrice = priceValue * bookingDetails.adults
    const childPrice = priceValue * 0.5 * bookingDetails.children
    const serviceFee = 99
    const taxes = (basePrice + childPrice) * 0.1
    return {
      subtotal: basePrice + childPrice,
      serviceFee,
      taxes,
      total: basePrice + childPrice + serviceFee + taxes,
    }
  }

  const totals = calculateTotal()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Payment submitted:", formData)
    alert("Payment processed successfully! Redirecting to confirmation page...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold">
          Xplore<span className="text-blue-500 italic">x</span>
        </Link>
        <div className="flex items-center gap-2 text-green-600">
          <Lock size={20} />
          <span className="text-sm font-semibold">Secure Payment</span>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/packages/${params.slug}/book`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Booking Details</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-2">Payment Details</h1>
              <p className="text-gray-600 mb-8">Complete your payment to confirm your booking</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Payment Method Selection */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <CreditCard className="mx-auto mb-2 text-gray-700" size={24} />
                      <div className="text-sm font-semibold text-gray-900">Credit/Debit Card</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === "paypal"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <div className="text-sm font-semibold text-gray-900">PayPal</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === "bank"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-2">🏦</div>
                      <div className="text-sm font-semibold text-gray-900">Bank Transfer</div>
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === "card" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Card Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="saveCard"
                          checked={formData.saveCard}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700">Save card for future bookings</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Secure Payment</h3>
                      <p className="text-sm text-green-700">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-bold text-lg"
                >
                  Pay ₱{totals.total.toLocaleString()} Now
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By completing this payment, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>

              {/* Package Image */}
              <div className="rounded-xl overflow-hidden mb-6">
                <img 
                  src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/placeholder.svg"} 
                  alt={pkg.title} 
                  className="w-full h-48 object-cover" 
                />
              </div>

              {/* Package Details */}
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-lg">{pkg.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>{pkg.location}{pkg.country ? `, ${pkg.country}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar size={16} />
                  <span>
                    {bookingDetails.checkIn} - {bookingDetails.checkOut}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Users size={16} />
                  <span>{bookingDetails.adults} Adult{bookingDetails.adults !== 1 ? "s" : ""}</span>
                  {bookingDetails.children > 0 && <span>, {bookingDetails.children} Child{bookingDetails.children !== 1 ? "ren" : ""}</span>}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ₱{pkg.price_value?.toLocaleString()} × {bookingDetails.adults} adult
                    {bookingDetails.adults !== 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold">₱{(pkg.price_value * bookingDetails.adults).toLocaleString()}</span>
                </div>
                {bookingDetails.children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ₱{(pkg.price_value * 0.5).toLocaleString()} × {bookingDetails.children} child
                      {bookingDetails.children !== 1 ? "ren" : ""}
                    </span>
                    <span className="font-semibold">₱{(pkg.price_value * 0.5 * bookingDetails.children).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-semibold">₱{totals.serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes (10%)</span>
                  <span className="font-semibold">₱{totals.taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-500">₱{totals.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Free cancellation up to 48 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
