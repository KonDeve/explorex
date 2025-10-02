"use client"

import { MapPin, Calendar, Users, Star, Check, ArrowRight, Sparkles, Award, Shield, Search, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function PackagesPage() {
  const [isVisible, setIsVisible] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])
  const [expandedFilters, setExpandedFilters] = useState({
    search: true,
    availability: false,
    category: false,
    priceRange: false
  })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroFilter, setHeroFilter] = useState("All")

  // Function to handle hero filter and scroll to packages
  const handleHeroFilter = (filter) => {
    setHeroFilter(filter)
    // Scroll to packages section with smooth behavior
    const packagesSection = document.getElementById('packages')
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Add custom styles for animations
  const customStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 30px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `

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

  // Carousel auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length)
    }, 5000) // Change slide every 5 seconds for better viewing time

    return () => clearInterval(interval)
  }, [])

  const packages = [
    {
      id: 1,
      title: "Santorini Paradise",
      location: "Greece",
      country: "GREECE",
      duration: "7 Days",
      people: "2-4 People",
      price: "$2,499",
      priceValue: 2499,
      rating: 4.9,
      reviews: 342,
      image: "/santorini-blue-domes-greece.jpg",
      features: ["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"],
      category: "International",
      popular: true,
      featured: true,
      heroType: "beach",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "6 nights stay at Santorini Blue Resort (Premium Suite)",
          amenities: ["Free Wi-Fi", "Private balcony with caldera view", "Daily breakfast", "Infinity pool access", "Concierge service", "Airport transfers"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights from major cities to Santorini",
          amenities: ["Premium economy seating", "In-flight meals", "Airport lounge access", "Travel insurance"],
          local: "Private transfers and local transportation for all tour activities"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Oia Village sunset tour", "Wine tasting at traditional wineries", "Caldera boat cruise", "Red Beach and Kamari Beach visits", "Fira town exploration"],
          amenities: ["Professional tour guide", "All entrance fees included", "Photography sessions", "Traditional Greek lunch", "Bottled water and snacks"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel insurance for 7 days", "Free welcome dinner with live music", "Souvenir shopping voucher worth $100", "24/7 customer support"]
        }
      }
    },
    {
      id: 2,
      title: "Venice Romance",
      location: "Italy",
      country: "ITALY",
      duration: "5 Days",
      people: "2 People",
      price: "$1,899",
      priceValue: 1899,
      rating: 4.8,
      reviews: 256,
      image: "/venice-italy-canal-buildings.jpg",
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"],
      category: "International",
      popular: false,
      heroType: "city",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "4 nights stay at Hotel Danieli Venice (Canal View Room)",
          amenities: ["Free Wi-Fi", "Canal view balcony", "Continental breakfast", "Room service", "Historic palazzo setting", "24-hour front desk"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Venice Marco Polo Airport",
          amenities: ["Economy plus seating", "Checked baggage included", "Airport transfers via water taxi"],
          local: "Vaporetto passes for Venice public water transport and walking tours"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Private gondola ride through Grand Canal", "St. Mark's Basilica and Doge's Palace tour", "Murano and Burano islands excursion", "Traditional Venetian glass-making workshop", "Romantic dinner at canal-side restaurant"],
          amenities: ["Licensed tour guide", "Skip-the-line tickets", "Traditional mask painting class", "Welcome prosecco", "Photography assistance"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Travel insurance for 5 days", "Venice city map and guidebook", "$75 restaurant voucher", "Free souvenir Venetian mask", "Emergency support hotline"]
        }
      }
    },
    {
      id: 3,
      title: "Alpine Adventure",
      location: "Switzerland",
      country: "SWITZERLAND",
      duration: "6 Days",
      people: "2-6 People",
      price: "$2,799",
      priceValue: 2799,
      rating: 5.0,
      reviews: 189,
      image: "/mountain-lake-sunset-alps.jpg",
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"],
      category: "International",
      popular: false,
      heroType: "mountain",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "5 nights stay at Alpine Grand Lodge (Mountain View Suite)",
          amenities: ["Free Wi-Fi", "Mountain panorama views", "All meals included", "Spa and wellness center", "Heated indoor pool", "Ski equipment storage"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Zurich Airport with connecting train to resort",
          amenities: ["Premium economy seating", "Swiss Travel Pass included", "Mountain railway tickets", "Airport and resort transfers"],
          local: "Cable car passes and local shuttle service to ski slopes and attractions"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Guided mountain hiking with professional alpine guide", "Jungfraujoch - Top of Europe excursion", "Lake Geneva boat cruise", "Traditional Swiss cheese and chocolate factory tours", "Paragliding experience (weather permitting)"],
          amenities: ["Certified mountain guide", "All safety equipment provided", "Alpine photography sessions", "Swiss traditional lunch", "Emergency mountain rescue insurance"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel and adventure insurance for 6 days", "Swiss knife souvenir", "$120 shopping voucher for Swiss products", "Traditional Swiss fondue dinner", "24/7 mountain rescue support"]
        }
      }
    },
    {
      id: 4,
      title: "Tropical Escape",
      location: "Maldives",
      country: "MALDIVES",
      duration: "8 Days",
      people: "2 People",
      price: "$3,299",
      priceValue: 3299,
      rating: 4.9,
      reviews: 421,
      image: "/tropical-beach-palm-trees-resort.jpg",
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"],
      category: "International",
      popular: true,
      heroType: "beach",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "7 nights stay at Maldives Paradise Resort (Overwater Villa)",
          amenities: ["Free Wi-Fi", "Private deck with ocean access", "All meals and beverages", "Butler service", "Spa treatments", "Water sports equipment"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights with seaplane transfer to resort",
          amenities: ["Business class upgrade available", "Champagne service", "Priority check-in", "Scenic seaplane flight"],
          local: "Resort boat transfers and island hopping excursions included"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Snorkeling and diving expeditions", "Dolphin watching cruise", "Sunset fishing trip", "Island hopping to local villages", "Couples spa treatments and beach dining"],
          amenities: ["PADI certified dive instructors", "All water sports equipment", "Underwater photography", "Traditional Maldivian cultural show", "Private beach access"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive travel insurance for 8 days", "Underwater camera rental", "$200 spa credit", "Romantic beachside dinner setup", "24/7 resort concierge service"]
        }
      }
    },
    {
      id: 5,
      title: "Greek Islands Tour",
      location: "Greece",
      country: "GREECE",
      duration: "10 Days",
      people: "4-8 People",
      price: "$2,199",
      priceValue: 2199,
      rating: 4.7,
      reviews: 298,
      image: "/white-greek-buildings-blue-doors.jpg",
      features: ["Island Hopping", "Hotels", "Ferry Tickets", "Local Guide"],
      category: "International",
      popular: false,
      heroType: "beach",
      details: {
        accommodation: {
          title: "Hotel Accommodation",
          nights: "9 nights across multiple islands (Mykonos, Santorini, Naxos - 3 nights each)",
          amenities: ["Free Wi-Fi", "Sea view rooms", "Daily breakfast", "Swimming pools", "Traditional Greek architecture", "Balconies with island views"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Athens with domestic connections",
          amenities: ["Economy class seating", "Inter-island ferry tickets", "Port transfers included", "Luggage handling"],
          local: "High-speed ferries between islands and local transportation on each island"
        },
        activities: {
          title: "Tour Activities",
          tours: ["Mykonos windmills and Little Venice tour", "Santorini caldera cruise and Oia sunset", "Naxos ancient temple visits", "Traditional Greek cooking class", "Beach hopping and swimming excursions"],
          amenities: ["Expert local guides on each island", "All entrance fees included", "Traditional Greek music and dance show", "Wine tasting sessions", "Photography opportunities at iconic spots"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Travel insurance for 10 days", "Greek island guidebook and maps", "$150 souvenir shopping credit", "Traditional Greek feast dinner", "Emergency support across all islands"]
        }
      }
    },
    {
      id: 6,
      title: "Mediterranean Cruise",
      location: "Multiple",
      country: "MULTIPLE",
      duration: "12 Days",
      people: "2-4 People",
      price: "$3,899",
      priceValue: 3899,
      rating: 4.8,
      reviews: 512,
      image: "/santorini-greece-infinity-pool-ocean.jpg",
      features: ["Luxury Cruise", "All Inclusive", "Shore Excursions", "Entertainment"],
      category: "International",
      popular: true,
      heroType: "beach",
      details: {
        accommodation: {
          title: "Cruise Accommodation",
          nights: "11 nights aboard luxury cruise ship (Balcony Stateroom)",
          amenities: ["Private balcony with ocean views", "24-hour room service", "All meals and beverages included", "Nightly turndown service", "Concierge services", "Premium bedding and amenities"]
        },
        transportation: {
          title: "Transportation",
          flights: "Round-trip flights to Barcelona with cruise port transfers",
          amenities: ["Premium economy flights", "Priority boarding", "Airport lounge access", "Cruise terminal transfers"],
          local: "Luxury cruise ship with stops in Barcelona, Monaco, Rome, Santorini, Mykonos, and Naples"
        },
        activities: {
          title: "Shore Excursions & Activities",
          tours: ["Guided tours in each port city", "Vatican Museums and Sistine Chapel (Rome)", "Monte Carlo casino and palace visit", "Santorini wine tasting and sunset viewing", "Pompeii archaeological site exploration"],
          amenities: ["Professional shore excursion guides", "All entrance fees included", "Onboard entertainment and shows", "Multiple dining venues", "Spa and fitness facilities"]
        },
        inclusions: {
          title: "Other Inclusions",
          items: ["Comprehensive cruise and travel insurance for 12 days", "Onboard WiFi package", "$300 onboard credit for spa and shopping", "Captain's gala dinner", "24/7 guest services and medical facilities"]
        }
      }
    },
  ]

  // Filtering logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory
    
    const matchesPrice = priceRange === "All" ||
      (priceRange === "Under $1,500" && pkg.priceValue < 1500) ||
      (priceRange === "$1,500 - $2,500" && pkg.priceValue >= 1500 && pkg.priceValue <= 2500) ||
      (priceRange === "$2,500 - $3,500" && pkg.priceValue > 2500 && pkg.priceValue <= 3500) ||
      (priceRange === "Above $3,500" && pkg.priceValue > 3500)

    // Hero filter logic
    const matchesHeroFilter = heroFilter === "All" || 
      (heroFilter === "Popular" && pkg.popular) ||
      (heroFilter === "Beach" && pkg.heroType === "beach") ||
      (heroFilter === "Mountain" && pkg.heroType === "mountain") ||
      (heroFilter === "City" && pkg.heroType === "city")

    return matchesSearch && matchesCategory && matchesPrice && matchesHeroFilter
  })

  const featuredPackage = filteredPackages.find((pkg) => pkg.featured)
  const regularPackages = filteredPackages.filter((pkg) => !pkg.featured)

  // Carousel data with different packages
  const carouselData = [
    // Featured package as first slide
    ...(featuredPackage ? [featuredPackage] : []),
    // Additional diverse packages
    {
      id: 'carousel-2',
      title: "Venice Romance",
      location: "Italy",
      duration: "5 Days",
      people: "2 People",
      price: "$1,899",
      rating: 4.8,
      reviews: 256,
      image: "/venice-italy-canal-buildings.jpg",
      features: ["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"]
    },
    {
      id: 'carousel-3',
      title: "Alpine Adventure",
      location: "Switzerland",
      duration: "6 Days",
      people: "2-6 People",
      price: "$2,799",
      rating: 5.0,
      reviews: 189,
      image: "/mountain-lake-sunset-alps.jpg",
      features: ["Mountain Lodge", "All Meals", "Ski Pass", "Equipment"]
    },
    {
      id: 'carousel-4',
      title: "Tropical Escape",
      location: "Maldives",
      duration: "8 Days",
      people: "2 People",
      price: "$3,299",
      rating: 4.9,
      reviews: 421,
      image: "/tropical-beach-paradise-sunset.jpg",
      features: ["Beach Villa", "All Inclusive", "Water Sports", "Spa Access"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <style jsx>{customStyles}</style>
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

          <div className="flex justify-center">
            <button 
              onClick={() => {
                const packagesSection = document.getElementById('packages')
                if (packagesSection) {
                  packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-semibold hover:scale-105 shadow-lg"
            >
              Explore All Packages
            </button>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
          {carouselData.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-[1500ms] ${
                index === currentSlide 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
            >
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0 will-change-transform">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-all duration-[1500ms] will-change-transform ${
                    index === currentSlide ? 'scale-100' : 'scale-110'
                  }`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 transition-all duration-[1500ms] ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`} 
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                }} />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center z-20">
                <div className="container mx-auto px-8 lg:px-16">
                  <div className="max-w-3xl text-white">
                    {/* Badges */}
                    <div className={`mb-6 flex gap-3 will-change-transform transition-all duration-700 ${
                      index === currentSlide 
                        ? 'translate-y-0 opacity-100 blur-0' 
                        : 'translate-y-8 opacity-0 blur-sm'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: index === currentSlide ? '200ms' : '0ms'
                    }}>
                      {slide.featured ? (
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300">
                          <Sparkles size={14} />
                          Featured Package
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300">
                          Premium Experience
                        </div>
                      )}
                      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-2 text-gray-900 shadow-lg border border-white/20 hover:scale-105 hover:bg-white transition-all duration-300">
                        <Star className="fill-yellow-400 text-yellow-400" size={16} />
                        <span className="font-bold text-sm">{slide.rating}</span>
                        <span className="text-xs text-gray-600">({slide.reviews})</span>
                      </div>
                    </div>
                    
                    <h2 className={`text-4xl lg:text-6xl font-bold mb-6 leading-tight will-change-transform transition-all duration-1000 ${
                      index === currentSlide 
                        ? 'translate-y-0 opacity-100 scale-100 blur-0' 
                        : 'translate-y-16 opacity-0 scale-95 blur-sm'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: index === currentSlide ? '400ms' : '0ms'
                    }}>
                      {slide.title}
                    </h2>
                    
                    <p className={`text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed will-change-transform transition-all duration-900 ${
                      index === currentSlide 
                        ? 'translate-y-0 opacity-100 blur-0' 
                        : 'translate-y-12 opacity-0 blur-sm'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: index === currentSlide ? '600ms' : '0ms'
                    }}>
                      {slide.features.join(' • ')}
                    </p>

                    {/* Package Details */}
                    <div className={`flex flex-wrap gap-8 mb-10 will-change-transform transition-all duration-800 ${
                      index === currentSlide 
                        ? 'translate-y-0 opacity-100 blur-0' 
                        : 'translate-y-10 opacity-0 blur-sm'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: index === currentSlide ? '800ms' : '0ms'
                    }}>
                      <div className={`flex items-center gap-3 will-change-transform transition-all duration-600 ${
                        index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: index === currentSlide ? '1000ms' : '0ms'
                      }}>
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 shadow-lg">
                          <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-white/70 font-medium">Location</div>
                          <div className="font-bold text-lg">{slide.location}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 will-change-transform transition-all duration-600 ${
                        index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: index === currentSlide ? '1100ms' : '0ms'
                      }}>
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 shadow-lg">
                          <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-white/70 font-medium">Duration</div>
                          <div className="font-bold text-lg">{slide.duration}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 will-change-transform transition-all duration-600 ${
                        index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: index === currentSlide ? '1200ms' : '0ms'
                      }}>
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 shadow-lg">
                          <Users size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-white/70 font-medium">Group Size</div>
                          <div className="font-bold text-lg">{slide.people}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-8 will-change-transform transition-all duration-800 ${
                      index === currentSlide 
                        ? 'translate-y-0 opacity-100 blur-0' 
                        : 'translate-y-10 opacity-0 blur-sm'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: index === currentSlide ? '1400ms' : '0ms'
                    }}>
                      <div className={`will-change-transform transition-all duration-700 ${
                        index === currentSlide 
                          ? 'translate-x-0 opacity-100 scale-100' 
                          : 'translate-x-12 opacity-0 scale-95'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: index === currentSlide ? '1600ms' : '0ms'
                      }}>
                        <div className="text-sm text-white/70 mb-2 font-medium uppercase tracking-wide">Starting from</div>
                        <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-br from-white to-white/90 bg-clip-text text-transparent">{slide.price}</div>
                        <div className="text-sm text-white/70 font-medium">per person</div>
                      </div>
                      <div className={`will-change-transform transition-all duration-700 ${
                        index === currentSlide 
                          ? 'translate-x-0 opacity-100 scale-100' 
                          : 'translate-x-12 opacity-0 scale-95'
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: index === currentSlide ? '1800ms' : '0ms'
                      }}>
                        <Link href={`/packages/${typeof slide.id === 'string' && slide.id.startsWith('carousel-') ? '1' : slide.id}`}>
                          <button className="bg-gradient-to-r from-white to-gray-50 text-gray-900 px-10 py-4 rounded-full font-bold hover:from-gray-50 hover:to-white transition-all inline-flex items-center gap-3 hover:scale-105 group shadow-2xl border border-white/20 backdrop-blur-sm">
                            <span>View Details</span>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative rounded-full transition-all duration-700 hover:scale-125 ${
                  index === currentSlide 
                    ? 'w-12 h-3 bg-white shadow-2xl' 
                    : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white to-white/80 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

        </div>
      </section>



      <section
        id="packages"
        data-animate
        className={`container mx-auto px-4 lg:px-8 py-16 pb-24 transition-all duration-700 ${
          isVisible.packages ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Sidebar */}
          <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              
              {/* Search Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, search: !prev.search }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Search</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.search ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.search && (
                  <div className="px-6 pb-6">
                    <div className="relative">
                      <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Availability Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, availability: !prev.availability }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Availability</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.availability ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.availability && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <ChevronDown size={16} className="rotate-90 text-gray-600" />
                        </button>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900">February 2025</div>
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <ChevronDown size={16} className="-rotate-90 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                          <div key={day} className="p-2 font-semibold text-gray-500">{day}</div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {Array.from({length: 28}, (_, i) => {
                          const date = i + 1;
                          const isSelected = selectedDates.includes(date);
                          const isInRange = date >= 10 && date <= 15;
                          
                          return (
                            <button
                              key={date}
                              onClick={() => {
                                if (selectedDates.includes(date)) {
                                  setSelectedDates(selectedDates.filter(d => d !== date));
                                } else {
                                  setSelectedDates([...selectedDates, date]);
                                }
                              }}
                              className={`p-2 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : isInRange
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {date}
                            </button>
                          )
                        })}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => setSelectedDates([])}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Clear
                        </button>
                        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Filter size={18} className="text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Category</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.category && (
                  <div className="px-6 pb-6">
                    {/* Quick Filter Buttons */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Quick Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Popular", "Beach", "Mountain", "City"].map((filter) => (
                          <button 
                            key={filter}
                            onClick={() => setHeroFilter(filter)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                              heroFilter === filter 
                                ? 'bg-blue-500 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Traditional Category Filter */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Package Type</h4>
                      {['All', 'International', 'Domestic'].map((category) => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="radio"
                              name="category"
                              value={category}
                              checked={selectedCategory === category}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                              selectedCategory === category
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 group-hover:border-blue-300'
                            }`}>
                              {selectedCategory === category && (
                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            selectedCategory === category ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                          }`}>
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div>
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, priceRange: !prev.priceRange }))}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-lg">$</span>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Price Range</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedFilters.priceRange ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {expandedFilters.priceRange && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      {[
                        'All',
                        'Under $1,500',
                        '$1,500 - $2,500',
                        '$2,500 - $3,500', 
                        'Above $3,500'
                      ].map((range) => (
                        <label key={range} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="radio"
                              name="priceRange"
                              value={range}
                              checked={priceRange === range}
                              onChange={(e) => setPriceRange(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                              priceRange === range
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 group-hover:border-blue-300'
                            }`}>
                              {priceRange === range && (
                                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            priceRange === range ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                          }`}>
                            {range}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              <div className="p-6 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setPriceRange("All")
                    setSelectedDates([])
                    setHeroFilter("All")
                  }}
                  className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between transition-all duration-500">
              <div>
                <h2 className="text-3xl font-bold transition-all duration-300">
                  {heroFilter === "All" ? "All Packages" : `${heroFilter} Packages`}
                </h2>
                {(heroFilter !== "All" || selectedCategory !== "All" || priceRange !== "All" || searchQuery) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {heroFilter !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {heroFilter}
                        <button 
                          onClick={() => setHeroFilter("All")}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCategory !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedCategory}
                        <button 
                          onClick={() => setSelectedCategory("All")}
                          className="ml-1.5 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {priceRange !== "All" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {priceRange}
                        <button 
                          onClick={() => setPriceRange("All")}
                          className="ml-1.5 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        "{searchQuery}"
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="ml-1.5 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-gray-600 transition-all duration-300 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
                {filteredPackages.length} packages found
              </div>
            </div>
            
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 transition-all duration-700 ease-out">
              {regularPackages.map((pkg, index) => (
            <Link key={pkg.id} href={`/packages/${pkg.id}`}>
              <div 
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col transform hover:scale-[1.02] hover:-translate-y-2"
                style={{
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Image */}
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image || "/placeholder.svg"}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/70 group-hover:via-black/30" />

                  {/* Price Badge - Top Left */}
                  <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 shadow-lg">
                    {pkg.price}
                  </div>

                  {/* Popular Badge - Top Right */}
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:bg-orange-600 shadow-lg">
                      Popular
                    </div>
                  )}

                  {/* Content Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-500 group-hover:p-6">
                    <h3 className="text-xl font-bold mb-2 leading-tight transition-all duration-300 group-hover:text-2xl">
                      {pkg.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-white/90 mb-3 line-clamp-2 transition-all duration-300 group-hover:text-base group-hover:text-white">
                      {pkg.features.join(', ')}
                    </p>
                    
                    {/* Location and Duration Tags */}
                    <div className="flex gap-2 mb-3 transition-all duration-300">
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                        <MapPin size={12} className="transition-all duration-300 group-hover:scale-110" />
                        <span className="text-xs font-medium">{pkg.country}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
                        <Calendar size={12} className="transition-all duration-300 group-hover:scale-110" />
                        <span className="text-xs font-medium">{pkg.duration}</span>
                      </div>
                    </div>

                    {/* Rating and Additional Info */}
                    <div className="flex items-center justify-between transition-all duration-300">
                      <div className="flex items-center gap-2 transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center gap-1">
                          <Star className="fill-yellow-400 text-yellow-400 transition-all duration-300 group-hover:scale-110" size={14} />
                          <span className="font-bold text-sm transition-all duration-300 group-hover:text-base">{pkg.rating}</span>
                          <span className="text-xs text-white/80 transition-all duration-300 group-hover:text-sm group-hover:text-white/90">({pkg.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs transition-all duration-300 group-hover:text-sm group-hover:scale-105">
                        <Users size={12} className="transition-all duration-300 group-hover:scale-110" />
                        <span>{pkg.people}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
              ))}
            </div>
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
