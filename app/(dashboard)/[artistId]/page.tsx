import { MetricStrip } from '@/components/dashboard/MetricStrip'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { TrackTable } from '@/components/dashboard/TrackTable'
import { RightRail } from '@/components/dashboard/RightRail'

export default function ArtistDashboard() {
  return (
    <div className="flex gap-0 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
        {/* Artist header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary leading-tight">
              Nova Bloom
            </h1>
            <p className="text-sm text-text-tertiary mt-0.5">
              Spotify · Last synced 2h ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-4 rounded-md border border-[rgba(0,0,0,0.12)] text-base font-medium text-text-primary bg-white hover:bg-surface-hover transition-colors duration-150">
              Sync
            </button>
            <button className="h-8 px-4 rounded-md bg-accent text-white text-base font-medium hover:bg-accent-hover transition-colors duration-150 flex items-center gap-1.5">
              New Pitch
            </button>
          </div>
        </div>

        {/* Metric strip card */}
        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-6 py-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <MetricStrip />
        </div>

        {/* Trend chart card */}
        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-6 py-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <TrendChart />
        </div>

        {/* Track table card */}
        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <TrackTable />
        </div>
      </div>

      {/* Right rail */}
      <div className="w-[240px] flex-shrink-0 overflow-y-auto px-0 py-6 pr-6 flex flex-col gap-4">
        <RightRail />
      </div>
    </div>
  )
}
