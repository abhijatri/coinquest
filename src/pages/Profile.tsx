import React from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { ProfileCard } from '../components/profile/ProfileCard'
import { StatsCard, EmptyStatsCard } from '../components/profile/StatsCard'
import { AchievementBadge } from '../components/profile/AchievementBadge'
import { PageTransition } from '../components/layout/PageTransition'
import { ALL_ACHIEVEMENTS } from '../utils/achievements'
import type { GameMode } from '../types'

const MODES: GameMode[] = ['classic', 'power', 'blitz', 'connect5', 'chaos']

export function Profile() {
  const { profile, stats } = usePlayer()

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Set up your profile on the home screen first!</p>
      </div>
    )
  }

  const unlockedSet = new Set(stats.achievements)
  const totalGames  = Object.values(stats.modes).reduce((s, m) => s + m.played, 0)

  return (
    <PageTransition className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <ProfileCard profile={profile} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Games Played', value: totalGames },
          { label: 'Total Wins',   value: Object.values(stats.modes).reduce((s, m) => s + m.wins, 0) },
          { label: 'Achievements', value: `${stats.achievements.length}/${ALL_ACHIEVEMENTS.length}` },
        ].map((s) => (
          <div key={s.label} className="bg-navy-800 border border-navy-700 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-yellow-400">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Game Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODES.map((mode) =>
            stats.modes[mode].played > 0
              ? <StatsCard key={mode} mode={mode} stats={stats.modes[mode]} />
              : <EmptyStatsCard key={mode} mode={mode} />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          Achievements ({stats.achievements.length}/{ALL_ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ALL_ACHIEVEMENTS.map((ach) => (
            <AchievementBadge key={ach.id} achievement={ach} unlocked={unlockedSet.has(ach.id)} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
