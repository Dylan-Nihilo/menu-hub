'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined'
  interactive?: boolean
  padding?: boolean
}

export function Card({
  className,
  variant = 'default',
  interactive = false,
  padding = true,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-surface',
    elevated: 'bg-white shadow-sm',
    outlined: 'bg-white border border-border',
  }

  return (
    <motion.div
      whileHover={interactive ? { y: -1 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={cn(
        'rounded-lg overflow-hidden',
        padding && 'p-4',
        variantStyles[variant],
        interactive && 'cursor-pointer active:bg-surface',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
