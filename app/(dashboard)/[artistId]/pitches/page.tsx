import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { cn } from '@/lib/utils'

const PITCH_TYPE_LABELS: Record<string, string> = {
  playlist: 'Playlist',
  label: 'Label',
  press: 'Press',
  sync: 'Sync',
}

const STATUS_CONFIG = {
  draft:     { label: 'DRAFT',    className: 'badge badge-neutral' },
  review:    { label: 'REVIEW',   className: 'badge badge-warning' },
  sent:      { label: 'SENT',     className: 'badge badge-positive' },
  archived:  { label: 'ARCHIVED', className: 'badge badge-neutral' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function PitchesPage({
  params,
}: {
  params: { artistId: string }
}) {
  const supabase = createClient()

  const { data: pitches } = await supabase
    .from('pitches')
    .select('id, title, pitch_type, target_label, status, created_at')
    .eq('artist_id', params.artistId)
    .order('created_at', { ascending: false })

  const rows = pitches ?? []

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111111] leading-tight">
            Pitch History
          </h1>
          <p className="text-sm text-[#9B9BA4] mt-0.5">
            {rows.length} saved {rows.length === 1 ? 'pitch' : 'pitches'}
          </p>
        </div>
        <Link
          href={`/${params.artistId}/pitches/new`}
          className="h-8 px-4 rounded-lg bg-[#E8442A] text-white text-[13px] font-medium hover:bg-[#D13820] active:bg-[#C03218] transition-colors duration-150 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2"
        >
          + New Pitch
        </Link>
      </div>

      {/* Table card */}
      <div
        className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)]"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
      >
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.07)]">
              <th className="col-header text-left px-6 py-3">Title</th>
              <th className="col-header text-left px-3 py-3">Type</th>
              <th className="col-header text-left px-3 py-3">Target</th>
              <th className="col-header text-left px-3 py-3">Date</th>
              <th className="col-header text-left px-3 py-3 pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-[#9B9BA4]"
                >
                  No pitches saved yet.{' '}
                  <Link
                    href={`/${params.artistId}/pitches/new`}
                    className="text-[#E8442A] hover:underline"
                  >
                    Generate your first pitch →
                  </Link>
                </td>
              </tr>
            )}
            {rows.map((pitch) => {
              const status = (pitch.status ?? 'draft') as keyof typeof STATUS_CONFIG
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
              return (
                <tr
                  key={pitch.id}
                  className="hover:bg-[#F9F9FA] transition-colors duration-150"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <td className="px-6 py-3">
                    <span className="text-[13px] font-medium text-[#111111]">
                      {pitch.title}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[13px] text-[#6B6B72]">
                      {pitch.pitch_type
                        ? PITCH_TYPE_LABELS[pitch.pitch_type] ?? pitch.pitch_type
                        : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[13px] text-[#6B6B72]">
                      {pitch.target_label ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[13px] text-[#9B9BA4] tabular-nums">
                      {formatDate(pitch.created_at)}
                    </span>
                  </td>
                  <td className="px-3 py-3 pr-6">
                    <span className={cn(cfg.className)}>{cfg.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
