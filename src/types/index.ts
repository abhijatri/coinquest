// ─── Player / Cell Types ────────────────────────────────────────────────────
export type PlayerKey = 'p1' | 'p2' | 'p3' | 'p4'
export type CellValue = PlayerKey | null
export type Board = CellValue[][]

// ─── Game Config ─────────────────────────────────────────────────────────────
export type GameMode = 'classic' | 'power' | 'blitz' | 'connect5' | 'chaos'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameResult = 'win' | 'loss' | 'draw'

export interface GameConfig {
  rows: number
  cols: number
  connectN: number
  playerCount: number
  timeLimit?: number // seconds per turn (blitz)
}

// ─── Power Mode ───────────────────────────────────────────────────────────────
export type PowerTokenType = 'bomb' | 'swap' | 'double'
export type PowerPlayer = 'p1' | 'p2'

export interface PowerTokenState {
  bomb: boolean    // true = available
  swap: boolean
  double: boolean
}

export interface PowerState {
  p1: PowerTokenState
  p2: PowerTokenState
  activeToken: PowerTokenType | null
  lastPlaced: { row: number; col: number } | null
  doubleUsed: boolean // whether 1st coin of double has been placed
}

// ─── Win State ────────────────────────────────────────────────────────────────
export interface WinState {
  winner: PlayerKey | 'draw' | null
  cells: Array<{ row: number; col: number }>
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string
  displayName: string
  avatarId: string
  xp: number
  level: number
  createdAt: number
  lastSeen: number
}

// ─── Game Stats (per mode) ────────────────────────────────────────────────────
export interface ModeStats {
  played: number
  wins: number
  losses: number
  draws: number
  currentStreak: number
  bestStreak: number
  coinsDropped: number
}

export type StatsMap = Record<GameMode, ModeStats>

export interface UserStats {
  uid: string
  totalXP: number
  modes: StatsMap
  achievements: string[]
  updatedAt: number
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  check: (stats: UserStats) => boolean
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export interface AvatarDef {
  id: string
  emoji: string
  name: string
  bg: string
  ring: string
}

// ─── Toast Notification ───────────────────────────────────────────────────────
export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

// ─── Sound Context ────────────────────────────────────────────────────────────
export interface SoundContextValue {
  soundEnabled: boolean
  toggleSound: () => void
  playDrop: () => void
  playWin: () => void
  playDraw: () => void
  playTick: () => void
  playPower: () => void
}

// ─── Theme Context ────────────────────────────────────────────────────────────
export interface ThemeContextValue {
  darkMode: boolean
  toggleDark: () => void
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
export interface AuthContextValue {
  user: import('firebase/auth').User | null
  profile: UserProfile | null
  stats: UserStats | null
  loading: boolean
  refreshStats: () => Promise<void>
}

// ─── XP Level ────────────────────────────────────────────────────────────────
export interface LevelInfo {
  level: number
  label: string
  xpRequired: number
  nextXP: number
  progress: number // 0-100 percentage
}
