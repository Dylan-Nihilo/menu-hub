'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 px-4 bg-gray-50 rounded-xl',
            'text-base outline-none',
            'placeholder:text-gray-400',
            'focus:bg-white focus:ring-2 focus:ring-primary-500',
            'transition-all',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
