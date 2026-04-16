import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile, getUserStats, createUserProfile, updateLastSeen } from '../firebase/firestore'
import type { UserProfile, UserStats, AuthContextValue } from '../types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats]     = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async (u: User) => {
    try {
      const [p, s] = await Promise.all([getUserProfile(u.uid), getUserStats(u.uid)])
      setProfile(p)
      setStats(s)
      if (p) updateLastSeen(u.uid).catch(() => undefined)
    } catch {
      setProfile(null)
      setStats(null)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    if (!user) return
    try {
      const [p, s] = await Promise.all([getUserProfile(user.uid), getUserStats(user.uid)])
      setProfile(p)
      setStats(s)
    } catch {
      // Silently fail — stale data is fine
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await loadUserData(u)
      } else {
        setProfile(null)
        setStats(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [loadUserData])

  return (
    <AuthContext.Provider value={{ user, profile, stats, loading, refreshStats }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Re-export for convenience in Profile setup
export { createUserProfile }
