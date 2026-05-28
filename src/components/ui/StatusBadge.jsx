import React from 'react'

/**
 * StatusBadge
 * Reusable pill badge for labels, statuses, phase indicators, etc.
 * variant: 'default' | 'accent' | 'pulse' | 'success'
 */
const variants = {
  default: 'bg-white/[0.06] text-slate border-white/10',
  accent:  'bg-accent/10 text-accent border-accent/20',
  pulse:   'bg-pulse/10 text-pulse border-pulse/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function StatusBadge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5 rounded-full
        font-mono text-[10px] tracking-widest uppercase
        border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
