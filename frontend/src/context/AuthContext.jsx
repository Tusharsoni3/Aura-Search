import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { authAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/get-me')
      const fetchedUser = res.data?.user ?? res.data
      setUser(fetchedUser)
      setIsAuthenticated(true)
      return fetchedUser
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
  }, [])

  useEffect(() => {
    fetchMe().finally(() => setLoading(false))
  }, [fetchMe])

  const login = useCallback(async (data) => {
    const res = await authAPI.login(data)
    const loggedInUser = await fetchMe()
    return { response: res, user: loggedInUser }
  }, [fetchMe])

  const signup = useCallback(async (data) => {
    const res = await authAPI.signup(data)
    const signedUpUser = res.data?.user ?? res.data
    if (signedUpUser) {
      setUser(signedUpUser)
      setIsAuthenticated(true)
    }
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('[AuthContext] Logout request failed:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      if (!prev) return data
      return { ...prev, ...data }
    })
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    refetchUser: fetchMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
