'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type SpotifyStats = {
  synced_at: string
  monthly_listeners: number | null
  streams_30d: number | null
  followers: number | null
}

type TrendChartProps = {
  history: SpotifyStats[]
}

function formatSyncDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatYAxis(value: number) {
  return `${value > 0 ? '+' : ''}${value}%`
}

function formatRaw(key: string, val: number | null) {
  if (val == null) return '—'
  if (key === 'streams' || key === 'listeners') {
    return val >= 1_000_000 ? `${(val / 1_000_000).toFixed(2)}M` : val.toLocaleString()
  }
  return val.toLocaleString()
}

type TooltipEntry = {
  dataKey: string
  name: string
  color: string
  value: number
  payload: Record<string, number | null>
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.payload
  return (
    <div
      className="bg-white rounded-lg px-3 py-2.5 text-sm"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '0.5px solid rgba(0,0,0,0.07)' }}
    >
      <p className="col-header mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 leading-snug">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary tabular-nums ml-auto pl-3">
            {formatRaw(entry.dataKey, raw[`_${entry.dataKey}`] as number | null)}
          </span>
        </div>
      ))}
    </div>
  )
}

function buildChartData(history: SpotifyStats[]) {
  if (history.length === 0) return []

  // Use first non-null value per series as the normalization base
  const baseListeners =
    history.find((r) => r.monthly_listeners != null)?.monthly_listeners ?? null
  const baseStreams =
    history.find((r) => r.streams_30d != null)?.streams_30d ?? null
  const baseFollowers =
    history.find((r) => r.followers != null)?.followers ?? null

  return history.map((row) => ({
    date: formatSyncDate(row.synced_at),
    listeners:
      baseListeners != null && row.monthly_listeners != null
        ? +((row.monthly_listeners / baseListeners - 1) * 100).toFixed(1)
        : null,
    streams:
      baseStreams != null && row.streams_30d != null
        ? +((row.streams_30d / baseStreams - 1) * 100).toFixed(1)
        : null,
    followers:
      baseFollowers != null && row.followers != null
        ? +((row.followers / baseFollowers - 1) * 100).toFixed(1)
        : null,
    // raw values for tooltip
    _listeners: row.monthly_listeners,
    _streams: row.streams_30d,
    _followers: row.followers,
  }))
}

export function TrendChart({ history }: TrendChartProps) {
  const chartData = buildChartData(history)
  const isEmpty = chartData.length < 2

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-semibold text-text-primary">Trends</h2>
          <span className="text-text-tertiary">···</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {[
              { label: 'Listeners', color: '#E8442A' },
              { label: 'Streams', color: '#5B8EE8' },
              { label: 'Followers', color: '#C0C0C8' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-text-tertiary">{item.label}</span>
              </div>
            ))}
          </div>
          <button className="text-sm text-text-secondary flex items-center gap-1 hover:text-text-primary transition-colors duration-150">
            3M
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
        </div>
      </div>

      {isEmpty ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-[#9B9BA4]">
            No trend data yet — sync again after your next update.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9B9BA4' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9B9BA4' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1, strokeDasharray: '4 2' }}
            />
            <Line
              type="monotone"
              dataKey="listeners"
              name="Listeners"
              stroke="#E8442A"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: 'white', stroke: '#E8442A', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="streams"
              name="Streams"
              stroke="#5B8EE8"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: 'white', stroke: '#5B8EE8', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="followers"
              name="Followers"
              stroke="#C0C0C8"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: 'white', stroke: '#C0C0C8', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
