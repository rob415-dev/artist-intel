'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

const PITCH_TYPES = [
  { value: 'playlist', label: 'Playlist Pitch' },
  { value: 'label', label: 'Label Pitch' },
  { value: 'press', label: 'Press Pitch' },
  { value: 'sync', label: 'Sync Pitch' },
]

const CHEVRON_SVG =
  "data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239B9BA4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

type Props = { artistId: string }

export function PitchForm({ artistId }: Props) {
  const router = useRouter()
  const [pitchType, setPitchType] = useState('playlist')
  const [targetName, setTargetName] = useState('')
  const [notes, setNotes] = useState('')
  const [generated, setGenerated] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = targetName.trim().length > 0 && !isGenerating

  async function handleGenerate() {
    if (!canGenerate) return
    setIsGenerating(true)
    setGenerated('')
    setError(null)
    setSavedId(null)
    setCopied(false)

    try {
      const res = await fetch('/api/generate/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId,
          pitchType,
          targetName: targetName.trim(),
          notes: notes.trim(),
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let received = false
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        received = true
        setGenerated((prev) => prev + decoder.decode(value, { stream: true }))
      }
      if (!received) throw new Error('No content returned from generation API')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(
        msg.includes('ANTHROPIC_API_KEY') || msg.includes('401')
          ? 'API key missing or invalid. Set ANTHROPIC_API_KEY in .env.local and Vercel.'
          : `Generation failed: ${msg}`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave() {
    if (!generated || isSaving || savedId) return
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const pitchLabel = PITCH_TYPES.find((p) => p.value === pitchType)?.label ?? pitchType
      const title = `${pitchLabel} — ${targetName.trim()}`

      const { data, error: sbErr } = await supabase
        .from('pitches')
        .insert({
          artist_id: artistId,
          created_by: user.id,
          title,
          body_md: generated,
          target_label: targetName.trim(),
          pitch_type: pitchType,
          status: 'draft',
        })
        .select('id')
        .single()

      if (sbErr) throw sbErr
      setSavedId(data.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Save failed: ${msg}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111111] leading-tight">New Pitch</h1>
          <p className="text-sm text-[#9B9BA4] mt-0.5">
            AI-generated using your live Spotify data
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="h-8 px-4 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] font-medium text-[#111111] hover:bg-[#F4F4F6] active:bg-[#EBEBED] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2"
        >
          ← Back
        </button>
      </div>

      {/* Form card */}
      <div
        className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Pitch Type */}
          <div>
            <label className="col-header block mb-1.5">Pitch Type</label>
            <select
              value={pitchType}
              onChange={(e) => setPitchType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8442A] focus:border-transparent appearance-none pr-8"
              style={{
                backgroundImage: `url("${CHEVRON_SVG}")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              {PITCH_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Name */}
          <div>
            <label className="col-header block mb-1.5">Target Name</label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Spotify Editorial, Pigeons & Planes"
              className="w-full h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] text-[#111111] placeholder:text-[#9B9BA4] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8442A] focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="col-header block mb-1.5">
            Notes{' '}
            <span className="normal-case font-normal text-[#9B9BA4]">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Extra context for the AI — new single drops Friday, targeting 18–24 demographic, sync for a car commercial..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] text-[#111111] placeholder:text-[#9B9BA4] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#E8442A] focus:border-transparent"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={cn(
            'h-9 px-5 rounded-lg text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2',
            canGenerate
              ? 'bg-[#E8442A] text-white hover:bg-[#D13820] active:bg-[#C03218]'
              : 'bg-[#F4F4F6] text-[#9B9BA4] cursor-not-allowed'
          )}
        >
          {isGenerating ? 'Generating…' : 'Generate Pitch'}
        </button>
      </div>

      {/* Output card */}
      {(isGenerating || generated) && (
        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-[#111111]">
                Generated Pitch
              </span>
              {isGenerating && (
                <span className="flex gap-0.5 items-center">
                  <span
                    className="w-1 h-1 rounded-full bg-[#E8442A] animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-[#E8442A] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-[#E8442A] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              )}
            </div>

            {!isGenerating && generated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="h-8 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] font-medium text-[#111111] hover:bg-[#F4F4F6] active:bg-[#EBEBED] transition-colors duration-150"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {savedId ? (
                  <span className="h-8 px-3 rounded-lg bg-[#EAF7F0] text-[#1A9E5C] text-[13px] font-medium flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#1A9E5C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Saved
                  </span>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      'h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150',
                      isSaving
                        ? 'bg-[#F4F4F6] text-[#9B9BA4] cursor-not-allowed'
                        : 'bg-[#111111] text-white hover:bg-[#333333] active:bg-[#222222]'
                    )}
                  >
                    {isSaving ? 'Saving…' : 'Save Pitch'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-[rgba(0,0,0,0.07)] mb-4" />

          <pre className="text-[13px] text-[#111111] leading-relaxed whitespace-pre-wrap font-[inherit]">
            {generated}
            {isGenerating && (
              <span className="inline-block w-0.5 h-[14px] bg-[#E8442A] ml-px align-middle animate-pulse" />
            )}
          </pre>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-lg px-4 py-3 border text-[13px] bg-[#FDF0EE] border-[rgba(232,68,42,0.2)] text-[#E8442A]">
          {error}
        </div>
      )}
    </div>
  )
}
