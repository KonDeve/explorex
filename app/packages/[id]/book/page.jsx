"use client"

import { ArrowLeft, Calendar, Users, MapPin, Check, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function BookingPage({ params }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    specialRequests: "",
  })
  const [isVisible, setIsVisible] = useState({})

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

  const packages = {
    1: {
      id: 1,
      title: "Santorini Paradise",
      location: "Greece",
      duration: "7 Days",
      price: 2499,
      image: "/santorini-blue-domes-greece.jpg",
      features: ["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"],
    },
    2: {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      price: 1899,
      image: "/venice-italy-canal-buildings.jpg",
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"],
    },
    3: {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      price: 2799,
      image: "/mountain-lake-sunset-alps.jpg",
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"],
    },
    4: {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      price: 3299,
      image: "/tropical-beach-palm-trees-resort.jpg",
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"],
    },
    5: {
      id: 5,
      title: "Greek Islands Tour",
      location: "Greece",
      duration: "10 Days",
      price: 2199,
      image: "/white-greek-buildings-blue-doors.jpg",
      features: ["Island Hopping", "Hotels", "Ferry Tickets", "Local Guide"],
    },
    6: {
      id: 6,
      title: "Mediterranean Cruise",
      location: "Multiple",
      duration: "12 Days",
      price: 3899,
      image: "/santorini-greece-infinity-pool-ocean.jpg",
      features: ["Luxury Cruise", "All Inclusive", "Shore Excursions", "Entertainment"],
    },
  }

  const pkg = packages[params.id] || packages[1]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (field, increment) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + increment),
    }))
  }

  const calculateTotal = () => {
    const basePrice = pkg.price * formData.adults
    const childPrice = pkg.price * 0.5 * formData.children
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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Booking submitted:", formData)
    alert("Booking request submitted! We'll contact you shortly to confirm your reservation.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold">
          Xplore<span className="text-blue-500 italic">x</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Need help?</span>
          <span className="font-semibold text-gray-900">+1 (555) 123-4567</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/packages/${params.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Package Details</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div
            id="form"
            data-animate
            className={`lg:col-span-2 transition-all duration-700 ${
              isVisible.form ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="text-gray-600 mb-8">Fill in your details to reserve your dream vacation</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User size={24} className="text-blue-500" />
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar size={24} className="text-blue-500" />
                    Travel Dates
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users size={24} className="text-blue-500" />
                    Number of Travelers
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Adults (18+)</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleNumberChange("adults", -1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.adults}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange("adults", 1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Children (0-17)</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleNumberChange("children", -1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.children}</span>
                        <button
                          type="button"
                          onClick={() => handleNumberChange("children", 1)}
                          className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Children under 18 receive 50% discount</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare size={24} className="text-blue-500" />
                    Special Requests
                  </h2>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Any dietary restrictions, accessibility needs, or special occasions we should know about?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-bold text-lg"
                >
                  Confirm Booking
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By confirming, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>

          <div
            id="summary"
            data-animate
            className={`lg:col-span-1 transition-all duration-700 ${
              isVisible.summary ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>

              <div className="rounded-xl overflow-hidden mb-6">
                <img src={pkg.image || "/placeholder.svg"} alt={pkg.title} className="w-full h-48 object-cover" />
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-lg">{pkg.title}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>{pkg.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar size={16} />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Included Features</h4>
                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ${pkg.price.toLocaleString()} × {formData.adults} adult{formData.adults !== 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold">${(pkg.price * formData.adults).toLocaleString()}</span>
                </div>
                {formData.children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${(pkg.price * 0.5).toLocaleString()} × {formData.children} child
                      {formData.children !== 1 ? "ren" : ""}
                    </span>
                    <span className="font-semibold">${(pkg.price * 0.5 * formData.children).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-semibold">${totals.serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes (10%)</span>
                  <span className="font-semibold">${totals.taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-500">${totals.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Free cancellation up to 48 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Check size={16} className="text-green-500" />
                  <span>Best price guarantee</span>
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

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
