'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
  outline: 'bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
  danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-600',
}

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-lg',
  md: 'h-12 px-5 text-sm rounded-xl',
  lg: 'h-14 px-6 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
