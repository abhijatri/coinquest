import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FullPageSpinner } from '../ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ children, requireProfile = true }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // User is authenticated but hasn't set up profile yet → profile setup
  if (requireProfile && !profile) {
    return <Navigate to="/auth?step=profile" replace />
  }

  return <>{children}</>
}
