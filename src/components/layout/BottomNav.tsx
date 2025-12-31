'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: '今日', icon: 'home' },
  { href: '/recipes', label: '菜谱', icon: 'book' },
  { href: '/shopping', label: '清单', icon: 'list' },
  { href: '/profile', label: '我的', icon: 'user' },
]

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'var(--color-primary)' : 'var(--color-text-muted)'
  const fill = active ? 'var(--color-primary)' : 'none'

  const icons: Record<string, JSX.Element> = {
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
    book: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    list: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    user: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  }
  return icons[name] || null
}

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || (href === '/home' && pathname === '/')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[var(--color-border)]"
      style={{ height: 'calc(var(--nav-height) + var(--safe-bottom))', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="h-[var(--nav-height)] flex items-center justify-around">
        {navItems.map(({ href, label, icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1">
              <NavIcon name={icon} active={active} />
              <span className={`text-[10px] ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                {label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] -mt-0.5" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
