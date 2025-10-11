# Fix for User Statistics Showing Zero

## 🔴 Problem Identified

**Symptom:** Admin customers page shows:
- Total Bookings: 0
- Total Spent: ₱0

Even though customers have actual bookings in the database.

**Root Cause:** The `total_bookings` and `total_spent` columns in the `users` table are not being updated. This happens when:
1. Database triggers weren't created yet
2. Triggers were created AFTER existing bookings
3. Triggers aren't working correctly
4. Data was manually inserted without triggers firing

---

## ✅ Solutions Implemented

### Solution 1: Automatic Fallback Calculation (Immediate Fix)

**File:** `lib/userProfile.js` - Updated `getAllCustomers()` function

**What it does:**
- Queries actual bookings for each customer
- Calculates real-time statistics from booking data
- Falls back to calculated values if database values are 0 or null
- Uses database values if they're already correct

**Code added:**
```javascript
// Get actual booking statistics (fallback if database values are wrong)
const { data: bookingStats } = await supabase
  .from('bookings')
  .select('total_amount')
  .eq('user_id', customer.id)

const actualBookingCount = bookingStats?.length || 0
const actualTotalSpent = bookingStats?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0

// Use actual calculated values if database values are 0 or null
total_bookings: customer.total_bookings || actualBookingCount,
total_spent: customer.total_spent || actualTotalSpent,
```

**Result:** ✅ Admin page now shows correct statistics immediately without database changes

---

### Solution 2: Database Fix Script (Long-term Fix)

**File:** `fix-user-statistics.sql`

**What it does:**
1. **Recalculates** all user statistics from actual booking data
2. **Updates** users table with correct values
3. **Recreates** triggers to ensure future bookings update stats automatically

**How to use:**

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix-user-statistics.sql`
3. Click "Run"

**What the script does:**

#### Part 1: Update Existing Data
```sql
UPDATE users
SET 
    total_bookings = (count from bookings),
    total_spent = (sum of total_amount from bookings)
```

#### Part 2: Reset Users with No Bookings
```sql
UPDATE users
SET total_bookings = 0, total_spent = 0
WHERE no bookings exist
```

#### Part 3: Recreate Trigger
```sql
CREATE TRIGGER update_user_stats_trigger 
AFTER INSERT OR UPDATE OR DELETE ON bookings
```

**After running this:** Database values will be correct, and future bookings will auto-update stats.

---

## 🎯 Which Solution to Use?

### **Quick Fix (Already Working):**
✅ Code change in `getAllCustomers()` - **Already deployed**
- No database changes needed
- Works immediately
- Slightly slower (queries bookings for each customer)

### **Permanent Fix (Recommended):**
⚠️ Run `fix-user-statistics.sql` in Supabase SQL Editor
- Updates database to be correct
- Enables triggers for automatic updates
- Faster performance (no extra queries needed)
- One-time setup

---

## 📊 How It Works Now

### Before Fix:
```
Database: users.total_bookings = 0
Database: users.total_spent = 0
Admin Page: Shows 0 and ₱0 ❌
```

### After Code Fix (Current):
```
Database: users.total_bookings = 0
Database: users.total_spent = 0
Code: Queries bookings table → calculates actual values
Admin Page: Shows real values ✅
```

### After Database Fix (Optimal):
```
Database: users.total_bookings = 3 (correct value)
Database: users.total_spent = 7500 (correct value)
Code: Uses database values directly
Admin Page: Shows real values ✅ (faster)
```

---

## 🧪 Testing Steps

### Test 1: Verify Admin Page Shows Data
1. Go to admin customers page
2. Check customer cards/table
3. Should now show actual booking counts and spending ✅

### Test 2: Run Database Fix (Optional but Recommended)
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `fix-user-statistics.sql`
4. Check verification query at the end
5. Confirm `total_bookings` and `total_spent` are correct

### Test 3: Create New Booking
1. Create a new test booking
2. Check if user's `total_bookings` increases by 1
3. Check if user's `total_spent` increases by booking amount
4. This verifies triggers are working ✅

---

## 📝 Files Changed

### Modified:
1. **`lib/userProfile.js`** - Added fallback calculation in `getAllCustomers()`

### Created:
1. **`fix-user-statistics.sql`** - Database fix script
2. **`FIX_USER_STATISTICS_ZERO.md`** - This documentation

---

## 🔧 Maintenance

### If Statistics Get Out of Sync Again:

**Quick check:**
```sql
SELECT 
    u.email,
    u.total_bookings as db_bookings,
    COUNT(b.id) as actual_bookings,
    u.total_spent as db_spent,
    COALESCE(SUM(b.total_amount), 0) as actual_spent
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.email, u.total_bookings, u.total_spent;
```

**If out of sync:**
- Re-run `fix-user-statistics.sql`

---

## ✨ Summary

**Problem:** 
- 🔴 User statistics showing 0 even with bookings

**Immediate Fix (Applied):**
- 🟢 Code calculates stats on-the-fly from bookings table
- 🟢 Admin page now shows correct values
- 🟡 Slightly slower (extra database queries)

**Permanent Fix (Recommended):**
- 🟡 Run `fix-user-statistics.sql` in Supabase
- 🟢 Updates all historical data
- 🟢 Enables automatic updates for future
- 🟢 Better performance

**Status:** 
- ✅ **Immediate issue fixed** - Admin page works now
- ⚠️ **Action needed** - Run SQL script for optimal performance

**Next Step:** 
Run `fix-user-statistics.sql` in Supabase SQL Editor (takes 1 minute)
