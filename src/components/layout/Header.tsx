'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: React.ReactNode
  className?: string
}

export function Header({ title, showBack, rightAction, className }: HeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background/80 backdrop-blur-lg',
        'safe-area-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {showBack && (
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
