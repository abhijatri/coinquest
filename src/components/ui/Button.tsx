import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-yellow-400 hover:bg-yellow-300 text-navy-900 font-bold shadow-lg shadow-yellow-400/25 hover:shadow-yellow-400/40',
  secondary: 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600 hover:border-navy-500',
  ghost:     'bg-transparent hover:bg-navy-800 text-gray-300 hover:text-white',
  danger:    'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25',
  success:   'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25',
}

const SIZES: Record<Size, string> = {
  sm:  'px-3 py-2 text-sm min-h-[36px]',
  md:  'px-5 py-3 text-base min-h-[44px]',
  lg:  'px-7 py-4 text-lg min-h-[52px]',
  xl:  'px-10 py-5 text-xl min-h-[60px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold',
        'transition-all duration-150 select-none',
        'active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-navy-900',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  )
}
