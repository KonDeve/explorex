"use client"

import { Facebook, Instagram, Twitter, Globe, Users, Award, Heart } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function AboutPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="about" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            About <span className="italic text-blue-500">Xplorex</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We're passionate about creating unforgettable travel experiences that connect you with the world's most
            beautiful destinations.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section
        id="mission"
        data-animate
        className={`container mx-auto px-4 py-12 transition-all duration-700 ${
          isVisible.mission ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Our <span className="italic">Mission</span>
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At Xplorex, we believe that travel is more than just visiting new places—it's about creating memories,
              discovering cultures, and connecting with people from around the world.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to make travel accessible, enjoyable, and meaningful for everyone. We curate the best
              destinations, provide expert guidance, and ensure every journey is seamless from start to finish.
            </p>
          </div>

          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img
              src="/santorini-blue-domes-greece.jpg"
              alt="Beautiful destination"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        id="values"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.values ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="italic text-blue-500">Us</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Value 1 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Reach</h3>
            <p className="text-gray-600 text-sm">
              Access to over 500+ destinations worldwide with local expertise and insider knowledge.
            </p>
          </div>

          {/* Value 2 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-orange-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Team</h3>
            <p className="text-gray-600 text-sm">
              Our travel experts have years of experience crafting perfect itineraries for every traveler.
            </p>
          </div>

          {/* Value 3 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-green-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Award Winning</h3>
            <p className="text-gray-600 text-sm">
              Recognized as one of the top travel platforms with multiple industry awards.
            </p>
          </div>

          {/* Value 4 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-pink-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Customer First</h3>
            <p className="text-gray-600 text-sm">
              24/7 support and personalized service to ensure your trip exceeds expectations.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Destinations</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Travelers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.team ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-4xl font-bold text-center mb-12">
          Meet Our <span className="italic text-blue-500">Team</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-1">Sarah Johnson</h3>
            <p className="text-gray-600 text-sm mb-3">Founder & CEO</p>
            <div className="flex justify-center gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-1">Michael Chen</h3>
            <p className="text-gray-600 text-sm mb-3">Head of Operations</p>
            <div className="flex justify-center gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mx-auto mb-4"></div>
            <h3 className="font-bold text-lg mb-1">Emma Rodriguez</h3>
            <p className="text-gray-600 text-sm mb-3">Travel Curator</p>
            <div className="flex justify-center gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-white rounded-3xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your <span className="italic text-blue-500">Journey?</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of happy travelers who have discovered the world with Xplorex.
          </p>
          <Link href="/packages">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition">
              Explore Packages
            </button>
          </Link>
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
