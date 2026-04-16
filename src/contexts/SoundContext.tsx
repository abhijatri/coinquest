import React, { createContext, useContext, useState, useCallback } from 'react'
import type { SoundContextValue } from '../types'
import * as Sounds from '../utils/sounds'

const SoundContext = createContext<SoundContextValue | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('coinquest_sound') !== 'off'
  })

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem('coinquest_sound', next ? 'on' : 'off')
      return next
    })
  }, [])

  const withSound = useCallback(
    (fn: () => Promise<void>) => {
      if (soundEnabled) fn().catch(() => undefined)
    },
    [soundEnabled],
  )

  const playDrop  = useCallback(() => withSound(Sounds.playDrop),  [withSound])
  const playWin   = useCallback(() => withSound(Sounds.playWin),   [withSound])
  const playDraw  = useCallback(() => withSound(Sounds.playDraw),  [withSound])
  const playTick  = useCallback(() => withSound(Sounds.playTick),  [withSound])
  const playPower = useCallback(() => withSound(Sounds.playPower), [withSound])

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playDrop, playWin, playDraw, playTick, playPower }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
