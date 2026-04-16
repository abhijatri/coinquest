import React, { createContext, useContext, useState, useCallback } from 'react'
import type { UserProfile, UserStats, GameMode, GameResult, ModeStats, StatsMap } from '../types'
import { getLevelFromXP } from '../utils/xpSystem'
import { getXPForResult } from '../utils/xpSystem'
import { ALL_ACHIEVEMENTS } from '../utils/achievements'

// ── Storage keys ─────────────────────────────────────────────────────────────
const KEY_PLAYER = 'coinquest_player'
const KEY_STATS  = 'coinquest_stats'

// ── Defaults ──────────────────────────────────────────────────────────────────
function defaultModeStats(): ModeStats {
  return { played: 0, wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, coinsDropped: 0 }
}

function defaultStatsMap(): StatsMap {
  return {
    classic: defaultModeStats(),
    power:   defaultModeStats(),
    blitz:   defaultModeStats(),
    connect5:defaultModeStats(),
    chaos:   defaultModeStats(),
  }
}

function defaultStats(): UserStats {
  return { uid: 'local', totalXP: 0, modes: defaultStatsMap(), achievements: [], updatedAt: Date.now() }
}

// ── Load / save helpers ───────────────────────────────────────────────────────
function loadPlayer(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY_PLAYER)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch { return null }
}

function savePlayer(p: UserProfile) {
  localStorage.setItem(KEY_PLAYER, JSON.stringify(p))
}

function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(KEY_STATS)
    if (!raw) return defaultStats()
    const parsed = JSON.parse(raw) as UserStats
    // Ensure all modes exist (handles new modes added after first play)
    const modes = defaultStatsMap()
    for (const m of Object.keys(modes) as GameMode[]) {
      if (parsed.modes?.[m]) modes[m] = { ...defaultModeStats(), ...parsed.modes[m] }
    }
    return { ...defaultStats(), ...parsed, modes }
  } catch { return defaultStats() }
}

function saveStats(s: UserStats) {
  localStorage.setItem(KEY_STATS, JSON.stringify({ ...s, updatedAt: Date.now() }))
}

// ── Context ───────────────────────────────────────────────────────────────────
interface PlayerContextValue {
  profile: UserProfile | null
  stats: UserStats
  setupProfile: (name: string, avatarId: string) => void
  recordResult: (mode: GameMode, result: GameResult, coinsDropped: number) => {
    xpGained: number
    newAchievements: string[]
    newLevel: number
  }
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(loadPlayer)
  const [stats, setStats]     = useState<UserStats>(loadStats)

  const setupProfile = useCallback((name: string, avatarId: string) => {
    const existing = loadPlayer()
    const p: UserProfile = {
      uid: 'local',
      displayName: name,
      avatarId,
      xp: existing?.xp ?? 0,
      level: existing?.level ?? 1,
      createdAt: existing?.createdAt ?? Date.now(),
      lastSeen: Date.now(),
    }
    savePlayer(p)
    setProfile(p)
  }, [])

  const recordResult = useCallback((mode: GameMode, result: GameResult, coinsDropped: number) => {
    const current = loadStats()
    const xpGained = getXPForResult(result)
    const newTotalXP = current.totalXP + xpGained
    const newLevel = getLevelFromXP(newTotalXP).level

    const modeStats = { ...current.modes[mode] }
    modeStats.played += 1
    modeStats.coinsDropped += coinsDropped
    if (result === 'win') {
      modeStats.wins += 1
      modeStats.currentStreak += 1
      if (modeStats.currentStreak > modeStats.bestStreak) modeStats.bestStreak = modeStats.currentStreak
    } else if (result === 'loss') {
      modeStats.losses += 1
      modeStats.currentStreak = 0
    } else {
      modeStats.draws += 1
      modeStats.currentStreak = 0
    }

    const updatedStats: UserStats = {
      ...current,
      totalXP: newTotalXP,
      modes: { ...current.modes, [mode]: modeStats },
    }

    // Check new achievements
    const newAchievements: string[] = []
    for (const ach of ALL_ACHIEVEMENTS) {
      if (!current.achievements.includes(ach.id) && ach.check(updatedStats)) {
        newAchievements.push(ach.id)
      }
    }
    if (newAchievements.length > 0) {
      updatedStats.achievements = [...current.achievements, ...newAchievements]
    }

    saveStats(updatedStats)
    setStats(updatedStats)

    // Update XP in profile
    const currentPlayer = loadPlayer()
    if (currentPlayer) {
      const updated = { ...currentPlayer, xp: newTotalXP, level: newLevel, lastSeen: Date.now() }
      savePlayer(updated)
      setProfile(updated)
    }

    return { xpGained, newAchievements, newLevel }
  }, [])

  return (
    <PlayerContext.Provider value={{ profile, stats, setupProfile, recordResult }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
