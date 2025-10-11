# Sample Data for New Schema

## Overview
This file contains sample data that matches the **NEW** database schema and admin form structure.

---

## 📦 Sample Package Data (JavaScript Object for Admin Form)

### Complete Package Example - "Santorini Romantic Getaway"

```javascript
const samplePackageData = {
  // ==========================================
  // STEP 1: BASIC INFORMATION
  // ==========================================
  
  // Package Images (uploaded files)
  images: [
    "https://example.com/storage/media/package_images/santorini-1.jpg",
    "https://example.com/storage/media/package_images/santorini-2.jpg",
    "https://example.com/storage/media/package_images/santorini-3.jpg"
  ],
  
  // Package Title
  title: "Santorini Romantic Getaway",
  
  // Category & Hero Type
  category: "International",
  hero_type: "beach",
  
  // Package Flags
  popular: true,
  featured: false,
  
  // Package Description
  description: "Experience the magic of Santorini with its iconic blue-domed churches, stunning sunsets, and crystal-clear waters. This 5-day romantic getaway includes luxury accommodation, island tours, and unforgettable dining experiences overlooking the Aegean Sea.",
  
  // Availability Status
  availability: "Available",
  
  // Location Information
  location: "Santorini",
  country: "Greece",
  
  // ==========================================
  // DEAL PERIODS (Multiple date ranges with individual pricing)
  // ==========================================
  deals: [
    {
      deal_start_date: "2025-01-15",
      deal_end_date: "2025-01-25",
      slots_available: 20,
      deal_price: 45000.00  // PHP 45,000 - Off-season price
    },
    {
      deal_start_date: "2025-02-01",
      deal_end_date: "2025-02-14",
      slots_available: 15,
      deal_price: 65000.00  // PHP 65,000 - Valentine's season (higher price)
    },
    {
      deal_start_date: "2025-03-01",
      deal_end_date: "2025-03-31",
      slots_available: 25,
      deal_price: 55000.00  // PHP 55,000 - Spring season
    }
  ],
  
  // ==========================================
  // STEP 2: TRANSPORTATION & INCLUSIONS
  // ==========================================
  
  // Transportation Section (NO description field in new schema)
  transportation: {
    title: "Transportation",
    local: "Airport transfers and island hopping boat tours included",
    amenities: [
      "Round-trip airport transfers",
      "Private boat tour to Red Beach",
      "Sunset cruise with dinner",
      "Daily hotel shuttle service"
    ]
  },
  
  // Inclusions Section (consolidated from old "accommodation")
  accommodation: {
    title: "Inclusions",
    amenities: [
      "5-night stay at 5-star luxury hotel",
      "Daily breakfast buffet",
      "Welcome drinks and fruit basket",
      "Couples spa treatment (60 minutes)",
      "Sunset dinner at Oia",
      "Professional photography session",
      "Wine tasting at local vineyard",
      "Travel insurance"
    ]
  },
  
  // ==========================================
  // STEP 3: EXCLUSIONS & ITINERARY
  // ==========================================
  
  // Exclusions Section (consolidated from old "activities")
  activities: {
    title: "Exclusions",
    tours: [
      "International airfare",
      "Visa fees",
      "Personal expenses and shopping",
      "Additional meals and drinks not specified",
      "Travel insurance upgrades",
      "Tips and gratuities",
      "Optional activities and excursions"
    ]
  },
  
  // Daily Itinerary
  itinerary: [
    {
      day: 1,
      title: "Arrival & Check-in",
      description: "Arrive at Santorini International Airport. Our team will welcome you with a private transfer to your luxury hotel in Fira. Check-in and enjoy welcome drinks while taking in the breathtaking caldera views. Rest of the day at leisure to explore the nearby area or relax by the infinity pool."
    },
    {
      day: 2,
      title: "Fira & Oia Exploration",
      description: "After breakfast, explore the charming capital of Fira with its narrow streets, white-washed buildings, and stunning sea views. Visit the Archaeological Museum and browse local shops. In the afternoon, transfer to Oia village, famous for its blue-domed churches and spectacular sunset views. Enjoy a romantic dinner at a cliffside restaurant."
    },
    {
      day: 3,
      title: "Beach Day & Wine Tasting",
      description: "Morning boat tour to the famous Red Beach and White Beach. Swim in crystal-clear waters and relax on unique volcanic sand. Afternoon visit to a traditional winery for wine tasting, learning about Santorini's unique viticulture. Return to hotel for couples spa treatment."
    },
    {
      day: 4,
      title: "Sunset Cruise",
      description: "Free morning to explore at your own pace or relax at the hotel. In the afternoon, embark on a luxurious sunset catamaran cruise. Sail past the volcano, hot springs, and secluded beaches. Enjoy a BBQ dinner on board while watching the famous Santorini sunset over the Aegean Sea."
    },
    {
      day: 5,
      title: "Photography & Leisure",
      description: "Professional photography session at iconic Santorini locations including blue domes, windmills, and caldera views. Capture your memories with stunning backdrops. Afternoon free for last-minute shopping or beach time. Farewell dinner at hotel restaurant."
    },
    {
      day: 6,
      title: "Departure",
      description: "Enjoy your final breakfast with a view. Check-out from hotel and private transfer to Santorini International Airport for your departure flight. Take home unforgettable memories of your romantic getaway."
    }
  ]
}
```

---

## 🗄️ Sample Database Records (SQL INSERT Format)

### 1. Packages Table Insert

```sql
INSERT INTO packages (
  id,
  title,
  category,
  hero_type,
  popular,
  featured,
  description,
  availability,
  location,
  country,
  images,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Santorini Romantic Getaway',
  'International',
  'beach',
  true,
  false,
  'Experience the magic of Santorini with its iconic blue-domed churches, stunning sunsets, and crystal-clear waters. This 5-day romantic getaway includes luxury accommodation, island tours, and unforgettable dining experiences overlooking the Aegean Sea.',
  'Available',
  'Santorini',
  'Greece',
  '["https://example.com/storage/media/package_images/santorini-1.jpg", "https://example.com/storage/media/package_images/santorini-2.jpg", "https://example.com/storage/media/package_images/santorini-3.jpg"]'::jsonb,
  NOW(),
  NOW()
);
```

### 2. Package Deals Table Inserts (Multiple Deals with Individual Pricing)

```sql
-- Deal 1: Off-season (January)
INSERT INTO package_deals (
  id,
  package_id,
  deal_start_date,
  deal_end_date,
  slots_available,
  slots_booked,
  deal_price,
  is_active,
  created_at,
  updated_at
) VALUES (
  'deal-1111-2222-3333-444444444444',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-01-15',
  '2025-01-25',
  20,
  0,
  45000.00,  -- PHP 45,000
  true,
  NOW(),
  NOW()
);

-- Deal 2: Valentine's season (February)
INSERT INTO package_deals (
  id,
  package_id,
  deal_start_date,
  deal_end_date,
  slots_available,
  slots_booked,
  deal_price,
  is_active,
  created_at,
  updated_at
) VALUES (
  'deal-5555-6666-7777-888888888888',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-02-01',
  '2025-02-14',
  15,
  0,
  65000.00,  -- PHP 65,000 (higher price for Valentine's)
  true,
  NOW(),
  NOW()
);

-- Deal 3: Spring season (March)
INSERT INTO package_deals (
  id,
  package_id,
  deal_start_date,
  deal_end_date,
  slots_available,
  slots_booked,
  deal_price,
  is_active,
  created_at,
  updated_at
) VALUES (
  'deal-9999-aaaa-bbbb-cccccccccccc',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-03-01',
  '2025-03-31',
  25,
  0,
  55000.00,  -- PHP 55,000
  true,
  NOW(),
  NOW()
);
```

### 3. Package Details Table Inserts (Simplified Sections)

```sql
-- Transportation Section
INSERT INTO package_details (
  id,
  package_id,
  section_type,
  title,
  local,
  amenities,
  created_at
) VALUES (
  'detail-1111-aaaa-bbbb-cccccccccccc',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'transportation',
  'Transportation',
  'Airport transfers and island hopping boat tours included',
  '["Round-trip airport transfers", "Private boat tour to Red Beach", "Sunset cruise with dinner", "Daily hotel shuttle service"]'::jsonb,
  NOW()
);

-- Inclusions Section
INSERT INTO package_details (
  id,
  package_id,
  section_type,
  title,
  items,
  created_at
) VALUES (
  'detail-2222-dddd-eeee-ffffffffffff',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'inclusions',
  'Inclusions',
  '["5-night stay at 5-star luxury hotel", "Daily breakfast buffet", "Welcome drinks and fruit basket", "Couples spa treatment (60 minutes)", "Sunset dinner at Oia", "Professional photography session", "Wine tasting at local vineyard", "Travel insurance"]'::jsonb,
  NOW()
);

-- Exclusions Section
INSERT INTO package_details (
  id,
  package_id,
  section_type,
  title,
  items,
  created_at
) VALUES (
  'detail-3333-gggg-hhhh-iiiiiiiiiiii',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'exclusions',
  'Exclusions',
  '["International airfare", "Visa fees", "Personal expenses and shopping", "Additional meals and drinks not specified", "Travel insurance upgrades", "Tips and gratuities", "Optional activities and excursions"]'::jsonb,
  NOW()
);
```

### 4. Package Itinerary Table Inserts

```sql
-- Day 1
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-1111-aaaa-bbbb-cccccccccccc',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  1,
  'Arrival & Check-in',
  'Arrive at Santorini International Airport. Our team will welcome you with a private transfer to your luxury hotel in Fira. Check-in and enjoy welcome drinks while taking in the breathtaking caldera views. Rest of the day at leisure to explore the nearby area or relax by the infinity pool.',
  NOW()
);

-- Day 2
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-2222-dddd-eeee-ffffffffffff',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  2,
  'Fira & Oia Exploration',
  'After breakfast, explore the charming capital of Fira with its narrow streets, white-washed buildings, and stunning sea views. Visit the Archaeological Museum and browse local shops. In the afternoon, transfer to Oia village, famous for its blue-domed churches and spectacular sunset views. Enjoy a romantic dinner at a cliffside restaurant.',
  NOW()
);

-- Day 3
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-3333-gggg-hhhh-iiiiiiiiiiii',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  3,
  'Beach Day & Wine Tasting',
  'Morning boat tour to the famous Red Beach and White Beach. Swim in crystal-clear waters and relax on unique volcanic sand. Afternoon visit to a traditional winery for wine tasting, learning about Santorini''s unique viticulture. Return to hotel for couples spa treatment.',
  NOW()
);

-- Day 4
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-4444-jjjj-kkkk-llllllllllll',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  4,
  'Sunset Cruise',
  'Free morning to explore at your own pace or relax at the hotel. In the afternoon, embark on a luxurious sunset catamaran cruise. Sail past the volcano, hot springs, and secluded beaches. Enjoy a BBQ dinner on board while watching the famous Santorini sunset over the Aegean Sea.',
  NOW()
);

-- Day 5
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-5555-mmmm-nnnn-oooooooooooo',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  5,
  'Photography & Leisure',
  'Professional photography session at iconic Santorini locations including blue domes, windmills, and caldera views. Capture your memories with stunning backdrops. Afternoon free for last-minute shopping or beach time. Farewell dinner at hotel restaurant.',
  NOW()
);

-- Day 6
INSERT INTO package_itinerary (
  id,
  package_id,
  day_number,
  title,
  description,
  created_at
) VALUES (
  'itinerary-6666-pppp-qqqq-rrrrrrrrrrrr',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  6,
  'Departure',
  'Enjoy your final breakfast with a view. Check-out from hotel and private transfer to Santorini International Airport for your departure flight. Take home unforgettable memories of your romantic getaway.',
  NOW()
);
```

---

## 🌴 Additional Sample Package - "Boracay Beach Paradise"

### Quick Reference (Domestic Package)

```javascript
const boracayPackage = {
  // Basic Info
  title: "Boracay Beach Paradise",
  category: "Domestic",
  hero_type: "beach",
  popular: true,
  featured: true,
  description: "Experience the white sand beaches and crystal-clear waters of Boracay. Includes island hopping, water sports, and beachfront accommodation.",
  availability: "Limited",
  location: "Boracay",
  country: "Philippines",
  
  // Multiple Deals with Different Prices
  deals: [
    {
      deal_start_date: "2025-01-10",
      deal_end_date: "2025-01-20",
      slots_available: 10,
      deal_price: 18000.00  // PHP 18,000 - Weekday rate
    },
    {
      deal_start_date: "2025-02-14",
      deal_end_date: "2025-02-18",
      slots_available: 5,
      deal_price: 25000.00  // PHP 25,000 - Valentine's weekend premium
    }
  ],
  
  // Transportation
  transportation: {
    title: "Transportation",
    local: "Caticlan airport to Boracay ferry and island transfers",
    amenities: [
      "Round-trip ferry tickets",
      "Island tricycle transfers",
      "Island hopping boat rental"
    ]
  },
  
  // Inclusions
  accommodation: {
    title: "Inclusions",
    amenities: [
      "3-night beachfront resort stay",
      "Daily breakfast",
      "Welcome drinks",
      "Island hopping tour",
      "Sunset sailing",
      "Snorkeling equipment"
    ]
  },
  
  // Exclusions
  activities: {
    title: "Exclusions",
    tours: [
      "Domestic flights",
      "Lunch and dinner",
      "Water sports activities",
      "Personal expenses",
      "Environmental fees"
    ]
  }
}
```

---

## 📊 Key Differences from OLD Schema

### ❌ Fields REMOVED:
```javascript
// These fields NO LONGER EXIST in new schema
{
  people: 4,                    // ❌ Removed (capacity is per-deal now)
  price: "$2,499",              // ❌ Removed (pricing is per-deal now)
  price_value: 2499,            // ❌ Removed (use deal_price instead)
  rating: 4.8,                  // ❌ Removed (calculated from reviews)
  reviews_count: 124,           // ❌ Removed (calculated from reviews)
  highlights: "Beach • Luxury",  // ❌ Removed (not in form)
  features: ["5-Star", "Guide"] // ❌ Removed (not in form)
}
```

### ✅ Fields ADDED:
```javascript
// These fields ARE NEW in the schema
{
  deals: [
    {
      // ... existing fields ...
      deal_price: 45000.00  // ✅ NEW: Individual price per deal period
    }
  ]
}
```

### 🔄 Fields SIMPLIFIED:
```javascript
// Package details sections simplified
// OLD: 'accommodation', 'transportation', 'activities', 'inclusions'
// NEW: 'transportation', 'inclusions', 'exclusions'

// OLD had description field in each section
// NEW: No description field (cleaner structure)
```

---

## 🧪 Testing the Sample Data

### To test in your admin form:
1. Copy the `samplePackageData` JavaScript object
2. Use it to populate your form fields
3. Submit through the admin interface
4. Verify it saves correctly to database

### To test database directly:
1. Run the SQL INSERT statements in Supabase SQL Editor
2. Query to verify:
```sql
SELECT * FROM packages WHERE title = 'Santorini Romantic Getaway';
SELECT * FROM package_deals WHERE package_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT * FROM package_details WHERE package_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT * FROM package_itinerary WHERE package_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

---

**Sample Data Version:** 1.0  
**Schema Version:** Updated (October 3, 2025)  
**Status:** ✅ Matches New Schema

---

## 🎌 Additional Sample Packages in JSON Format

### Sample 1: "Tokyo Cultural Experience"

```json
{
  "title": "Tokyo Cultural Experience",
  "category": "International",
  "hero_type": "city",
  "popular": false,
  "featured": true,
  "description": "Immerse yourself in Japanese culture with this 7-day Tokyo adventure. Visit ancient temples, experience traditional tea ceremonies, explore bustling neighborhoods, and savor authentic Japanese cuisine. Perfect blend of tradition and modernity.",
  "availability": "Available",
  "location": "Tokyo",
  "country": "Japan",
  "images": [
    "https://example.com/storage/media/package_images/tokyo-1.jpg",
    "https://example.com/storage/media/package_images/tokyo-2.jpg",
    "https://example.com/storage/media/package_images/tokyo-3.jpg",
    "https://example.com/storage/media/package_images/tokyo-4.jpg"
  ],
  "deals": [
    {
      "deal_start_date": "2025-03-15",
      "deal_end_date": "2025-03-31",
      "slots_available": 12,
      "deal_price": 75000.00
    },
    {
      "deal_start_date": "2025-04-01",
      "deal_end_date": "2025-04-15",
      "slots_available": 8,
      "deal_price": 95000.00
    },
    {
      "deal_start_date": "2025-05-01",
      "deal_end_date": "2025-05-20",
      "slots_available": 15,
      "deal_price": 85000.00
    }
  ],
  "transportation": {
    "title": "Transportation",
    "local": "JR Pass for unlimited train travel and airport transfers",
    "amenities": [
      "Round-trip airport transfers",
      "7-day JR Pass (unlimited train travel)",
      "Tokyo Metro 72-hour pass",
      "Private bus for day tours"
    ]
  },
  "accommodation": {
    "title": "Inclusions",
    "amenities": [
      "6-night stay at 4-star hotel in Shinjuku",
      "Daily Japanese breakfast",
      "Welcome sake tasting",
      "Traditional tea ceremony experience",
      "Sumo wrestling tournament tickets",
      "Guided tour of Senso-ji Temple",
      "Visit to Tsukiji Outer Market",
      "Mt. Fuji day trip",
      "Kimono rental experience",
      "English-speaking tour guide"
    ]
  },
  "activities": {
    "title": "Exclusions",
    "tours": [
      "International airfare",
      "Japan visa fees",
      "Lunch and dinner meals",
      "Personal shopping and souvenirs",
      "Optional activities",
      "Travel insurance",
      "Tips and gratuities"
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Tokyo",
      "description": "Arrive at Narita or Haneda Airport. Meet your guide and transfer to your hotel in Shinjuku. Check-in and receive your JR Pass. Evening orientation meeting with welcome sake tasting. Rest of the evening free to explore nearby Shinjuku area."
    },
    {
      "day": 2,
      "title": "Traditional Tokyo",
      "description": "Start with guided tour of Senso-ji Temple in Asakusa, Tokyo's oldest temple. Walk through Nakamise shopping street. Afternoon visit to Meiji Shrine surrounded by forest. Experience traditional tea ceremony. Evening free to explore Harajuku and Takeshita Street."
    },
    {
      "day": 3,
      "title": "Modern Tokyo",
      "description": "Visit teamLab Borderless digital art museum. Explore the trendy Shibuya district and famous scramble crossing. Afternoon in Akihabara electric town. Evening visit to Tokyo Skytree for panoramic city views. Optional Robot Restaurant show."
    },
    {
      "day": 4,
      "title": "Mt. Fuji Day Trip",
      "description": "Full-day excursion to Mt. Fuji 5th Station (weather permitting). Visit Lake Kawaguchi with stunning Mt. Fuji views. Stop at Oshino Hakkai traditional village. Return to Tokyo in the evening."
    },
    {
      "day": 5,
      "title": "Culinary & Cultural Day",
      "description": "Early morning visit to Tsukiji Outer Market for fresh sushi breakfast. Join sushi-making class. Afternoon kimono rental and photoshoot in traditional gardens. Evening attend Sumo wrestling tournament with ringside seats."
    },
    {
      "day": 6,
      "title": "Imperial Palace & Shopping",
      "description": "Morning tour of Imperial Palace East Gardens. Visit Ginza district for high-end shopping. Afternoon in Odaiba waterfront with teamLab Planets. Evening farewell dinner at traditional izakaya restaurant."
    },
    {
      "day": 7,
      "title": "Departure",
      "description": "Final breakfast at hotel. Free time for last-minute shopping or exploring. Check-out and airport transfer for your departure flight. Sayonara Tokyo!"
    }
  ]
}
```

### Sample 2: "Palawan Island Adventure"

```json
{
  "title": "Palawan Island Adventure",
  "category": "Domestic",
  "hero_type": "adventure",
  "popular": true,
  "featured": true,
  "description": "Discover the pristine beauty of Palawan, consistently voted as one of the world's best islands. Explore underground rivers, swim in crystal lagoons, island hop through limestone cliffs, and relax on white sand beaches. An unforgettable Philippine paradise.",
  "availability": "Available",
  "location": "El Nido & Coron",
  "country": "Philippines",
  "images": [
    "https://example.com/storage/media/package_images/palawan-1.jpg",
    "https://example.com/storage/media/package_images/palawan-2.jpg",
    "https://example.com/storage/media/package_images/palawan-3.jpg",
    "https://example.com/storage/media/package_images/palawan-4.jpg",
    "https://example.com/storage/media/package_images/palawan-5.jpg"
  ],
  "deals": [
    {
      "deal_start_date": "2025-01-20",
      "deal_end_date": "2025-02-10",
      "slots_available": 20,
      "deal_price": 22000.00
    },
    {
      "deal_start_date": "2025-03-01",
      "deal_end_date": "2025-03-31",
      "slots_available": 25,
      "deal_price": 24000.00
    },
    {
      "deal_start_date": "2025-04-15",
      "deal_end_date": "2025-05-15",
      "slots_available": 18,
      "deal_price": 26000.00
    }
  ],
  "transportation": {
    "title": "Transportation",
    "local": "All island transfers, ferries, and boat tours included",
    "amenities": [
      "Puerto Princesa to El Nido van transfer",
      "El Nido to Coron ferry",
      "Coron airport transfer",
      "Island hopping boat tours (3 days)",
      "Tricycle transfers to activities"
    ]
  },
  "accommodation": {
    "title": "Inclusions",
    "amenities": [
      "2 nights in Puerto Princesa hotel",
      "2 nights in El Nido beachfront resort",
      "2 nights in Coron island resort",
      "Daily breakfast",
      "Underground River tour with lunch",
      "El Nido Island Hopping Tour A & C",
      "Coron Island Hopping with lunch",
      "Kayangan Lake entrance",
      "Twin Lagoon entrance",
      "Snorkeling equipment",
      "Environmental fees",
      "Tour guide services"
    ]
  },
  "activities": {
    "title": "Exclusions",
    "tours": [
      "Domestic flights to/from Manila",
      "Dinner meals",
      "Alcoholic beverages",
      "Optional diving activities",
      "Personal expenses",
      "Travel insurance",
      "Tips for guides and crew"
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Puerto Princesa",
      "description": "Arrive at Puerto Princesa International Airport. Meet your guide and transfer to hotel. Check-in and attend orientation. Evening free to explore the city center or relax. Welcome dinner at local restaurant featuring Palawan cuisine."
    },
    {
      "day": 2,
      "title": "Underground River Tour",
      "description": "Early morning departure for Puerto Princesa Underground River, a UNESCO World Heritage Site. Paddle through the 8.2km underground river system with stunning rock formations. Lunch included. Return to city for city tour including Baker's Hill and Mitra's Ranch. Transfer to hotel."
    },
    {
      "day": 3,
      "title": "Transfer to El Nido",
      "description": "Morning scenic 5-hour van ride to El Nido through mountains and coastline. Check-in to beachfront resort. Afternoon free to explore El Nido town, visit local shops, or relax on the beach. Sunset cocktails on the beach."
    },
    {
      "day": 4,
      "title": "El Nido Island Hopping Tour A",
      "description": "Full-day island hopping covering Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu Island, and 7 Commando Beach. Kayaking through lagoons, snorkeling with tropical fish, and beach relaxation. Lunch served on beach. Return to resort in late afternoon."
    },
    {
      "day": 5,
      "title": "El Nido Island Hopping Tour C",
      "description": "Explore Hidden Beach, Matinloc Shrine, Secret Beach, Star Beach, and Helicopter Island. Snorkel at pristine coral reefs. Picnic lunch on remote beach. Afternoon swimming and photography. Return to resort for farewell El Nido sunset."
    },
    {
      "day": 6,
      "title": "Transfer to Coron",
      "description": "Morning ferry ride to Coron (approximately 4 hours). Enjoy scenic views of islands and seascapes. Arrival in Coron, check-in to island resort. Afternoon free to explore Coron town or relax. Optional Mt. Tapyas sunset hike."
    },
    {
      "day": 7,
      "title": "Coron Island Hopping",
      "description": "Ultimate Coron island tour visiting Kayangan Lake (voted cleanest lake in Asia), Twin Lagoon, Skeleton Wreck for snorkeling, Coral Garden, and CYC Beach. Lunch on beach. Swimming, snorkeling, and underwater photography. Return to resort."
    },
    {
      "day": 8,
      "title": "Departure",
      "description": "Final breakfast with island views. Free time for last-minute souvenir shopping or beach time. Check-out and transfer to Busuanga Airport for your departure flight. Paalam Palawan!"
    }
  ]
}
```

### Sample 3: "Iceland Northern Lights Expedition"

```json
{
  "title": "Iceland Northern Lights Expedition",
  "category": "International",
  "hero_type": "nature",
  "popular": true,
  "featured": false,
  "description": "Chase the magical Northern Lights across Iceland's stunning winter landscapes. Experience glacier hiking, geothermal hot springs, ice caves, and frozen waterfalls. This 6-day winter wonderland adventure combines natural wonders with aurora hunting for an unforgettable Arctic experience.",
  "availability": "Limited",
  "location": "Reykjavik & South Coast",
  "country": "Iceland",
  "images": [
    "https://example.com/storage/media/package_images/iceland-1.jpg",
    "https://example.com/storage/media/package_images/iceland-2.jpg",
    "https://example.com/storage/media/package_images/iceland-3.jpg"
  ],
  "deals": [
    {
      "deal_start_date": "2025-01-05",
      "deal_end_date": "2025-01-31",
      "slots_available": 10,
      "deal_price": 120000.00
    },
    {
      "deal_start_date": "2025-02-01",
      "deal_end_date": "2025-02-28",
      "slots_available": 12,
      "deal_price": 135000.00
    },
    {
      "deal_start_date": "2025-03-01",
      "deal_end_date": "2025-03-20",
      "slots_available": 8,
      "deal_price": 125000.00
    }
  ],
  "transportation": {
    "title": "Transportation",
    "local": "4WD vehicles for all tours and transfers",
    "amenities": [
      "Airport transfers",
      "4WD vehicle for all tours",
      "Professional driver-guide",
      "WiFi in vehicles",
      "Winter tires and safety equipment"
    ]
  },
  "accommodation": {
    "title": "Inclusions",
    "amenities": [
      "5 nights in boutique hotels",
      "Daily breakfast",
      "Golden Circle tour",
      "Glacier hiking with certified guide",
      "Ice cave exploration",
      "Blue Lagoon admission with drink",
      "3 Northern Lights hunts",
      "South Coast waterfalls tour",
      "Black sand beach visit",
      "Winter clothing rental (jacket, boots)",
      "Aurora forecast monitoring",
      "Photography tips from guide"
    ]
  },
  "activities": {
    "title": "Exclusions",
    "tours": [
      "International flights",
      "Iceland visa fees",
      "Lunch and dinner meals",
      "Optional activities (snowmobiling, whale watching)",
      "Personal expenses",
      "Travel and cancellation insurance",
      "Tips for guides"
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Blue Lagoon",
      "description": "Land at Keflavik International Airport. Pick up winter gear (jacket, boots). Transfer to Blue Lagoon geothermal spa. Relax in milky-blue waters surrounded by lava fields. Enjoy welcome drink. Continue to Reykjavik, check-in to hotel. Evening Northern Lights briefing."
    },
    {
      "day": 2,
      "title": "Golden Circle & First Aurora Hunt",
      "description": "Full-day Golden Circle tour: Thingvellir National Park (UNESCO site where continents meet), Geysir geothermal area with Strokkur geyser erupting every 5-10 minutes, and powerful Gullfoss waterfall. Lunch stop at countryside restaurant. Return to Reykjavik. Evening Northern Lights hunt (weather permitting)."
    },
    {
      "day": 3,
      "title": "South Coast Waterfalls & Black Beach",
      "description": "Drive along scenic south coast. Visit Seljalandsfoss waterfall (walk behind it!). Stop at Skogafoss, one of Iceland's largest waterfalls. Explore Reynisfjara black sand beach with basalt columns and sea stacks. Visit charming Vik village. Return to accommodation. Second aurora hunt if conditions are favorable."
    },
    {
      "day": 4,
      "title": "Glacier Hiking Adventure",
      "description": "Morning drive to Sólheimajökull glacier. Meet certified glacier guide. Receive safety briefing and crampons. 3-hour glacier hike exploring ice formations, crevasses, and learning about glaciology. Lunch break. Afternoon free in Vik or optional snowmobile tour on glacier. Evening relaxation."
    },
    {
      "day": 5,
      "title": "Ice Cave Exploration",
      "description": "Early departure for natural ice cave at Vatnajökull glacier. Drive to ice cap in super jeep. Enter magical blue ice cave with certified guide. Marvel at crystal formations and blue light. Photography session inside cave. Return journey. Stop at Diamond Beach to see icebergs on black sand. Final Northern Lights hunt."
    },
    {
      "day": 6,
      "title": "Reykjavik & Departure",
      "description": "Morning free to explore Reykjavik: Hallgrímskirkja church, Harpa concert hall, or souvenir shopping on Laugavegur street. Optional whale watching tour. Check-out and airport transfer. Depart Iceland with unforgettable Arctic memories."
    }
  ]
}
```

### Sample 4: "Baguio Weekend Getaway"

```json
{
  "title": "Baguio Weekend Getaway",
  "category": "Domestic",
  "hero_type": "nature",
  "popular": false,
  "featured": false,
  "description": "Escape to the cool climate of the Summer Capital of the Philippines. Enjoy fresh strawberries, scenic mountain views, colonial architecture, and vibrant local markets. Perfect short weekend retreat from Manila's heat.",
  "availability": "Available",
  "location": "Baguio City",
  "country": "Philippines",
  "images": [
    "https://example.com/storage/media/package_images/baguio-1.jpg",
    "https://example.com/storage/media/package_images/baguio-2.jpg"
  ],
  "deals": [
    {
      "deal_start_date": "2025-02-01",
      "deal_end_date": "2025-02-28",
      "slots_available": 30,
      "deal_price": 8500.00
    },
    {
      "deal_start_date": "2025-03-01",
      "deal_end_date": "2025-04-30",
      "slots_available": 25,
      "deal_price": 9500.00
    }
  ],
  "transportation": {
    "title": "Transportation",
    "local": "Round-trip bus from Manila and city tours",
    "amenities": [
      "Round-trip deluxe bus Manila-Baguio",
      "Airport/terminal pickup (Manila)",
      "City tour van rental",
      "All entrance fees included"
    ]
  },
  "accommodation": {
    "title": "Inclusions",
    "amenities": [
      "2 nights in 3-star hotel (good location)",
      "Daily breakfast",
      "Baguio city tour",
      "Strawberry farm visit with picking",
      "Burnham Park boat ride",
      "The Mansion visit",
      "Mines View Park",
      "Camp John Hay tour",
      "Session Road shopping time",
      "Good Shepherd visit"
    ]
  },
  "activities": {
    "title": "Exclusions",
    "tours": [
      "Lunch and dinner",
      "Strawberry taho and snacks",
      "Shopping expenses",
      "Personal expenses",
      "Additional activities"
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Manila to Baguio",
      "description": "Early morning pickup from designated Manila terminals. 6-hour scenic bus ride to Baguio with rest stops. Arrival and check-in to hotel. Lunch on own. Afternoon visit to Burnham Park for boat riding and people watching. Walk along Session Road for shopping and street food. Evening free to explore Baguio Night Market."
    },
    {
      "day": 2,
      "title": "Baguio City Tour",
      "description": "Breakfast at hotel. Full-day city tour starting with The Mansion (summer residence of Philippine President). Visit Mines View Park for panoramic mountain views and souvenir shopping. Stop at Good Shepherd for famous ube jam and strawberry products. Lunch break at local restaurant. Afternoon strawberry farm visit with picking experience. Visit Camp John Hay for nature walks. Return to hotel. Free evening."
    },
    {
      "day": 3,
      "title": "Return to Manila",
      "description": "Final breakfast. Check-out. Free morning for last-minute shopping at Baguio Market or Session Road. Lunch on own. Afternoon departure to Manila. Evening arrival at terminals with wonderful Baguio memories."
    }
  ]
}
```

---
