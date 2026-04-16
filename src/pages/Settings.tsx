import React, { useState } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSound } from '../contexts/SoundContext'
import { getAvatar, AVATARS } from '../utils/avatars'
import { getLevelFromXP } from '../utils/xpSystem'
import { PageTransition } from '../components/layout/PageTransition'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

interface ToggleRowProps {
  icon: string; label: string; desc: string; value: boolean; onToggle: () => void
}
function ToggleRow({ icon, label, desc, value, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-navy-700/50 last:border-b-0">
      <span className="text-2xl w-8 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={value}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-yellow-400' : 'bg-navy-600'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export function Settings() {
  const { profile, setupProfile } = usePlayer()
  const { darkMode, toggleDark }  = useTheme()
  const { soundEnabled, toggleSound } = useSound()

  const [editName, setEditName]       = useState(false)
  const [newName, setNewName]         = useState(profile?.displayName ?? '')
  const [newAvatarId, setNewAvatarId] = useState(profile?.avatarId ?? AVATARS[0].id)
  const [nameError, setNameError]     = useState('')

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || trimmed.length < 2) { setNameError('At least 2 characters required'); return }
    setupProfile(trimmed, newAvatarId)
    setEditName(false)
  }

  const avatar    = profile ? getAvatar(profile.avatarId) : null
  const levelInfo = profile ? getLevelFromXP(profile.xp) : null

  return (
    <PageTransition className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-6">Settings</h1>

      {/* Profile summary / edit */}
      {profile && avatar && levelInfo && (
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-4 mb-6">
          {!editName ? (
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                {avatar.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white truncate">{profile.displayName}</p>
                <p className="text-sm text-yellow-400 font-semibold">Lv.{levelInfo.level} · {profile.xp.toLocaleString()} XP</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setNewName(profile.displayName); setNewAvatarId(profile.avatarId); setEditName(true) }}>
                Edit
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setNewAvatarId(av.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer min-h-[64px] ${newAvatarId === av.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-navy-600 bg-navy-900 hover:border-navy-500'}`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}>{av.emoji}</div>
                    <span className="text-xs text-gray-400">{av.name}</span>
                  </button>
                ))}
              </div>
              <Input value={newName} onChange={(e) => { setNewName(e.target.value); setNameError('') }} maxLength={20} error={nameError} autoFocus />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="md" fullWidth>Save</Button>
                <Button type="button" variant="ghost" size="md" onClick={() => setEditName(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Preferences */}
      <div className="bg-navy-800 border border-navy-700 rounded-2xl px-4 mb-6">
        <ToggleRow icon="🔊" label="Sound Effects" desc="Coin drops, win fanfare, timer ticks" value={soundEnabled} onToggle={toggleSound} />
        <ToggleRow icon={darkMode ? '🌙' : '☀️'} label="Dark Mode" desc={darkMode ? 'Currently dark' : 'Currently light'} value={darkMode} onToggle={toggleDark} />
      </div>

      {/* Reset */}
      <div className="bg-navy-800 border border-navy-700 rounded-2xl px-4">
        <div className="py-4">
          <p className="font-bold text-white text-sm mb-1">Reset All Progress</p>
          <p className="text-xs text-gray-500 mb-3">Clears all stats, XP, and achievements. Cannot be undone.</p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Reset ALL progress? This cannot be undone.')) {
                localStorage.removeItem('coinquest_stats')
                localStorage.removeItem('coinquest_player')
                window.location.href = '/'
              }
            }}
          >
            Reset Progress
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
