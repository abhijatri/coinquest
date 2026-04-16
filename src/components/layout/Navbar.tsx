import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useSound } from '../../contexts/SoundContext'
import { getAvatar } from '../../utils/avatars'
import { getLevelFromXP } from '../../utils/xpSystem'

export function Navbar() {
  const { profile }                   = usePlayer()
  const { darkMode, toggleDark }      = useTheme()
  const { soundEnabled, toggleSound } = useSound()
  const location                      = useLocation()
  const [menuOpen, setMenuOpen]       = useState(false)

  if (!profile) return null

  const avatar    = getAvatar(profile.avatarId)
  const levelInfo = getLevelFromXP(profile.xp)

  const NAV_LINKS = [
    { to: '/',        label: 'Home',    icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '📊' },
    { to: '/settings',label: 'Settings',icon: '⚙️' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700/50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🪙</span>
          <span className="font-black text-xl text-yellow-400 hidden sm:block tracking-tight">CoinQuest</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={[
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all',
                location.pathname === l.to
                  ? 'bg-yellow-400/15 text-yellow-400'
                  : 'text-gray-400 hover:text-white hover:bg-navy-800',
              ].join(' ')}
            >
              <span>{l.icon}</span><span>{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleSound} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={toggleDark} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Toggle theme">
            {darkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/profile" className="flex items-center gap-2 group">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-lg group-hover:scale-105 transition-transform`}>
              {avatar.emoji}
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-bold text-white">{profile.displayName}</span>
              <span className="text-xs text-yellow-400 font-semibold">Lv.{levelInfo.level}</span>
            </div>
          </Link>

          <button className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-navy-700/50 bg-navy-900 px-4 py-3 flex flex-col gap-1 animate-slide-down">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all',
                location.pathname === l.to ? 'bg-yellow-400/15 text-yellow-400' : 'text-gray-300 hover:text-white hover:bg-navy-800',
              ].join(' ')}
            >
              <span>{l.icon}</span><span>{l.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
