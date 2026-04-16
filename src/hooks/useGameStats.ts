import { usePlayer } from '../contexts/PlayerContext'
import type { GameMode, GameResult } from '../types'

interface GameEndResult {
  newAchievements: string[]
  xpGained: number
  newLevel: number
}

export function useGameStats() {
  const { recordResult: record } = usePlayer()

  function recordResult(mode: GameMode, result: GameResult, coinsDropped: number): GameEndResult {
    return record(mode, result, coinsDropped)
  }

  return { recordResult }
}
