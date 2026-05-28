'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export function UserMenu({ initials, email }: { initials: string; email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[#E8442A] flex items-center justify-center flex-shrink-0 hover:bg-[#D13820] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2"
      >
        <span className="text-sm font-medium text-white">{initials}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 bg-white rounded-lg py-1 min-w-[180px]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '0.5px solid rgba(0,0,0,0.07)' }}
        >
          <div className="px-3 py-2 border-b border-[rgba(0,0,0,0.07)]">
            <p className="text-[13px] font-medium text-[#111111] truncate">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-[13px] text-[#6B6B72] hover:bg-[#F9F9FA] hover:text-[#111111] transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
