'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
  maxLength?: number
  showCharCount?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    hint,
    prefix,
    suffix,
    maxLength,
    showCharCount,
    value,
    onChange,
    ...props
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            className={cn(
              'w-full h-12 px-4 bg-neutral-50 rounded-xl',
              'text-base outline-none',
              'placeholder:text-neutral-400',
              'focus:bg-white focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
              'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'ring-2 ring-error focus:ring-error',
              prefix && 'pl-12',
              suffix && 'pr-12',
              className
            )}
            {...props}
          />

          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500">
              {suffix}
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="text-xs font-medium text-error">
            {error}
          </p>
        )}

        {/* 提示文本和字数统计 */}
        <div className="flex items-center justify-between">
          {hint && !error && (
            <p className="text-xs text-neutral-500">
              {hint}
            </p>
          )}
          {showCharCount && maxLength && (
            <p className={cn(
              'text-xs ml-auto',
              charCount > maxLength * 0.8 ? 'text-warning' : 'text-neutral-500'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

// 需要在文件顶部添加 React import
import React from 'react'
