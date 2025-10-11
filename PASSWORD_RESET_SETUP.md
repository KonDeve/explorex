# Password Reset Email Configuration Guide

## Overview
The password reset functionality is now implemented. Users can request a password reset link via email.

## How It Works

### User Flow:
1. User clicks "Forget Password?" on login page
2. User enters their email address
3. System sends reset link to their email
4. User clicks the link in email
5. User enters new password
6. User is redirected to login page

## Supabase Email Template Configuration

You need to configure the email template in your Supabase dashboard:

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Configure Email Template**
   - Go to: `Authentication` → `Email Templates`
   - Select: `Reset Password` template

3. **Update the Email Template**

Replace the default template with:

```html
<h2>Reset Password</h2>

<p>Hello,</p>

<p>Follow this link to reset the password for your Xplorex account:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>This link will expire in 24 hours.</p>

<p>Best regards,<br>
The Xplorex Team</p>
```

4. **Configure Redirect URL (Important!)**
   - Go to: `Authentication` → `URL Configuration`
   - Add your redirect URL: `http://localhost:3000/reset-password` (for development)
   - For production: `https://yourdomain.com/reset-password`

5. **Email Settings**
   - Go to: `Project Settings` → `Auth`
   - Scroll to: "Email Auth"
   - Ensure "Enable Email Confirmations" is checked
   - Set "Confirmation URL": Leave default or set custom domain

## Files Created

### 1. `/app/forgot-password/page.jsx`
- Forgot password form
- Sends reset email via Supabase
- Shows success/error messages

### 2. `/app/reset-password/page.jsx`
- Reset password form
- Validates reset token
- Updates user password
- Redirects to login on success

### 3. Updated `/app/login/page.jsx`
- "Forget Password?" link now points to `/forgot-password`

## Features

✅ **Email Validation**: Checks if email is registered
✅ **Secure Token**: Supabase generates secure reset token
✅ **Password Strength**: Minimum 6 characters
✅ **Password Confirmation**: Must match
✅ **Session Validation**: Verifies valid reset link
✅ **Auto-redirect**: After successful reset
✅ **Error Handling**: Clear error messages
✅ **Loading States**: Visual feedback during operations

## Security Features

- Reset links expire after 24 hours (Supabase default)
- One-time use tokens
- Secure session validation
- Password requirements enforced
- No password shown in URL

## Testing

1. Go to: http://localhost:3000/login
2. Click "Forget Password?"
3. Enter registered email
4. Check email inbox for reset link
5. Click link to reset password
6. Enter new password
7. Confirm you can login with new password

## Troubleshooting

### Email Not Received?
- Check spam/junk folder
- Verify email in Supabase Auth users
- Check Supabase email logs
- Ensure SMTP is configured in Supabase

### Reset Link Not Working?
- Check if link expired (24 hours)
- Verify redirect URL is configured correctly
- Check browser console for errors

### Password Not Updating?
- Ensure password meets requirements (6+ chars)
- Check if passwords match
- Verify valid session from reset link

## Production Deployment

Before deploying to production:

1. Update redirect URLs in Supabase:
   - Replace `localhost:3000` with your domain
   - Add production domain to allowed redirect URLs

2. Customize email template:
   - Add your logo
   - Match your brand colors
   - Update support contact info

3. Test thoroughly:
   - Test with real email addresses
   - Verify emails are delivered
   - Check all error cases

## Support

If you encounter issues:
- Check Supabase logs: Dashboard → Logs
- Check browser console for errors
- Verify Supabase Auth configuration
