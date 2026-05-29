import { createClient } from '@/lib/supabase-server'
import { refreshAccessToken } from '@/lib/spotify'
import { NextResponse, type NextRequest } from 'next/server'

type SpotifyTrack = {
  id: string
  name: string
  album: { name: string; release_date: string } | null
}

export async function POST(request: NextRequest) {
  const artistId = new URL(request.url).searchParams.get('artistId')
  if (!artistId) {
    return NextResponse.json({ error: 'missing_artist_id' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  // Read stored tokens — RLS ensures only the artist's manager can access this
  const { data: conn, error: connErr } = await supabase
    .from('spotify_connections')
    .select('id, access_token, refresh_token, token_expires_at')
    .eq('artist_id', artistId)
    .single()

  if (connErr || !conn) {
    return NextResponse.json(
      { error: 'no_connection', detail: connErr?.message ?? 'No Spotify connection found for this artist' },
      { status: 404 }
    )
  }

  // Always refresh — tokens expire in 1h and this keeps them fresh
  let accessToken: string
  try {
    const refreshed = await refreshAccessToken(conn.refresh_token)
    accessToken = refreshed.access_token
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

    const { error: updateErr } = await supabase
      .from('spotify_connections')
      .update({ access_token: accessToken, token_expires_at: expiresAt })
      .eq('id', conn.id)

    if (updateErr) {
      return NextResponse.json(
        { error: 'token_update_failed', detail: updateErr.message },
        { status: 500 }
      )
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'token_refresh_failed', detail: String(err) },
      { status: 502 }
    )
  }

  // ── Spotify API calls ──────────────────────────────────────────────────────

  const headers = { Authorization: `Bearer ${accessToken}` }

  // 1. User profile → followers
  const profileRes = await fetch('https://api.spotify.com/v1/me', { headers })
  if (!profileRes.ok) {
    return NextResponse.json(
      { error: 'spotify_profile_failed', status: profileRes.status, detail: await profileRes.text() },
      { status: 502 }
    )
  }
  const profile = await profileRes.json()
  const followers: number = profile.followers?.total ?? 0

  // 2. Playlists → active_playlists count
  let activePlaylists = 0
  const playlistsRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', { headers })
  if (playlistsRes.ok) {
    const playlists = await playlistsRes.json()
    activePlaylists = playlists.total ?? 0
  }

  // 3. Top tracks (short_term ≈ last 4 weeks)
  let topTracks: SpotifyTrack[] = []
  const tracksRes = await fetch(
    'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50',
    { headers }
  )
  if (tracksRes.ok) {
    const tracksData = await tracksRes.json()
    topTracks = tracksData.items ?? []
  }

  // ── Persist to Supabase ────────────────────────────────────────────────────

  const { error: statsErr } = await supabase.from('spotify_stats').insert({
    artist_id: artistId,
    followers,
    active_playlists: activePlaylists,
  })

  if (statsErr) {
    return NextResponse.json(
      { error: 'stats_insert_failed', detail: statsErr.message },
      { status: 500 }
    )
  }

  if (topTracks.length > 0) {
    const now = new Date().toISOString()
    const trackRows = topTracks.map((t) => ({
      artist_id: artistId,
      spotify_track_id: t.id,
      title: t.name,
      album: t.album?.name ?? null,
      release_date: t.album?.release_date ?? null,
      status: 'neutral' as const,
      synced_at: now,
    }))

    const { error: tracksErr } = await supabase
      .from('tracks')
      .upsert(trackRows, { onConflict: 'artist_id,spotify_track_id' })

    if (tracksErr) {
      return NextResponse.json(
        { error: 'tracks_upsert_failed', detail: tracksErr.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    ok: true,
    followers,
    active_playlists: activePlaylists,
    tracks_synced: topTracks.length,
  })
}
