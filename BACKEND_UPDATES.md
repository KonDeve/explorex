# Backend Updates Documentation

## Overview
This document details all backend changes made to `lib/packages.js` to support the new database schema and admin form structure.

## Updated: October 3, 2025

---

## Summary of Changes

### Key Updates:
1. ✅ **Removed fields from package creation/update**: `people`, `price`, `price_value`, `rating`, `reviews_count`, `highlights`, `features`
2. ✅ **Added `deal_price`** to package deals (individual pricing per deal period)
3. ✅ **Simplified package details sections**: Now uses only `transportation`, `inclusions`, `exclusions`
4. ✅ **Updated statistics calculation**: Average price now calculated from `package_deals.deal_price` instead of `packages.price`

---

## Detailed Function Changes

### 1. `createPackage(packageData, imageFiles)`

#### OLD Schema (Before):
```javascript
const packageInsertData = {
  title: packageData.title,
  location: packageData.location,
  country: packageData.country,
  people: peopleCount,                    // ❌ REMOVED
  price: `$${priceValue.toLocaleString()}`, // ❌ REMOVED
  price_value: priceValue,                // ❌ REMOVED
  category: packageData.category,
  description: packageData.description,
  highlights: packageData.highlights,     // ❌ REMOVED
  availability: packageData.availability,
  features: packageData.features,         // ❌ REMOVED
  images: imageUrls,
  popular: packageData.popular,
  featured: packageData.featured,
  hero_type: packageData.hero_type,
  rating: 0.0,                           // ❌ REMOVED
  reviews_count: 0                       // ❌ REMOVED
}
```

#### NEW Schema (After):
```javascript
const packageInsertData = {
  title: packageData.title,
  location: packageData.location,
  country: packageData.country || packageData.location?.toUpperCase(),
  category: packageData.category || 'International',
  hero_type: packageData.hero_type || 'beach',
  popular: packageData.popular || false,
  featured: packageData.featured || false,
  description: packageData.description,
  availability: packageData.availability || 'Available',
  images: imageUrls
}
```

#### Deal Creation - Added `deal_price`:
```javascript
// OLD (Before):
const dealEntries = packageData.deals.map(deal => ({
  package_id: packageId,
  deal_start_date: deal.deal_start_date,
  deal_end_date: deal.deal_end_date,
  slots_available: parseInt(deal.slots_available),
  slots_booked: 0,
  is_active: true
  // No deal_price field
}))

// NEW (After):
const dealEntries = packageData.deals.map(deal => ({
  package_id: packageId,
  deal_start_date: deal.deal_start_date,
  deal_end_date: deal.deal_end_date,
  slots_available: parseInt(deal.slots_available),
  slots_booked: 0,
  deal_price: parseFloat(deal.deal_price), // ✅ NEW - Individual price in PHP
  is_active: true
}))
```

#### Package Details - Simplified Sections:
```javascript
// OLD (Before): Used section types 'accommodation', 'transportation', 'activities', 'inclusions'
// Each had description field and various combinations of amenities/tours/items

// NEW (After): Simplified to 'transportation', 'inclusions', 'exclusions'
// Transportation section
{
  section_type: 'transportation',
  title: packageData.transportation.title,
  local: packageData.transportation.local,
  amenities: packageData.transportation.amenities
  // No description field
}

// Inclusions section (consolidated from accommodation)
{
  section_type: 'inclusions',
  title: packageData.accommodation.title,
  items: packageData.accommodation.amenities
  // No description field
}

// Exclusions section (consolidated from activities)
{
  section_type: 'exclusions',
  title: packageData.activities.title,
  items: packageData.activities.tours
  // No description field
}
```

---

### 2. `updatePackage(packageId, packageData, newImageFiles, imagesToDelete)`

#### Changes:
- Same field removals as `createPackage`
- Removed: `people`, `price`, `price_value`, `rating`, `highlights`, `features`
- Added: `deal_price` to deal entries
- Simplified package details sections

#### Deal Update - Added `deal_price`:
```javascript
const dealEntries = packageData.deals.map(deal => ({
  package_id: packageId,
  deal_start_date: deal.deal_start_date,
  deal_end_date: deal.deal_end_date,
  slots_available: parseInt(deal.slots_available),
  slots_booked: deal.slots_booked || 0, // Preserve existing bookings
  deal_price: parseFloat(deal.deal_price), // ✅ NEW - Individual price in PHP
  is_active: deal.is_active !== undefined ? deal.is_active : true
}))
```

---

### 3. `getPackageStats()`

#### OLD Implementation (Before):
```javascript
const { data: packages, error } = await supabase
  .from('packages')
  .select('price, availability, rating')

const stats = {
  total: packages.length,
  available: packages.filter(p => p.availability === 'Available').length,
  limited: packages.filter(p => p.availability === 'Limited').length,
  soldOut: packages.filter(p => p.availability === 'Sold Out').length,
  averagePrice: packages.reduce((sum, p) => sum + parseFloat(p.price), 0) / packages.length,
  averageRating: packages.reduce((sum, p) => sum + parseFloat(p.rating || 0), 0) / packages.length
}
```

#### NEW Implementation (After):
```javascript
// Get packages for availability stats
const { data: packages, error } = await supabase
  .from('packages')
  .select('id, availability')

// Get deals for price calculation
const { data: deals, error: dealsError } = await supabase
  .from('package_deals')
  .select('deal_price')

// Get reviews for rating calculation
const { data: reviews, error: reviewsError } = await supabase
  .from('reviews')
  .select('rating')

const stats = {
  total: packages.length,
  available: packages.filter(p => p.availability === 'Available').length,
  limited: packages.filter(p => p.availability === 'Limited').length,
  soldOut: packages.filter(p => p.availability === 'Sold Out').length,
  averagePrice: deals.reduce((sum, d) => sum + parseFloat(d.deal_price || 0), 0) / deals.length,
  averageRating: reviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0) / reviews.length
}
```

**Why?** 
- Price is no longer stored in `packages` table, must calculate from `package_deals.deal_price`
- Rating is no longer cached in `packages`, must calculate from `reviews` table

---

### 4. `getPackageById(packageId)` & `getPackageBySlug(slug)`

#### No Changes Required
These functions already fetch related data correctly:
```javascript
// Still returns:
{
  ...packageData,
  details: details || [],    // Package details (transportation, inclusions, exclusions)
  itinerary: itinerary || [], // Daily itinerary
  deals: deals || []          // Now includes deal_price for each deal
}
```

The `deals` array will now automatically include `deal_price` field since we're selecting all columns (`*`).

---

### 5. `getAllPackages()`

#### No Changes Required
This function already joins packages with deals:
```javascript
const packagesWithDeals = packages.map(pkg => ({
  ...pkg,
  deals: allDeals.filter(deal => deal.package_id === pkg.id) // Now includes deal_price
}))
```

The deals will automatically include `deal_price` field.

---

## Migration Checklist

### ✅ Completed Backend Updates:
- [x] `createPackage()` - Updated to new schema
- [x] `updatePackage()` - Updated to new schema
- [x] `getPackageStats()` - Calculate from deals and reviews
- [x] Package details sections simplified
- [x] Deal creation includes `deal_price`
- [x] Deal updates include `deal_price`

### ⏳ No Changes Needed:
- [x] `uploadPackageImages()` - No schema changes
- [x] `deletePackageImage()` - No schema changes
- [x] `getAllPackages()` - Automatically includes new deal_price
- [x] `getPackageById()` - Automatically includes new deal_price
- [x] `getPackageBySlug()` - Automatically includes new deal_price
- [x] `deletePackage()` - No schema changes

---

## Testing Recommendations

### 1. Test Package Creation
```javascript
const testPackage = {
  title: "Test Package",
  category: "International",
  hero_type: "beach",
  location: "Boracay",
  country: "Philippines",
  description: "Test description",
  availability: "Available",
  popular: true,
  featured: false,
  deals: [
    {
      deal_start_date: "2025-01-01",
      deal_end_date: "2025-01-10",
      slots_available: 20,
      deal_price: 45000.00 // NEW FIELD
    }
  ],
  transportation: {
    title: "Transportation",
    local: "Hotel transfers included",
    amenities: ["Airport pickup", "Island hopping boat"]
  },
  accommodation: {
    title: "Inclusions",
    amenities: ["5-star hotel", "All meals"]
  },
  activities: {
    title: "Exclusions",
    tours: ["Travel insurance", "Personal expenses"]
  },
  itinerary: [
    { day: 1, title: "Arrival", description: "Check in" }
  ]
}

const result = await createPackage(testPackage, imageFiles)
```

### 2. Test Package Update
```javascript
const updatedData = {
  ...existingPackage,
  title: "Updated Title",
  deals: [
    {
      deal_start_date: "2025-02-01",
      deal_end_date: "2025-02-10",
      slots_available: 15,
      deal_price: 55000.00 // Updated price
    }
  ]
}

const result = await updatePackage(packageId, updatedData)
```

### 3. Test Statistics
```javascript
const stats = await getPackageStats()
console.log(stats)
// Should return:
// {
//   total: 10,
//   available: 8,
//   limited: 1,
//   soldOut: 1,
//   averagePrice: "48500.00", // Calculated from package_deals.deal_price
//   averageRating: "4.5"       // Calculated from reviews
// }
```

### 4. Test Package Retrieval
```javascript
const package = await getPackageById(packageId)
console.log(package.deals)
// Should include deal_price for each deal:
// [
//   {
//     id: "uuid",
//     package_id: "uuid",
//     deal_start_date: "2025-01-01",
//     deal_end_date: "2025-01-10",
//     slots_available: 20,
//     slots_booked: 5,
//     deal_price: 45000.00, // ✅ Included
//     is_active: true
//   }
// ]
```

---

## Data Flow Example

### Complete Package Creation Flow:

1. **Admin fills form** → `app/admin/packages/add/page.jsx`
2. **Form submitted** → Calls `createPackage()`
3. **Backend processes**:
   ```
   a. Upload images to Supabase Storage
   b. Insert into packages table (NO people, price, rating, highlights, features)
   c. Insert into package_deals table (WITH deal_price per deal)
   d. Insert into package_details table (simplified: transportation, inclusions, exclusions)
   e. Insert into package_itinerary table
   ```
4. **Success** → Package created with deal-specific pricing

### Customer Views Package:

1. **Customer visits** → `app/packages/[slug]/page.jsx`
2. **Page calls** → `getPackageBySlug(slug)`
3. **Backend returns**:
   ```javascript
   {
     id: "uuid",
     title: "Santorini Getaway",
     category: "International",
     location: "Santorini",
     country: "Greece",
     description: "...",
     // NO people field
     // NO price field
     deals: [
       {
         deal_start_date: "2025-01-01",
         deal_end_date: "2025-01-10",
         slots_available: 20,
         deal_price: 45000.00 // Customer sees this price
       },
       {
         deal_start_date: "2025-02-01",
         deal_end_date: "2025-02-10",
         slots_available: 15,
         deal_price: 55000.00 // Different price for different period
       }
     ],
     details: [...], // Transportation, inclusions, exclusions
     itinerary: [...] // Daily itinerary
   }
   ```
4. **Page displays** → Show lowest price or price range from deals

---

## Breaking Changes

### ⚠️ Customer-Facing Pages Need Updates

The following files need to be updated to use `deal_price` instead of `package.price`:

1. **`app/packages/page.jsx`** - Package listing
   - OLD: `{package.price}`
   - NEW: `₱${Math.min(...package.deals.map(d => d.deal_price)).toLocaleString()}`

2. **`app/packages/[slug]/page.jsx`** - Package details
   - OLD: `{package.price}`
   - NEW: Display price from selected deal or show price range

3. **`app/dashboard/trip/[slug]/page.jsx`** - Trip details
   - OLD: `{trip.package.price}`
   - NEW: `₱${trip.deal.deal_price.toLocaleString()}`

4. **Booking Flow**
   - Must select a specific deal (with its price) when booking
   - `deal_id` is required in bookings table to link to specific price

---

## Next Steps

1. ✅ **Backend Updated** - All functions now use new schema
2. ⏳ **Run Migration** - Execute `migrate-to-new-schema.sql` on database
3. ⏳ **Test Backend** - Create, update, view packages via admin
4. ⏳ **Update Customer Pages** - Modify to display `deal_price` instead of `package.price`
5. ⏳ **Test End-to-End** - Full flow from admin create → customer view → booking

---

## Support & Troubleshooting

### Common Issues:

**Error: "column 'price' does not exist"**
- Solution: Run the migration script to remove old columns

**Error: "null value in column 'deal_price'"**
- Solution: Ensure all deals include `deal_price` when creating/updating

**Issue: Stats showing 0 for average price**
- Solution: Check that `package_deals` has entries with valid `deal_price` values

**Issue: Customer pages not showing prices**
- Solution: Update pages to use `package.deals[].deal_price` instead of `package.price`

---

**Document Version:** 1.0  
**Last Updated:** October 3, 2025  
**Status:** ✅ Backend Updates Complete
