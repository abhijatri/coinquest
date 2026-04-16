import React from 'react'
import { Link } from 'react-router-dom'
import type { PlayerKey, WinState } from '../../types'
import { PLAYER_COLORS, PLAYER_LABELS } from '../../utils/gameLogic'

interface GameHeaderProps {
  title: string
  currentPlayer: PlayerKey
  winState: WinState
  playerLabels?: Partial<Record<PlayerKey, string>>
  playerColors?: Partial<Record<PlayerKey, string>>
  extra?: React.ReactNode
}

export function GameHeader({
  title,
  currentPlayer,
  winState,
  playerLabels,
  playerColors,
  extra,
}: GameHeaderProps) {
  const colors  = { ...PLAYER_COLORS, ...playerColors }
  const labels  = { ...PLAYER_LABELS, ...playerLabels }

  const statusText = () => {
    if (winState.winner === 'draw') return "It's a Draw! 🤝"
    if (winState.winner)           return `${labels[winState.winner]} Wins! 🎉`
    return `${labels[currentPlayer]}'s Turn`
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <Link
        to="/home"
        className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Back to home"
      >
        ←
      </Link>

      <div className="flex-1 text-center">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          {!winState.winner && (
            <div
              className="w-4 h-4 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: colors[currentPlayer] }}
            />
          )}
          <p
            className="text-lg font-black"
            style={{
              color: winState.winner && winState.winner !== 'draw'
                ? colors[winState.winner]
                : winState.winner === 'draw'
                ? '#94a3b8'
                : colors[currentPlayer],
            }}
          >
            {statusText()}
          </p>
        </div>
      </div>

      <div className="min-w-[44px]">{extra}</div>
    </div>
  )
}
