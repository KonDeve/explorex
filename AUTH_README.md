# Xplorex Authentication System

## Overview
Complete authentication system with Supabase integration for login and signup functionality.

## Architecture

### Backend (Authentication Service)
**File:** `lib/auth.js`

Provides all authentication functions:
- `signUp(email, password, userData)` - Register new users
- `signIn(email, password)` - Login existing users
- `signOut()` - Logout current user
- `getCurrentUser()` - Get current authenticated user
- `getSession()` - Get current session
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update user password
- `onAuthStateChange(callback)` - Listen to auth state changes

### Frontend (UI Components)
- **Login Page:** `app/login/page.jsx`
- **Signup Page:** `app/signup/page.jsx`

## Features

### Sign Up
✅ Form validation (password match, minimum length)
✅ Password visibility toggle
✅ Loading states
✅ Error and success messages
✅ Auto-redirect to login after successful signup
✅ Creates user in both auth and users table
✅ Phone number (optional)

### Login
✅ Email and password authentication
✅ Password visibility toggle
✅ Loading states
✅ Error messages
✅ Role-based redirect (admin → /admin/dashboard, customer → /packages)
✅ Remember session

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Usage Examples

### Sign Up a New User
```javascript
import { signUp } from '@/lib/auth'

const result = await signUp('user@example.com', 'password123', {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+63 912 345 6789'
})

if (result.success) {
  console.log('User created:', result.user)
} else {
  console.error('Error:', result.error)
}
```

### Sign In a User
```javascript
import { signIn } from '@/lib/auth'

const result = await signIn('user@example.com', 'password123')

if (result.success) {
  console.log('Logged in:', result.user)
  console.log('Profile:', result.profile)
} else {
  console.error('Error:', result.error)
}
```

### Get Current User
```javascript
import { getCurrentUser } from '@/lib/auth'

const result = await getCurrentUser()

if (result.success && result.user) {
  console.log('Current user:', result.user)
  console.log('Profile:', result.profile)
}
```

### Sign Out
```javascript
import { signOut } from '@/lib/auth'

const result = await signOut()

if (result.success) {
  console.log('Signed out successfully')
}
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Features

1. **Password Requirements:**
   - Minimum 6 characters
   - Confirmation required on signup

2. **Supabase Auth:**
   - Secure password hashing
   - Session management
   - Email verification (optional)

3. **Role-Based Access:**
   - Admin and customer roles
   - Automatic redirect based on role

4. **Form Protection:**
   - Disabled inputs during loading
   - XSS protection through React
   - CSRF protection through Supabase

## Error Handling

All authentication functions return a consistent response format:
```javascript
{
  success: boolean,
  user?: object,
  session?: object,
  profile?: object,
  message?: string,
  error?: string
}
```

## Next Steps

1. **Email Verification:** Enable in Supabase dashboard
2. **Password Reset:** Implement reset password page
3. **Protected Routes:** Add middleware for authentication checks
4. **Social Login:** Add Google/Facebook OAuth (optional)
5. **Two-Factor Auth:** Implement 2FA (optional)

## Testing

### Test Accounts
Create test accounts through the signup page or Supabase dashboard.

### Admin Account
To create an admin account, manually update the role in Supabase:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Troubleshooting

**Issue:** "Missing Supabase environment variables"
- **Solution:** Ensure `.env.local` exists with correct values

**Issue:** "Failed to create user account"
- **Solution:** Check Supabase project is active and credentials are correct

**Issue:** "Invalid email or password"
- **Solution:** Verify credentials or check if email is confirmed (if required)

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify environment variables are loaded

