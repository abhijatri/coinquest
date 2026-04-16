import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createUserProfile } from '../../firebase/firestore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { AVATARS } from '../../utils/avatars'
import { useToast } from '../ui/Toast'

interface ProfileSetupProps {
  onComplete: () => void
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, refreshStats } = useAuth()
  const { showToast } = useToast()
  const [name, setName]         = useState(user?.displayName ?? '')
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [loading, setLoading]   = useState(false)
  const [nameError, setNameError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameError('Pick a cool name for yourself!'); return }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters.'); return }
    if (trimmed.length > 20) { setNameError('Name must be 20 characters or fewer.'); return }
    if (!user) return
    setLoading(true)
    try {
      await createUserProfile(user.uid, trimmed, avatarId)
      await refreshStats()
      showToast(`Welcome to CoinQuest, ${trimmed}! 🎉`, 'success')
      onComplete()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('permission-denied')) {
        showToast('Permission denied. Please check Firebase rules.', 'error')
      } else if (msg.includes('network')) {
        showToast('Network error. Check your connection.', 'error')
      } else {
        showToast('Could not save profile. Please try again.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedAvatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="text-center">
        <div className="text-5xl mb-2 animate-bounce-in">{selectedAvatar.emoji}</div>
        <h3 className="text-2xl font-black text-white">Set Up Your Profile</h3>
        <p className="text-sm text-gray-400 mt-1">Pick your name and avatar to get started!</p>
      </div>

      {/* Avatar Picker */}
      <div>
        <p className="text-sm font-bold text-gray-300 mb-3 text-center">Choose Your Avatar</p>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((av) => (
            <button
              key={av.id}
              type="button"
              onClick={() => setAvatarId(av.id)}
              className={[
                'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-150',
                'min-h-[72px] cursor-pointer active:scale-95',
                avatarId === av.id
                  ? 'border-yellow-400 bg-yellow-400/10 scale-105'
                  : 'border-navy-600 bg-navy-800 hover:border-navy-500',
              ].join(' ')}
              aria-label={av.name}
              aria-pressed={avatarId === av.id}
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-2xl`}
              >
                {av.emoji}
              </div>
              <span className="text-xs text-gray-400 font-semibold">{av.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <Input
        label="Your Display Name"
        value={name}
        onChange={(e) => { setName(e.target.value); setNameError('') }}
        placeholder="e.g. CoinMaster, Drago42…"
        maxLength={20}
        error={nameError}
        hint="2–20 characters"
        leftIcon={<span>✏️</span>}
        autoFocus
        autoComplete="off"
      />

      <Button type="submit" variant="primary" size="xl" fullWidth loading={loading}>
        🚀 Let's Play!
      </Button>
    </form>
  )
}
