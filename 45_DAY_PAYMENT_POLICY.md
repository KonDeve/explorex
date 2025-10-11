# 45-Day Payment Policy

## Overview
This document explains the automatic cancellation policy for bookings with remaining balance that are less than 45 days before travel.

## Policy Summary

**Key Rule:** Bookings with unpaid remaining balance MUST be paid at least 45 days before the check-in date. If not paid by this deadline, the booking will be **automatically cancelled** and is **non-refundable**.

### Why This Policy?

1. **Planning & Logistics** - Gives the travel company enough time to finalize arrangements
2. **Vendor Commitments** - Many hotels and services require payment 45+ days in advance
3. **Inventory Management** - Allows time to re-sell slots if customer doesn't complete payment
4. **Customer Commitment** - Ensures serious bookings, reducing last-minute cancellations

## Payment Options

### Full Payment (100%)
- Customer pays entire amount at booking
- ✅ No risk of auto-cancellation
- Booking confirmed immediately after admin approval

### Partial Payment (50%)
- Available ONLY for bookings 45+ days before travel
- Customer pays 50% at booking
- Remaining 50% must be paid before reaching 45-day deadline
- ⚠️ Risk of auto-cancellation if balance not paid in time

## Workflow

### At Booking Time

**Scenario 1: Booking 60 days before travel**
```
Travel Date: Jan 1, 2026
Booking Date: Nov 2, 2025
Days Until Travel: 60 days ✅

Options Available:
✅ Full Payment (100%) - ₱50,000
✅ Partial Payment (50%) - ₱25,000 now, ₱25,000 before Dec 17
```

**Scenario 2: Booking 30 days before travel**
```
Travel Date: Jan 1, 2026
Booking Date: Dec 2, 2025
Days Until Travel: 30 days ⚠️

Options Available:
✅ Full Payment (100%) - ₱50,000
❌ Partial Payment - NOT AVAILABLE (less than 45 days)
```

### After Booking

**Timeline Example:**
```
Dec 1: Customer books with 50% partial payment (₱25,000)
       Travel date: Feb 15, 2026 (76 days away)
       Status: Pending → Admin confirms → Confirmed
       
Dec 15: Still 61 days until travel
        Remaining balance: ₱25,000
        Status: Can still pay ✅
        
Jan 1:  Now 45 days until travel (DEADLINE)
        Remaining balance: ₱25,000
        Status: Last day to pay ⚠️
        
Jan 2:  Now 44 days until travel
        Remaining balance: ₱25,000
        Status: AUTO-CANCELLED ❌
        Refund: None (non-refundable)
```

## Implementation

### Customer Dashboard

**1. Payment Status Indicators**

When customer views their bookings, they see:

```jsx
// Green badge - Fully paid, no action needed
✅ Paid

// Orange badge - Partial payment made
⚠️ Partial Payment

// With days remaining indicator
📅 46 days until travel - Pay by Jan 1
```

**2. Warning Banner (< 45 days)**

If booking has remaining balance and is within 45 days:

```jsx
┌─────────────────────────────────────────────────┐
│ ⚠️ Payment Deadline Passed                      │
│                                                  │
│ This booking is less than 45 days before travel │
│ (44 days remaining). Payment can no longer be   │
│ processed. This booking will be automatically   │
│ cancelled and is non-refundable.                │
└─────────────────────────────────────────────────┘

[Payment Unavailable] ← Disabled button
```

**3. Pay Remaining Balance Button**

```jsx
// Available (> 45 days before travel)
[💳 Pay Remaining Balance] ← Active, clickable

// Unavailable (< 45 days before travel)
[💳 Payment Unavailable] ← Disabled, greyed out
```

### Auto-Cancellation System

**Function:** `autoCancelExpiredBookings()`
**Location:** `lib/bookings.js`
**Triggers:** Runs automatically when user loads dashboard

**Logic:**
```javascript
1. Find bookings where:
   - Status: 'pending' or 'confirmed'
   - remaining_balance > 0
   - check_in_date <= (today + 45 days)

2. For each booking found:
   - Update status to 'cancelled'
   - If was 'confirmed', restore the package deal slot
   - Log cancellation
   - (Future: Send email notification)

3. Return results:
   - Number of bookings cancelled
   - List of affected customers
```

### Payment Validation

When customer clicks "Pay Remaining Balance":

```javascript
const handlePayNow = async (booking) => {
  // Calculate days until trip
  const checkInDate = new Date(booking.check_in_date)
  const today = new Date()
  const daysUntilTrip = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24))

  // Block payment if < 45 days
  if (daysUntilTrip < 45) {
    alert(
      `This booking cannot be paid as it is less than 45 days before travel ` +
      `(${daysUntilTrip} days remaining).\n\n` +
      `According to our policy, bookings with remaining balance must be paid ` +
      `at least 45 days before travel.\n\n` +
      `This booking will be automatically cancelled and is non-refundable.`
    )
    window.location.reload() // Refresh to show cancellation
    return
  }

  // Proceed with PayMongo checkout
  // ...
}
```

## Database Schema

### bookings table
```sql
- check_in_date: DATE (travel start date)
- remaining_balance: DECIMAL (unpaid amount)
- status: ENUM ('pending', 'confirmed', 'cancelled', 'completed')
- payment_status: ENUM ('pending', 'partial', 'paid')
```

### Key Query
Find bookings at risk:
```sql
SELECT 
  b.id,
  b.booking_number,
  b.customer_first_name,
  b.customer_email,
  b.check_in_date,
  b.remaining_balance,
  b.status,
  (b.check_in_date - CURRENT_DATE) as days_until_travel
FROM bookings b
WHERE 
  b.status IN ('pending', 'confirmed')
  AND b.remaining_balance > 0
  AND b.check_in_date <= (CURRENT_DATE + INTERVAL '45 days')
ORDER BY b.check_in_date ASC;
```

## Customer Communication

### At Booking Confirmation
Email should include:
```
✅ Booking Confirmed - BK-001

Important: Payment Deadline
Your partial payment of ₱25,000 has been received.

Remaining Balance: ₱25,000
Payment Deadline: January 1, 2026
Days Remaining: 75 days

⚠️ IMPORTANT: The remaining balance MUST be paid at least 45 days 
before your travel date. If not paid by the deadline, your booking 
will be automatically cancelled with NO REFUND.

[Pay Remaining Balance Now]
```

### Reminder Email (60 days before)
```
📅 Payment Reminder - BK-001

Your trip to Santorini is coming up!

Travel Date: February 15, 2026
Days Until Travel: 60 days
Remaining Balance: ₱25,000
Payment Deadline: January 1, 2026 (15 days remaining)

⚠️ Don't forget to pay your remaining balance before the 45-day 
deadline to avoid automatic cancellation.

[Pay Now]
```

### Warning Email (50 days before)
```
⚠️ URGENT: Payment Required - BK-001

Your booking is approaching the payment deadline!

Travel Date: February 15, 2026
Days Until Travel: 50 days
Remaining Balance: ₱25,000
Payment Deadline: January 1, 2026 (5 DAYS LEFT!)

🚨 IMPORTANT: If payment is not received within 5 days, your booking 
will be AUTOMATICALLY CANCELLED and your partial payment will NOT be 
refunded.

[Pay Immediately]
```

### Auto-Cancellation Email
```
❌ Booking Cancelled - BK-001

Your booking has been automatically cancelled due to unpaid remaining 
balance.

Cancellation Date: January 2, 2026
Cancellation Reason: Remaining balance not paid within 45-day deadline

Original Booking Details:
- Package: Santorini Romantic Getaway
- Travel Date: February 15, 2026
- Total Amount: ₱50,000
- Amount Paid: ₱25,000
- Remaining Balance: ₱25,000 (unpaid)

Refund Policy:
According to our terms and conditions, bookings cancelled due to 
unpaid balance within 45 days of travel are NON-REFUNDABLE. Your 
partial payment of ₱25,000 will not be refunded.

We're sorry to see you go. If you'd like to book again, please visit 
our website.
```

## Edge Cases

### Case 1: Customer pays on the 45th day
```
Days until travel: 45 (exactly)
Action: Payment ALLOWED ✅
Deadline: Not yet reached
```

### Case 2: Customer pays on the 44th day
```
Days until travel: 44
Action: Payment BLOCKED ❌
Deadline: Already passed
Booking: Will be auto-cancelled
```

### Case 3: Admin manually confirms booking within 45 days
```
Days until travel: 30
Remaining balance: ₱10,000
Admin action: Confirms booking
System: Allows (admin override)
Note: Customer still cannot pay via dashboard
```

### Case 4: Customer books with full payment within 45 days
```
Days until travel: 30
Payment option: Full payment only
Remaining balance: ₱0
Action: Booking created successfully ✅
No risk: No auto-cancellation (fully paid)
```

## Testing Checklist

- [ ] Book package 60 days before travel with partial payment
- [ ] Verify "Pay Remaining Balance" button is visible and active
- [ ] Fast-forward system date to 46 days before travel
- [ ] Verify payment button still works
- [ ] Fast-forward system date to 44 days before travel
- [ ] Verify warning banner appears
- [ ] Verify payment button is disabled
- [ ] Click payment button - should show alert and not proceed
- [ ] Load dashboard - booking should auto-cancel
- [ ] Verify booking status changed to 'cancelled'
- [ ] If booking was confirmed, verify slot was restored
- [ ] Verify no refund is issued (amount_paid unchanged)
- [ ] Try to book within 45 days - verify only full payment available

## Admin Tools

### Manual Override
Admin can still manually confirm bookings within 45 days if needed (special cases, travel agent bookings, etc.)

### View At-Risk Bookings
```sql
-- Dashboard query for admin
SELECT 
  b.booking_number,
  b.customer_first_name,
  b.customer_last_name,
  b.customer_email,
  p.title as package_name,
  b.check_in_date,
  b.remaining_balance,
  (b.check_in_date - CURRENT_DATE) as days_until_travel,
  CASE 
    WHEN (b.check_in_date - CURRENT_DATE) < 45 THEN '🔴 URGENT'
    WHEN (b.check_in_date - CURRENT_DATE) BETWEEN 45 AND 60 THEN '🟡 WARNING'
    ELSE '🟢 OK'
  END as risk_level
FROM bookings b
LEFT JOIN packages p ON b.package_id = p.id
WHERE 
  b.status IN ('pending', 'confirmed')
  AND b.remaining_balance > 0
ORDER BY b.check_in_date ASC;
```

## Configuration

To change the 45-day policy to a different number of days:

**Files to update:**
1. `lib/bookings.js` - `autoCancelExpiredBookings()` function
2. `app/dashboard/page.jsx` - `handlePayNow()` validation
3. `app/dashboard/page.jsx` - Warning banner condition
4. `app/packages/[slug]/book/page.jsx` - Partial payment availability check
5. This documentation file

**Search for:** `45` and `deadline.setDate(deadline.getDate() + 45)`

## Summary

✅ **Partial payments available**: Only if booking is 45+ days before travel  
✅ **Payment deadline**: Must pay remaining balance before reaching 45 days  
⚠️ **Within 45 days**: Payment button disabled, booking at risk  
❌ **Auto-cancellation**: Automatic if unpaid when deadline passes  
💰 **Non-refundable**: Partial payments are NOT refunded when auto-cancelled  
📧 **Email reminders**: (Future) Notify customers at 60, 50, and 46 days  

This policy protects both the business and encourages timely payment commitments from customers.
