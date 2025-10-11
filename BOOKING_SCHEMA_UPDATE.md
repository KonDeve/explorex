# BOOKING SCHEMA UPDATE - SIMPLIFIED

## Issue Fixed
The booking creation was failing with error:
```
Could not find the 'service_fee' column of 'bookings' in the schema cache
```

And the `amount_paid` column was not being populated after PayMongo payment.

## Changes Made

### 1. Updated `lib/bookings.js` - `createBooking()` function

**Removed columns that don't exist in your schema:**
- ❌ `deal_id`
- ❌ `adults_count`
- ❌ `children_count`
- ❌ `children_price`
- ❌ `service_fee`
- ❌ `taxes`
- ❌ `special_requests`
- ❌ `payment_due_date`

**Kept only columns from your actual schema:**
- ✅ `booking_number`
- ✅ `user_id`
- ✅ `package_id`
- ✅ `customer_first_name`
- ✅ `customer_last_name`
- ✅ `customer_email`
- ✅ `customer_phone`
- ✅ `check_in_date`
- ✅ `check_out_date`
- ✅ `total_guests` (formatted as "1 Adult" or "2 Adults")
- ✅ `status` (default: 'pending')
- ✅ `booking_type` (default: 'upcoming')
- ✅ `base_price`
- ✅ `discount` (default: 0.00)
- ✅ `total_amount`
- ✅ `payment_status` (auto-calculated: 'paid', 'partial', or 'pending')
- ✅ `amount_paid` (from PayMongo payment)
- ✅ `remaining_balance` (auto-calculated)
- ✅ `booking_date`
- ✅ `created_at` (auto)
- ✅ `updated_at` (auto)

**Payment Logic:**
```javascript
// Automatically calculates payment status
const paid = bookingData.amountToPay
const total = bookingData.totalAmount

if (paid >= total) → payment_status = 'paid'
if (paid > 0) → payment_status = 'partial'
else → payment_status = 'pending'

amount_paid = amountToPay
remaining_balance = total - paid
```

### 2. Updated `app/packages/[slug]/book/payment/success/page.jsx`

**Fixed payment amount passing:**
```javascript
const bookingResult = await createBooking({
  ...bookingData,
  paymentSessionId: sessionId,
  paymentStatus: 'paid',
  amountPaid: bookingData.amountToPay, // ✅ Now explicitly passed
  remainingAmount: bookingData.remainingAmount || 0
})
```

## Your Simplified Schema

```sql
CREATE TABLE public.bookings (
  -- IDs
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  booking_number varchar(50) UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  
  -- Customer Info
  customer_first_name varchar(100) NOT NULL,
  customer_last_name varchar(100) NOT NULL,
  customer_email varchar(255) NOT NULL,
  customer_phone varchar(20) NOT NULL,
  
  -- Travel Details
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_guests varchar(50) NOT NULL,
  
  -- Status
  status varchar(20) DEFAULT 'pending',
  booking_type varchar(20) DEFAULT 'upcoming',
  
  -- Pricing
  base_price numeric(10,2) NOT NULL,
  discount numeric(10,2) DEFAULT 0.00,
  total_amount numeric(10,2) NOT NULL,
  
  -- Payment
  payment_status varchar(20) DEFAULT 'pending',
  amount_paid numeric(10,2) DEFAULT 0.00,
  remaining_balance numeric(10,2) DEFAULT 0.00,
  
  -- Timestamps
  booking_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Payment Flow Now Works Correctly

### Full Payment:
1. User pays 100% via PayMongo → `amountToPay = totalAmount`
2. Booking created with:
   - `amount_paid = totalAmount`
   - `remaining_balance = 0`
   - `payment_status = 'paid'`

### Partial Payment (50%):
1. User pays 50% via PayMongo → `amountToPay = totalAmount * 0.50`
2. Booking created with:
   - `amount_paid = totalAmount * 0.50`
   - `remaining_balance = totalAmount * 0.50`
   - `payment_status = 'partial'`

## Testing

After this fix:
1. ✅ Booking creation won't fail with schema errors
2. ✅ `amount_paid` will be correctly populated with PayMongo payment amount
3. ✅ `remaining_balance` will be automatically calculated
4. ✅ `payment_status` will be set correctly ('paid' or 'partial')
5. ✅ `total_guests` will show "1 Adult" by default

## Files Modified

1. **`lib/bookings.js`** - Updated `createBooking()` to match simplified schema
2. **`app/packages/[slug]/book/payment/success/page.jsx`** - Pass `amountPaid` explicitly

The booking system now works with your simplified schema! 🎉
