'use client'

import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'dark' | 'light'
  className?: string
}

const variants = {
  default: 'bg-background-tertiary text-foreground-muted',
  dark: 'bg-foreground text-white',
  light: 'bg-background border border-border text-foreground-muted',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
