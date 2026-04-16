import React, { useEffect, useRef, useState } from 'react'

interface BlitzTimerProps {
  timeLimit: number        // seconds
  onTimeout: () => void
  running: boolean         // false = paused (e.g. game over)
  resetKey: string | number // changes to restart timer
  onTick?: () => void
}

export function BlitzTimer({ timeLimit, onTimeout, running, resetKey, onTick }: BlitzTimerProps) {
  const [remaining, setRemaining] = useState(timeLimit)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const didTimeoutRef = useRef(false)

  // Reset on new turn
  useEffect(() => {
    setRemaining(timeLimit)
    didTimeoutRef.current = false
  }, [resetKey, timeLimit])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (!didTimeoutRef.current) {
            didTimeoutRef.current = true
            onTimeout()
          }
          return 0
        }
        if (prev <= 4 && onTick) onTick()
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, resetKey, onTimeout, onTick])

  const pct = (remaining / timeLimit) * 100
  const urgent = remaining <= 3

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-xs">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-xs font-bold text-gray-400">TIME</span>
        <span
          className={`text-lg font-black tabular-nums transition-colors ${
            urgent ? 'text-rose-400 animate-pulse' : 'text-white'
          }`}
        >
          {remaining}s
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-navy-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            urgent ? 'bg-rose-500' : pct > 50 ? 'bg-emerald-400' : 'bg-yellow-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
