import type { Board, CellValue, PlayerKey, WinState, GameConfig } from '../types'

// ─── Board Factory ────────────────────────────────────────────────────────────
export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array<CellValue>(cols).fill(null))
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

// ─── Drop Coin ────────────────────────────────────────────────────────────────
export function dropCoin(
  board: Board,
  col: number,
  player: PlayerKey,
): { board: Board; row: number } | null {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      const next = cloneBoard(board)
      next[row][col] = player
      return { board: next, row }
    }
  }
  return null // column full
}

// ─── Column Full? ─────────────────────────────────────────────────────────────
export function isColumnFull(board: Board, col: number): boolean {
  return board[0][col] !== null
}

// ─── Valid Moves ──────────────────────────────────────────────────────────────
export function getValidCols(board: Board): number[] {
  return Array.from({ length: board[0].length }, (_, i) => i).filter(
    (c) => !isColumnFull(board, c),
  )
}

// ─── Board Full? ──────────────────────────────────────────────────────────────
export function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== null)
}

// ─── Win Detection ────────────────────────────────────────────────────────────
export function checkWin(
  board: Board,
  connectN: number,
): WinState {
  const rows = board.length
  const cols = board[0].length

  const directions: [number, number][] = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c]
      if (cell === null) continue

      for (const [dr, dc] of directions) {
        const cells: Array<{ row: number; col: number }> = [{ row: r, col: c }]
        for (let k = 1; k < connectN; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break
          if (board[nr][nc] !== cell) break
          cells.push({ row: nr, col: nc })
        }
        if (cells.length === connectN) {
          return { winner: cell as PlayerKey, cells }
        }
      }
    }
  }

  return { winner: isBoardFull(board) ? 'draw' : null, cells: [] }
}

// ─── Power Mode: Remove Coin (Bomb) ──────────────────────────────────────────
// Removes coin at (row, col) and shifts coins above down by 1
export function removeCoin(board: Board, row: number, col: number): Board {
  const next = cloneBoard(board)
  // Shift all cells above 'row' down by one in this column
  for (let r = row; r > 0; r--) {
    next[r][col] = next[r - 1][col]
  }
  next[0][col] = null
  return next
}

// ─── Power Mode: Swap Last Coin ───────────────────────────────────────────────
// Moves last placed coin from its column to targetCol
export function swapCoin(
  board: Board,
  fromRow: number,
  fromCol: number,
  toCol: number,
): { board: Board; row: number } | null {
  const player = board[fromRow][fromCol]
  if (!player) return null
  // Remove coin from original position
  const after = removeCoin(board, fromRow, fromCol)
  // Drop in new column
  return dropCoin(after, toCol, player as PlayerKey)
}

// ─── Game Config Presets ──────────────────────────────────────────────────────
export const GAME_CONFIGS: Record<string, GameConfig> = {
  classic: { rows: 6, cols: 7, connectN: 4, playerCount: 2 },
  power:   { rows: 6, cols: 7, connectN: 4, playerCount: 2 },
  blitz:   { rows: 6, cols: 7, connectN: 4, playerCount: 2, timeLimit: 10 },
  connect5:{ rows: 7, cols: 9, connectN: 5, playerCount: 2 },
  chaos:   { rows: 7, cols: 9, connectN: 4, playerCount: 4 },
}

// ─── Player colors for rendering ─────────────────────────────────────────────
export const PLAYER_COLORS: Record<PlayerKey, string> = {
  p1: '#facc15', // yellow
  p2: '#f43f5e', // red/coral
  p3: '#38bdf8', // sky blue
  p4: '#4ade80', // green
}

export const PLAYER_LABELS: Record<PlayerKey, string> = {
  p1: 'Player 1',
  p2: 'Player 2',
  p3: 'Player 3',
  p4: 'Player 4',
}

export const PLAYER_BG: Record<PlayerKey, string> = {
  p1: 'bg-yellow-400',
  p2: 'bg-rose-500',
  p3: 'bg-sky-400',
  p4: 'bg-green-400',
}

export const PLAYER_RING: Record<PlayerKey, string> = {
  p1: 'ring-yellow-400',
  p2: 'ring-rose-500',
  p3: 'ring-sky-400',
  p4: 'ring-green-400',
}
