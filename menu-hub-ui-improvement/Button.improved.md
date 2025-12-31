'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-neutral-50',
  tertiary: 'bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-300',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
  outline: 'bg-transparent border border-neutral-300 text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400',
  danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300',
}

const sizes = {
  xs: 'h-8 px-3 text-xs rounded-md',
  sm: 'h-10 px-4 text-sm rounded-lg',
  md: 'h-12 px-5 text-base rounded-xl',
  lg: 'h-14 px-6 text-lg rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    fullWidth,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
  }, ref) => {
    const hasIcon = icon && !loading
    const hasContent = children || hasIcon

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-60 disabled:pointer-events-none',
          'active:scale-[0.98]',
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
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {hasIcon && iconPosition === 'left' && (
              <span className={cn('flex items-center justify-center', children && 'mr-2')}>
                {icon}
              </span>
            )}
            {children && <span>{children}</span>}
            {hasIcon && iconPosition === 'right' && (
              <span className={cn('flex items-center justify-center', children && 'ml-2')}>
                {icon}
              </span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
