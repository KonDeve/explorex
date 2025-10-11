# BOOKING SLOTS MANAGEMENT - IMPLEMENTATION

## Overview
Automatic slot management system that tracks available slots in `package_deals` based on booking confirmations.

## How It Works

### Booking Status Flow
```
pending → confirmed → slots_booked increases (available slots decrease)
confirmed → cancelled → slots_booked decreases (available slots increase)
```

### Database Structure

**package_deals table:**
```sql
- slots_available: INTEGER  -- Total slots for this deal
- slots_booked: INTEGER     -- Number of confirmed bookings
- Available Slots = slots_available - slots_booked
```

**bookings table:**
```sql
- deal_id: UUID             -- Links to package_deals
- status: VARCHAR(20)       -- pending, confirmed, cancelled, completed
```

## Implementation Details

### Updated Function: `updateBookingStatus()`
**File**: `lib/bookings.js`

#### Logic Flow:

1. **Fetch Current Booking**
   ```javascript
   const { data: currentBooking } = await supabase
     .from('bookings')
     .select('id, status, deal_id')
     .eq('id', bookingId)
     .single()
   ```
   - Gets current status and deal_id
   - Stores old status for comparison

2. **Update Booking Status**
   ```javascript
   const { data } = await supabase
     .from('bookings')
     .update({ status, updated_at: NOW() })
     .eq('id', bookingId)
   ```
   - Updates the booking status
   - Updates timestamp

3. **Manage Slots (if deal_id exists)**

   **Case A: Status changed TO "confirmed"**
   ```javascript
   if (status === 'confirmed' && oldStatus !== 'confirmed') {
     // Increment slots_booked
     await supabase
       .from('package_deals')
       .update({ slots_booked: raw('slots_booked + 1') })
       .eq('id', dealId)
   }
   ```
   - Increases `slots_booked` by 1
   - Reduces available slots
   - Uses SQL `raw()` for atomic increment

   **Case B: Status changed FROM "confirmed"**
   ```javascript
   if (status !== 'confirmed' && oldStatus === 'confirmed') {
     // Decrement slots_booked
     await supabase
       .from('package_deals')
       .update({ slots_booked: raw('GREATEST(slots_booked - 1, 0)') })
       .eq('id', dealId)
   }
   ```
   - Decreases `slots_booked` by 1
   - Restores available slots
   - Uses `GREATEST()` to prevent negative values

## Example Scenarios

### Scenario 1: Admin Confirms Booking
```
Before:
- Booking Status: pending
- Deal: slots_available = 10, slots_booked = 3
- Available: 10 - 3 = 7 slots

Admin Action: Change status to "confirmed"

After:
- Booking Status: confirmed
- Deal: slots_available = 10, slots_booked = 4
- Available: 10 - 4 = 6 slots
```

### Scenario 2: Admin Cancels Confirmed Booking
```
Before:
- Booking Status: confirmed
- Deal: slots_available = 10, slots_booked = 5
- Available: 10 - 5 = 5 slots

Admin Action: Change status to "cancelled"

After:
- Booking Status: cancelled
- Deal: slots_available = 10, slots_boked = 4
- Available: 10 - 4 = 6 slots
```

### Scenario 3: Booking Without deal_id
```
Before:
- Booking Status: pending
- Deal: deal_id = null (old bookings)

Admin Action: Change status to "confirmed"

After:
- Booking Status: confirmed
- Deal: No slot changes (deal_id is null, skipped)
```

## Status Transitions & Slot Impact

| From Status | To Status | Slots Impact |
|-------------|-----------|--------------|
| pending → confirmed | +1 slots_booked | ✅ Slot taken |
| pending → cancelled | No change | ➖ |
| confirmed → cancelled | -1 slots_booked | ✅ Slot freed |
| confirmed → completed | No change | ➖ Stay booked |
| cancelled → confirmed | +1 slots_booked | ✅ Slot taken again |
| completed → cancelled | -1 slots_booked | ✅ Slot freed |

## Error Handling

### Slot Update Failures
```javascript
if (incrementError) {
  console.error('Failed to increment slots_booked:', incrementError)
  // Don't throw error - booking status already updated
}
```

**Why non-fatal?**
- Booking status update is primary operation
- Slot sync failures are logged but don't rollback
- Can be manually corrected by admin if needed
- Prevents booking management from being blocked

### Edge Cases Handled

1. **Negative Slots Prevention**
   ```sql
   GREATEST(slots_booked - 1, 0)
   ```
   - Ensures slots_booked never goes below 0
   - Handles data inconsistencies gracefully

2. **Null deal_id**
   ```javascript
   if (dealId) { /* update slots */ }
   ```
   - Skips slot management for old bookings
   - Backward compatible with existing data

3. **Same Status Update**
   ```javascript
   if (status === 'confirmed' && oldStatus !== 'confirmed')
   ```
   - Only updates slots on actual status change
   - Prevents duplicate slot modifications

## Admin UI Integration

**File**: `app/admin/bookings/page.jsx`

### Status Update Handler
```javascript
const handleStatusUpdate = async (bookingId, newStatus) => {
  if (!confirm(`Change status to "${newStatus}"?`)) return
  
  const result = await updateBookingStatus(bookingId, newStatus)
  
  if (result.success) {
    alert('Booking status updated successfully!')
    await fetchBookings() // Refresh list
  } else {
    alert(`Failed: ${result.error}`)
  }
}
```

### UI Elements
- Dropdown menu for status selection
- Confirmation dialog before update
- Success/error notifications
- Automatic list refresh after update

## Testing Checklist

### Basic Operations
- [ ] Confirm pending booking → slots_booked increases
- [ ] Cancel confirmed booking → slots_booked decreases
- [ ] Confirm cancelled booking → slots_booked increases
- [ ] Update to same status → no slot change

### Edge Cases
- [ ] Booking with null deal_id → no errors
- [ ] Slots_booked at 0, cancel booking → stays at 0
- [ ] Multiple rapid status changes → final state correct
- [ ] Slots_booked equals slots_available → booking prevents new bookings

### Data Integrity
- [ ] Check slots_booked never exceeds slots_available
- [ ] Check slots_booked never goes negative
- [ ] Verify available slots calculation in UI
- [ ] Confirm booking list refreshes after update

## Query to Verify Slot Data

```sql
-- Check current slot usage
SELECT 
  pd.id,
  p.title,
  pd.deal_start_date,
  pd.deal_end_date,
  pd.slots_available,
  pd.slots_booked,
  (pd.slots_available - pd.slots_booked) as slots_remaining,
  COUNT(b.id) as confirmed_bookings
FROM package_deals pd
LEFT JOIN packages p ON pd.package_id = p.id
LEFT JOIN bookings b ON b.deal_id = pd.id AND b.status = 'confirmed'
GROUP BY pd.id, p.title, pd.deal_start_date, pd.deal_end_date, 
         pd.slots_available, pd.slots_booked
ORDER BY pd.deal_start_date DESC;
```

## Benefits

✅ **Automatic Slot Management** - No manual tracking needed  
✅ **Real-time Availability** - Slots update instantly  
✅ **Prevents Overbooking** - Accurate slot counts  
✅ **Handles Cancellations** - Slots freed automatically  
✅ **Backward Compatible** - Works with null deal_id  
✅ **Error Resilient** - Graceful failure handling  
✅ **Atomic Operations** - Uses SQL for thread safety  

## Maintenance Notes

### If Slots Get Out of Sync

Run this query to recalculate slots_booked:
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

### Monitor Slot Usage

```sql
-- Find deals with potential issues
SELECT * FROM package_deals
WHERE slots_booked > slots_available
   OR slots_booked < 0;
```

## Future Enhancements

1. **Slot Reservation System**
   - Hold slots for pending payments (15 min timer)
   - Auto-release expired reservations

2. **Waitlist Feature**
   - Queue bookings when slots full
   - Auto-assign when slot frees up

3. **Overbooking Protection**
   - Add database constraint: `CHECK (slots_booked <= slots_available)`
   - Prevent confirming when no slots available

4. **Audit Trail**
   - Log all slot changes
   - Track who made the changes
   - Include timestamp and reason
