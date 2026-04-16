import React, { useState } from 'react'
import { sendEmailLink } from '../../firebase/auth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface EmailAuthProps {
  onBack: () => void
}

export function EmailAuth({ onBack }: EmailAuthProps) {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await sendEmailLink(email.trim().toLowerCase())
      setSent(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('invalid-email') || msg.includes('INVALID_EMAIL')) {
        setError("That email address doesn't look right. Please check it.")
      } else if (msg.includes('network')) {
        setError('Network error. Check your connection and try again.')
      } else {
        setError('Failed to send the magic link. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-center">
        <div className="text-5xl animate-bounce-in">✉️</div>
        <h3 className="text-2xl font-black text-white">Check your email!</h3>
        <p className="text-gray-400">
          We sent a magic link to{' '}
          <span className="text-yellow-400 font-bold">{email}</span>.
          Click the link in your email to sign in.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Didn't get it? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-yellow-400 hover:text-yellow-300 font-semibold underline"
          >
            try again
          </button>
          .
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors mt-4"
        >
          ← Back to login options
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-4 w-full">
      <div className="text-center">
        <div className="text-4xl mb-2">✉️</div>
        <h3 className="text-xl font-black text-white">Email Magic Link</h3>
        <p className="text-sm text-gray-400 mt-1">We'll send you a sign-in link — no password needed</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError('') }}
        placeholder="you@example.com"
        error={error}
        leftIcon={<span>📧</span>}
        autoFocus
        autoComplete="email"
      />

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Send Magic Link
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white transition-colors text-center"
      >
        ← Back to login options
      </button>
    </form>
  )
}
