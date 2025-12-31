'use client'

import { cn } from '@/lib/utils/cn'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  hasBottomNav?: boolean
}

export function PageContainer({ children, className, hasBottomNav = true }: PageContainerProps) {
  return (
    <main
      className={cn(
        'min-h-screen bg-background',
        hasBottomNav && 'pb-20',
        className
      )}
    >
      {children}
    </main>
  )
}
