import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/layout/PageTransition'

const FEATURES = [
  { icon: '🟡', label: 'Classic Connect 4', desc: 'Play vs AI or a friend' },
  { icon: '💣', label: 'Power Mode',         desc: 'Bombs, swaps & double drops' },
  { icon: '⏩', label: 'Blitz Mode',         desc: '10-second turns, pure speed' },
  { icon: '✋', label: 'Connect 5',           desc: '9×7 board — bigger challenge' },
  { icon: '🌈', label: 'Color Chaos',         desc: '4 players, one epic board' },
]

export function Landing() {
  const navigate = useNavigate()

  return (
    <PageTransition className="min-h-screen bg-navy-950 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Logo */}
        <div className="mb-6 relative">
          <div className="text-7xl sm:text-8xl animate-glow-pulse">🪙</div>
          <div className="absolute -top-2 -right-4 text-3xl animate-spin-slow">⭐</div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tight mb-2">
          Coin<span className="text-yellow-400">Quest</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 font-semibold mb-2">
          Drop. Connect. Win!
        </p>
        <p className="text-sm text-gray-500 mb-10 max-w-xs">
          Five thrilling Connect 4 modes with achievements, XP, and your own player profile.
        </p>

        <Button
          variant="primary"
          size="xl"
          onClick={() => navigate('/auth')}
          className="mb-4 animate-glow-pulse"
        >
          🚀 Start Playing — It's Free!
        </Button>

        {/* Decorative grid preview */}
        <div className="mt-12 flex gap-2" aria-hidden="true">
          {['#facc15','#f43f5e','#facc15','#f43f5e','#facc15','#f43f5e','#facc15'].map((c, i) => (
            <div
              key={i}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md"
              style={{
                backgroundColor: i % 2 === 0 ? c : i > 3 ? '#facc15' : c,
                opacity: 0.8 + (i % 3) * 0.07,
                transform: `translateY(${[0,4,-3,8,-2,5,-4][i]}px)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="px-4 pb-12 max-w-2xl mx-auto w-full">
        <h2 className="text-center text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
          5 Game Modes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 bg-navy-900 border border-navy-700 rounded-2xl px-4 sm:px-3 py-3 sm:py-4 sm:text-center"
            >
              <span className="text-3xl">{f.icon}</span>
              <div className="sm:text-center">
                <p className="font-black text-white text-sm">{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-700 pb-6">
        CoinQuest © {new Date().getFullYear()} — Made with ❤️ for kids everywhere
      </footer>
    </PageTransition>
  )
}
