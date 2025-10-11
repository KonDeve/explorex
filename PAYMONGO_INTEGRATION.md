# PayMongo Payment Integration - Implementation Guide

## Overview
This document describes the PayMongo payment gateway integration for the ExplorEx travel booking platform. The integration allows customers to pay for their bookings securely through PayMongo's checkout page.

## API Keys Configuration
The application uses environment variables for API keys. Set the following in your `.env.local` file:

```env
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=your_public_key_here
PAYMONGO_SECRET_KEY=your_secret_key_here
```

⚠️ **Important**: 
- Use test keys for development (prefix: `pk_test_` and `sk_test_`)
- Use production keys for live environment (prefix: `pk_live_` and `sk_live_`)
- Never commit API keys to version control

## Files Modified/Created

### 1. **lib/paymongo.js** (Created)
PayMongo API integration utilities with the following functions:

- `createCheckoutSession(paymentData)` - Creates a checkout session with PayMongo
  - Parameters:
    - `amount`: Payment amount in PHP
    - `description`: Payment description
    - `lineItems`: Array of items being purchased
    - `billing`: Customer billing information (name, email)
    - `successUrl`: URL to redirect after successful payment
    - `cancelUrl`: URL to redirect if payment is cancelled
  - Returns: `{ success, checkoutUrl, sessionId, session }`

- `getCheckoutSession(sessionId)` - Retrieves checkout session details
  - Returns: Session data including payment status

- `createPaymentIntent(paymentData)` - Alternative payment method

### 2. **lib/bookings.js** (Modified)
Added new function:

- `processPayment(bookingId, paymentData)` - Processes payment and updates booking
  - Updates booking's `payment_status`, `amount_paid`, `remaining_balance`
  - Creates entry in `payments` table
  - Automatically determines if payment is 'paid' or 'partial' based on amount
  - Parameters:
    - `bookingId`: The booking ID
    - `paymentData`: Object containing `amount`, `payment_method`, `transaction_id`
  - Returns: `{ success, booking, payment, message }`

### 3. **app/dashboard/trip/[slug]/payment/page.jsx** (Modified)
Payment page with PayMongo integration:

- Added `createCheckoutSession` import from `@/lib/paymongo`
- Added `isProcessing` state to manage payment button state
- Added `handlePayment()` function:
  - Calculates payment amount based on selected option (full or partial)
  - Creates line items with package details
  - Calls PayMongo to create checkout session
  - Redirects user to PayMongo checkout page
- Updated "Complete Payment" button:
  - Calls `handlePayment()` instead of navigating to success page
  - Shows loading state with spinner during processing
  - Disabled during processing to prevent double-clicks

### 4. **app/dashboard/trip/[slug]/payment/success/page.jsx** (Modified)
Payment success/verification page:

- Reads `session_id` and `booking_id` from URL query parameters
- Calls `getCheckoutSession()` to verify payment with PayMongo
- Verifies payment status is 'paid'
- Calls `processPayment()` to update Supabase database
- Shows three states:
  - **Loading**: While verifying payment
  - **Success**: Payment verified and database updated
  - **Error**: Payment failed or verification error
- Displays payment details including amount, method, and transaction ID
- Maintains existing Lottie animation for success state
- Shows user-friendly error messages with support contact

## Payment Flow

1. **User initiates payment**:
   - User selects payment option (full or partial - 30% down payment)
   - Clicks "Complete Payment" button
   - Button shows loading state

2. **Checkout session created**:
   - `handlePayment()` creates PayMongo checkout session
   - Includes booking details, amount, customer info
   - Success URL includes `session_id` and `booking_id` parameters

3. **User redirected to PayMongo**:
   - User completes payment on PayMongo's secure page
   - Supports multiple payment methods:
     - Credit/Debit Cards
     - GCash
     - PayMaya
     - GrabPay

4. **Payment processed**:
   - PayMongo processes the payment
   - User redirected back to success page with session details

5. **Verification and database update**:
   - Success page retrieves PayMongo session
   - Verifies payment status is 'paid'
   - Calls `processPayment()` to update Supabase:
     - Updates `bookings` table (payment_status, amount_paid, remaining_balance)
     - Creates entry in `payments` table
   - Shows success message with payment details

## Database Updates

### Bookings Table
When payment is processed:
- `payment_status`: Updated to 'paid' (full payment) or 'partial' (partial payment)
- `amount_paid`: Incremented by payment amount
- `remaining_balance`: Decremented by payment amount
- `updated_at`: Updated to current timestamp

### Payments Table
New record created with:
- `booking_id`: Reference to the booking
- `user_id`: Customer who made payment
- `amount`: Payment amount in PHP
- `payment_method`: 'paymongo' or specific method used
- `status`: 'completed'
- `transaction_id`: PayMongo transaction/session ID
- `payment_date`: Current timestamp
- `created_at`: Current timestamp

## Payment Options

### Full Payment
- Pays entire remaining balance
- No additional fees
- Payment status set to 'paid' upon completion

### Partial Payment (30% Down Payment)
- Pays 30% of remaining balance upfront
- Remaining 70% due before travel date
- Payment status set to 'partial' upon completion
- Shows payment schedule with due dates

## Error Handling

The integration includes comprehensive error handling:

1. **Checkout creation errors**:
   - Network failures
   - API errors
   - Invalid parameters
   - Shows alert to user: "Failed to initiate payment. Please try again."

2. **Payment verification errors**:
   - Missing session_id or booking_id
   - PayMongo API errors
   - Payment not in 'paid' status
   - Shows error page with message and support contact

3. **Database update errors**:
   - Booking not found
   - Database connection issues
   - Shows error: "Failed to update booking. Please contact support."

## Security Features

1. **API Key Protection**:
   - Secret key only used server-side in API calls
   - Never exposed to client

2. **Payment Verification**:
   - Always verify payment status with PayMongo before updating database
   - Don't trust client-side parameters alone

3. **Session Validation**:
   - Validates session_id from PayMongo
   - Verifies booking_id belongs to correct user

4. **Encrypted Communication**:
   - All PayMongo API calls use HTTPS
   - Uses Basic Auth with base64-encoded secret key

## Testing

### Test Cards (PayMongo Test Mode)
Use these test cards on PayMongo checkout:

- **Success**: 4343434343434345
- **Failed**: 4571736000000075
- **3D Secure**: 4120000000000007

All test cards:
- CVV: Any 3 digits
- Expiry: Any future date

### Test GCash/PayMaya
In test mode, PayMongo provides mock payment pages that automatically succeed.

## Production Checklist

Before going live:

- [ ] Replace test API keys with production keys in `lib/paymongo.js`
- [ ] Update `successUrl` and `cancelUrl` to production URLs
- [ ] Test with real payment methods
- [ ] Set up webhook handler for payment notifications (recommended)
- [ ] Enable email receipts for customers
- [ ] Implement refund functionality if needed
- [ ] Add payment history page for users
- [ ] Set up monitoring for failed payments

## Future Enhancements

1. **Webhook Integration**:
   - Listen for PayMongo webhook events
   - Handle payment updates asynchronously
   - More reliable than redirect-based verification

2. **Payment History**:
   - Show all payments made for a booking
   - Allow users to view receipts

3. **Refund Support**:
   - Admin ability to refund payments
   - Integration with PayMongo refund API

4. **Payment Reminders**:
   - Email reminders for partial payment balance
   - Automated notifications before due date

5. **Multiple Payment Methods**:
   - Bank transfer
   - Over-the-counter payments
   - Installment plans

## Support

For PayMongo API documentation:
- https://developers.paymongo.com/reference

For ExplorEx support:
- support@explorex.com
