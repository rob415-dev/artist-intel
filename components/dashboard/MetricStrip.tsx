'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type SpotifyStats = {
  monthly_listeners: number | null
  streams_30d: number | null
  followers: number | null
  active_playlists: number | null
}

type MetricStripProps = {
  stats: SpotifyStats | null
  prevStats: SpotifyStats | null
}

type Delta = { formatted: string | null; positive: boolean }

function computeDelta(current: number | null, prev: number | null): Delta {
  if (current == null || prev == null || prev === 0) return { formatted: null, positive: true }
  const pct = ((current - prev) / prev) * 100
  return { formatted: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, positive: pct >= 0 }
}

function NullValue() {
  return (
    <span className="relative group inline-flex items-center">
      <span className="text-[#9B9BA4]">—</span>
      <span className="absolute left-1/2 -translate-x-1/2 -top-8 z-10 whitespace-nowrap px-2 py-1 rounded text-xs bg-[#111111] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        Available via Spotify for Artists
      </span>
    </span>
  )
}

function useCountUp(target: number, duration = 600) {
  const [current, setCurrent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    startTime.current = null
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(target * ease))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return current
}

type MetricDef = {
  label: string
  value: number | null
  display: (v: number) => string
  delta: Delta
}

function MetricCell({ metric, last }: { metric: MetricDef; last: boolean }) {
  // Always call the hook — skip rendering its output when value is null
  const animated = useCountUp(metric.value ?? 0)

  return (
    <div
      className={cn(
        'flex-1 flex flex-col gap-0.5 px-4 first:pl-0 last:pr-0',
        !last && 'border-r border-[rgba(0,0,0,0.07)]'
      )}
    >
      <span className="col-header">{metric.label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-text-primary tabular-nums leading-tight">
          {metric.value === null ? <NullValue /> : metric.display(animated)}
        </span>
        {metric.value !== null && metric.delta.formatted && (
          <span
            className={cn(
              'text-sm font-medium leading-tight',
              metric.delta.positive ? 'text-positive' : 'text-negative'
            )}
          >
            {metric.delta.formatted}
          </span>
        )}
      </div>
    </div>
  )
}

export function MetricStrip({ stats, prevStats }: MetricStripProps) {
  const metrics: MetricDef[] = [
    {
      label: 'Monthly Listeners',
      value: stats?.monthly_listeners ?? null,
      display: (v) =>
        v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v.toLocaleString(),
      delta: computeDelta(
        stats?.monthly_listeners ?? null,
        prevStats?.monthly_listeners ?? null
      ),
    },
    {
      label: 'Streams 30d',
      value: stats?.streams_30d ?? null,
      display: (v) =>
        v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString(),
      delta: computeDelta(stats?.streams_30d ?? null, prevStats?.streams_30d ?? null),
    },
    {
      label: 'Followers',
      value: stats?.followers ?? null,
      display: (v) => v.toLocaleString(),
      delta: computeDelta(stats?.followers ?? null, prevStats?.followers ?? null),
    },
    {
      label: 'Active Playlists',
      value: stats?.active_playlists ?? null,
      display: (v) => v.toString(),
      delta: computeDelta(
        stats?.active_playlists ?? null,
        prevStats?.active_playlists ?? null
      ),
    },
  ]

  return (
    <div className="flex items-center">
      {metrics.map((m, i) => (
        <MetricCell key={m.label} metric={m} last={i === metrics.length - 1} />
      ))}
    </div>
  )
}
