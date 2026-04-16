import React from 'react'
import type { Achievement } from '../../types'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all',
        unlocked
          ? 'bg-yellow-400/10 border-yellow-400/30 shadow-lg shadow-yellow-400/5'
          : 'bg-navy-800/50 border-navy-700/50 opacity-50',
      ].join(' ')}
      title={unlocked ? achievement.description : `Locked: ${achievement.description}`}
    >
      <div
        className={[
          'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
          unlocked ? 'bg-yellow-400/20' : 'bg-navy-700 grayscale',
        ].join(' ')}
      >
        {unlocked ? achievement.icon : '🔒'}
      </div>
      <p
        className={`text-xs font-black text-center leading-tight ${
          unlocked ? 'text-yellow-400' : 'text-gray-600'
        }`}
      >
        {achievement.name}
      </p>
      {unlocked && (
        <p className="text-xs text-gray-400 text-center leading-tight hidden sm:block">
          {achievement.description}
        </p>
      )}
    </div>
  )
}
