import type { Achievement, UserStats } from '../types'
import { getLevelFromXP } from './xpSystem'

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ─── First Steps ─────────────────────────────────────────────────
  {
    id: 'first_game',
    name: 'Coin Rookie',
    description: 'Play your very first game',
    icon: '🎮',
    check: (s) => Object.values(s.modes).some((m) => m.played >= 1),
  },
  {
    id: 'first_win',
    name: 'First Victory!',
    description: 'Win your first game',
    icon: '🏆',
    check: (s) => Object.values(s.modes).some((m) => m.wins >= 1),
  },
  {
    id: 'first_10',
    name: 'Getting Warmed Up',
    description: 'Play 10 games total',
    icon: '🔥',
    check: (s) => Object.values(s.modes).reduce((acc, m) => acc + m.played, 0) >= 10,
  },
  // ─── Win Streaks ─────────────────────────────────────────────────
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Win 3 games in a row',
    icon: '⚡',
    check: (s) => Object.values(s.modes).some((m) => m.bestStreak >= 3),
  },
  {
    id: 'streak_5',
    name: 'On Fire!',
    description: 'Win 5 games in a row',
    icon: '🔥',
    check: (s) => Object.values(s.modes).some((m) => m.bestStreak >= 5),
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '💥',
    check: (s) => Object.values(s.modes).some((m) => m.bestStreak >= 10),
  },
  // ─── Mode Specific ────────────────────────────────────────────────
  {
    id: 'classic_10',
    name: 'Classic Pro',
    description: 'Win 10 Classic games',
    icon: '🟡',
    check: (s) => s.modes.classic.wins >= 10,
  },
  {
    id: 'power_player',
    name: 'Power Player',
    description: 'Win 5 Power Mode games',
    icon: '💣',
    check: (s) => s.modes.power.wins >= 5,
  },
  {
    id: 'blitz_master',
    name: 'Blitz Master',
    description: 'Win 5 Blitz games',
    icon: '⏩',
    check: (s) => s.modes.blitz.wins >= 5,
  },
  {
    id: 'connect5_winner',
    name: 'High Five!',
    description: 'Win a Connect 5 game',
    icon: '✋',
    check: (s) => s.modes.connect5.wins >= 1,
  },
  {
    id: 'chaos_king',
    name: 'Chaos King',
    description: 'Win a Color Chaos game',
    icon: '🌈',
    check: (s) => s.modes.chaos.wins >= 1,
  },
  // ─── Volume Badges ────────────────────────────────────────────────
  {
    id: 'coins_100',
    name: 'Coin Collector',
    description: 'Drop 100 coins total',
    icon: '🪙',
    check: (s) => Object.values(s.modes).reduce((acc, m) => acc + m.coinsDropped, 0) >= 100,
  },
  {
    id: 'coins_500',
    name: 'Coin Hoarder',
    description: 'Drop 500 coins total',
    icon: '💰',
    check: (s) => Object.values(s.modes).reduce((acc, m) => acc + m.coinsDropped, 0) >= 500,
  },
  {
    id: 'coins_1000',
    name: 'Coin Legend',
    description: 'Drop 1000 coins total',
    icon: '👑',
    check: (s) => Object.values(s.modes).reduce((acc, m) => acc + m.coinsDropped, 0) >= 1000,
  },
  // ─── XP / Level Milestones ────────────────────────────────────────
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    check: (s) => getLevelFromXP(s.totalXP).level >= 5,
  },
  {
    id: 'level_10',
    name: 'Grandmaster',
    description: 'Reach Level 10',
    icon: '🌟',
    check: (s) => getLevelFromXP(s.totalXP).level >= 10,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Play all 5 game modes',
    icon: '🗺️',
    check: (s) => Object.values(s.modes).every((m) => m.played >= 1),
  },
  {
    id: 'win_all_modes',
    name: 'All-Rounder',
    description: 'Win in all 5 game modes',
    icon: '🎯',
    check: (s) => Object.values(s.modes).every((m) => m.wins >= 1),
  },
]

// ─── Helper — check achievements against updated stats ───────────────────────
export function checkNewAchievements(
  stats: UserStats,
  alreadyUnlocked: string[],
): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(stats),
  )
}
