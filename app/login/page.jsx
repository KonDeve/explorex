"use client"

import { ArrowLeft, Plane } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 right-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden flex animate-fade-in-up">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Xplore<span className="text-blue-500">x</span>
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Plane className="text-white" size={20} />
              </div>
              <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">WELCOME</h2>
            <p className="text-gray-600">Let's get you back on the road</p>
          </div>

          {/* Login Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div className="text-right mt-2">
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Forget Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all hover:shadow-lg font-medium"
            >
              SIGN IN
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-5">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-medium transition">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src="/coastal-cliffs-ocean-adventure.jpg"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
