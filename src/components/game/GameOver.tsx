import React, { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { PlayerKey, WinState } from '../../types'
import { Button } from '../ui/Button'
import { PLAYER_COLORS, PLAYER_LABELS } from '../../utils/gameLogic'

interface GameOverProps {
  winState: WinState
  playerLabels?: Partial<Record<PlayerKey, string>>
  playerColors?: Partial<Record<PlayerKey, string>>
  xpGained?: number
  newAchievements?: string[]
  onPlayAgain: () => void
  onHome: () => void
}

export function GameOver({
  winState,
  playerLabels,
  playerColors,
  xpGained,
  newAchievements = [],
  onPlayAgain,
  onHome,
}: GameOverProps) {
  const didConfetti = useRef(false)
  const colors  = { ...PLAYER_COLORS, ...playerColors }
  const labels  = { ...PLAYER_LABELS, ...playerLabels }

  useEffect(() => {
    if (winState.winner && winState.winner !== 'draw' && !didConfetti.current) {
      didConfetti.current = true
      const color = colors[winState.winner]
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 },
        colors: [color, '#facc15', '#ffffff'],
        startVelocity: 45,
        gravity: 0.8,
      })
      setTimeout(() =>
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [color, '#facc15'],
        }), 300)
      setTimeout(() =>
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [color, '#facc15'],
        }), 500)
    }
  }, [winState.winner, colors])

  const isDraw   = winState.winner === 'draw'
  const isWin    = winState.winner && !isDraw
  const winner   = winState.winner as PlayerKey | null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
        {/* Icon */}
        <div className="text-6xl mb-4">
          {isDraw ? '🤝' : isWin ? '🏆' : '😔'}
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-black mb-2"
          style={{
            color: isDraw ? '#94a3b8' : winner ? colors[winner] : '#ffffff',
          }}
        >
          {isDraw ? "It's a Draw!" : isWin && winner ? `${labels[winner]} Wins!` : 'Game Over!'}
        </h2>

        {/* XP */}
        {xpGained !== undefined && (
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-2 mb-4">
            <span className="text-yellow-400 font-black text-lg">+{xpGained} XP</span>
          </div>
        )}

        {/* Achievements */}
        {newAchievements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">🏅 New Achievement{newAchievements.length > 1 ? 's' : ''}!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {newAchievements.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold border border-yellow-400/20"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <Button variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
            🎮 Play Again
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onHome}>
            🏠 Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
