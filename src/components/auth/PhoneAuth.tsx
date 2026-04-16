import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { ConfirmationResult } from 'firebase/auth'
import { sendPhoneOTP, verifyPhoneOTP } from '../../firebase/auth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface PhoneAuthProps {
  onBack: () => void
  onSuccess: () => void
}

type Step = 'phone' | 'otp'

const RESEND_SECS = 30

export function PhoneAuth({ onBack, onSuccess }: PhoneAuthProps) {
  const [step, setStep]               = useState<Step>('phone')
  const [phone, setPhone]             = useState('')
  const [otp, setOtp]                 = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const confirmRef                    = useRef<ConfirmationResult | null>(null)
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null)

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_SECS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!phone.trim()) { setError('Please enter your phone number'); return }
    setLoading(true)
    try {
      const cleaned = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`
      const confirmation = await sendPhoneOTP(cleaned, 'recaptcha-container')
      confirmRef.current = confirmation
      setStep('otp')
      startResendTimer()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('invalid-phone-number') || msg.includes('INVALID_PHONE_NUMBER')) {
        setError('Invalid phone number. Include country code (e.g. +1 555 0123).')
      } else if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else if (msg.includes('network')) {
        setError('Network error. Check your connection and try again.')
      } else {
        setError('Could not send OTP. Please check the number and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp.trim() || otp.length < 6) { setError('Enter the 6-digit code'); return }
    if (!confirmRef.current) { setError('Session expired. Please go back and retry.'); return }
    setLoading(true)
    try {
      await verifyPhoneOTP(confirmRef.current, otp.trim())
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('invalid-verification-code') || msg.includes('INVALID_CODE')) {
        setError('Wrong code. Please try again.')
      } else if (msg.includes('code-expired') || msg.includes('CODE_EXPIRED')) {
        setError('Code expired. Please request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    setError('')
    setOtp('')
    setLoading(true)
    try {
      const cleaned = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`
      const confirmation = await sendPhoneOTP(cleaned, 'recaptcha-container')
      confirmRef.current = confirmation
      startResendTimer()
    } catch {
      setError('Could not resend. Please wait and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 w-full">
        <div className="text-center">
          <div className="text-4xl mb-2">📨</div>
          <h3 className="text-xl font-black text-white">Check your phone!</h3>
          <p className="text-sm text-gray-400 mt-1">
            We sent a 6-digit code to <span className="text-yellow-400 font-bold">{phone}</span>
          </p>
        </div>

        <Input
          label="Enter 6-digit code"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
          placeholder="• • • • • •"
          className="text-center text-2xl tracking-[0.5em] font-bold"
          error={error}
          autoFocus
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Verify Code
        </Button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(''); setError('') }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            className={`text-sm font-semibold transition-colors ${
              resendTimer > 0 || loading
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-yellow-400 hover:text-yellow-300 cursor-pointer'
            }`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" />
      </form>
    )
  }

  return (
    <form onSubmit={handleSendOTP} className="flex flex-col gap-4 w-full">
      <div className="text-center">
        <div className="text-4xl mb-2">📱</div>
        <h3 className="text-xl font-black text-white">Phone Sign-In</h3>
        <p className="text-sm text-gray-400 mt-1">We'll send you a one-time code</p>
      </div>

      <Input
        label="Phone Number"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => { setPhone(e.target.value); setError('') }}
        placeholder="+1 555 012 3456"
        error={error}
        hint="Include country code (e.g. +1 for US)"
        leftIcon={<span>📞</span>}
        autoFocus
      />

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Send Code
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white transition-colors text-center"
      >
        ← Back to login options
      </button>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />
    </form>
  )
}
