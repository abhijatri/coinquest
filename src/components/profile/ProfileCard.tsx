import React from 'react'
import type { UserProfile } from '../../types'
import { getLevelFromXP } from '../../utils/xpSystem'
import { getAvatar } from '../../utils/avatars'

interface ProfileCardProps {
  profile: UserProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const levelInfo = getLevelFromXP(profile.xp)
  const avatar = getAvatar(profile.avatarId)

  return (
    <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-xl">
      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-5xl shadow-lg ring-4 ${avatar.ring}`}
        >
          {avatar.emoji}
        </div>
        {/* Level badge */}
        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-navy-950 text-xs font-black px-2 py-1 rounded-full border-2 border-navy-900">
          Lv.{levelInfo.level}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">{profile.displayName}</h2>
        <p className="text-sm font-bold text-yellow-400">{levelInfo.label}</p>
      </div>

      {/* XP bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
          <span>{profile.xp.toLocaleString()} XP</span>
          <span>
            {levelInfo.level < 20 ? `${levelInfo.nextXP.toLocaleString()} XP` : 'MAX'}
          </span>
        </div>
        <div className="h-3 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-700"
            style={{ width: `${levelInfo.progress}%` }}
          />
        </div>
        {levelInfo.level < 20 && (
          <p className="text-center text-xs text-gray-500 mt-1">
            {(levelInfo.nextXP - profile.xp).toLocaleString()} XP to Level {levelInfo.level + 1}
          </p>
        )}
      </div>
    </div>
  )
}
