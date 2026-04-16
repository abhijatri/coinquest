import React, { useEffect, useRef } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(12px)'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.28s ease-out, transform 0.28s ease-out'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
