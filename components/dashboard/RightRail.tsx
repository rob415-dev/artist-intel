'use client'

import { useState } from 'react'

function DonutRing({ percent }: { percent: number }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - percent / 100)
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#E8E8EA" strokeWidth="6" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="#E8442A"
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111111">
        {percent}%
      </text>
    </svg>
  )
}

const barData = [
  { day: '27', value: 60, active: false },
  { day: '28', value: 75, active: false },
  { day: '29', value: 55, active: false },
  { day: '30', value: 85, active: false },
  { day: '31', value: 70, active: false },
  { day: '1', value: 90, active: true },
  { day: '2', value: 65, active: false },
]

const timeOptions = ['7D', '30D', '3M']

export function RightRail() {
  const [timeframe, setTimeframe] = useState('7D')
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <>
      {/* Spotify Panel */}
      <div
        className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-md font-semibold text-text-primary">Spotify</span>
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary text-sm">···</span>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-0.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                {timeframe}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-tooltip border border-[rgba(0,0,0,0.07)] py-1 min-w-[60px]">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setTimeframe(opt); setShowDropdown(false) }}
                      className="w-full px-3 py-1.5 text-sm text-left hover:bg-surface-hover text-text-secondary hover:text-text-primary"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-3" />

        {/* Followers hero */}
        <div
          className="rounded-lg p-3 mb-3"
          style={{ background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.07)' }}
        >
          <p className="col-header mb-1">Followers</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-text-primary tabular-nums">48,300</span>
            <span className="text-sm font-medium text-positive">+16</span>
          </div>
        </div>

        {/* Monthly listeners */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="col-header mb-1">Monthly Listeners</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-text-primary tabular-nums">1.28M</span>
            </div>
          </div>
          <DonutRing percent={82} />
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-3" />

        {/* Breakdown */}
        <div className="flex flex-col gap-2">
          {[
            { label: 'Saves', value: '62,140' },
            { label: 'Playlist Adds', value: '312' },
            { label: 'Artist Page Views', value: '28,500' },
            { label: 'Skip Rate', value: '18.4%' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-base text-text-secondary">{row.label}</span>
              <span className="text-base text-text-primary tabular-nums font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Panel */}
      <div
        className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-md font-semibold text-text-primary">Apple Music</span>
          <span className="text-text-tertiary text-sm">···</span>
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-3" />

        <div className="flex items-end gap-1 mb-2">
          {barData.map((bar) => (
            <div key={bar.day} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-full transition-opacity duration-150"
                style={{
                  height: `${(bar.value / 100) * 48}px`,
                  background: bar.active ? '#5B8EE8' : '#E8E8EA',
                  borderRadius: '100px',
                  minHeight: '4px',
                }}
              />
              <span className="text-xs text-text-tertiary tabular-nums">{bar.day}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] mt-3 mb-3" />

        <div className="flex flex-col gap-2">
          {[
            { label: 'Impressions', value: '12,400', delta: '+14%', positive: true },
            { label: 'Streams', value: '8,200', delta: '-3%', positive: false },
            { label: 'Listeners', value: '3,100', delta: '+22%', positive: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-base text-text-secondary">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base text-text-primary tabular-nums font-medium">{row.value}</span>
                <span className={`text-sm font-medium ${row.positive ? 'text-positive' : 'text-negative'}`}>
                  {row.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
