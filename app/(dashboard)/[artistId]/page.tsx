import { createClient } from '@/lib/supabase-server'
import { MetricStrip } from '@/components/dashboard/MetricStrip'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { TrackTable } from '@/components/dashboard/TrackTable'
import { RightRail } from '@/components/dashboard/RightRail'
import { ConnectSpotify } from '@/components/dashboard/ConnectSpotify'
import { SyncButton } from '@/components/dashboard/SyncButton'

export type SpotifyStats = {
  id: string
  synced_at: string
  monthly_listeners: number | null
  streams_30d: number | null
  followers: number | null
  active_playlists: number | null
  saves_30d: number | null
  playlist_adds_30d: number | null
  artist_page_views: number | null
  skip_rate: number | null
  save_rate: number | null
}

export type TrackRow = {
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

async function getArtistAndConnection(artistId: string) {
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

async function getDashboardData(artistId: string): Promise<{
  stats: SpotifyStats | null
  prevStats: SpotifyStats | null
  history: SpotifyStats[]
  tracks: TrackRow[]
}> {
  if (artistId === 'demo') {
    return { stats: null, prevStats: null, history: [], tracks: [] }
  }

  const supabase = createClient()

  const [{ data: rawHistory }, { data: rawTracks }] = await Promise.all([
    supabase
      .from('spotify_stats')
      .select(
        'id, synced_at, monthly_listeners, streams_30d, followers, active_playlists, saves_30d, playlist_adds_30d, artist_page_views, skip_rate, save_rate'
      )
      .eq('artist_id', artistId)
      .order('synced_at', { ascending: false })
      .limit(12),
    supabase
      .from('tracks')
      .select(
        'id, title, album, streams_30d, listeners_30d, saves_30d, save_rate, skip_rate, playlist_adds, status, created_at'
      )
      .eq('artist_id', artistId)
      .order('streams_30d', { ascending: false, nullsFirst: false })
      .limit(20),
  ])

  // rawHistory comes back newest-first; reverse to chronological for the chart
  const history = [...(rawHistory ?? [])].reverse() as SpotifyStats[]
  const stats = history.length > 0 ? history[history.length - 1] : null
  const prevStats = history.length > 1 ? history[history.length - 2] : null

  return {
    stats,
    prevStats,
    history,
    tracks: (rawTracks ?? []) as TrackRow[],
  }
}

export default async function ArtistDashboard({
  params,
  searchParams,
}: {
  params: { artistId: string }
  searchParams: { spotify_error?: string }
}) {
  const [{ artist, connected }, { stats, prevStats, history, tracks }] = await Promise.all([
    getArtistAndConnection(params.artistId),
    getDashboardData(params.artistId),
  ])

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
            {connected && <SyncButton artistId={params.artistId} />}
            <button className="h-8 px-4 rounded-lg bg-[#E8442A] text-white text-[13px] font-medium hover:bg-[#D13820] active:bg-[#C03218] transition-colors duration-150 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8442A] focus-visible:ring-offset-2">
              New Pitch
            </button>
          </div>
        </div>

        {!connected && <ConnectSpotify error={spotifyError} />}

        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-6 py-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <MetricStrip stats={stats} prevStats={prevStats} />
        </div>

        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-6 py-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <TrendChart history={history} />
        </div>

        <div
          className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <TrackTable tracks={tracks} />
        </div>
      </div>

      {/* Right rail */}
      <div className="w-[240px] flex-shrink-0 overflow-y-auto py-6 pr-6 flex flex-col gap-4">
        <RightRail stats={stats} prevStats={prevStats} />
      </div>
    </div>
  )
}
