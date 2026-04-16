import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameBoard } from '../components/game/GameBoard'
import { GameHeader } from '../components/game/GameHeader'
import { GameOver } from '../components/game/GameOver'
import { BlitzTimer } from '../components/game/BlitzTimer'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/layout/PageTransition'
import { useGameStats } from '../hooks/useGameStats'
import { useSound } from '../contexts/SoundContext'
import { usePlayer } from '../contexts/PlayerContext'
import { createBoard, dropCoin, checkWin, GAME_CONFIGS } from '../utils/gameLogic'
import type { Board, PlayerKey, WinState } from '../types'

const CONFIG     = GAME_CONFIGS.blitz
const TIME_LIMIT = CONFIG.timeLimit ?? 10

interface GameResult { xpGained: number; newAchievements: string[] }

export function BlitzGame() {
  const navigate                       = useNavigate()
  const { recordResult }               = useGameStats()
  const { playDrop, playWin, playDraw, playTick } = useSound()
  const { profile }                    = usePlayer()

  const [started, setStarted]          = useState(false)
  const [board, setBoard]              = useState<Board>(createBoard(CONFIG.rows, CONFIG.cols))
  const [currentPlayer, setCurrentPlayer] = useState<PlayerKey>('p1')
  const [winState, setWinState]        = useState<WinState>({ winner: null, cells: [] })
  const [droppingCell, setDroppingCell] = useState<{ row: number; col: number } | null>(null)
  const [coinsDropped, setCoinsDropped] = useState(0)
  const [gameResult, setGameResult]    = useState<GameResult | null>(null)
  const [gameOver, setGameOver]        = useState(false)
  const [turnKey, setTurnKey]          = useState(0)
  const [forfeitedPlays, setForfeitedPlays] = useState<string[]>([])

  const playerLabels: Partial<Record<PlayerKey, string>> = {
    p1: profile?.displayName ?? 'Player 1',
    p2: 'Player 2',
  }

  const resetGame = useCallback(() => {
    setBoard(createBoard(CONFIG.rows, CONFIG.cols))
    setCurrentPlayer('p1')
    setWinState({ winner: null, cells: [] })
    setDroppingCell(null)
    setCoinsDropped(0)
    setGameResult(null)
    setGameOver(false)
    setTurnKey((k) => k + 1)
    setForfeitedPlays([])
  }, [])

  const endGame = useCallback(
    async (ws: WinState, totalCoins: number) => {
      if (ws.winner === 'draw') playDraw(); else playWin()
      setGameOver(true)
      const result = ws.winner === 'p1' ? 'win' : ws.winner === 'draw' ? 'draw' : 'loss'
      const outcome = recordResult('blitz', result, totalCoins)
      if (outcome) setGameResult({ xpGained: outcome.xpGained, newAchievements: outcome.newAchievements })
    },
    [playDraw, playWin, recordResult],
  )

  // Timer expires — forfeit turn
  const handleTimeout = useCallback(() => {
    if (winState.winner !== null || gameOver) return
    const label = playerLabels[currentPlayer] ?? currentPlayer
    setForfeitedPlays((prev) => [...prev.slice(-2), `⏰ ${label} forfeited!`])
    setCurrentPlayer((p) => (p === 'p1' ? 'p2' : 'p1'))
    setTurnKey((k) => k + 1)
  }, [currentPlayer, winState.winner, gameOver, playerLabels])

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
        if (ws.winner !== null) {
          setWinState(ws)
          endGame(ws, newCoins)
        } else {
          setCurrentPlayer((p) => (p === 'p1' ? 'p2' : 'p1'))
          setTurnKey((k) => k + 1)
        }
      }, 420)
    },
    [board, currentPlayer, winState.winner, droppingCell, gameOver, coinsDropped, playDrop, endGame],
  )

  if (!started) {
    return (
      <PageTransition className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">⏩</div>
          <h1 className="text-3xl font-black text-white">Timed Blitz</h1>
          <p className="text-gray-400 mt-1">
            {TIME_LIMIT} seconds per turn — drop a coin or lose your turn!
          </p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-4 w-full">
          <div className="h-3 bg-navy-700 rounded-full overflow-hidden mb-2">
            <div className="h-full w-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500 rounded-full" />
          </div>
          <p className="text-center text-sm text-gray-400">Your timer starts as soon as it's your turn!</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="xl" fullWidth onClick={() => { resetGame(); setStarted(true) }}>
            ⚡ Start Blitz Game
          </Button>
          <Button variant="ghost" onClick={() => navigate('/home')}>
            ← Back
          </Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-2xl mx-auto px-4 py-4 flex flex-col items-center gap-4">
      <div className="w-full">
        <GameHeader
          title="Timed Blitz"
          currentPlayer={currentPlayer}
          winState={winState}
          playerLabels={playerLabels}
          extra={
            <button
              onClick={() => { resetGame(); setStarted(false) }}
              className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ↺
            </button>
          }
        />
      </div>

      {/* Timer */}
      {!gameOver && winState.winner === null && (
        <div className="w-full max-w-xs">
          <BlitzTimer
            timeLimit={TIME_LIMIT}
            onTimeout={handleTimeout}
            running={!droppingCell && !gameOver && winState.winner === null}
            resetKey={turnKey}
            onTick={playTick}
          />
        </div>
      )}

      {/* Forfeit log */}
      {forfeitedPlays.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          {forfeitedPlays.map((msg, i) => (
            <p key={i} className="text-xs text-rose-400 font-semibold animate-fade-in">
              {msg}
            </p>
          ))}
        </div>
      )}

      <GameBoard
        board={board}
        winState={winState}
        currentPlayer={currentPlayer}
        onColumnClick={handleColumnClick}
        disabled={!!droppingCell || gameOver}
        droppingCell={droppingCell}
        playerLabels={playerLabels}
      />

      {gameOver && (
        <GameOver
          winState={winState}
          playerLabels={playerLabels}
          xpGained={gameResult?.xpGained}
          newAchievements={gameResult?.newAchievements}
          onPlayAgain={() => resetGame()}
          onHome={() => navigate('/home')}
        />
      )}
    </PageTransition>
  )
}
