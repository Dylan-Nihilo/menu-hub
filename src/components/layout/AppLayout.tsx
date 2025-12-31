'use client'

import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
  showNav?: boolean
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--color-bg)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="flex-1 flex flex-col"
        style={{
          paddingBottom: showNav
            ? 'calc(var(--nav-height) + var(--safe-bottom))'
            : 'var(--safe-bottom)'
        }}
      >
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

export function ScrollArea({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 scroll-area ${className}`}>{children}</div>
}
