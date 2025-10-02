import { supabase } from './supabase'

/**
 * Authentication Service
 * Handles all authentication-related operations with Supabase
 */

// Sign up a new user
export const signUp = async (email, password, userData) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    })

    if (authError) throw authError

    // If auth successful, create user profile in users table
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || null,
          role: 'customer',
          status: 'active'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Note: Auth user is already created, but profile failed
        return {
          success: true,
          user: authData.user,
          session: authData.session,
          warning: 'User created but profile setup incomplete'
        }
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        profile: profileData,
        message: 'Account created successfully! Please check your email to verify your account.'
      }
    }

    return {
      success: false,
      error: 'Failed to create user account'
    }

  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: error.message || 'An error occurred during sign up'
    }
  }
}

// Sign in an existing user
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Fetch user profile from users table
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile: profileData,
        message: 'Signed in successfully!'
      }
    }

    return {
      success: false,
      error: 'Failed to sign in'
    }

  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: error.message || 'Invalid email or password'
    }
  }
}

// Sign out current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error

    return {
      success: true,
      message: 'Signed out successfully!'
    }

  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error.message || 'An error occurred during sign out'
    }
  }
}

// Get current user session
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error

    if (user) {
      // Fetch full profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        success: true,
        user,
        profile: profileData
      }
    }

    return {
      success: false,
      user: null
    }

  } catch (error) {
    console.error('Get current user error:', error)
    return {
      success: false,
      user: null,
      error: error.message
    }
  }
}

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error

    return {
      success: true,
      session
    }

  } catch (error) {
    console.error('Get session error:', error)
    return {
      success: false,
      session: null,
      error: error.message
    }
  }
}

// Reset password - send reset email
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
    }

  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send reset email'
    }
  }
}

// Update password
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return {
      success: true,
      message: 'Password updated successfully!'
    }

  } catch (error) {
    console.error('Update password error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update password'
    }
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
