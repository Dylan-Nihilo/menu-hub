'use client'

import { useState, forwardRef, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const isActive = focused || hasValue

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          className={`
            w-full h-14 px-4 pt-4 pb-2
            bg-gray-50 rounded-xl
            border-2 transition-colors duration-200
            ${focused ? 'border-black bg-white' : 'border-transparent'}
            text-black text-base outline-none
            ${className}
          `}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0)
            props.onChange?.(e)
          }}
          placeholder=""
        />
        <motion.label
          initial={false}
          animate={{
            y: isActive ? -8 : 0,
            scale: isActive ? 0.75 : 1,
            color: focused ? '#000' : '#9ca3af',
          }}
          className="absolute left-4 top-4 origin-left pointer-events-none text-base"
        >
          {label}
        </motion.label>
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
