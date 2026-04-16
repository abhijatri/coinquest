import type { AvatarDef } from '../types'

export const AVATARS: AvatarDef[] = [
  { id: 'fox',      emoji: '🦊', name: 'Foxie',    bg: 'from-orange-400 to-red-500',    ring: 'ring-orange-400' },
  { id: 'panda',    emoji: '🐼', name: 'Panda',    bg: 'from-gray-200 to-gray-400',     ring: 'ring-gray-300' },
  { id: 'lion',     emoji: '🦁', name: 'Leo',      bg: 'from-yellow-400 to-amber-500',  ring: 'ring-yellow-400' },
  { id: 'frog',     emoji: '🐸', name: 'Froggo',   bg: 'from-green-400 to-emerald-600', ring: 'ring-green-400' },
  { id: 'robot',    emoji: '🤖', name: 'Robo',     bg: 'from-blue-400 to-cyan-500',     ring: 'ring-blue-400' },
  { id: 'unicorn',  emoji: '🦄', name: 'Uni',      bg: 'from-pink-400 to-purple-500',   ring: 'ring-pink-400' },
  { id: 'dragon',   emoji: '🐉', name: 'Drago',    bg: 'from-red-400 to-rose-600',      ring: 'ring-red-400' },
  { id: 'penguin',  emoji: '🐧', name: 'Pingu',    bg: 'from-sky-400 to-indigo-500',    ring: 'ring-sky-400' },
]

export function getAvatar(id: string): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0]
}
