import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameBoard } from '../components/game/GameBoard'
import { GameHeader } from '../components/game/GameHeader'
import { GameOver } from '../components/game/GameOver'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/layout/PageTransition'
import { useGameStats } from '../hooks/useGameStats'
import { useSound } from '../contexts/SoundContext'
import { usePlayer } from '../contexts/PlayerContext'
import { createBoard, dropCoin, checkWin, GAME_CONFIGS, PLAYER_COLORS, PLAYER_LABELS } from '../utils/gameLogic'
import type { Board, PlayerKey, WinState } from '../types'

const CONFIG   = GAME_CONFIGS.chaos
const PLAYERS: PlayerKey[] = ['p1', 'p2', 'p3', 'p4']

interface GameResult { xpGained: number; newAchievements: string[] }

export function ChaosGame() {
  const navigate                       = useNavigate()
  const { recordResult }               = useGameStats()
  const { playDrop, playWin, playDraw } = useSound()
  const { profile }                    = usePlayer()

  const [started, setStarted]          = useState(false)
  const [playerNames, setPlayerNames]  = useState<Record<PlayerKey, string>>({
    p1: profile?.displayName ?? 'Player 1',
    p2: 'Player 2',
    p3: 'Player 3',
    p4: 'Player 4',
  })
  const [board, setBoard]              = useState<Board>(createBoard(CONFIG.rows, CONFIG.cols))
  const [currentIdx, setCurrentIdx]    = useState(0)
  const [winState, setWinState]        = useState<WinState>({ winner: null, cells: [] })
  const [droppingCell, setDroppingCell] = useState<{ row: number; col: number } | null>(null)
  const [coinsDropped, setCoinsDropped] = useState(0)
  const [gameResult, setGameResult]    = useState<GameResult | null>(null)
  const [gameOver, setGameOver]        = useState(false)

  const currentPlayer = PLAYERS[currentIdx]

  const resetGame = useCallback(() => {
    setBoard(createBoard(CONFIG.rows, CONFIG.cols))
    setCurrentIdx(0)
    setWinState({ winner: null, cells: [] })
    setDroppingCell(null)
    setCoinsDropped(0)
    setGameResult(null)
    setGameOver(false)
  }, [])

  const endGame = useCallback(
    async (ws: WinState, totalCoins: number) => {
      if (ws.winner === 'draw') playDraw(); else playWin()
      setGameOver(true)
      if (ws.winner && ws.winner !== 'draw') {
        const result = ws.winner === 'p1' ? 'win' : 'loss'
        const outcome = recordResult('chaos', result, totalCoins)
        if (outcome) setGameResult({ xpGained: outcome.xpGained, newAchievements: outcome.newAchievements })
      }
    },
    [playDraw, playWin, recordResult],
  )

  const handleColumnClick = useCallback(
    (col: number) => {
      if (winState.winner !== null || droppingCell || gameOver) return
      const result = dropCoin(board, col, currentPlayer)
      if (!result) return
      playDrop()
      setDroppingCell({ row: result.row, col })
      const newCoins = coinsDropped + 1
      setTimeout(() => {
        setBoard(result.board)
        setDroppingCell(null)
        setCoinsDropped(newCoins)
        const ws = checkWin(result.board, CONFIG.connectN)
        if (ws.winner !== null) { setWinState(ws); endGame(ws, newCoins) }
        else setCurrentIdx((i) => (i + 1) % 4)
      }, 420)
    },
    [board, currentPlayer, winState.winner, droppingCell, gameOver, coinsDropped, playDrop, endGame],
  )

  const playerLabels: Partial<Record<PlayerKey, string>> = { ...playerNames }
  const playerColors: Partial<Record<PlayerKey, string>> = PLAYER_COLORS

  if (!started) {
    return (
      <PageTransition className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🌈</div>
          <h1 className="text-3xl font-black text-white">Color Chaos</h1>
          <p className="text-gray-400 mt-1">4 players · 9×7 board · Connect 4 to win</p>
        </div>

        {/* Player name setup */}
        <div className="w-full space-y-3">
          {PLAYERS.map((p) => (
            <div key={p} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: PLAYER_COLORS[p] }}
              />
              <input
                type="text"
                value={playerNames[p]}
                onChange={(e) =>
                  setPlayerNames((prev) => ({ ...prev, [p]: e.target.value || PLAYER_LABELS[p] }))
                }
                maxLength={16}
                className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-yellow-400 min-h-[44px]"
                placeholder={PLAYER_LABELS[p]}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="xl" fullWidth onClick={() => { resetGame(); setStarted(true) }}>
            🎮 Start Color Chaos!
          </Button>
          <Button variant="ghost" onClick={() => navigate('/home')}>← Back</Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center gap-4">
      {/* Custom header for 4 players */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          ←
        </button>

        <div className="flex-1 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Color Chaos</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: PLAYER_COLORS[currentPlayer] }}
            />
            <p
              className="text-lg font-black"
              style={{
                color: winState.winner && winState.winner !== 'draw'
                  ? PLAYER_COLORS[winState.winner as PlayerKey]
                  : PLAYER_COLORS[currentPlayer],
              }}
            >
              {winState.winner === 'draw'
                ? "It's a Draw! 🤝"
                : winState.winner
                ? `${playerNames[winState.winner as PlayerKey]} Wins! 🎉`
                : `${playerNames[currentPlayer]}'s Turn`}
            </p>
          </div>
        </div>

        <button
          onClick={() => { resetGame(); setStarted(false) }}
          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          ↺
        </button>
      </div>

      {/* Player indicators */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {PLAYERS.map((p, i) => (
          <div
            key={p}
            className={[
              'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all',
              currentIdx === i && winState.winner === null
                ? 'border-current bg-current/10 scale-105'
                : 'border-navy-700 bg-navy-800/50 opacity-60',
            ].join(' ')}
            style={{ color: PLAYER_COLORS[p], borderColor: currentIdx === i ? PLAYER_COLORS[p] : undefined }}
          >
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: PLAYER_COLORS[p] }} />
            <p className="text-xs font-bold truncate w-full text-center" style={{ color: PLAYER_COLORS[p] }}>
              {playerNames[p].split(' ')[0]}
            </p>
          </div>
        ))}
      </div>

      <GameBoard
        board={board}
        winState={winState}
        currentPlayer={currentPlayer}
        onColumnClick={handleColumnClick}
        disabled={!!droppingCell || gameOver}
        droppingCell={droppingCell}
        playerColors={playerColors}
        playerLabels={playerLabels}
      />

      {gameOver && (
        <GameOver
          winState={winState}
          playerLabels={playerLabels}
          playerColors={playerColors}
          xpGained={gameResult?.xpGained}
          newAchievements={gameResult?.newAchievements}
          onPlayAgain={() => resetGame()}
          onHome={() => navigate('/home')}
        />
      )}
    </PageTransition>
  )
}
