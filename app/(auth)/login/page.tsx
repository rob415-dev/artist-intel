'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Radio } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E8E8EA] flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-white rounded-xl p-8"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '0.5px solid rgba(0,0,0,0.07)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#E8442A] flex items-center justify-center">
            <Radio size={16} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-[#111111] tracking-tight">
            Artist Intel
          </span>
        </div>

        {sent ? (
          <div>
            <h1 className="text-[18px] font-semibold text-[#111111] mb-2">Check your email</h1>
            <p className="text-sm text-[#6B6B72] leading-relaxed">
              We sent a magic link to <span className="font-medium text-[#111111]">{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-[18px] font-semibold text-[#111111] mb-1">Sign in</h1>
            <p className="text-sm text-[#6B6B72] mb-6">
              Enter your email to receive a magic link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="col-header block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-9 px-3 rounded-lg text-[13px] text-[#111111] placeholder:text-[#9B9BA4] outline-none focus:ring-2 focus:ring-[#E8442A] focus:ring-offset-0 transition-shadow duration-150"
                  style={{ border: '1px solid rgba(0,0,0,0.12)', background: '#FAFAFA' }}
                />
              </div>

              {error && (
                <p className="text-sm text-[#E8442A]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-9 w-full rounded-lg bg-[#E8442A] text-white text-[13px] font-medium hover:bg-[#D13820] active:bg-[#C03218] disabled:opacity-50 transition-colors duration-150"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
