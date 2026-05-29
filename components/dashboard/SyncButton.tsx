'use client'

import { useState } from 'react'

type SyncState = 'idle' | 'syncing' | 'success' | 'error'

type Props = {
  artistId: string
}

export function SyncButton({ artistId }: Props) {
  const [state, setState] = useState<SyncState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSync() {
    setState('syncing')
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/spotify/sync?artistId=${artistId}`, { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        const detail = json.detail ? `${json.error}: ${json.detail}` : json.error
        setErrorMsg(detail ?? 'Unknown error')
        setState('error')
        return
      }

      setState('success')
      // Reset to idle after 2s so it's re-clickable
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      setErrorMsg(String(err))
      setState('error')
    }
  }

  const label =
    state === 'syncing' ? 'Syncing…' :
    state === 'success' ? 'Synced ✓' :
    'Sync'

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={state === 'syncing'}
        className="h-8 px-4 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] font-medium text-[#111111] bg-white hover:bg-[#F9F9FA] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2"
        style={{ transition: 'background 150ms ease, border-color 150ms ease' }}
      >
        {label}
      </button>

      {state === 'error' && errorMsg && (
        <p className="text-[12px] text-[#E8442A] max-w-[200px] text-right leading-tight">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
