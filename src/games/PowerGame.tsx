import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameBoard } from '../components/game/GameBoard'
import { GameHeader } from '../components/game/GameHeader'
import { GameOver } from '../components/game/GameOver'
import { PowerTokenBar } from '../components/game/PowerTokenBar'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/layout/PageTransition'
import { useGameStats } from '../hooks/useGameStats'
import { useSound } from '../contexts/SoundContext'
import { usePlayer } from '../contexts/PlayerContext'
import {
  createBoard,
  dropCoin,
  checkWin,
  removeCoin,
  swapCoin,
  GAME_CONFIGS,
} from '../utils/gameLogic'
import type { Board, PlayerKey, WinState, PowerTokenState, PowerTokenType, PowerState, PowerPlayer } from '../types'

const CONFIG = GAME_CONFIGS.power

function defaultTokens(): PowerTokenState {
  return { bomb: true, swap: true, double: true }
}

function defaultPowerState(): PowerState {
  return {
    p1: defaultTokens(),
    p2: defaultTokens(),
    activeToken: null,
    lastPlaced: null,
    doubleUsed: false,
  }
}

interface GameResult {
  xpGained: number
  newAchievements: string[]
}

// In PowerGame, currentPlayer is always p1 or p2
function asPP(p: PlayerKey): PowerPlayer { return p as PowerPlayer }

export function PowerGame() {
  const navigate                      = useNavigate()
  const { recordResult }              = useGameStats()
  const { playDrop, playWin, playDraw, playPower } = useSound()
  const { profile }                   = usePlayer()

  const [started, setStarted]         = useState(false)
  const [board, setBoard]             = useState<Board>(createBoard(CONFIG.rows, CONFIG.cols))
  const [currentPlayer, setCurrentPlayer] = useState<PlayerKey>('p1')
  const [winState, setWinState]       = useState<WinState>({ winner: null, cells: [] })
  const [power, setPower]             = useState<PowerState>(defaultPowerState())
  const [droppingCell, setDroppingCell] = useState<{ row: number; col: number } | null>(null)
  const [coinsDropped, setCoinsDropped] = useState(0)
  const [gameResult, setGameResult]   = useState<GameResult | null>(null)
  const [gameOver, setGameOver]       = useState(false)
  const [message, setMessage]         = useState<string | null>(null)
  const msgTimerRef                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const playerLabels: Partial<Record<PlayerKey, string>> = {
    p1: profile?.displayName ?? 'Player 1',
    p2: 'Player 2',
  }

  const showMessage = (msg: string, ms = 2000) => {
    setMessage(msg)
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
    msgTimerRef.current = setTimeout(() => setMessage(null), ms)
  }

  useEffect(() => () => { if (msgTimerRef.current) clearTimeout(msgTimerRef.current) }, [])

  const resetGame = useCallback(() => {
    setBoard(createBoard(CONFIG.rows, CONFIG.cols))
    setCurrentPlayer('p1')
    setWinState({ winner: null, cells: [] })
    setPower(defaultPowerState())
    setDroppingCell(null)
    setCoinsDropped(0)
    setGameResult(null)
    setGameOver(false)
    setMessage(null)
  }, [])

  const endGame = useCallback(
    async (ws: WinState, totalCoins: number) => {
      if (ws.winner === 'draw') playDraw(); else playWin()
      setGameOver(true)

      const result = ws.winner === 'p1' ? 'win' : ws.winner === 'draw' ? 'draw' : 'loss'
      const outcome = recordResult('power', result, totalCoins)
      if (outcome) setGameResult({ xpGained: outcome.xpGained, newAchievements: outcome.newAchievements })
    },
    [playDraw, playWin, recordResult],
  )

  const nextPlayer = (p: PlayerKey): PlayerKey => (p === 'p1' ? 'p2' : 'p1')

  const finishTurn = useCallback(
    (newBoard: Board, newCoins: number) => {
      setCoinsDropped(newCoins)
      const ws = checkWin(newBoard, CONFIG.connectN)
      if (ws.winner !== null) {
        setWinState(ws)
        endGame(ws, newCoins)
      } else {
        setCurrentPlayer((p) => nextPlayer(p))
        setPower((prev) => ({ ...prev, activeToken: null, doubleUsed: false }))
      }
    },
    [endGame],
  )

  // ── Normal drop ────────────────────────────────────────────────────────────
  const handleNormalDrop = useCallback(
    (col: number) => {
      const result = dropCoin(board, col, currentPlayer)
      if (!result) { showMessage('Column is full!'); return }

      playDrop()
      setDroppingCell({ row: result.row, col })
      const newCoins = coinsDropped + 1

      setPower((prev) => ({
        ...prev,
        lastPlaced: { row: result.row, col },
      }))

      setTimeout(() => {
        setBoard(result.board)
        setDroppingCell(null)

        if (power.activeToken === 'double' && !power.doubleUsed) {
          // First coin of double — stay on same player, mark doubleUsed
          setPower((prev) => ({ ...prev, doubleUsed: true, activeToken: null }))
          setCoinsDropped(newCoins)
          showMessage('Drop your 2nd coin! ⏩')
        } else {
          finishTurn(result.board, newCoins)
        }
      }, 420)
    },
    [board, currentPlayer, coinsDropped, power, playDrop, finishTurn],
  )

  // ── Board click (normal or bomb) ───────────────────────────────────────────
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (winState.winner !== null || droppingCell || gameOver) return

      if (power.activeToken === 'bomb') {
        const target = board[row][col]
        const opponent: PlayerKey = currentPlayer === 'p1' ? 'p2' : 'p1'
        if (target !== opponent) {
          showMessage('Bomb must target an opponent coin! 💣')
          return
        }
        playPower()
        const newBoard = removeCoin(board, row, col)
        setBoard(newBoard)
        const pp = asPP(currentPlayer)
        setPower((prev) => ({
          ...prev,
          [pp]: { ...prev[pp], bomb: false },
          activeToken: null,
          lastPlaced: null,
        }))
        showMessage('💣 BOOM! Coin destroyed!')
        // Bomb doesn't end turn but consumes token — now do normal turn
      }
    },
    [board, currentPlayer, power, winState.winner, droppingCell, gameOver, playPower],
  )

  // ── Column click ───────────────────────────────────────────────────────────
  const handleColumnClick = useCallback(
    (col: number) => {
      if (winState.winner !== null || droppingCell || gameOver) return

      if (power.activeToken === 'swap') {
        // Swap last placed coin to this column
        if (!power.lastPlaced) { showMessage('No coin to swap!'); return }
        if (col === power.lastPlaced.col) { showMessage('Pick a different column!'); return }
        const swapped = swapCoin(board, power.lastPlaced.row, power.lastPlaced.col, col)
        if (!swapped) { showMessage("Can't swap there — column full!"); return }
        playPower()
        setBoard(swapped.board)
        const pp = asPP(currentPlayer)
        setPower((prev) => ({
          ...prev,
          [pp]: { ...prev[pp], swap: false },
          activeToken: null,
          lastPlaced: { row: swapped.row, col },
        }))
        showMessage('🔄 Coin swapped!')
        // Swap doesn't end turn — player can still drop
        return
      }

      if (power.activeToken === 'bomb') {
        showMessage('Click on an opponent coin on the board to bomb it! 💣')
        return
      }

      handleNormalDrop(col)
    },
    [board, currentPlayer, power, winState.winner, droppingCell, gameOver, handleNormalDrop, playPower],
  )

  // ── Activate power token ───────────────────────────────────────────────────
  const handleActivateToken = useCallback(
    (token: PowerTokenType) => {
      if (winState.winner !== null || gameOver) return
      const pp = asPP(currentPlayer)
      const tokens = power[pp]
      if (!tokens[token]) return

      if (power.activeToken === token) {
        // Deselect
        setPower((prev) => ({ ...prev, activeToken: null }))
        return
      }

      if (token === 'double') {
        // Mark token used immediately when activated
        setPower((prev) => ({
          ...prev,
          [pp]: { ...prev[pp], double: false },
          activeToken: 'double',
          doubleUsed: false,
        }))
        showMessage('Drop your first coin! ⏩')
      } else {
        setPower((prev) => ({ ...prev, activeToken: token }))
      }
    },
    [currentPlayer, power, winState.winner, gameOver],
  )

  if (!started) {
    return (
      <PageTransition className="max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">💣</div>
          <h1 className="text-3xl font-black text-white">Power Mode</h1>
          <p className="text-gray-400 mt-1">Each player gets 3 special power tokens</p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-4 w-full space-y-3">
          {[
            { icon: '💣', name: 'Bomb',   desc: 'Remove any 1 opponent coin from the board' },
            { icon: '🔄', name: 'Swap',   desc: 'Move your last coin to a different column' },
            { icon: '⏩', name: 'Double', desc: 'Drop 2 coins in a single turn' },
          ].map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="xl" fullWidth onClick={() => { resetGame(); setStarted(true) }}>
            🎮 Start 2-Player Game
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
          title="Power Mode"
          currentPlayer={currentPlayer}
          winState={winState}
          playerLabels={playerLabels}
          extra={
            <button
              onClick={() => { resetGame(); setStarted(false) }}
              className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gray-400 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Restart"
            >
              ↺
            </button>
          }
        />
      </div>

      {/* Message banner */}
      {message && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-bold px-4 py-2 rounded-xl animate-slide-down">
          {message}
        </div>
      )}

      {/* Board — with cell click support for bomb */}
      <div
        onClick={(e) => {
          if (power.activeToken !== 'bomb') return
          const target = e.target as HTMLElement
          const cell = target.closest('[data-row][data-col]') as HTMLElement | null
          if (cell) {
            const row = parseInt(cell.dataset.row ?? '-1', 10)
            const col = parseInt(cell.dataset.col ?? '-1', 10)
            if (row >= 0 && col >= 0) handleCellClick(row, col)
          }
        }}
      >
        <GameBoard
          board={board}
          winState={winState}
          currentPlayer={currentPlayer}
          onColumnClick={handleColumnClick}
          disabled={!!droppingCell || gameOver}
          droppingCell={droppingCell}
          playerLabels={playerLabels}
        />
      </div>

      {/* Power tokens for current player */}
      {!gameOver && winState.winner === null && (
        <PowerTokenBar
          tokens={power[asPP(currentPlayer)]}
          currentPlayer={currentPlayer}
          activeToken={power.activeToken}
          onActivate={handleActivateToken}
          disabled={!!droppingCell}
        />
      )}

      {gameOver && (
        <GameOver
          winState={winState}
          playerLabels={playerLabels}
          xpGained={gameResult?.xpGained}
          newAchievements={gameResult?.newAchievements}
          onPlayAgain={() => { resetGame() }}
          onHome={() => navigate('/home')}
        />
      )}
    </PageTransition>
  )
}
