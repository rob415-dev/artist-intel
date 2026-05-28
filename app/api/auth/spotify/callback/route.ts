import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { exchangeCodeForTokens, getSpotifyProfile } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  function redirectError(reason: string) {
    const url = new URL(`${appUrl}/demo`)
    url.searchParams.set('spotify_error', reason)
    const res = NextResponse.redirect(url)
    res.cookies.delete('spotify_oauth_state')
    return res
  }

  if (error) return redirectError(error)
  if (!code || !returnedState) return redirectError('missing_params')

  // Verify CSRF state
  const cookieStore = cookies()
  const storedState = cookieStore.get('spotify_oauth_state')?.value
  if (!storedState || storedState !== returnedState) return redirectError('state_mismatch')

  // Start building the final response — destination set once we know the artist id
  // Use a mutable ref so the Supabase client can write session cookies onto it
  let redirectTo = `${appUrl}/demo`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Session cookies are written onto the response we return below
        setAll: () => {}, // getUser() won't rotate tokens; no-op is safe here
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  try {
    const tokens = await exchangeCodeForTokens(code)
    const profile = await getSpotifyProfile(tokens.access_token)

    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    const artistName = profile.display_name ?? profile.email ?? 'My Artist'
    const imageUrl = profile.images[0]?.url ?? null

    // Upsert artist — idempotent: same Spotify user reconnecting is a no-op
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .upsert(
        {
          manager_id: user.id,
          name: artistName,
          spotify_id: profile.id,
          image_url: imageUrl,
        },
        { onConflict: 'manager_id,spotify_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (artistError || !artist) {
      console.error('Artist upsert failed:', artistError)
      return redirectError('db_artist')
    }

    // Upsert Spotify connection tokens
    const { error: connError } = await supabase
      .from('spotify_connections')
      .upsert(
        {
          artist_id: artist.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokenExpiresAt,
          scope: tokens.scope,
        },
        { onConflict: 'artist_id', ignoreDuplicates: false }
      )

    if (connError) {
      console.error('Spotify connection upsert failed:', connError)
      return redirectError('db_connection')
    }

    redirectTo = `${appUrl}/${artist.id}`
  } catch (err) {
    console.error('Spotify OAuth callback error:', err)
    return redirectError('unexpected')
  }

  const res = NextResponse.redirect(redirectTo)
  res.cookies.delete('spotify_oauth_state')
  return res
}
