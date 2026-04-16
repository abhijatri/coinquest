import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const SIZES = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label={label}>
      <svg
        className={`animate-spin text-yellow-400 ${SIZES[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && <span className="text-sm text-gray-400 animate-pulse">{label}</span>}
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-navy-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl animate-bounce-in">🪙</div>
        <Spinner size="lg" label="Loading CoinQuest…" />
      </div>
    </div>
  )
}

// Skeleton loader for cards
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-navy-800 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="animate-pulse space-y-3 p-4">
        <div className="h-4 bg-navy-700 rounded-full w-3/4" />
        <div className="h-4 bg-navy-700 rounded-full w-1/2" />
        <div className="h-4 bg-navy-700 rounded-full w-5/6" />
      </div>
    </div>
  )
}
