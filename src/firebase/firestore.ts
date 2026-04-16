import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { UserProfile, UserStats, ModeStats, StatsMap, GameMode, GameResult } from '../types'
import { getXPForResult, getLevelFromXP } from '../utils/xpSystem'
import { ALL_ACHIEVEMENTS } from '../utils/achievements'

// ─── Default Stats Factory ────────────────────────────────────────────────────
function defaultModeStats(): ModeStats {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    coinsDropped: 0,
  }
}

function defaultStatsMap(): StatsMap {
  return {
    classic: defaultModeStats(),
    power: defaultModeStats(),
    blitz: defaultModeStats(),
    connect5: defaultModeStats(),
    chaos: defaultModeStats(),
  }
}

// ─── Profile CRUD ─────────────────────────────────────────────────────────────
export async function createUserProfile(
  uid: string,
  displayName: string,
  avatarId: string,
): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    displayName,
    avatarId,
    xp: 0,
    level: 1,
    createdAt: Date.now(),
    lastSeen: Date.now(),
  }

  const stats: Omit<UserStats, 'uid'> = {
    totalXP: 0,
    modes: defaultStatsMap(),
    achievements: [],
    updatedAt: Date.now(),
  }

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  })

  await setDoc(doc(db, 'stats', uid), {
    uid,
    ...stats,
    updatedAt: serverTimestamp(),
  })

  return profile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      uid,
      displayName: data.displayName,
      avatarId: data.avatarId,
      xp: data.xp ?? 0,
      level: data.level ?? 1,
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt ?? 0,
      lastSeen:
        data.lastSeen instanceof Timestamp ? data.lastSeen.toMillis() : data.lastSeen ?? 0,
    }
  } catch {
    return null
  }
}

export async function updateLastSeen(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { lastSeen: serverTimestamp() })
  } catch {
    // Non-critical — ignore
  }
}

// ─── Stats CRUD ───────────────────────────────────────────────────────────────
export async function getUserStats(uid: string): Promise<UserStats | null> {
  try {
    const snap = await getDoc(doc(db, 'stats', uid))
    if (!snap.exists()) return null
    const data = snap.data()
    // Merge with defaults to handle newly-added modes
    const modes: StatsMap = defaultStatsMap()
    for (const mode of Object.keys(modes) as GameMode[]) {
      if (data.modes?.[mode]) {
        modes[mode] = { ...defaultModeStats(), ...data.modes[mode] }
      }
    }
    return {
      uid,
      totalXP: data.totalXP ?? 0,
      modes,
      achievements: data.achievements ?? [],
      updatedAt:
        data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt ?? 0,
    }
  } catch {
    return null
  }
}

// ─── Record game result & update XP / achievements ────────────────────────────
export async function recordGameResult(
  uid: string,
  mode: GameMode,
  result: GameResult,
  coinsDropped: number,
): Promise<{ newAchievements: string[]; xpGained: number; newLevel: number }> {
  const [profileSnap, statsSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDoc(doc(db, 'stats', uid)),
  ])

  if (!profileSnap.exists() || !statsSnap.exists()) {
    throw new Error('User data not found')
  }

  const currentStatsData = statsSnap.data()
  const modes: StatsMap = defaultStatsMap()
  for (const m of Object.keys(modes) as GameMode[]) {
    if (currentStatsData.modes?.[m]) {
      modes[m] = { ...defaultModeStats(), ...currentStatsData.modes[m] }
    }
  }

  const xpGained = getXPForResult(result)
  const newTotalXP = (currentStatsData.totalXP ?? 0) + xpGained
  const newLevel = getLevelFromXP(newTotalXP).level

  // Update mode stats
  const modeStats = { ...modes[mode] }
  modeStats.played += 1
  modeStats.coinsDropped += coinsDropped
  if (result === 'win') {
    modeStats.wins += 1
    modeStats.currentStreak += 1
    if (modeStats.currentStreak > modeStats.bestStreak) {
      modeStats.bestStreak = modeStats.currentStreak
    }
  } else if (result === 'loss') {
    modeStats.losses += 1
    modeStats.currentStreak = 0
  } else {
    modeStats.draws += 1
    modeStats.currentStreak = 0
  }

  const updatedModes = { ...modes, [mode]: modeStats }
  const currentAchievements: string[] = currentStatsData.achievements ?? []

  // Check for new achievements
  const updatedStats: UserStats = {
    uid,
    totalXP: newTotalXP,
    modes: updatedModes,
    achievements: currentAchievements,
    updatedAt: Date.now(),
  }
  const newAchievements: string[] = []
  for (const ach of ALL_ACHIEVEMENTS) {
    if (!currentAchievements.includes(ach.id) && ach.check(updatedStats)) {
      newAchievements.push(ach.id)
    }
  }

  // Batch update
  const statsUpdate: Record<string, unknown> = {
    totalXP: newTotalXP,
    [`modes.${mode}`]: modeStats,
    updatedAt: serverTimestamp(),
  }
  if (newAchievements.length > 0) {
    statsUpdate.achievements = arrayUnion(...newAchievements)
  }

  await Promise.all([
    updateDoc(doc(db, 'stats', uid), statsUpdate),
    updateDoc(doc(db, 'users', uid), {
      xp: increment(xpGained),
      level: newLevel,
      lastSeen: serverTimestamp(),
    }),
  ])

  return { newAchievements, xpGained, newLevel }
}

// ─── Profile update (display name / avatar) ───────────────────────────────────
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'avatarId'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...updates, lastSeen: serverTimestamp() })
}
