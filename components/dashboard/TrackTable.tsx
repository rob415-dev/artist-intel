'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type TrackRow = {
  id: string
  title: string
  album: string | null
  streams_30d: number | null
  listeners_30d: number | null
  saves_30d: number | null
  save_rate: number | null
  skip_rate: number | null
  playlist_adds: number | null
  status: 'good' | 'review' | 'neutral'
  created_at: string
}

type PitchRow = {
  id: string
  title: string
  pitch_type: string | null
  target_label: string | null
  status: 'draft' | 'review' | 'sent' | 'archived'
  created_at: string
}

type TrackTableProps = {
  tracks: TrackRow[]
  pitches: PitchRow[]
  artistId: string
}

const PITCH_TYPE_LABELS: Record<string, string> = {
  playlist: 'Playlist',
  label: 'Label',
  press: 'Press',
  sync: 'Sync',
}

const PITCH_STATUS_CONFIG = {
  draft:    { label: 'DRAFT',    className: 'badge badge-neutral' },
  review:   { label: 'REVIEW',   className: 'badge badge-warning' },
  sent:     { label: 'SENT',     className: 'badge badge-positive' },
  archived: { label: 'ARCHIVED', className: 'badge badge-neutral' },
}

function formatPitchDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusConfig = {
  good: { label: 'GOOD', className: 'badge badge-positive' },
  review: { label: 'NEEDS REVIEW', className: 'badge badge-warning' },
  neutral: { label: 'NEUTRAL', className: 'badge badge-neutral' },
}

const tabs = ['Top Tracks', 'Pitch History', 'Playlists']

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return value.toString()
}

function NullCell() {
  return (
    <span className="relative group inline-flex items-center">
      <span className="text-[#9B9BA4]">—</span>
      <span className="absolute left-1/2 -translate-x-1/2 -top-8 z-10 whitespace-nowrap px-2 py-1 rounded text-xs bg-[#111111] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        Available via Spotify for Artists
      </span>
    </span>
  )
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function isNewTrack(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS
}

export function TrackTable({ tracks, pitches, artistId }: TrackTableProps) {
  const [activeTab, setActiveTab] = useState('Top Tracks')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-0 px-6 border-b border-[rgba(0,0,0,0.07)]">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'h-11 px-4 text-base font-medium transition-colors duration-150 relative',
              i < tabs.length - 1 && 'mr-0',
              activeTab === tab
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t" />
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors duration-150">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Pitch History tab content */}
      {activeTab === 'Pitch History' && (
        <div>
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="col-header text-left px-6 py-3">Title</th>
                <th className="col-header text-left px-3 py-3">Type</th>
                <th className="col-header text-left px-3 py-3">Target</th>
                <th className="col-header text-left px-3 py-3">Date</th>
                <th className="col-header text-left px-3 py-3 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {pitches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#9B9BA4]">
                    No pitches yet.{' '}
                    <Link
                      href={`/${artistId}/pitches/new`}
                      className="text-[#E8442A] hover:underline"
                    >
                      Generate your first pitch →
                    </Link>
                  </td>
                </tr>
              )}
              {pitches.map((pitch) => {
                const status = (pitch.status ?? 'draft') as keyof typeof PITCH_STATUS_CONFIG
                const cfg = PITCH_STATUS_CONFIG[status] ?? PITCH_STATUS_CONFIG.draft
                return (
                  <tr
                    key={pitch.id}
                    className="hover:bg-surface-hover transition-colors duration-150"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    <td className="px-6 py-3">
                      <span className="text-base font-medium text-text-primary">{pitch.title}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-base text-text-secondary">
                        {pitch.pitch_type ? PITCH_TYPE_LABELS[pitch.pitch_type] ?? pitch.pitch_type : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-base text-text-secondary">{pitch.target_label ?? '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-base text-text-tertiary tabular-nums">
                        {formatPitchDate(pitch.created_at)}
                      </span>
                    </td>
                    <td className="px-3 py-3 pr-6">
                      <span className={cfg.className}>{cfg.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Tracks table */}
      {activeTab === 'Top Tracks' && (
      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            <th className="col-header text-left px-6 py-3 w-8"></th>
            <th className="col-header text-left px-3 py-3">Track</th>
            <th className="col-header text-left px-3 py-3">Album</th>
            <th className="col-header text-right px-3 py-3">Streams 30d</th>
            <th className="col-header text-right px-3 py-3">Listeners</th>
            <th className="col-header text-right px-3 py-3">Saves</th>
            <th className="col-header text-left px-3 py-3 pr-6">Status</th>
            <th className="col-header px-6 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {tracks.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-sm text-[#9B9BA4]">
                No tracks yet — sync Spotify to populate your track list.
              </td>
            </tr>
          )}
          {tracks.map((track) => {
            const isExpanded = expandedRow === track.id
            const isNew = isNewTrack(track.created_at)
            return (
              <Fragment key={track.id}>
                <tr
                  className="cursor-pointer hover:bg-surface-hover transition-colors duration-150 group"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                  onClick={() => setExpandedRow(isExpanded ? null : track.id)}
                >
                  <td className="px-6 py-0 w-8">
                    {isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-base font-medium text-text-primary">{track.title}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-base text-text-secondary">{track.album ?? '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {track.streams_30d == null ? (
                      <NullCell />
                    ) : (
                      <span className="text-base text-text-primary tabular-nums">
                        {formatCount(track.streams_30d)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {track.listeners_30d == null ? (
                      <NullCell />
                    ) : (
                      <span className="text-base text-text-secondary tabular-nums">
                        {formatCount(track.listeners_30d)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {track.saves_30d == null ? (
                      <NullCell />
                    ) : (
                      <span className="text-base text-text-secondary tabular-nums">
                        {formatCount(track.saves_30d)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 pr-6">
                    <span className={statusConfig[track.status].className}>
                      {statusConfig[track.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-0 w-8">
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-text-tertiary transition-transform duration-150 opacity-0 group-hover:opacity-100',
                        isExpanded && 'rotate-180 opacity-100'
                      )}
                    />
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan={8} className="px-6 pb-4">
                      <div
                        className="rounded-lg p-4 bg-[#F9F9FA]"
                        style={{ borderLeft: '3px solid #E8442A' }}
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="col-header mb-1">Save Rate</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">
                              {track.save_rate != null ? `${track.save_rate}%` : <NullCell />}
                            </p>
                          </div>
                          <div>
                            <p className="col-header mb-1">Skip Rate</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">
                              {track.skip_rate != null ? `${track.skip_rate}%` : <NullCell />}
                            </p>
                          </div>
                          <div>
                            <p className="col-header mb-1">Playlist Adds</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">
                              {track.playlist_adds != null
                                ? track.playlist_adds.toLocaleString()
                                : <NullCell />}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      )}
    </div>
  )
}
