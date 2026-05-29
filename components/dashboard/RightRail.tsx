'use client'

import { useState } from 'react'

type SpotifyStats = {
  monthly_listeners: number | null
  followers: number | null
  saves_30d: number | null
  playlist_adds_30d: number | null
  artist_page_views: number | null
  skip_rate: number | null
  save_rate: number | null
}

type RightRailProps = {
  stats: SpotifyStats | null
  prevStats: SpotifyStats | null
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

function formatBig(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return v.toLocaleString()
  return v.toString()
}

function formatCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return v.toLocaleString()
  return v.toString()
}

// Mock bar data for the Apple Music panel (no schema source yet)
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

export function RightRail({ stats, prevStats }: RightRailProps) {
  const [timeframe, setTimeframe] = useState('7D')
  const [showDropdown, setShowDropdown] = useState(false)

  const followersDelta =
    stats?.followers != null && prevStats?.followers != null
      ? stats.followers - prevStats.followers
      : null

  // save_rate is a percentage (e.g. 5.20 = 5.2%) — round for the donut label
  const saveRatePct =
    stats?.save_rate != null ? Math.round(Number(stats.save_rate)) : 0

  const breakdownRows: { label: string; value: string | null }[] = [
    {
      label: 'Saves',
      value: stats?.saves_30d != null ? formatCount(stats.saves_30d) : null,
    },
    {
      label: 'Playlist Adds',
      value:
        stats?.playlist_adds_30d != null
          ? stats.playlist_adds_30d.toLocaleString()
          : null,
    },
    {
      label: 'Artist Page Views',
      value:
        stats?.artist_page_views != null ? formatCount(stats.artist_page_views) : null,
    },
    {
      label: 'Skip Rate',
      value: stats?.skip_rate != null ? `${stats.skip_rate}%` : null,
    },
  ]

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
                  <path
                    d="M2.5 4L5 6.5L7.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-tooltip border border-[rgba(0,0,0,0.07)] py-1 min-w-[60px]">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTimeframe(opt)
                        setShowDropdown(false)
                      }}
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
            {stats?.followers != null ? (
              <>
                <span className="text-xl font-semibold text-text-primary tabular-nums">
                  {formatBig(stats.followers)}
                </span>
                {followersDelta != null && (
                  <span
                    className={`text-sm font-medium ${
                      followersDelta >= 0 ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {followersDelta >= 0 ? '+' : ''}
                    {followersDelta.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <NullValue />
            )}
          </div>
        </div>

        {/* Monthly listeners */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="col-header mb-1">Monthly Listeners</p>
            <div className="flex items-baseline gap-1.5">
              {stats?.monthly_listeners != null ? (
                <span className="text-lg font-semibold text-text-primary tabular-nums">
                  {formatBig(stats.monthly_listeners)}
                </span>
              ) : (
                <NullValue />
              )}
            </div>
          </div>
          <DonutRing percent={saveRatePct} />
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-3" />

        {/* Breakdown rows */}
        <div className="flex flex-col gap-2">
          {breakdownRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-base text-text-secondary">{row.label}</span>
              {row.value != null ? (
                <span className="text-base text-text-primary tabular-nums font-medium">
                  {row.value}
                </span>
              ) : (
                <NullValue />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apple Music Panel — no schema source, mock data retained */}
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
                <span className="text-base text-text-primary tabular-nums font-medium">
                  {row.value}
                </span>
                <span
                  className={`text-sm font-medium ${
                    row.positive ? 'text-positive' : 'text-negative'
                  }`}
                >
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
