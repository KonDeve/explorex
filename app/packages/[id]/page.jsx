"use client"

import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Star, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Header from "@/components/header"

export default function PackageDetailPage({ params }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
      people: "2-4 People",
      price: "$2,499",
      rating: 4.9,
      reviews: 342,
      images: [
        "/santorini-blue-domes-greece.jpg",
        "/santorini-greece-infinity-pool-ocean.jpg",
        "/white-greek-buildings-blue-doors.jpg",
      ],
      features: ["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"],
      leadArchitect: "Maria Papadopoulos",
      tourOperator: "Aegean Adventures",
      area: "Cyclades Islands",
      description:
        "Experience the magic of Santorini with its iconic blue-domed churches, stunning sunsets, and pristine beaches. This comprehensive package includes luxury accommodation, guided tours, and authentic Greek dining experiences.",
      highlights: [
        "Visit the famous blue-domed churches of Oia",
        "Sunset cruise around the caldera",
        "Wine tasting at local vineyards",
        "Explore ancient ruins of Akrotiri",
        "Relax on the unique red and black sand beaches",
        "Traditional Greek cooking class",
      ],
      included: [
        "Round-trip airport transfers",
        "7 nights in 5-star hotel",
        "Daily breakfast and dinner",
        "All entrance fees",
        "Professional English-speaking guide",
        "Travel insurance",
      ],
    },
    2: {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      people: "2 People",
      price: "$1,899",
      rating: 4.8,
      reviews: 256,
      images: ["/venice-italy-canal-buildings.jpg", "/santorini-blue-domes-greece.jpg"],
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"],
      leadArchitect: "Giovanni Rossi",
      tourOperator: "Italian Escapes",
      area: "Veneto Region",
      description:
        "Discover the romantic charm of Venice with its winding canals, historic architecture, and world-class art. Perfect for couples seeking an unforgettable Italian getaway.",
      highlights: [
        "Private gondola ride through the canals",
        "Visit St. Mark's Basilica and Doge's Palace",
        "Explore the colorful island of Burano",
        "Venetian mask-making workshop",
        "Sunset aperitivo with canal views",
      ],
      included: [
        "Airport water taxi transfers",
        "5 nights in boutique hotel",
        "Daily breakfast",
        "Gondola ride",
        "Museum passes",
        "City walking tour",
      ],
    },
    3: {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      people: "2-6 People",
      price: "$2,799",
      rating: 5.0,
      reviews: 189,
      images: ["/mountain-lake-sunset-alps.jpg", "/tropical-beach-palm-trees-resort.jpg"],
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"],
      leadArchitect: "Hans Mueller",
      tourOperator: "Alpine Explorers",
      area: "Swiss Alps",
      description:
        "Embark on an unforgettable alpine adventure with breathtaking mountain views, pristine lakes, and world-class skiing. Perfect for nature lovers and adventure seekers.",
      highlights: [
        "Ski or snowboard on pristine slopes",
        "Scenic train ride through the Alps",
        "Visit charming mountain villages",
        "Fondue dinner with mountain views",
        "Optional paragliding experience",
      ],
      included: [
        "All transfers and transportation",
        "6 nights in mountain lodge",
        "All meals included",
        "Ski pass and equipment rental",
        "Mountain guide",
        "Travel insurance",
      ],
    },
    4: {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      people: "2 People",
      price: "$3,299",
      rating: 4.9,
      reviews: 421,
      images: ["/tropical-beach-palm-trees-resort.jpg", "/santorini-greece-infinity-pool-ocean.jpg"],
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"],
      leadArchitect: "Ahmed Hassan",
      tourOperator: "Island Paradise Tours",
      area: "Maldives Atolls",
      description:
        "Escape to paradise with crystal-clear waters, white sand beaches, and luxury overwater villas. The ultimate tropical getaway for relaxation and romance.",
      highlights: [
        "Stay in overwater villa with private pool",
        "Snorkeling with tropical fish and turtles",
        "Sunset dolphin cruise",
        "Couples spa treatments",
        "Private beach dinner under the stars",
      ],
      included: [
        "Seaplane transfers",
        "8 nights in beach villa",
        "All meals and drinks",
        "Water sports equipment",
        "Spa access",
        "Excursions",
      ],
    },
    5: {
      id: 5,
      title: "Greek Islands Tour",
      location: "Greece",
      duration: "10 Days",
      people: "4-8 People",
      price: "$2,199",
      rating: 4.7,
      reviews: 298,
      images: ["/white-greek-buildings-blue-doors.jpg", "/santorini-blue-domes-greece.jpg"],
      features: ["Island Hopping", "Hotels", "Ferry Tickets", "Local Guide"],
      leadArchitect: "Dimitris Kostas",
      tourOperator: "Hellenic Voyages",
      area: "Greek Islands",
      description:
        "Explore multiple Greek islands on this comprehensive tour. Experience diverse landscapes, ancient history, and authentic Greek culture across the Aegean Sea.",
      highlights: [
        "Visit 5 different Greek islands",
        "Explore ancient archaeological sites",
        "Traditional Greek taverna experiences",
        "Beach time on pristine shores",
        "Local market visits",
      ],
      included: [
        "All ferry transfers",
        "10 nights accommodation",
        "Daily breakfast",
        "Island tours",
        "Local guide",
        "Some lunches and dinners",
      ],
    },
    6: {
      id: 6,
      title: "Mediterranean Cruise",
      location: "Multiple",
      duration: "12 Days",
      people: "2-4 People",
      price: "$3,899",
      rating: 4.8,
      reviews: 512,
      images: ["/santorini-greece-infinity-pool-ocean.jpg", "/venice-italy-canal-buildings.jpg"],
      features: ["Luxury Cruise", "All Inclusive", "Shore Excursions", "Entertainment"],
      leadArchitect: "Captain Marco Bellini",
      tourOperator: "Mediterranean Cruises Ltd",
      area: "Mediterranean Sea",
      description:
        "Sail the Mediterranean in luxury, visiting iconic ports across multiple countries. Enjoy world-class dining, entertainment, and shore excursions.",
      highlights: [
        "Visit 8 ports in 5 countries",
        "Luxury cruise ship amenities",
        "Guided shore excursions",
        "Gourmet dining experiences",
        "Evening entertainment shows",
      ],
      included: [
        "12-day cruise accommodation",
        "All meals and snacks",
        "Shore excursions",
        "Entertainment",
        "Port taxes",
        "Onboard activities",
      ],
    },
  }

  const pkg = packages[params.id] || packages[1]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pkg.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + pkg.images.length) % pkg.images.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="packages" />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/packages" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <ArrowLeft size={20} />
          <span className="font-medium">Specifications</span>
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 pb-8 animate-fade-in">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Image */}
          <div className="md:col-span-2 relative h-[500px] rounded-2xl overflow-hidden">
            <img
              src={pkg.images[currentImageIndex] || "/placeholder.svg"}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            {pkg.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {pkg.images.length}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="space-y-4">
            {pkg.images.slice(0, 3).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-full h-[158px] rounded-xl overflow-hidden transition ${
                  currentImageIndex === index ? "ring-4 ring-blue-500" : ""
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* See All Button */}
        {pkg.images.length > 3 && (
          <div className="mt-4 text-right">
            <button className="text-blue-500 font-semibold hover:underline flex items-center gap-2 ml-auto">
              See All →
            </button>
          </div>
        )}
      </section>

      {/* Package Details */}
      <section
        id="details"
        data-animate
        className={`container mx-auto px-4 py-8 transition-all duration-700 ${
          isVisible.details ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="text-sm text-gray-500 mb-2">(01) Specifications</div>
              <h1 className="text-5xl font-bold mb-4">{pkg.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{pkg.description}</p>

              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{pkg.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{pkg.people}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="font-semibold">{pkg.rating}</span>
                  <span className="text-sm">({pkg.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div
              id="highlights"
              data-animate
              className={`bg-white rounded-2xl p-8 transition-all duration-700 ${
                isVisible.highlights ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">Tour Highlights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pkg.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div
              id="included"
              data-animate
              className={`bg-white rounded-2xl p-8 transition-all duration-700 ${
                isVisible.included ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              <div className="space-y-3">
                {pkg.included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="text-blue-500" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-2xl p-6">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Lead Architect</div>
                <div className="font-bold text-lg">{pkg.leadArchitect}</div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Tour Operator</div>
                <div className="font-bold text-lg">{pkg.tourOperator}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Area</div>
                <div className="font-bold text-lg">{pkg.area}</div>
              </div>
            </div>

            {/* Pricing and Booking */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white sticky top-4">
              <div className="mb-6">
                <div className="text-blue-100 text-sm mb-1">Starting from</div>
                <div className="text-4xl font-bold">{pkg.price}</div>
                <div className="text-blue-100 text-sm">per person</div>
              </div>

              <Link
                href={`/packages/${params.id}/book`}
                className="w-full bg-white text-blue-500 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg mb-4 block text-center"
              >
                Book This Package
              </Link>

              <button className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold">
                Contact Us
              </button>

              <div className="mt-6 pt-6 border-t border-blue-400">
                <div className="text-sm text-blue-100 mb-2">Need help?</div>
                <div className="font-semibold">Call us: +1 (555) 123-4567</div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Package Features</h3>
              <div className="space-y-3">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
