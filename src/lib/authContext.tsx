// @ts-nocheck
/**
 * Authentication Context
 * Manages admin user authentication state
 * Type checking disabled pending database type generation
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabase'

interface Admin {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'super_admin'
}

interface AuthContextType {
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAdminProfile(session.user.id)
      } else {
        setAdmin(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await fetchAdminProfile(session.user.id)
      } else {
        // Check localStorage for demo mode
        const storedAdmin = localStorage.getItem('pahal_admin')
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin))
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoading(false)
    }
  }

  const fetchAdminProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error || !data) {
        // User is not an admin
        await supabase.auth.signOut()
        setAdmin(null)
      } else {
        setAdmin({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        })
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      // Demo mode: Check hardcoded admin credentials
      // In production, this would use Supabase auth
      const demoAdmins = [
        { email: 'admin@pahal.in', password: 'admin123', full_name: 'Admin User', role: 'admin' as const },
        { email: 'superadmin@pahal.in', password: 'super123', full_name: 'Super Admin', role: 'super_admin' as const },
      ]

      const demoAdmin = demoAdmins.find(a => a.email === email && a.password === password)

      if (demoAdmin) {
        const adminData: Admin = {
          id: 'demo-' + Date.now(),
          email: demoAdmin.email,
          full_name: demoAdmin.full_name,
          role: demoAdmin.role,
        }
        setAdmin(adminData)
        localStorage.setItem('pahal_admin', JSON.stringify(adminData))
        return { success: true }
      }

      // Try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: 'Invalid email or password' }
      }

      if (data.user) {
        // Check if user is in admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (adminError || !adminData) {
          await supabase.auth.signOut()
          return { success: false, error: 'You are not authorized as an admin' }
        }

        setAdmin({
          id: adminData.id,
          email: adminData.email,
          full_name: adminData.full_name,
          role: adminData.role,
        })

        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An error occurred during login' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      localStorage.removeItem('pahal_admin')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
