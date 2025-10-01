"use client"

import { Facebook, Instagram, Twitter, Search, Hotel, Star, MapPin, Calendar, Users, Car } from "lucide-react"
import Header from "@/components/header"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [isVisible, setIsVisible] = useState({})
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
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
    sections.forEach((section) => observerRef.current.observe(section))

    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="home" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slide-in-left">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Let's <span className="italic text-blue-500">travel</span> the <br />
              <span className="italic text-blue-500">world</span>
            </h1>

            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Enjoy the breathtaking vista of the scenic Belize and fulfill your dream to the fullest
            </p>

            {/* Search Form */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg animate-fade-in-up animation-delay-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Where to go?"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    Guests
                  </label>
                  <input
                    type="number"
                    placeholder="How many?"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button className="w-full md:w-auto bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all hover:shadow-lg flex items-center justify-center gap-2">
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 animate-fade-in animation-delay-400">
              <span className="text-sm font-medium">Follow</span>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-all hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-500 transition-all hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-400 transition-all hover:scale-110">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="w-full max-w-[560px] ml-auto">
            {/* Decorative Circle - Top Right */}
            {/* <div className="hidden lg:flex absolute top-0 right-0 w-20 h-20 border-2 border-dashed border-blue-400 rounded-full items-center justify-center z-10 -mt-4 -mr-4">
              <span className="text-xs font-bold text-blue-500 text-center leading-tight">EXPLORE</span>
            </div> */}

            {/* Responsive Image Layout */}
            <div className="relative space-y-4 md:space-y-6">
              {/* Main Image - Santorini */}
              <div className="rounded-2xl md:rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <img 
                  src="/santorini-blue-domes-greece.jpg" 
                  alt="Santorini" 
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover" 
                />
              </div>

              {/* Two Column Layout for remaining images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Traveler Image */}
                <div className="rounded-2xl md:rounded-[32px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="/backpacker-with-hat-ocean-view.jpg" 
                    alt="Traveler" 
                    className="w-full h-40 sm:h-48 md:h-52 object-cover" 
                  />
                </div>

                {/* Greek Architecture Image */}
                <div className="rounded-2xl md:rounded-[32px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="/white-greek-buildings-blue-doors.jpg"
                    alt="Greek Architecture"
                    className="w-full h-40 sm:h-48 md:h-52 object-cover"
                  />
                </div>
              </div>

              {/* Best Packages Link */}
              <div className="flex justify-end mt-4">
                <a href="/packages" className="text-blue-500 font-semibold hover:text-blue-700 transition-colors flex items-center gap-2 text-sm">
                  Best Packages →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-16 flex items-center justify-center gap-12 opacity-40 flex-wrap animate-fade-in animation-delay-600">
          <div className="text-gray-500 font-medium hover:opacity-100 transition">Expedia</div>
          <div className="text-gray-500 font-medium hover:opacity-100 transition">TURKISH AIRLINES</div>
          <div className="text-gray-500 font-medium hover:opacity-100 transition">Skyscanner</div>
          <div className="text-gray-500 font-medium hover:opacity-100 transition">Airbnb</div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section
        id="destinations"
        data-animate
        className={`container mx-auto px-4 py-12 transition-all duration-700 ${
          isVisible.destinations ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold italic">
            Popular <span className="text-blue-500">Destinations</span>
          </h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">
              ←
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Destination Card 1 */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/mountain-lake-sunset-alps.jpg"
                alt="Seneka Alps"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <button className="w-full bg-white text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition">Seneka Alps</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">2,932 ratings</span>
                <span className="text-yellow-500 font-semibold flex items-center gap-1">
                  <Star size={16} className="fill-yellow-500" /> 4.8
                </span>
              </div>
            </div>
          </div>

          {/* Destination Card 2 */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/tropical-beach-palm-trees-resort.jpg"
                alt="Grand Barrier"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <button className="w-full bg-white text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition">Grand Barrier</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">9,829 ratings</span>
                <span className="text-yellow-500 font-semibold flex items-center gap-1">
                  <Star size={16} className="fill-yellow-500" /> 4.3
                </span>
              </div>
            </div>
          </div>

          {/* Destination Card 3 */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/venice-italy-canal-buildings.jpg"
                alt="Venice Italy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <button className="w-full bg-white text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition">Venice Italy</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">7,342 ratings</span>
                <span className="text-yellow-500 font-semibold flex items-center gap-1">
                  <Star size={16} className="fill-yellow-500" /> 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Destination Card 4 */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <img
                src="/santorini-greece-infinity-pool-ocean.jpg"
                alt="Santorini"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <button className="w-full bg-white text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition">
                    Explore Now
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition">Santorini</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">3,214 ratings</span>
                <span className="text-yellow-500 font-semibold flex items-center gap-1">
                  <Star size={16} className="fill-yellow-500" /> 4.2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Services Section */}
      <section
        id="services"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.services ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Images */}
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute top-0 left-0 w-72 h-64 rounded-2xl overflow-hidden transform -rotate-3 shadow-xl hover:scale-105 transition-transform duration-300">
              <img src="/santorini-blue-domes-greece.jpg" alt="Destination" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-56 rounded-2xl overflow-hidden transform rotate-6 shadow-xl hover:scale-105 transition-transform duration-300">
              <img
                src="/white-greek-buildings-blue-doors.jpg"
                alt="Architecture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Book your <span className="italic text-blue-500">services</span>
              <br />& <span className="italic">enjoy your room.</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Choose to provide the best travel clicks to make your trip more comfortable
            </p>

            {/* Book Car */}
            <div className="mb-6 flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-blue-500 transition">Book Car</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Choose from a wide range of vehicles to make your journey comfortable and convenient
                </p>
              </div>
            </div>

            {/* Book Hotel */}
            <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition">
                <Hotel className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-blue-500 transition">Book Hotel</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Find the perfect accommodation from budget-friendly to luxury hotels worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & Travel Tips Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-12 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/3 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full translate-y-1/2 -translate-x-1/4 opacity-20"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Stay updated with our <span className="italic text-blue-600">travel</span> tips and{" "}
                <span className="italic text-blue-600">exclusive</span> deals
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Join thousands of travelers who get insider tips, destination guides, and special offers delivered directly to their inbox.
              </p>
              
              {/* Newsletter Signup */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    Subscribe
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">No spam. Unsubscribe anytime.</p>
              </div>
            </div>

            {/* Right - Travel Statistics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-blue-600 mb-2">250+</div>
                <p className="text-gray-600 text-sm">Destinations Worldwide</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-orange-500 mb-2">50K+</div>
                <p className="text-gray-600 text-sm">Happy Travelers</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-green-500 mb-2">15</div>
                <p className="text-gray-600 text-sm">Years Experience</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
                <p className="text-gray-600 text-sm">Customer Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Review Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 italic">Client Review</h2>

        <div className="max-w-2xl mx-auto text-center mb-8">
          <p className="text-gray-700 text-lg mb-4">
            "Our travel planner and her team pulled together an amazing trip in a challenging environment."
          </p>
          <div className="flex justify-center gap-1 mb-8">
            <Star className="fill-orange-400 text-orange-400" size={20} />
            <Star className="fill-orange-400 text-orange-400" size={20} />
            <Star className="fill-orange-400 text-orange-400" size={20} />
            <Star className="fill-orange-400 text-orange-400" size={20} />
            <Star className="fill-orange-400 text-orange-400" size={20} />
          </div>
        </div>

        {/* Client Avatars */}
        <div className="flex justify-center items-center gap-8 mb-16">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-2 border-4 border-white"></div>
            <p className="text-sm font-medium">Liam</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mx-auto mb-2 border-4 border-white"></div>
            <p className="text-sm font-medium">Shivani</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mx-auto mb-2 border-4 border-white"></div>
            <p className="text-sm font-medium">Raina</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4 italic">Start your tour today!</h3>
          <p className="text-gray-600 mb-6">Book a trip to your favorite destination</p>
          <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition">Book Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Xplorex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
