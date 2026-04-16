import type { Board, PlayerKey, Difficulty } from '../types'
import {
  dropCoin,
  getValidCols,
  checkWin,
  cloneBoard,
  isBoardFull,
} from './gameLogic'

// ─── Public entry ─────────────────────────────────────────────────────────────
export function getAIMove(
  board: Board,
  aiPlayer: PlayerKey,
  humanPlayer: PlayerKey,
  difficulty: Difficulty,
  connectN: number,
): number {
  const validCols = getValidCols(board)
  if (validCols.length === 0) return -1

  switch (difficulty) {
    case 'easy':
      return easyMove(board, validCols)
    case 'medium':
      return bestMove(board, aiPlayer, humanPlayer, connectN, 3)
    case 'hard':
      return bestMove(board, aiPlayer, humanPlayer, connectN, 7)
  }
}

// ─── Easy: 70% random, 30% block/win ─────────────────────────────────────────
function easyMove(board: Board, validCols: number[]): number {
  if (Math.random() < 0.3) {
    // Try to win or block
    const smart = tryWinOrBlock(board, validCols, 'p2', 'p1', 4)
    if (smart !== -1) return smart
  }
  return validCols[Math.floor(Math.random() * validCols.length)]
}

function tryWinOrBlock(
  board: Board,
  validCols: number[],
  ai: PlayerKey,
  human: PlayerKey,
  connectN: number,
): number {
  // Try to win first
  for (const col of validCols) {
    const result = dropCoin(board, col, ai)
    if (result && checkWin(result.board, connectN).winner === ai) return col
  }
  // Block human
  for (const col of validCols) {
    const result = dropCoin(board, col, human)
    if (result && checkWin(result.board, connectN).winner === human) return col
  }
  return -1
}

// ─── Medium/Hard: Minimax with Alpha-Beta pruning ─────────────────────────────
function bestMove(
  board: Board,
  ai: PlayerKey,
  human: PlayerKey,
  connectN: number,
  depth: number,
): number {
  const validCols = getValidCols(board)
  let bestScore = -Infinity
  let bestCol = validCols[Math.floor(validCols.length / 2)] // prefer center

  // Order: center columns first (heuristic)
  const center = Math.floor(board[0].length / 2)
  const ordered = [...validCols].sort(
    (a, b) => Math.abs(a - center) - Math.abs(b - center),
  )

  for (const col of ordered) {
    const result = dropCoin(board, col, ai)
    if (!result) continue
    const score = minimax(result.board, depth - 1, -Infinity, Infinity, false, ai, human, connectN)
    if (score > bestScore) {
      bestScore = score
      bestCol = col
    }
  }
  return bestCol
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ai: PlayerKey,
  human: PlayerKey,
  connectN: number,
): number {
  const { winner } = checkWin(board, connectN)
  if (winner === ai)    return 10000 + depth
  if (winner === human) return -10000 - depth
  if (isBoardFull(board) || depth === 0) {
    return evaluateBoard(board, ai, human, connectN)
  }

  const validCols = getValidCols(board)
  const center = Math.floor(board[0].length / 2)
  const ordered = [...validCols].sort(
    (a, b) => Math.abs(a - center) - Math.abs(b - center),
  )

  if (maximizing) {
    let best = -Infinity
    for (const col of ordered) {
      const result = dropCoin(board, col, ai)
      if (!result) continue
      best = Math.max(best, minimax(result.board, depth - 1, alpha, beta, false, ai, human, connectN))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const col of ordered) {
      const result = dropCoin(board, col, human)
      if (!result) continue
      best = Math.min(best, minimax(result.board, depth - 1, alpha, beta, true, ai, human, connectN))
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

// ─── Static board evaluator ───────────────────────────────────────────────────
function evaluateBoard(
  board: Board,
  ai: PlayerKey,
  human: PlayerKey,
  connectN: number,
): number {
  let score = 0
  const rows = board.length
  const cols = board[0].length
  const center = Math.floor(cols / 2)

  // Center column preference
  for (let r = 0; r < rows; r++) {
    if (board[r][center] === ai) score += 3
    if (board[r][center] === human) score -= 3
  }

  // All windows of length connectN
  const directions: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal ↘
    [1, -1], // diagonal ↙
  ]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of directions) {
        const window: Array<typeof board[0][0]> = []
        for (let k = 0; k < connectN; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break
          window.push(board[nr][nc])
        }
        if (window.length === connectN) {
          score += scoreWindow(window, ai, human)
        }
      }
    }
  }

  return score
}

function scoreWindow(
  window: Array<ReturnType<typeof cloneBoard>[0][0]>,
  ai: PlayerKey,
  human: PlayerKey,
): number {
  const aiCount    = window.filter((c) => c === ai).length
  const humanCount = window.filter((c) => c === human).length
  const emptyCount = window.filter((c) => c === null).length

  if (aiCount > 0 && humanCount > 0) return 0 // mixed — no value

  if (aiCount === 4) return 1000
  if (aiCount === 3 && emptyCount === 1) return 100
  if (aiCount === 2 && emptyCount === 2) return 10

  if (humanCount === 4) return -1000
  if (humanCount === 3 && emptyCount === 1) return -200 // prioritize blocking
  if (humanCount === 2 && emptyCount === 2) return -20

  return 0
}
