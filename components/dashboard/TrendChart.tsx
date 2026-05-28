'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const rawData = [
  { month: 'JAN', listeners: 920000, streams: 3100000, followers: 39000 },
  { month: 'FEB', listeners: 980000, streams: 3300000, followers: 40500 },
  { month: 'MAR', listeners: 1050000, streams: 3500000, followers: 42000 },
  { month: 'APR', listeners: 1010000, streams: 3400000, followers: 43200 },
  { month: 'MAY', listeners: 1120000, streams: 3700000, followers: 44800 },
  { month: 'JUN', listeners: 1090000, streams: 3600000, followers: 45500 },
  { month: 'JUL', listeners: 1200000, streams: 3900000, followers: 46700 },
  { month: 'AUG', listeners: 1180000, streams: 3800000, followers: 47100 },
  { month: 'SEP', listeners: 1240000, streams: 4000000, followers: 47600 },
  { month: 'OCT', listeners: 1220000, streams: 4100000, followers: 47900 },
  { month: 'NOV', listeners: 1260000, streams: 4150000, followers: 48100 },
  { month: 'DEC', listeners: 1284500, streams: 4200000, followers: 48300 },
]

// Normalize to % change from first value so all three lines share the same Y axis
const base = rawData[0]
const chartData = rawData.map((d) => ({
  month: d.month,
  listeners: +((d.listeners / base.listeners - 1) * 100).toFixed(1),
  streams: +((d.streams / base.streams - 1) * 100).toFixed(1),
  followers: +((d.followers / base.followers - 1) * 100).toFixed(1),
  // keep raw values for tooltip
  _listeners: d.listeners,
  _streams: d.streams,
  _followers: d.followers,
}))

function formatYAxis(value: number) {
  return `${value > 0 ? '+' : ''}${value}%`
}

function formatRaw(key: string, val: number) {
  if (key === 'streams' || key === 'listeners') {
    return val >= 1000000 ? `${(val / 1000000).toFixed(2)}M` : val.toLocaleString()
  }
  return val.toLocaleString()
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.payload
  return (
    <div
      className="bg-white rounded-lg px-3 py-2.5 text-sm"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '0.5px solid rgba(0,0,0,0.07)' }}
    >
      <p className="col-header mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 leading-snug">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary tabular-nums ml-auto pl-3">
            {formatRaw(entry.dataKey, raw[`_${entry.dataKey}`])}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart() {
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
              <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1, strokeDasharray: '4 2' }} />
          <Line
            type="monotone"
            dataKey="listeners"
            name="Listeners"
            stroke="#E8442A"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: 'white', stroke: '#E8442A', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="streams"
            name="Streams"
            stroke="#5B8EE8"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: 'white', stroke: '#5B8EE8', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="followers"
            name="Followers"
            stroke="#C0C0C8"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: 'white', stroke: '#C0C0C8', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
