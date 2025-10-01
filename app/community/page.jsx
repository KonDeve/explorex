"use client"

import { Heart, MessageCircle, Share2, MapPin, Calendar, Star, TrendingUp } from "lucide-react"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function CommunityPage() {
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

  const posts = [
    {
      id: 1,
      author: "Sarah Mitchell",
      avatar: "from-blue-400 to-blue-600",
      location: "Santorini, Greece",
      date: "2 days ago",
      image: "/santorini-blue-domes-greece.jpg",
      title: "Sunset in Santorini: A Dream Come True",
      excerpt: "Just witnessed the most breathtaking sunset of my life. The blue domes against the golden sky...",
      likes: 342,
      comments: 28,
      trending: true,
    },
    {
      id: 2,
      author: "Michael Chen",
      avatar: "from-orange-400 to-pink-500",
      location: "Venice, Italy",
      date: "5 days ago",
      image: "/venice-italy-canal-buildings.jpg",
      title: "Getting Lost in Venice's Charming Streets",
      excerpt: "There's something magical about wandering through Venice without a map. Every corner reveals...",
      likes: 256,
      comments: 19,
      trending: false,
    },
    {
      id: 3,
      author: "Emma Rodriguez",
      avatar: "from-purple-400 to-pink-500",
      location: "Swiss Alps",
      date: "1 week ago",
      image: "/mountain-lake-sunset-alps.jpg",
      title: "Alpine Adventures: Hiking Through Paradise",
      excerpt:
        "The crisp mountain air, crystal clear lakes, and stunning peaks made this the adventure of a lifetime...",
      likes: 189,
      comments: 15,
      trending: false,
    },
    {
      id: 4,
      author: "David Park",
      avatar: "from-green-400 to-teal-500",
      location: "Maldives",
      date: "1 week ago",
      image: "/tropical-beach-palm-trees-resort.jpg",
      title: "Paradise Found: My Maldives Experience",
      excerpt: "Crystal clear waters, white sand beaches, and the most incredible marine life I've ever seen...",
      likes: 421,
      comments: 34,
      trending: true,
    },
  ]

  const trendingTopics = [
    { name: "Summer Travel", posts: 1234 },
    { name: "Budget Tips", posts: 892 },
    { name: "Solo Travel", posts: 756 },
    { name: "Photography", posts: 645 },
    { name: "Food & Culture", posts: 523 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header activePage="community" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Travel <span className="italic text-blue-500">Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with fellow travelers, share your stories, and get inspired for your next adventure.
          </p>
          <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-semibold">
            Share Your Story
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section
        id="content"
        data-animate
        className={`container mx-auto px-4 py-12 transition-all duration-700 ${
          isVisible.content ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${post.avatar}`}></div>
                    <div className="flex-1">
                      <div className="font-bold">{post.author}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {post.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                      </div>
                    </div>
                    {post.trending && (
                      <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                        <TrendingUp size={16} />
                        Trending
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                </div>

                {/* Post Image */}
                <div className="h-80 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Post Actions */}
                <div className="p-6 pt-4 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition">
                      <Heart size={20} />
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                      <MessageCircle size={20} />
                      <span className="font-semibold">{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                    <Share2 size={20} />
                    <span className="font-semibold">Share</span>
                  </button>
                </div>
              </article>
            ))}

            {/* Load More */}
            <div className="text-center py-8">
              <button className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
                Load More Stories
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-orange-500" size={24} />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <span className="font-medium">#{topic.name}</span>
                    <span className="text-sm text-gray-500">{topic.posts} posts</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={24} />
                Top Contributors
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Sarah Mitchell</div>
                    <div className="text-xs text-gray-500">142 posts</div>
                  </div>
                  <button className="text-blue-500 text-sm font-semibold hover:underline">Follow</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Michael Chen</div>
                    <div className="text-xs text-gray-500">128 posts</div>
                  </div>
                  <button className="text-blue-500 text-sm font-semibold hover:underline">Follow</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Emma Rodriguez</div>
                    <div className="text-xs text-gray-500">115 posts</div>
                  </div>
                  <button className="text-blue-500 text-sm font-semibold hover:underline">Follow</button>
                </div>
              </div>
            </div>

            {/* Join Community CTA */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Join Our Community</h3>
              <p className="text-blue-100 text-sm mb-4">
                Connect with thousands of travelers and share your adventures.
              </p>
              <button className="w-full bg-white text-blue-500 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section
        id="stats"
        data-animate
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          isVisible.stats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-white rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Growing <span className="italic text-blue-500">Community</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-500 mb-2">12K+</div>
              <div className="text-gray-600">Travel Stories</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-500 mb-2">180+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-500 mb-2">25K+</div>
              <div className="text-gray-600">Photos Shared</div>
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
