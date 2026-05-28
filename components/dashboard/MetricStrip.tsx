'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Metric = {
  label: string
  value: number
  display: (v: number) => string
  delta: string
  positive: boolean
}

const metrics: Metric[] = [
  {
    label: 'Monthly Listeners',
    value: 1284500,
    display: (v) => (v >= 1000000 ? `${(v / 1000000).toFixed(2)}M` : v.toLocaleString()),
    delta: '+8.2%',
    positive: true,
  },
  {
    label: 'Streams 30d',
    value: 4200000,
    display: (v) => `${(v / 1000000).toFixed(1)}M`,
    delta: '+12%',
    positive: true,
  },
  {
    label: 'Followers',
    value: 48300,
    display: (v) => v.toLocaleString(),
    delta: '+3%',
    positive: true,
  },
  {
    label: 'Active Playlists',
    value: 127,
    display: (v) => v.toString(),
    delta: '+4',
    positive: true,
  },
]

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

function MetricCell({ metric, last }: { metric: Metric; last: boolean }) {
  const animated = useCountUp(metric.value)

  return (
    <div className={cn('flex-1 flex flex-col gap-0.5 px-4 first:pl-0 last:pr-0', !last && 'border-r border-[rgba(0,0,0,0.07)]')}>
      <span className="col-header">{metric.label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-text-primary tabular-nums leading-tight">
          {metric.display(animated)}
        </span>
        <span
          className={cn(
            'text-sm font-medium leading-tight',
            metric.positive ? 'text-positive' : 'text-negative'
          )}
        >
          {metric.delta}
        </span>
      </div>
    </div>
  )
}

export function MetricStrip() {
  return (
    <div className="flex items-center">
      {metrics.map((m, i) => (
        <MetricCell key={m.label} metric={m} last={i === metrics.length - 1} />
      ))}
    </div>
  )
}
