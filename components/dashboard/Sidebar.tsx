'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Music2,
  FileText,
  Send,
  Settings,
  ChevronDown,
  Radio,
} from 'lucide-react'

const DEMO_ARTIST_ID = 'demo'

type NavItem = {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  href: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutGrid,
    href: `/${DEMO_ARTIST_ID}`,
  },
  {
    label: 'Pitches',
    icon: Music2,
    href: `/${DEMO_ARTIST_ID}/pitches`,
    children: [
      { label: 'New Pitch', href: `/${DEMO_ARTIST_ID}/pitches/new` },
      { label: 'History', href: `/${DEMO_ARTIST_ID}/pitches` },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    href: `/${DEMO_ARTIST_ID}/reports`,
    children: [
      { label: 'Send Report', href: `/${DEMO_ARTIST_ID}/reports` },
    ],
  },
  {
    label: 'Distribution',
    icon: Send,
    href: `/${DEMO_ARTIST_ID}/distribution`,
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string | null>('Pitches')

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col h-full bg-white px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Radio size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold text-text-primary tracking-tight">
          Artist Intel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.children?.some((c) => pathname === c.href) ?? false)
          const isExpanded = expanded === item.label

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (item.children) {
                    setExpanded(isExpanded ? null : item.label)
                  }
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-md text-base transition-colors duration-150',
                  isActive
                    ? 'bg-white text-text-primary font-medium shadow-nav-active'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={(e) => item.children && e.preventDefault()}
                >
                  <item.icon
                    size={16}
                    className={cn(
                      isActive ? 'text-text-primary' : 'text-text-secondary'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
                {item.children && (
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-text-tertiary transition-transform duration-150',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {item.children && isExpanded && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'pl-7 pr-3 py-1.5 rounded-md text-sm transition-colors duration-150',
                          childActive
                            ? 'text-text-primary font-medium'
                            : 'text-text-tertiary hover:text-text-secondary'
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-app-bg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-text-primary truncate leading-tight">
              My Account
            </p>
            <p className="text-sm text-text-tertiary truncate leading-tight">
              Free plan
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
