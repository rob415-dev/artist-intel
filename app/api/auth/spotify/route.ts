import { createClient } from '@/lib/supabase-server'
import { buildSpotifyAuthUrl } from '@/lib/spotify'
import { NextResponse } from 'next/server'

export async function GET() {
  // Must be logged in
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Generate a random CSRF state token
  const state = crypto.randomUUID()

  const response = NextResponse.redirect(buildSpotifyAuthUrl(state))

  // Store state in a short-lived httpOnly cookie to verify in the callback
  response.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
