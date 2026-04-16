import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameBoard } from '../components/game/GameBoard'
import { GameHeader } from '../components/game/GameHeader'
import { GameOver } from '../components/game/GameOver'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/layout/PageTransition'
import { useGameStats } from '../hooks/useGameStats'
import { useSound } from '../contexts/SoundContext'
import { usePlayer } from '../contexts/PlayerContext'
import { createBoard, dropCoin, checkWin, GAME_CONFIGS } from '../utils/gameLogic'
import { getAIMove } from '../utils/aiEngine'
import type { Board, PlayerKey, WinState, Difficulty } from '../types'

const CONFIG = GAME_CONFIGS.connect5

type Mode = 'two-player' | 'vs-ai'

interface GameResult { xpGained: number; newAchievements: string[] }

export function Connect5Game() {
  const navigate                       = useNavigate()
  const { recordResult }               = useGameStats()
  const { playDrop, playWin, playDraw } = useSound()
  const { profile }                    = usePlayer()

  const [gameMode, setGameMode]         = useState<Mode | null>(null)
  const [difficulty, setDifficulty]     = useState<Difficulty>('medium')
  const [board, setBoard]               = useState<Board>(createBoard(CONFIG.rows, CONFIG.cols))
  const [currentPlayer, setCurrentPlayer] = useState<PlayerKey>('p1')
  const [winState, setWinState]         = useState<WinState>({ winner: null, cells: [] })
  const [droppingCell, setDroppingCell] = useState<{ row: number; col: number } | null>(null)
  const [coinsDropped, setCoinsDropped] = useState(0)
  const [gameResult, setGameResult]     = useState<GameResult | null>(null)
  const [gameOver, setGameOver]         = useState(false)
  const aiThinking                      = useRef(false)

  const playerLabels: Partial<Record<PlayerKey, string>> = {
    p1: profile?.displayName ?? 'Player 1',
    p2: gameMode === 'vs-ai' ? `AI (${difficulty})` : 'Player 2',
  }

  const resetGame = useCallback(() => {
    setBoard(createBoard(CONFIG.rows, CONFIG.cols))
    setCurrentPlayer('p1')
    setWinState({ winner: null, cells: [] })
    setDroppingCell(null)
    setCoinsDropped(0)
    setGameResult(null)
    setGameOver(false)
    aiThinking.current = false
  }, [])

  const endGame = useCallback(
    async (ws: WinState, totalCoins: number) => {
      if (ws.winner === 'draw') playDraw(); else playWin()
      setGameOver(true)
      if (gameMode === 'vs-ai') {
        const result = ws.winner === 'p1' ? 'win' : ws.winner === 'draw' ? 'draw' : 'loss'
        const outcome = recordResult('connect5', result, totalCoins)
        if (outcome) setGameResult({ xpGained: outcome.xpGained, newAchievements: outcome.newAchievements })
      }
    },
    [gameMode, playDraw, playWin, recordResult],
  )

  const handleColumnClick = useCallback(
    (col: number) => {
      if (winState.winner !== null || droppingCell || aiThinking.current) return
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
        else setCurrentPlayer((p) => (p === 'p1' ? 'p2' : 'p1'))
      }, 420)
    },
    [board, currentPlayer, winState.winner, droppingCell, coinsDropped, playDrop, endGame],
  )

  useEffect(() => {
    if (gameMode !== 'vs-ai' || currentPlayer !== 'p2' || winState.winner !== null || droppingCell || gameOver) return
    if (aiThinking.current) return
    aiThinking.current = true
    const delay = difficulty === 'hard' ? 700 : 400
    const timer = setTimeout(() => {
      const col = getAIMove(board, 'p2', 'p1', difficulty, CONFIG.connectN)
      if (col === -1) { aiThinking.current = false; return }
      const result = dropCoin(board, col, 'p2')
      if (!result) { aiThinking.current = false; return }
      playDrop()
      setDroppingCell({ row: result.row, col })
      const newCoins = coinsDropped + 1
      setTimeout(() => {
        setBoard(result.board)
        setDroppingCell(null)
        setCoinsDropped(newCoins)
        aiThinking.current = false
        const ws = checkWin(result.board, CONFIG.connectN)
        if (ws.winner !== null) { setWinState(ws); endGame(ws, newCoins) }
        else setCurrentPlayer('p1')
      }, 420)
    }, delay)
    return () => clearTimeout(timer)
  }, [board, currentPlayer, gameMode, difficulty, winState.winner, droppingCell, gameOver, coinsDropped, playDrop, endGame])

  if (!gameMode) {
    return (
      <PageTransition className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">✋</div>
          <h1 className="text-3xl font-black text-white">Connect 5</h1>
          <p className="text-gray-400 mt-1">9×7 board · Connect 5 in a row to win</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          <Button variant="primary" size="xl" fullWidth onClick={() => { resetGame(); setGameMode('vs-ai') }}>
            🤖 vs AI
          </Button>
          <Button variant="secondary" size="xl" fullWidth onClick={() => { resetGame(); setGameMode('two-player') }}>
            👥 2 Players
          </Button>
        </div>
        <div className="w-full">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-center">AI Difficulty</p>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all ${
                  difficulty === d ? 'border-green-400 bg-green-400/10 text-green-400' : 'border-navy-700 bg-navy-800 text-gray-400'
                }`}
              >
                {d === 'easy' ? '😊' : d === 'medium' ? '🧠' : '🔥'} {d}
              </button>
            ))}
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/home')}>← Back</Button>
      </PageTransition>
    )
  }

  const isAITurn = gameMode === 'vs-ai' && currentPlayer === 'p2'

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center gap-4">
      <div className="w-full">
        <GameHeader
          title="Connect 5"
          currentPlayer={currentPlayer}
          winState={winState}
          playerLabels={playerLabels}
          extra={
            <button onClick={() => { resetGame(); setGameMode(null) }}
              className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
              ↺
            </button>
          }
        />
      </div>

      <GameBoard
        board={board}
        winState={winState}
        currentPlayer={currentPlayer}
        onColumnClick={handleColumnClick}
        disabled={isAITurn || !!droppingCell || gameOver}
        droppingCell={droppingCell}
        playerLabels={playerLabels}
      />

      {isAITurn && !gameOver && (
        <p className="text-sm text-gray-400 animate-pulse font-semibold">🤖 AI is thinking…</p>
      )}

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
