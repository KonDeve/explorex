"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange, signOut } from './auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current user on mount
    checkUser()

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(true)
        const result = await getCurrentUser()
        if (result.success) {
          setUser(result.user)
          setProfile(result.profile)
        }
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (event === 'INITIAL_SESSION' && session) {
        setLoading(true)
        const result = await getCurrentUser()
        if (result.success) {
          setUser(result.user)
          setProfile(result.profile)
        }
        setLoading(false)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const result = await getCurrentUser()
      if (result.success && result.user) {
        setUser(result.user)
        setProfile(result.profile)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const result = await signOut()
    if (result.success) {
      setUser(null)
      setProfile(null)
    }
    return result
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    logout,
    refreshUser: checkUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
