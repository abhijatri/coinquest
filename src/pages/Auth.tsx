import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { checkIsEmailLink, completeEmailLink, signInWithGoogle } from '../firebase/auth'
import { MethodSelector } from '../components/auth/MethodSelector'
import { PhoneAuth } from '../components/auth/PhoneAuth'
import { EmailAuth } from '../components/auth/EmailAuth'
import { ProfileSetup } from '../components/auth/ProfileSetup'
import { PageTransition } from '../components/layout/PageTransition'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

type AuthStep = 'method' | 'phone' | 'email' | 'profile'

export function Auth() {
  const { user, profile, loading } = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { showToast } = useToast()
  const [step, setStep] = useState<AuthStep>('method')
  const [emailLinkLoading, setEmailLinkLoading] = useState(false)

  // Determine initial step from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('step') === 'profile') {
      setStep('profile')
    }
  }, [location.search])

  // Handle email link sign-in (redirect back from email click)
  useEffect(() => {
    const url = window.location.href
    if (checkIsEmailLink(url)) {
      setEmailLinkLoading(true)
      completeEmailLink(url)
        .then(() => {
          showToast('Signed in successfully! 🎉', 'success')
          // AuthContext will update; redirect happens below
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg === 'NEED_EMAIL') {
            showToast('Please enter your email to complete sign-in.', 'warning')
          } else {
            showToast('Sign-in link failed or expired. Please try again.', 'error')
          }
        })
        .finally(() => setEmailLinkLoading(false))
    }
  }, [showToast])

  // Redirect when authenticated + has profile
  useEffect(() => {
    if (loading || emailLinkLoading) return
    if (user && profile) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/home'
      navigate(from, { replace: true })
    } else if (user && !profile) {
      setStep('profile')
    }
  }, [user, profile, loading, emailLinkLoading, navigate, location.state])

  if (loading || emailLinkLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Spinner size="lg" label={emailLinkLoading ? 'Completing sign-in…' : 'Loading…'} />
      </div>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 py-10">
      {/* Back to landing on method step */}
      {step === 'method' && (
        <Link
          to="/"
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Home
        </Link>
      )}

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🪙</div>
          <h1 className="text-3xl font-black text-white">
            Coin<span className="text-yellow-400">Quest</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {step === 'method'  && 'Sign in to start playing'}
            {step === 'phone'   && 'Phone number sign-in'}
            {step === 'email'   && 'Email magic link'}
            {step === 'profile' && "Almost ready — set up your profile!"}
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 shadow-2xl">
          {step === 'method' && (
            <MethodSelector
              onGoogle={() => {
                signInWithGoogle().catch(() =>
                    showToast('Google sign-in failed. Please try again.', 'error')
                )
              }}
              onPhone={() => setStep('phone')}
              onEmail={() => setStep('email')}
            />
          )}

          {step === 'phone' && (
            <PhoneAuth
              onBack={() => setStep('method')}
              onSuccess={() => {
                // AuthContext detects auth state; profile check happens in useEffect
              }}
            />
          )}

          {step === 'email' && (
            <EmailAuth onBack={() => setStep('method')} />
          )}

          {step === 'profile' && (
            <ProfileSetup onComplete={() => navigate('/home', { replace: true })} />
          )}
        </div>
      </div>
    </PageTransition>
  )
}
