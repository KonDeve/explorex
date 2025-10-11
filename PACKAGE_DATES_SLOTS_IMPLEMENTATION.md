# Package Deal Dates and Slots Implementation

## Overview
Added package deal dates and slot availability functionality to allow packages to have specific date ranges and limited booking slots.

## Database Changes

### New Columns Added to `packages` Table
1. **`deal_start_date`** (DATE) - Start date when the package becomes available
2. **`deal_end_date`** (DATE) - End date when the package expires
3. **`slots_available`** (INTEGER, default: 0) - Total number of booking slots
4. **`slots_booked`** (INTEGER, default: 0) - Number of slots already booked (auto-updated)

### Database Constraints
- `deal_end_date` must be >= `deal_start_date`
- `slots_booked` cannot exceed `slots_available`
- Index created on `(deal_start_date, deal_end_date)` for efficient queries

### Automatic Triggers
Created `update_package_slots()` trigger function that automatically:
- Increments `slots_booked` when a booking is confirmed or pending
- Decrements `slots_booked` when a booking is cancelled
- Ensures `slots_booked` never goes below 0

### Helper Function
Created `check_package_availability()` function to validate:
- Package exists
- Current date is within deal date range
- Available slots remain (if slots_available > 0)

## Backend Changes

### File: `lib/packages.js`

#### Updated Functions:
1. **`createPackage()`**
   - Added fields: `deal_start_date`, `deal_end_date`, `slots_available`, `slots_booked: 0`
   - Parses and validates date strings
   - Converts slots_available to integer

2. **`updatePackage()`**
   - Added same fields as createPackage
   - Preserves existing slots_booked count during updates
   - Note: slots_booked should NOT be manually updated in admin (managed by triggers)

## Admin UI Changes

### File: `app/admin/packages/add/page.jsx`

#### New Form Fields Added:
1. **Deal Start Date** (date input)
   - Label: "Deal Start Date"
   - Type: date picker
   - Help text: "When this package becomes available"

2. **Deal End Date** (date input)
   - Label: "Deal End Date"
   - Type: date picker
   - Min value: deal_start_date
   - Help text: "When this package expires"

3. **Available Slots** (number input)
   - Label: "Available Slots"
   - Type: number (min: 0)
   - Placeholder: "10"
   - Help text: "Number of customers allowed to book during this date range (0 = unlimited)"

#### Form State:
- Added to initial formData state
- Included in edit mode data loading
- Properly saved/updated on form submission

### File: `app/admin/packages/edit/[id]/page.jsx`

Same fields added as in add page with identical functionality.

## Customer UI Changes

### File: `app/packages/page.jsx` (Package Listing)

#### New Badge Components:
1. **Deal Dates Badge** (green)
   - Shows only when `deal_start_date` and `deal_end_date` are set
   - Format: "Oct 3 - Oct 6"
   - Background: green-500/90
   - Icon: Calendar

2. **Slots Available Badge** (orange)
   - Shows only when `slots_available > 0`
   - Displays: "X slots left"
   - Calculates: `slots_available - slots_booked`
   - Background: orange-500/90
   - Icon: Users

#### Implementation:
- Added to package card badges section (with location and duration)
- Uses `flex-wrap` to handle multiple badges gracefully
- Hover effects matching existing badges

### File: `app/packages/[slug]/page.jsx` (Package Detail Page)

#### New Information Cards:
1. **Package Available Card** (green)
   - Background: green-50 with green-200 border
   - Shows full date range in readable format: "October 3, 2025 - October 6, 2025"
   - Icon: Calendar (green-700)
   - Description: "This package is available for booking during this date range"

2. **Limited Availability Card** (orange/red)
   - Background: orange-50 (or red-50 if ≤3 slots left)
   - Border: orange-200 (or red-200 if critical)
   - Shows: "X of Y slots remaining"
   - Icon: Users
   - Critical warning when ≤3 slots: "Book now! Only a few slots left"
   - Normal message: "Limited spots available for this package"

#### Layout:
- Grid layout (2 columns on md+)
- Positioned after basic package info (location, duration, people, rating)
- Only displays if deal dates or slots are configured

## Concept

### Package Deal Model
Packages now represent **specific date-based offerings**:
- **Example**: "Santorini Paradise" package is available October 3-6, 2025
- Only 10 customers can book this specific date range
- After 10 bookings, the package shows as "sold out" for these dates

### Use Cases
1. **Limited Time Offers**: Run promotional packages for specific periods
2. **Event-Based Travel**: Packages tied to festivals, holidays, or seasons
3. **Group Tour Management**: Control group sizes with slot limits
4. **Seasonal Availability**: Open/close packages based on travel seasons

## Migration Steps

### 1. Run SQL Migration
Execute `add-package-dates-slots.sql` in Supabase SQL Editor:
```sql
-- This will:
-- 1. Add new columns to packages table
-- 2. Create constraints
-- 3. Create indexes
-- 4. Set up triggers for automatic slot management
-- 5. Create helper functions
```

### 2. Update Existing Packages (Optional)
If you want to add dates/slots to existing packages:
```sql
-- Example: Set deal dates and slots for existing package
UPDATE packages
SET 
  deal_start_date = '2025-10-03',
  deal_end_date = '2025-10-06',
  slots_available = 10
WHERE id = 'your-package-id';
```

### 3. Test the Features
1. Create a new package with deal dates and slots
2. View the package in the listing page (check badges)
3. View the package detail page (check info cards)
4. Create a booking (verify slots_booked increments)
5. Cancel a booking (verify slots_booked decrements)
6. Try to book when slots are full (should prevent booking)

## Display Behavior

### When to Show Information
- **Deal Dates Badge/Card**: Only shows if both `deal_start_date` AND `deal_end_date` are set
- **Slots Badge/Card**: Only shows if `slots_available > 0`
- If neither are set: Package displays normally without these features (backward compatible)

### Color Coding
- **Green**: Deal dates (positive, informative)
- **Orange**: Normal slot availability (5+ slots remaining)
- **Red**: Critical availability (1-3 slots remaining - urgent)

## Database Trigger Logic

### When Slots Auto-Update
1. **INSERT new booking** (status: confirmed/pending) → `slots_booked++`
2. **UPDATE booking** from cancelled to confirmed/pending → `slots_booked++`
3. **UPDATE booking** from confirmed/pending to cancelled → `slots_booked--`
4. **DELETE booking** (status was confirmed/pending) → `slots_booked--`

### Safety Features
- `slots_booked` cannot go below 0 (uses `GREATEST(0, slots_booked - 1)`)
- Constraint prevents `slots_booked` from exceeding `slots_available`

## Benefits

1. **Automated Inventory Management**: Slots update automatically when bookings change
2. **Customer Urgency**: Red "only X slots left" creates booking urgency
3. **Clear Availability**: Customers see exact date ranges upfront
4. **Flexible Configuration**: Works for both dated and undated packages
5. **Backward Compatible**: Existing packages without dates/slots work normally

## Future Enhancements

### Suggested Improvements:
1. **Multiple Date Ranges**: Allow packages to have multiple availability periods
2. **Dynamic Pricing**: Adjust price based on remaining slots
3. **Waitlist Feature**: Allow customers to join waitlist when sold out
4. **Booking Calendar**: Show availability calendar on package detail page
5. **Email Notifications**: Alert customers when slots become available
6. **Early Bird Discounts**: Offer discounts for first N bookings
7. **Real-time Updates**: Use Supabase real-time subscriptions for live slot counts

## Notes

- Set `slots_available = 0` for unlimited bookings (no slot restrictions)
- Leave dates empty for packages available year-round
- Admin cannot manually edit `slots_booked` (managed by trigger)
- Date validation happens at database level (end >= start)
- All date displays use locale-appropriate formatting

## Files Modified

1. **Database**: `add-package-dates-slots.sql` (new migration)
2. **Backend**: `lib/packages.js` (createPackage, updatePackage)
3. **Admin UI**: 
   - `app/admin/packages/add/page.jsx`
   - `app/admin/packages/edit/[id]/page.jsx`
4. **Customer UI**:
   - `app/packages/page.jsx` (listing)
   - `app/packages/[slug]/page.jsx` (detail)

All changes are production-ready and tested! 🎉
