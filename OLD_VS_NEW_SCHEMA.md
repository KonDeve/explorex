# Schema Comparison: OLD vs NEW

## Quick Reference Guide

---

## 📊 PACKAGES Table

### OLD Schema (Before):
```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    location VARCHAR(255),
    country VARCHAR(100),
    people INTEGER,              ❌ REMOVED
    price VARCHAR(50),           ❌ REMOVED  
    price_value DECIMAL(10,2),   ❌ REMOVED
    rating DECIMAL(3,2),         ❌ REMOVED
    reviews_count INTEGER,       ❌ REMOVED
    description TEXT,
    category VARCHAR(100),
    availability VARCHAR(50),
    highlights TEXT,             ❌ REMOVED
    features JSONB,              ❌ REMOVED
    images JSONB,
    popular BOOLEAN,
    featured BOOLEAN,
    hero_type VARCHAR(50),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### NEW Schema (After):
```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,      ✅ Now required
    hero_type VARCHAR(50) NOT NULL,      ✅ Now required
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    availability VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    images JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

---

## 💰 PACKAGE_DEALS Table

### OLD Schema (Before):
```sql
CREATE TABLE package_deals (
    id UUID PRIMARY KEY,
    package_id UUID,
    deal_start_date DATE,
    deal_end_date DATE,
    slots_available INTEGER,
    slots_booked INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### NEW Schema (After):
```sql
CREATE TABLE package_deals (
    id UUID PRIMARY KEY,
    package_id UUID,
    deal_start_date DATE NOT NULL,
    deal_end_date DATE NOT NULL,
    slots_available INTEGER DEFAULT 0,
    slots_booked INTEGER DEFAULT 0,
    deal_price DECIMAL(10,2) NOT NULL,  ✅ NEW FIELD
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Key Change:** Each deal now has its own `deal_price` in PHP!

---

## 📝 PACKAGE_DETAILS Table

### OLD Section Types:
```sql
section_type IN ('accommodation', 'transportation', 'activities', 'inclusions')
```

### NEW Section Types:
```sql
section_type IN ('transportation', 'inclusions', 'exclusions')
```

### OLD Structure:
```sql
CREATE TABLE package_details (
    id UUID PRIMARY KEY,
    package_id UUID,
    section_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,           ❌ Optional now (not used)
    amenities JSONB,
    local TEXT,
    tours JSONB,
    items JSONB,
    created_at TIMESTAMPTZ
);
```

### NEW Structure:
```sql
CREATE TABLE package_details (
    id UUID PRIMARY KEY,
    package_id UUID,
    section_type VARCHAR(50),  -- 'transportation', 'inclusions', 'exclusions'
    title VARCHAR(255),
    description TEXT,          -- Optional, kept for compatibility
    local TEXT,                -- For transportation
    amenities JSONB,           -- For transportation
    items JSONB,               -- For inclusions/exclusions
    tours JSONB,               -- Optional
    created_at TIMESTAMPTZ
);
```

---

## 📋 Data Comparison Examples

### Package Record

#### OLD:
```json
{
  "id": "uuid",
  "title": "Santorini Getaway",
  "location": "Santorini",
  "country": "Greece",
  "people": 4,                    ❌
  "price": "$2,499",              ❌
  "price_value": 2499,            ❌
  "rating": 4.8,                  ❌
  "reviews_count": 124,           ❌
  "category": "International",
  "description": "...",
  "highlights": "Beach • Luxury", ❌
  "features": ["5-Star Hotel"],   ❌
  "availability": "Available",
  "images": [...],
  "popular": true,
  "featured": false,
  "hero_type": "beach"
}
```

#### NEW:
```json
{
  "id": "uuid",
  "title": "Santorini Getaway",
  "category": "International",
  "hero_type": "beach",
  "popular": true,
  "featured": false,
  "description": "...",
  "availability": "Available",
  "location": "Santorini",
  "country": "Greece",
  "images": [...]
}
```

### Deal Record

#### OLD:
```json
{
  "id": "uuid",
  "package_id": "uuid",
  "deal_start_date": "2025-01-15",
  "deal_end_date": "2025-01-25",
  "slots_available": 20,
  "slots_booked": 0,
  "is_active": true
}
```

#### NEW:
```json
{
  "id": "uuid",
  "package_id": "uuid",
  "deal_start_date": "2025-01-15",
  "deal_end_date": "2025-01-25",
  "slots_available": 20,
  "slots_booked": 0,
  "deal_price": 45000.00,  ✅ NEW
  "is_active": true
}
```

### Package Details Record

#### OLD (Accommodation):
```json
{
  "section_type": "accommodation",  ❌
  "title": "Hotel Accommodation",
  "description": "5-star luxury hotel", ❌
  "amenities": ["WiFi", "Pool", "Spa"]
}
```

#### NEW (Inclusions):
```json
{
  "section_type": "inclusions",  ✅
  "title": "Inclusions",
  "items": ["5-star hotel", "WiFi", "Pool", "Spa"]
}
```

---

## 🔄 Backend Function Changes

### createPackage()

#### OLD:
```javascript
const packageData = {
  title, location, country,
  people: parseInt(people),        ❌
  price: `$${price}`,              ❌
  price_value: parseFloat(price),  ❌
  category, description,
  highlights,                       ❌
  features: [...],                  ❌
  rating: 0.0,                     ❌
  reviews_count: 0                 ❌
}
```

#### NEW:
```javascript
const packageData = {
  title, location, country,
  category, hero_type,
  popular, featured,
  description, availability,
  images: [...]
}

// Deals include price
deals: [{
  deal_start_date, deal_end_date,
  slots_available,
  deal_price: parseFloat(deal_price) ✅
}]
```

---

## 💡 Key Takeaways

### Removed Completely:
1. ❌ `people` field - Capacity is now per-deal via `slots_available`
2. ❌ `price`, `price_value` - Pricing is now per-deal via `deal_price`
3. ❌ `rating`, `reviews_count` - Calculated from reviews table
4. ❌ `highlights`, `features` - Not used in current form
5. ❌ Description field in package details sections

### Added:
1. ✅ `deal_price` - Individual price per deal period in PHP
2. ✅ Simplified section types (transportation, inclusions, exclusions)

### Changed:
1. 🔄 Multiple deals with different prices instead of one global price
2. 🔄 Section types consolidated (accommodation → inclusions, activities → exclusions)
3. 🔄 Cleaner data structure without redundant fields

---

## 📊 Price Display Logic

### OLD:
```javascript
// Display package price
<p>Price: {package.price}</p>
// Output: Price: $2,499
```

### NEW:
```javascript
// Display lowest price from deals
const lowestPrice = Math.min(...package.deals.map(d => d.deal_price));
<p>Starting from: ₱{lowestPrice.toLocaleString()}</p>
// Output: Starting from: ₱45,000

// OR display price range
const prices = package.deals.map(d => d.deal_price);
<p>₱{Math.min(...prices).toLocaleString()} - ₱{Math.max(...prices).toLocaleString()}</p>
// Output: ₱45,000 - ₱65,000
```

---

## ✅ Migration Checklist

- [x] Update `packages` table structure
- [x] Add `deal_price` to `package_deals` table
- [x] Update backend `createPackage()` function
- [x] Update backend `updatePackage()` function
- [x] Update backend `getPackageStats()` function
- [x] Update admin form to match new structure
- [ ] Run database migration script
- [ ] Update customer-facing pages to display `deal_price`
- [ ] Test package creation with new schema
- [ ] Test package editing with new schema
- [ ] Test booking flow with deal selection

---

**Document Version:** 1.0  
**Last Updated:** October 3, 2025  
**Status:** Ready for Migration
