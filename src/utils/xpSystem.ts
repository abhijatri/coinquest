import type { GameResult, LevelInfo } from '../types'

// XP gains per result
export function getXPForResult(result: GameResult): number {
  switch (result) {
    case 'win':  return 10
    case 'draw': return 3
    case 'loss': return 1
  }
}

// XP thresholds for each level (index = level - 1)
const LEVEL_XP: number[] = [
  0,    // Level 1
  50,   // Level 2
  120,  // Level 3
  220,  // Level 4
  360,  // Level 5
  550,  // Level 6
  800,  // Level 7
  1100, // Level 8
  1500, // Level 9
  2000, // Level 10
  2600, // Level 11
  3300, // Level 12
  4100, // Level 13
  5000, // Level 14
  6100, // Level 15
  7400, // Level 16
  8900, // Level 17
  10600,// Level 18
  12500,// Level 19
  14600,// Level 20
]

const LEVEL_LABELS: string[] = [
  'Rookie',         // 1
  'Apprentice',     // 2
  'Challenger',     // 3
  'Contender',      // 4
  'Competitor',     // 5
  'Tactician',      // 6
  'Strategist',     // 7
  'Expert',         // 8
  'Master',         // 9
  'Grandmaster',    // 10
  'Champion',       // 11
  'Legend',         // 12
  'Mythic',         // 13
  'Cosmic',         // 14
  'Stellar',        // 15
  'Galactic',       // 16
  'Universal',      // 17
  'Eternal',        // 18
  'Immortal',       // 19
  'CoinQuest God',  // 20
]

export function getLevelFromXP(xp: number): LevelInfo {
  let level = 1
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) {
      level = i + 1
      break
    }
  }
  level = Math.min(level, 20)

  const xpRequired = LEVEL_XP[level - 1]
  const nextXP = level < 20 ? LEVEL_XP[level] : LEVEL_XP[19]
  const xpInLevel = xp - xpRequired
  const xpNeededForNext = nextXP - xpRequired
  const progress = level >= 20 ? 100 : Math.min(100, Math.floor((xpInLevel / xpNeededForNext) * 100))

  return {
    level,
    label: LEVEL_LABELS[level - 1],
    xpRequired,
    nextXP,
    progress,
  }
}
