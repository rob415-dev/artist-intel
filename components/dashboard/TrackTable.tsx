'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type Track = {
  id: string
  title: string
  album: string
  streams30d: string
  listeners: string
  saves: string
  status: 'good' | 'review' | 'neutral'
  isNew: boolean
}

const tracks: Track[] = [
  { id: '1', title: 'Afterglow', album: 'Bloom EP', streams30d: '1.2M', listeners: '480K', saves: '62K', status: 'good', isNew: true },
  { id: '2', title: 'Paper Walls', album: 'Bloom EP', streams30d: '890K', listeners: '310K', saves: '44K', status: 'review', isNew: true },
  { id: '3', title: 'Coastline', album: 'Single', streams30d: '540K', listeners: '205K', saves: '28K', status: 'good', isNew: false },
  { id: '4', title: 'Silver Hour', album: 'First Light', streams30d: '320K', listeners: '140K', saves: '18K', status: 'neutral', isNew: false },
  { id: '5', title: 'Frequency', album: 'First Light', streams30d: '280K', listeners: '115K', saves: '14K', status: 'review', isNew: false },
]

const statusConfig = {
  good: { label: 'GOOD', className: 'badge badge-positive' },
  review: { label: 'NEEDS REVIEW', className: 'badge badge-warning' },
  neutral: { label: 'NEUTRAL', className: 'badge badge-neutral' },
}

const tabs = ['Top Tracks', 'Pitch History', 'Playlists']

export function TrackTable() {
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
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
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
          {tracks.map((track) => {
            const isExpanded = expandedRow === track.id
            return (
              <>
                <tr
                  key={track.id}
                  className="cursor-pointer hover:bg-surface-hover transition-colors duration-150 group"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                  onClick={() => setExpandedRow(isExpanded ? null : track.id)}
                >
                  <td className="px-6 py-0 w-8">
                    {track.isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-base font-medium text-text-primary">{track.title}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-base text-text-secondary">{track.album}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-base text-text-primary tabular-nums">{track.streams30d}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-base text-text-secondary tabular-nums">{track.listeners}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-base text-text-secondary tabular-nums">{track.saves}</span>
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
                  <tr key={`${track.id}-expanded`}>
                    <td colSpan={8} className="px-6 pb-4">
                      <div
                        className="rounded-lg p-4 bg-[#F9F9FA]"
                        style={{ borderLeft: '3px solid #E8442A' }}
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="col-header mb-1">Save Rate</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">5.2%</p>
                          </div>
                          <div>
                            <p className="col-header mb-1">Skip Rate</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">18.4%</p>
                          </div>
                          <div>
                            <p className="col-header mb-1">Playlist Adds</p>
                            <p className="text-base font-medium text-text-primary tabular-nums">312</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
