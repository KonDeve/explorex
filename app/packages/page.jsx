"use client"

import { MapPin, Calendar, Users, Star, Check, ArrowRight, Sparkles, Award, Shield } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function PackagesPage() {
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

  const packages = [
    {
      id: 1,
      title: "Santorini Paradise",
      location: "Greece",
      duration: "7 Days",
      people: "2-4 People",
      price: "$2,499",
      rating: 4.9,
      reviews: 342,
      image: "/santorini-blue-domes-greece.jpg",
      features: ["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"],
      popular: true,
      featured: true,
    },
    {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      people: "2 People",
      price: "$1,899",
      rating: 4.8,
      reviews: 256,
      image: "/venice-italy-canal-buildings.jpg",
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"],
      popular: false,
    },
    {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      people: "2-6 People",
      price: "$2,799",
      rating: 5.0,
      reviews: 189,
      image: "/mountain-lake-sunset-alps.jpg",
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"],
      popular: false,
    },
    {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      people: "2 People",
      price: "$3,299",
      rating: 4.9,
      reviews: 421,
      image: "/tropical-beach-palm-trees-resort.jpg",
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"],
      popular: true,
    },
    {
      id: 5,
      title: "Greek Islands Tour",
      location: "Greece",
      duration: "10 Days",
      people: "4-8 People",
      price: "$2,199",
      rating: 4.7,
      reviews: 298,
      image: "/white-greek-buildings-blue-doors.jpg",
      features: ["Island Hopping", "Hotels", "Ferry Tickets", "Local Guide"],
      popular: false,
    },
    {
      id: 6,
      title: "Mediterranean Cruise",
      location: "Multiple",
      duration: "12 Days",
      people: "2-4 People",
      price: "$3,899",
      rating: 4.8,
      reviews: 512,
      image: "/santorini-greece-infinity-pool-ocean.jpg",
      features: ["Luxury Cruise", "All Inclusive", "Shore Excursions", "Entertainment"],
      popular: true,
    },
  ]

  const featuredPackage = packages.find((pkg) => pkg.featured)
  const regularPackages = packages.filter((pkg) => !pkg.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header activePage="packages" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 pt-16 pb-12 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-8">
            <Sparkles size={16} />
            <span>Curated Travel Experiences</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] text-balance">
            Explore Our Travel{" "}
            <span className="italic bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Packages
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-14 max-w-2xl mx-auto leading-relaxed text-pretty">
            Handpicked destinations and experiences designed to create unforgettable memories. Every detail carefully
            planned for your perfect journey.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-semibold hover:scale-105">
              All Packages
            </button>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all text-sm font-semibold hover:scale-105">
              Popular
            </button>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all text-sm font-semibold hover:scale-105">
              Beach
            </button>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all text-sm font-semibold hover:scale-105">
              Mountain
            </button>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all text-sm font-semibold hover:scale-105">
              City
            </button>
          </div>
        </div>
      </section>

      {featuredPackage && (
        <section
          id="featured"
          data-animate
          className={`container mx-auto px-4 lg:px-8 py-12 transition-all duration-700 ${
            isVisible.featured ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-8 flex items-center gap-3">
            <Award className="text-orange-500" size={24} />
            <h2 className="text-2xl font-bold">Featured Package</h2>
          </div>

          <Link href={`/packages/${featuredPackage.id}`}>
            <div className="group relative bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-blue-500 transition-all duration-500">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-[400px] lg:h-[600px] overflow-hidden">
                  <img
                    src={featuredPackage.image || "/placeholder.svg"}
                    alt={featuredPackage.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/40" />

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex gap-3">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} />
                      Featured
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <Star className="fill-yellow-400 text-yellow-400" size={16} />
                      <span className="font-bold text-sm">{featuredPackage.rating}</span>
                      <span className="text-xs text-gray-500">({featuredPackage.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-balance leading-tight group-hover:text-blue-500 transition-colors">
                    {featuredPackage.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-6 text-base text-gray-600 mb-10 pb-10 border-b-2 border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <MapPin size={18} className="text-blue-500" />
                      </div>
                      <span className="font-medium">{featuredPackage.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                        <Calendar size={18} className="text-orange-500" />
                      </div>
                      <span className="font-medium">{featuredPackage.duration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <Users size={18} className="text-green-500" />
                      </div>
                      <span className="font-medium">{featuredPackage.people}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    {featuredPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-base text-gray-700">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-green-600 stroke-[3]" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t-2 border-gray-100">
                    <div>
                      <div className="text-sm text-gray-500 mb-2 font-medium">Starting from</div>
                      <div className="text-4xl font-bold text-gray-900">{featuredPackage.price}</div>
                      <div className="text-sm text-gray-500 mt-1">per person</div>
                    </div>
                    <div className="flex items-center gap-3 text-blue-500 font-semibold text-base group-hover:gap-4 transition-all">
                      <span>View Details</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section
        id="packages"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-16 pb-24 transition-all duration-700 ${
          isVisible.packages ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="mb-10">
          <h2 className="text-3xl font-bold">All Packages</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPackages.map((pkg) => (
            <Link key={pkg.id} href={`/packages/${pkg.id}`}>
              <div className="group bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-blue-500 transition-all duration-500 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image || "/placeholder.svg"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {pkg.popular && (
                    <div className="absolute top-5 left-5 bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                    <span className="font-bold text-sm">{pkg.rating}</span>
                    <span className="text-xs text-gray-500">({pkg.reviews})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-5 text-balance leading-tight group-hover:text-blue-500 transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600 mb-8 pb-8 border-b-2 border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-medium">{pkg.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="font-medium">{pkg.people}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-8 flex-grow">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-green-600 stroke-[3]" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t-2 border-gray-100 mt-auto">
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Starting from</div>
                      <div className="text-3xl font-bold text-gray-900">{pkg.price}</div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>View Details</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Custom Package CTA */}
      <section
        id="custom"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-16 transition-all duration-700 ${
          isVisible.custom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="relative border-2 border-gray-900 rounded-3xl p-12 md:p-20 text-center bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
              Let us create a custom package tailored to your preferences, budget, and travel style. Our experts will
              design the perfect journey just for you.
            </p>
            <button className="bg-gray-900 text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all font-semibold inline-flex items-center gap-3 hover:scale-105">
              Create Custom Package
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section
        id="whybook"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-20 border-t-2 border-gray-200 transition-all duration-700 ${
          isVisible.whybook ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
            <Shield size={16} />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
            Why Book{" "}
            <span className="italic bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              With Xplorex
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-blue-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="text-blue-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Best Price Guarantee</h3>
            <p className="text-gray-600 leading-relaxed">
              We guarantee the best prices on all our packages. Find it cheaper elsewhere and we'll match it.
            </p>
          </div>

          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-orange-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="text-orange-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">Handpicked Experiences</h3>
            <p className="text-gray-600 leading-relaxed">
              Every package is carefully curated by our travel experts to ensure unforgettable experiences.
            </p>
          </div>

          <div className="text-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-green-500 transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="text-green-500" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated support team is available around the clock to assist you during your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-3xl font-bold">
              Xplore<span className="text-blue-400 italic">x</span>
            </div>
            <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
