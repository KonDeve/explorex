# Slot Management Policy

## Overview
This document explains how package deal slots are managed in the Explorex booking system.

## Policy: Admin Approval Required

**Key Rule:** Slots are ONLY deducted when an admin manually confirms a booking, regardless of payment status.

### Why This Policy?

1. **Quality Control** - Admin reviews each booking before confirming
2. **Fraud Prevention** - Verify payment legitimacy before reducing inventory
3. **Flexibility** - Admin can review details, contact customer, or handle special cases
4. **Inventory Safety** - Prevents accidental overbooking from automated systems

## Workflow

### Customer Books a Package

1. Customer selects a deal and completes payment via PayMongo
2. Booking is created with status: `pending`
3. Payment status: `paid` (if full payment) or `partial` (if 50% payment)
4. **Slots are NOT deducted yet** ❌

### Admin Reviews Booking

Admin logs into admin panel and reviews:
- Payment verification ✓
- Customer information ✓
- Deal availability ✓
- Special requests ✓

### Admin Confirms Booking

When admin clicks "Confirm" on a booking:
1. Booking status changes: `pending` → `confirmed`
2. **Slot is automatically deducted** ✅
3. `package_deals.slots_booked` increases by 1
4. Available slots = `slots_available - slots_booked`

### Admin Cancels Booking

If admin cancels a confirmed booking:
1. Booking status changes: `confirmed` → `cancelled`
2. **Slot is automatically restored** ✅
3. `package_deals.slots_booked` decreases by 1

## Database Schema

### bookings table
```sql
- deal_id: UUID (references package_deals.id)
- status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
- payment_status: 'pending' | 'partial' | 'paid'
```

### package_deals table
```sql
- slots_available: INT (total capacity)
- slots_booked: INT (confirmed bookings)
- available = slots_available - slots_booked
```

## Implementation

### createBooking() Function
```javascript
// Location: lib/bookings.js

export const createBooking = async (bookingData) => {
  // ... create booking
  
  // NEW: Always includes deal_id
  const booking = {
    deal_id: bookingData.dealId || null,
    status: 'pending', // Always starts as pending
    // ...
  }
  
  // NOTE: No slot deduction here!
  // Slots only deducted when admin confirms
}
```

### updateBookingStatus() Function
```javascript
// Location: lib/bookings.js

export const updateBookingStatus = async (bookingId, status) => {
  // 1. Fetch current booking
  const currentBooking = await supabase
    .from('bookings')
    .select('id, status, deal_id')
    .eq('id', bookingId)
    .single()
  
  const oldStatus = currentBooking.status
  const dealId = currentBooking.deal_id
  
  // 2. Update booking status
  await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
  
  // 3. Manage slots based on status change
  if (dealId) {
    // CONFIRM: Deduct slot
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      // Increment slots_booked
      const { data: deal } = await supabase
        .from('package_deals')
        .select('slots_booked')
        .eq('id', dealId)
        .single()
      
      await supabase
        .from('package_deals')
        .update({ slots_booked: deal.slots_booked + 1 })
        .eq('id', dealId)
    }
    
    // CANCEL/REVERT: Restore slot
    if (status !== 'confirmed' && oldStatus === 'confirmed') {
      // Decrement slots_booked
      const { data: deal } = await supabase
        .from('package_deals')
        .select('slots_booked')
        .eq('id', dealId)
        .single()
      
      await supabase
        .from('package_deals')
        .update({ 
          slots_booked: Math.max(deal.slots_booked - 1, 0) 
        })
        .eq('id', dealId)
    }
  }
}
```

## Status Flow

### Typical Booking Flow
```
Customer books → pending (no slot deduction)
       ↓
Admin reviews → confirmed (slot deducted -1)
       ↓
Travel date → completed (slot remains deducted)
```

### Cancellation Flow
```
confirmed (slot deducted) → cancelled (slot restored +1)
```

### Edge Cases

**Case 1: Admin cancels then re-confirms**
```
confirmed (slots_booked = 5)
    ↓ admin cancels
cancelled (slots_booked = 4) ✅ slot restored
    ↓ admin re-confirms
confirmed (slots_booked = 5) ✅ slot deducted again
```

**Case 2: Customer pays but booking never confirmed**
```
pending (slots_booked = 5) - Payment received
    ↓ admin never confirms
pending (slots_booked = 5) - Slot NOT deducted ✅
```

**Case 3: Multiple rapid status changes**
```
Only the actual state change matters:
- pending → confirmed: deduct once
- confirmed → cancelled: restore once
- Duplicate updates are ignored
```

## Data Integrity

### Verification Query
Check if slots_booked matches actual confirmed bookings:
```sql
SELECT 
  pd.id,
  p.title,
  pd.slots_available,
  pd.slots_booked,
  COUNT(b.id) as actual_confirmed,
  CASE 
    WHEN pd.slots_booked = COUNT(b.id) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM package_deals pd
LEFT JOIN packages p ON pd.package_id = p.id
LEFT JOIN bookings b ON b.deal_id = pd.id AND b.status = 'confirmed'
GROUP BY pd.id, p.title, pd.slots_available, pd.slots_booked;
```

### Manual Sync (if needed)
If slots get out of sync, recalculate from confirmed bookings:
```sql
UPDATE package_deals pd
SET slots_booked = (
  SELECT COUNT(*)
  FROM bookings b
  WHERE b.deal_id = pd.id 
    AND b.status = 'confirmed'
),
updated_at = NOW();
```

## Admin UI

### Booking List
Shows all bookings with status badges:
- 🟡 Pending - Awaiting confirmation (no slot deducted)
- 🟢 Confirmed - Approved by admin (slot deducted)
- 🔴 Cancelled - Booking cancelled (slot restored if was confirmed)
- ✅ Completed - Trip finished (slot remains deducted)

### Confirm Button
When admin clicks "Confirm":
1. Status updates to `confirmed`
2. Slot automatically deducted
3. Customer notified (if email system implemented)

### Available Slots Display
```
Package: Santorini Romantic Getaway
Deal: Dec 3-5, 2025
Total Slots: 20
Booked: 5 confirmed bookings
Available: 15 slots remaining
```

## Testing Checklist

- [ ] Create booking with payment → status is 'pending', slots unchanged
- [ ] Admin confirms booking → status is 'confirmed', slots_booked increases by 1
- [ ] Admin cancels confirmed booking → status is 'cancelled', slots_booked decreases by 1
- [ ] Admin confirms booking without deal_id → no errors, slots unchanged
- [ ] Verify slots_booked never goes negative
- [ ] Verify slots_booked matches COUNT of confirmed bookings
- [ ] Test rapid status changes (pending → confirmed → cancelled → confirmed)
- [ ] Check that duplicate confirms don't double-deduct slots

## Future Enhancements

1. **Email Notifications** - Notify customer when booking is confirmed
2. **Slot Reservation Timer** - Hold slot for 15 minutes during checkout
3. **Waitlist** - Allow customers to join waitlist when fully booked
4. **Database Constraint** - Add `CHECK (slots_booked <= slots_available)`
5. **Audit Log** - Track all slot changes with timestamps and admin user
6. **Auto-confirm** - Optional: Auto-confirm bookings from trusted payment methods
7. **Slot Warnings** - Alert admin when slots are running low (e.g., < 3 remaining)

## Summary

✅ **Slots deducted**: When admin confirms booking (status → confirmed)
✅ **Slots restored**: When admin cancels confirmed booking (confirmed → cancelled)
❌ **Slots NOT deducted**: When booking is created, even with payment
❌ **Slots NOT affected**: When booking is pending, regardless of payment_status

This policy ensures admin oversight and prevents automated overbooking.
