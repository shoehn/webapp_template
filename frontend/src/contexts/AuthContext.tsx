import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthAPI, User, RegisterData, LoginData } from '../api/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refresh_token')
  )

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthAPI.me()
        setUser(currentUser)
      } catch (err) {
        // If token is invalid, try to refresh
        if (refreshToken) {
          try {
            const response = await AuthAPI.refresh(refreshToken)
            setUser(response.user)
            localStorage.setItem('refresh_token', response.refresh_token)
            setRefreshToken(response.refresh_token)
          } catch (refreshErr) {
            // Refresh failed, clear everything
            localStorage.removeItem('refresh_token')
            setRefreshToken(null)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (data: LoginData) => {
    try {
      setError(null)
      setLoading(true)
      const response = await AuthAPI.login(data)
      setUser(response.user)
      localStorage.setItem('refresh_token', response.refresh_token)
      setRefreshToken(response.refresh_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setError(null)
      setLoading(true)
      const response = await AuthAPI.register(data)
      setUser(response.user)
      localStorage.setItem('refresh_token', response.refresh_token)
      setRefreshToken(response.refresh_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (refreshToken) {
        await AuthAPI.logout(refreshToken)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('refresh_token')
      setRefreshToken(null)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
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
