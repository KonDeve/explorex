# Duplicate Payment Prevention Guide

## Current Issues That Could Cause Duplicate Payments

### 1. **No Idempotency Check in `processPayment()`**
The `processPayment()` function doesn't check if a payment with the same `transaction_id` already exists. If a user:
- Refreshes the success page
- Clicks back and forward in browser
- PayMongo sends a duplicate webhook
- Network issues cause retry

**Result:** The same payment gets recorded multiple times.

### 2. **Success Page Runs on Every Mount**
The `useEffect` in `success/page.jsx` runs every time the component mounts without checking if payment was already processed.

### 3. **No Payment Status Validation**
Before processing payment, there's no check to ensure the booking status allows payment (e.g., preventing payment on already "paid" bookings).

### 4. **No Transaction Lock**
Multiple simultaneous requests could process the same payment concurrently.

---

## Solutions to Implement

### Solution 1: Add Idempotency Check (CRITICAL)

Update `processPayment()` in `lib/bookings.js`:

```javascript
export const processPayment = async (bookingId, paymentData) => {
  try {
    // CHECK 1: Verify if this transaction_id already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', paymentData.transaction_id)
      .single()

    if (existingPayment) {
      console.log('Payment already processed:', paymentData.transaction_id)
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Payment already processed'
      }
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    // CHECK 2: Don't process payment if booking is already fully paid
    if (booking.payment_status === 'paid' && booking.remaining_balance <= 0) {
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Booking is already fully paid'
      }
    }

    // Rest of the payment processing logic...
    // (continue with existing code)
  }
}
```

### Solution 2: Prevent Re-execution on Success Page

Update `app/dashboard/trip/[slug]/payment/success/page.jsx`:

```javascript
useEffect(() => {
  // Use ref to ensure payment is only verified once
  let isVerifying = false

  const verifyPayment = async () => {
    if (isVerifying) return // Prevent duplicate execution
    isVerifying = true

    try {
      // ... existing verification logic
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('error')
      setMessage('An error occurred while processing your payment.')
    }
  }

  verifyPayment()

  // Cleanup function
  return () => {
    isVerifying = false
  }
}, []) // Empty dependency array - run only once
```

### Solution 3: Add Unique Constraint to Database

Add to your Supabase SQL:

```sql
-- Prevent duplicate transaction_ids in payments table
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_id 
ON payments(transaction_id) 
WHERE transaction_id IS NOT NULL;
```

This ensures database-level protection against duplicates.

### Solution 4: Disable Button During Processing

Already implemented in `payment/page.jsx`:
```javascript
const [isProcessing, setIsProcessing] = useState(false)

<button 
  onClick={handlePayment}
  disabled={isProcessing}
  className={isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
>
  {isProcessing ? 'Processing...' : 'Complete Payment'}
</button>
```

---

## Immediate Action Required

### Priority 1: Update `processPayment()` Function
Add the idempotency check as shown in Solution 1.

### Priority 2: Add Database Constraint
Run the SQL query from Solution 3 in your Supabase SQL editor.

### Priority 3: Update Success Page
Modify the `useEffect` to use a ref to prevent re-execution.

---

## Testing Checklist

After implementing fixes, test these scenarios:

- [ ] Refresh the success page multiple times
- [ ] Click browser back/forward on success page
- [ ] Submit payment twice rapidly
- [ ] Simulate slow network (check Network tab throttling)
- [ ] Open success page URL directly in new tab
- [ ] Check database for duplicate payment records

---

## Current Risk Level: 🔴 HIGH

Without these fixes, users can accidentally:
1. Be charged multiple times
2. Have inflated payment records
3. Incorrect booking balances
4. Data integrity issues

Implement Priority 1 and 2 immediately.
