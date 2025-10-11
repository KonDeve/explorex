# Database Schema Update Documentation

## Overview
This document explains the database schema changes to match the updated admin package form structure.

## Key Changes

### 1. **PACKAGES Table - Removed Fields**

The following fields have been **REMOVED** from the `packages` table as they're no longer used in the new form:

| Removed Field | Reason |
|--------------|--------|
| `people` | Capacity is now handled per-deal via `slots_available` in `package_deals` |
| `price` | Pricing is now individual per deal period in `package_deals.deal_price` |
| `price_value` | Same as above - moved to deal-level pricing |
| `rating` | Can be calculated dynamically from `reviews` table |
| `reviews_count` | Can be calculated dynamically from `reviews` table |
| `highlights` | Not used in current admin form |
| `features` | Not used in current admin form |
| `duration` | Not needed with deal date ranges |

### 2. **PACKAGES Table - Current Structure**

The `packages` table now contains only the fields that exist in the admin form:

```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    
    -- Step 1: Basic Information
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,          -- International, Domestic, etc.
    hero_type VARCHAR(50) NOT NULL,          -- beach, mountain, city, etc.
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    availability VARCHAR(50) DEFAULT 'Available',
    
    -- Location
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    
    -- Images
    images JSONB,                            -- Array of image URLs
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **PACKAGE_DEALS Table - Added Field**

Added **individual pricing per deal period**:

```sql
CREATE TABLE package_deals (
    id UUID PRIMARY KEY,
    package_id UUID REFERENCES packages(id),
    deal_start_date DATE NOT NULL,
    deal_end_date DATE NOT NULL,
    slots_available INTEGER DEFAULT 0,
    slots_booked INTEGER DEFAULT 0,
    deal_price DECIMAL(10,2) NOT NULL,       -- NEW: Price in PHP for this deal
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why This Change?**
- Different date ranges can now have different prices (e.g., peak season vs off-season)
- More flexible pricing model
- Each deal period has its own capacity (slots) and price

### 4. **PACKAGE_DETAILS Table - Simplified**

Section types simplified to match the form structure:

| Section Type | Used For | Fields |
|-------------|----------|--------|
| `transportation` | Transportation details | `local`, `amenities` |
| `inclusions` | Included items | `items` |
| `exclusions` | Excluded items | `items` |

**Removed:** `accommodation` and `activities` section types (consolidated into above)

### 5. **PAYMENTS Table - Currency Update**

Default currency changed from `USD` to `PHP`:

```sql
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'PHP';
```

## Migration Path

### Step 1: Run the Migration Script

Execute `migrate-to-new-schema.sql` in your Supabase SQL Editor. This script:

1. ✅ Creates a backup view of old package data
2. ✅ Adds `deal_price` to `package_deals`
3. ✅ Migrates existing prices from `packages.price_value` to `package_deals.deal_price`
4. ✅ Removes unused columns from `packages`
5. ✅ Ensures all required columns exist
6. ✅ Updates indexes for performance
7. ✅ Changes default currency to PHP

### Step 2: Verify Migration

After running the migration, verify the changes:

```sql
-- Check packages table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'packages'
ORDER BY ordinal_position;

-- Check package_deals has deal_price
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'package_deals'
ORDER BY ordinal_position;

-- Verify data integrity
SELECT p.title, pd.deal_price, pd.deal_start_date, pd.deal_end_date
FROM packages p
JOIN package_deals pd ON p.id = pd.package_id
LIMIT 10;
```

### Step 3: Update Application Code

After schema migration, ensure these areas are updated:

#### ✅ Already Updated:
- `app/admin/packages/add/page.jsx` - Form matches new schema
- Deal periods include individual pricing
- Removed people and base price fields

#### ⏳ Needs Update:
- `lib/packages.js` - Verify `createPackage()` and `updatePackage()` save `deal_price`
- Customer-facing pages:
  - `app/packages/page.jsx` - Package listing
  - `app/packages/[slug]/page.jsx` - Package details
  - `app/dashboard/trip/[slug]/page.jsx` - Trip details
- Update queries to use `deal_price` instead of `packages.price`

## New Data Flow

### Creating a Package:

1. **Admin fills form** (Step 1: Basic Info)
   - Title, Category, Hero Type, Popular, Featured
   - Description, Availability
   - Location, Country
   - Deal Periods with **individual prices**

2. **Data saved to database:**
   ```javascript
   // packages table
   {
     title: "Santorini Getaway",
     category: "International",
     hero_type: "beach",
     location: "Santorini",
     country: "Greece",
     description: "...",
     // NO people field
     // NO price field
   }
   
   // package_deals table (multiple entries)
   [
     {
       package_id: "uuid",
       deal_start_date: "2025-01-01",
       deal_end_date: "2025-01-10",
       slots_available: 20,
       deal_price: 45000.00  // PHP
     },
     {
       package_id: "uuid",
       deal_start_date: "2025-02-01",
       deal_end_date: "2025-02-10",
       slots_available: 15,
       deal_price: 55000.00  // Higher price for peak season
     }
   ]
   ```

### Displaying to Customers:

Customer pages need to fetch deal information:

```javascript
// OLD way (doesn't work anymore):
const price = package.price; // ❌ This field no longer exists

// NEW way:
const deals = await getPackageDeals(packageId);
const lowestPrice = Math.min(...deals.map(d => d.deal_price));
const displayPrice = `₱${lowestPrice.toLocaleString()}`;
```

## Checklist for Full Migration

- [x] Create updated schema file (`supabase-schema-updated.sql`)
- [x] Create migration script (`migrate-to-new-schema.sql`)
- [x] Update admin form to match schema
- [ ] Run migration on Supabase database
- [ ] Test creating new package via admin form
- [ ] Test editing existing package via admin form
- [ ] Update `lib/packages.js` to handle `deal_price`
- [ ] Update customer package listing page
- [ ] Update customer package details page
- [ ] Update booking flow to select specific deal with price
- [ ] Test end-to-end: create package → view as customer → book

## Benefits of New Structure

1. **Flexible Pricing:** Different prices for different date ranges
2. **Better Capacity Management:** Each deal period has its own slot count
3. **Cleaner Data Model:** Removed unused fields
4. **Simplified Form:** Removed redundant fields (people, base price)
5. **PHP Currency:** Consistent with Philippine market
6. **Logical Field Order:** Package info → Location → Deal-specific details

## Rollback Plan

If you need to rollback, the migration script creates a backup view:

```sql
-- View old package data
SELECT * FROM packages_backup;

-- Restore people and price columns (if needed)
ALTER TABLE packages ADD COLUMN people INTEGER;
ALTER TABLE packages ADD COLUMN price VARCHAR(50);
ALTER TABLE packages ADD COLUMN price_value DECIMAL(10,2);

-- Copy data back from backup or package_deals
UPDATE packages p SET 
    price_value = (SELECT MIN(deal_price) FROM package_deals WHERE package_id = p.id);
```

## Support

For questions or issues during migration:
1. Check Supabase logs for errors
2. Verify all foreign key relationships are intact
3. Test with a single package first before migrating all data
4. Keep the `packages_backup` view until migration is confirmed successful

---

**Created:** October 3, 2025
**Version:** 2.0
**Status:** Ready for Migration
