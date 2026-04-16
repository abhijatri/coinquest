import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { getAvatar, AVATARS } from '../utils/avatars'
import { getLevelFromXP } from '../utils/xpSystem'
import { PageTransition } from '../components/layout/PageTransition'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

// ── First-time setup inline on the home page ──────────────────────────────────
function SetupScreen() {
  const { setupProfile } = usePlayer()
  const [name, setName]       = useState('')
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [error, setError]     = useState('')

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) { setError('Enter at least 2 characters'); return }
    setupProfile(trimmed, avatarId)
  }

  const selectedAvatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]

  return (
    <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{selectedAvatar.emoji}</div>
          <h1 className="text-4xl font-black text-white">
            Coin<span className="text-yellow-400">Quest</span>
          </h1>
          <p className="text-gray-400 mt-2">Pick your avatar and enter your name to start!</p>
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-5">
          {/* Avatar grid */}
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setAvatarId(av.id)}
                aria-label={av.name}
                aria-pressed={avatarId === av.id}
                className={[
                  'flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer active:scale-95 min-h-[72px]',
                  avatarId === av.id
                    ? 'border-yellow-400 bg-yellow-400/10 scale-105'
                    : 'border-navy-600 bg-navy-800 hover:border-navy-500',
                ].join(' ')}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center text-2xl`}>
                  {av.emoji}
                </div>
                <span className="text-xs text-gray-400 font-semibold">{av.name}</span>
              </button>
            ))}
          </div>

          <Input
            label="Your Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g. CoinMaster, Drago…"
            maxLength={20}
            error={error}
            autoFocus
            autoComplete="off"
          />

          <Button type="submit" variant="primary" size="xl" fullWidth>
            🚀 Start Playing!
          </Button>
        </form>
      </div>
    </PageTransition>
  )
}

// ── Game hub ──────────────────────────────────────────────────────────────────
const GAME_CARDS = [
  { route: '/game/classic',  icon: '🟡', title: 'Classic Connect 4', desc: '7×6 · vs AI or Friend · 3 difficulty levels', color: 'from-yellow-400/10 to-amber-500/5', textColor: 'text-yellow-400', borderColor: 'border-yellow-400/20 hover:border-yellow-400/50' },
  { route: '/game/power',    icon: '💣', title: 'Power Mode',         desc: 'Bombs, Swaps & Double Drops', badge: 'HOT', color: 'from-rose-500/10 to-pink-500/5', textColor: 'text-rose-400', borderColor: 'border-rose-400/20 hover:border-rose-400/50' },
  { route: '/game/blitz',    icon: '⏩', title: 'Timed Blitz',        desc: '10 seconds per move — think fast!', color: 'from-sky-400/10 to-blue-500/5', textColor: 'text-sky-400', borderColor: 'border-sky-400/20 hover:border-sky-400/50' },
  { route: '/game/connect5', icon: '✋', title: 'Connect 5',          desc: '9×7 bigger board — connect 5 to win', color: 'from-green-400/10 to-emerald-500/5', textColor: 'text-green-400', borderColor: 'border-green-400/20 hover:border-green-400/50' },
  { route: '/game/chaos',    icon: '🌈', title: 'Color Chaos',        desc: '4 players · 9×7 board', badge: 'BONUS', color: 'from-purple-400/10 to-violet-500/5', textColor: 'text-purple-400', borderColor: 'border-purple-400/20 hover:border-purple-400/50' },
]

export function Home() {
  const { profile, stats } = usePlayer()
  const navigate = useNavigate()

  if (!profile) return <SetupScreen />

  const avatar      = getAvatar(profile.avatarId)
  const levelInfo   = getLevelFromXP(profile.xp)
  const totalWins   = stats ? Object.values(stats.modes).reduce((s, m) => s + m.wins, 0) : 0
  const totalPlayed = stats ? Object.values(stats.modes).reduce((s, m) => s + m.played, 0) : 0

  return (
    <PageTransition className="max-w-2xl mx-auto px-4 py-8">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700 rounded-3xl p-5 mb-6 flex items-center gap-4 shadow-xl">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-3xl shadow-md ring-2 ${avatar.ring} flex-shrink-0`}>
          {avatar.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm font-semibold">Welcome back,</p>
          <p className="text-xl font-black text-white truncate">{profile.displayName}!</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs bg-yellow-400/15 text-yellow-400 font-bold px-2 py-0.5 rounded-full border border-yellow-400/20">
              Lv.{levelInfo.level} {levelInfo.label}
            </span>
            {totalPlayed > 0 && (
              <span className="text-xs text-gray-500">{totalWins}W / {totalPlayed - totalWins}L</span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <p className="text-xs text-gray-500">{profile.xp} XP</p>
          <div className="w-20 h-2 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${levelInfo.progress}%` }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {totalPlayed > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Games',        value: totalPlayed },
            { label: 'Wins',         value: totalWins },
            { label: 'Achievements', value: stats?.achievements.length ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-navy-800 border border-navy-700 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Choose Your Game</h2>

      <div className="flex flex-col gap-3">
        {GAME_CARDS.map((card) => (
          <button
            key={card.route}
            onClick={() => navigate(card.route)}
            className={`bg-gradient-to-r ${card.color} border-2 ${card.borderColor} rounded-2xl p-4 flex items-center gap-4 transition-all duration-150 cursor-pointer active:scale-[0.98] text-left w-full hover:shadow-lg`}
          >
            <span className="text-4xl flex-shrink-0">{card.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-base ${card.textColor}`}>{card.title}</h3>
                {card.badge && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${card.textColor} border border-current/20 bg-current/10`}>{card.badge}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5 leading-snug">{card.desc}</p>
            </div>
            <svg className={`w-5 h-5 flex-shrink-0 ${card.textColor}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
      </div>
    </PageTransition>
  )
}
