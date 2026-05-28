import { createClient } from '@/lib/supabase-server'
import { MetricStrip } from '@/components/dashboard/MetricStrip'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { TrackTable } from '@/components/dashboard/TrackTable'
import { RightRail } from '@/components/dashboard/RightRail'
import { ConnectSpotify } from '@/components/dashboard/ConnectSpotify'

async function getArtistAndConnection(artistId: string) {
  // 'demo' is the placeholder route — no DB record exists
  if (artistId === 'demo') return { artist: null, connected: false }

  const supabase = createClient()
  const { data: artist } = await supabase
    .from('artists')
    .select('id, name, spotify_id, image_url')
    .eq('id', artistId)
    .single()

  if (!artist) return { artist: null, connected: false }

  const { data: connection } = await supabase
    .from('spotify_connections')
    .select('id')
    .eq('artist_id', artistId)
    .maybeSingle()

  return { artist, connected: !!connection }
}

export default async function ArtistDashboard({
  params,
  searchParams,
}: {
  params: { artistId: string }
  searchParams: { spotify_error?: string }
}) {
  const { artist, connected } = await getArtistAndConnection(params.artistId)
  const artistName = artist?.name ?? 'Nova Bloom'
  const spotifyError = searchParams.spotify_error ?? null

  return (
    <div className="flex gap-0 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
        {/* Artist header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-[#111111] leading-tight">
              {artistName}
            </h1>
            <p className="text-sm text-[#9B9BA4] mt-0.5">
              {connected ? 'Spotify · Last synced 2h ago' : 'No data source connected'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connected && (
              <button className="h-8 px-4 rounded-lg border border-[rgba(0,0,0,0.12)] text-[13px] font-medium text-[#111111] bg-white hover:bg-[#F9F9FA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2">
                Sync
              </button>
            )}
            <button className="h-8 px-4 rounded-lg bg-[#E8442A] text-white text-[13px] font-medium hover:bg-[#D13820] active:bg-[#C03218] transition-colors duration-150 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2">
              New Pitch
            </button>
          </div>
        </div>

        {/* Connect Spotify banner — shown when no connection exists */}
        {!connected && (
          <ConnectSpotify error={spotifyError} />
        )}

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
      <div className="w-[240px] flex-shrink-0 overflow-y-auto py-6 pr-6 flex flex-col gap-4">
        <RightRail />
      </div>
    </div>
  )
}
