'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name?.slice(0, 2).toUpperCase() || '?'

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-background-tertiary',
        'flex items-center justify-center text-foreground-muted font-medium',
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name || ''} fill className="object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
