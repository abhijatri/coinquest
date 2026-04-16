import React from 'react'
import type { ModeStats, GameMode } from '../../types'

interface StatsCardProps {
  mode: GameMode
  stats: ModeStats
}

const MODE_META: Record<GameMode, { label: string; icon: string; color: string }> = {
  classic:  { label: 'Classic Connect 4', icon: '🟡', color: 'yellow' },
  power:    { label: 'Power Mode',         icon: '💣', color: 'rose' },
  blitz:    { label: 'Timed Blitz',        icon: '⏩', color: 'sky' },
  connect5: { label: 'Connect 5',          icon: '✋', color: 'green' },
  chaos:    { label: 'Color Chaos',        icon: '🌈', color: 'purple' },
}

const COLOR_MAP: Record<string, { bar: string; text: string; bg: string }> = {
  yellow: { bar: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  rose:   { bar: 'bg-rose-400',   text: 'text-rose-400',   bg: 'bg-rose-400/10' },
  sky:    { bar: 'bg-sky-400',    text: 'text-sky-400',    bg: 'bg-sky-400/10' },
  green:  { bar: 'bg-green-400',  text: 'text-green-400',  bg: 'bg-green-400/10' },
  purple: { bar: 'bg-purple-400', text: 'text-purple-400', bg: 'bg-purple-400/10' },
}

function CSSBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function StatsCard({ mode, stats }: StatsCardProps) {
  const meta     = MODE_META[mode]
  const colors   = COLOR_MAP[meta.color]
  const total    = stats.played
  const winRate  = total > 0 ? Math.round((stats.wins / total) * 100) : 0

  const bars = [
    { label: 'Wins',   value: stats.wins,   max: total || 1 },
    { label: 'Draws',  value: stats.draws,  max: total || 1 },
    { label: 'Losses', value: stats.losses, max: total || 1 },
  ]

  return (
    <div className={`rounded-2xl border border-navy-700 ${colors.bg} p-4`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h3 className={`font-black text-base ${colors.text}`}>{meta.label}</h3>
          <p className="text-xs text-gray-500">{total} game{total !== 1 ? 's' : ''} played</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`text-2xl font-black ${colors.text}`}>{winRate}%</p>
          <p className="text-xs text-gray-500">Win Rate</p>
        </div>
      </div>

      {/* Bar charts */}
      <div className="space-y-2 mb-4">
        {bars.map(({ label, value, max }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="font-semibold">{label}</span>
              <span className="font-bold text-white">{value}</span>
            </div>
            <CSSBar value={value} max={max} colorClass={colors.bar} />
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-navy-800/50 rounded-xl px-2 py-2">
          <p className={`font-black text-lg ${colors.text}`}>{stats.currentStreak}</p>
          <p className="text-xs text-gray-500 leading-tight">Streak</p>
        </div>
        <div className="bg-navy-800/50 rounded-xl px-2 py-2">
          <p className={`font-black text-lg ${colors.text}`}>{stats.bestStreak}</p>
          <p className="text-xs text-gray-500 leading-tight">Best</p>
        </div>
        <div className="bg-navy-800/50 rounded-xl px-2 py-2">
          <p className={`font-black text-lg ${colors.text}`}>{stats.coinsDropped}</p>
          <p className="text-xs text-gray-500 leading-tight">Coins</p>
        </div>
      </div>
    </div>
  )
}

// Empty state for a mode with no plays
export function EmptyStatsCard({ mode }: { mode: GameMode }) {
  const meta = MODE_META[mode]
  return (
    <div className="rounded-2xl border border-navy-700/50 border-dashed p-6 text-center">
      <span className="text-3xl">{meta.icon}</span>
      <p className="text-sm font-bold text-gray-500 mt-2">{meta.label}</p>
      <p className="text-xs text-gray-600 mt-1">No games played yet</p>
    </div>
  )
}
