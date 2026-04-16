import React, { useState } from 'react'
import type { Board, PlayerKey, WinState } from '../../types'
import { PLAYER_COLORS } from '../../utils/gameLogic'

interface GameBoardProps {
  board: Board
  winState: WinState
  currentPlayer: PlayerKey
  onColumnClick: (col: number) => void
  disabled?: boolean
  droppingCell?: { row: number; col: number } | null
  playerColors?: Partial<Record<PlayerKey, string>>
  playerLabels?: Partial<Record<PlayerKey, string>>
}

export function GameBoard({
  board,
  winState,
  currentPlayer,
  onColumnClick,
  disabled = false,
  droppingCell,
  playerColors,
}: GameBoardProps) {
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const rows = board.length
  const cols = board[0].length

  const colors = { ...PLAYER_COLORS, ...playerColors }

  const isWinCell = (r: number, c: number) =>
    winState.cells.some((wc) => wc.row === r && wc.col === c)

  const isDropping = (r: number, c: number) =>
    droppingCell?.row === r && droppingCell?.col === c

  function getCellStyle(r: number, c: number): React.CSSProperties {
    const val = board[r][c]
    if (val) {
      return {
        backgroundColor: colors[val],
        boxShadow: isWinCell(r, c)
          ? `0 0 0 3px ${colors[val]}, 0 0 20px ${colors[val]}80`
          : 'inset 0 -3px 6px rgba(0,0,0,0.3)',
      }
    }
    if (hoverCol === c && !disabled && winState.winner === null) {
      return {
        backgroundColor: `${colors[currentPlayer]}30`,
      }
    }
    return {}
  }

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 select-none">
      {/* Column click targets */}
      <div
        className="grid gap-1 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }, (_, col) => (
          <button
            key={col}
            className={[
              'h-8 rounded-xl transition-all duration-150',
              disabled || winState.winner !== null
                ? 'cursor-default opacity-0'
                : 'cursor-pointer hover:bg-white/10 active:scale-95',
            ].join(' ')}
            style={{ minWidth: '44px' }}
            onClick={() => !disabled && winState.winner === null && onColumnClick(col)}
            onMouseEnter={() => setHoverCol(col)}
            onMouseLeave={() => setHoverCol(null)}
            aria-label={`Drop coin in column ${col + 1}`}
          >
            {hoverCol === col && !disabled && winState.winner === null && (
              <span
                className="block w-5 h-5 rounded-full mx-auto animate-bounce"
                style={{ backgroundColor: colors[currentPlayer] }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Board grid */}
      <div
        className="rounded-2xl p-2 sm:p-3 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1e3a6e 0%, #0f2040 100%)' }}
      >
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = board[r][c]
              const winning = isWinCell(r, c)
              const dropping = isDropping(r, c)
              return (
                <div
                  key={`${r}-${c}`}
                  className="relative"
                  data-row={r}
                  data-col={c}
                  style={{ width: 'clamp(36px, 8vw, 56px)', height: 'clamp(36px, 8vw, 56px)' }}
                >
                  {/* Cell background (hole) */}
                  <div
                    className="absolute inset-0 rounded-full bg-navy-950/80"
                    style={{
                      boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.5)',
                    }}
                  />
                  {/* Coin */}
                  {cell && (
                    <div
                      className={[
                        'absolute inset-0 rounded-full transition-all',
                        dropping ? 'animate-coin-drop' : '',
                        winning ? 'animate-win-pulse' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={getCellStyle(r, c)}
                    >
                      {/* Coin shine */}
                      <div
                        className="absolute top-1 left-1 right-4 h-1/4 rounded-full bg-white/30"
                        style={{ borderRadius: '50%' }}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
