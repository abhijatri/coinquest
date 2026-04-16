import React from 'react'
import type { PowerTokenType, PowerTokenState, PlayerKey } from '../../types'

interface PowerTokenBarProps {
  tokens: PowerTokenState
  currentPlayer: PlayerKey
  activeToken: PowerTokenType | null
  onActivate: (token: PowerTokenType) => void
  disabled?: boolean
}

interface TokenDef {
  type: PowerTokenType
  icon: string
  label: string
  desc: string
}

const TOKEN_DEFS: TokenDef[] = [
  { type: 'bomb',   icon: '💣', label: 'Bomb',   desc: 'Remove an opponent coin' },
  { type: 'swap',   icon: '🔄', label: 'Swap',   desc: 'Move last coin to another column' },
  { type: 'double', icon: '⏩', label: 'Double', desc: 'Drop two coins this turn' },
]

export function PowerTokenBar({
  tokens,
  activeToken,
  onActivate,
  disabled = false,
}: PowerTokenBarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Power Tokens</p>
      <div className="flex gap-3">
        {TOKEN_DEFS.map(({ type, icon, label, desc }) => {
          const available = tokens[type]
          const isActive  = activeToken === type

          return (
            <button
              key={type}
              disabled={!available || disabled}
              onClick={() => available && !disabled && onActivate(type)}
              title={available ? desc : `${label} used`}
              aria-label={`${label} power token${!available ? ' (used)' : ''}`}
              className={[
                'flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all duration-150',
                'min-w-[72px] min-h-[72px] select-none',
                available && !disabled
                  ? isActive
                    ? 'bg-yellow-400/20 border-yellow-400 scale-105 shadow-lg shadow-yellow-400/20'
                    : 'bg-navy-800 border-navy-600 hover:border-yellow-400/40 hover:bg-navy-700 cursor-pointer active:scale-95'
                  : 'bg-navy-800/50 border-navy-700/50 opacity-40 cursor-not-allowed',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={`text-2xl ${!available ? 'grayscale' : ''}`}>{icon}</span>
              <span className={`text-xs font-bold ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
      {activeToken && (
        <p className="text-xs text-yellow-400 font-semibold animate-pulse">
          {TOKEN_DEFS.find((t) => t.type === activeToken)?.desc}
        </p>
      )}
    </div>
  )
}
