import Link from 'next/link'

// Spotify wordmark SVG (official green)
function SpotifyLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Spotify">
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        d="M16.76 10.73c-2.76-1.64-7.32-1.79-9.95-.99a.77.77 0 0 1-.46-1.48c3.03-.92 8.07-.74 11.26 1.14a.77.77 0 1 1-.85 1.33Zm-.1 2.77a.64.64 0 0 1-.88.21c-2.3-1.41-5.8-1.82-8.52-.99a.64.64 0 0 1-.37-1.22c3.1-.94 6.96-.48 9.56 1.12a.64.64 0 0 1 .21.88Zm-1 2.67a.51.51 0 0 1-.7.17c-2-1.22-4.52-1.5-7.49-.82a.51.51 0 0 1-.23-.99c3.25-.74 6.04-.42 8.25.95a.51.51 0 0 1 .17.69Z"
        fill="white"
      />
    </svg>
  )
}

type Props = {
  error?: string | null
}

export function ConnectSpotify({ error }: Props) {
  return (
    <div
      className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-6 py-5 flex items-center justify-between"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#F4F4F6] flex items-center justify-center flex-shrink-0">
          <SpotifyLogo size={22} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#111111] leading-tight">
            Connect Spotify
          </p>
          <p className="text-sm text-[#6B6B72] mt-0.5 leading-tight">
            Authorize your Spotify account to pull live stats into this dashboard.
          </p>
          {error && (
            <p className="text-sm text-[#E8442A] mt-1 leading-tight">
              {errorMessage(error)}
            </p>
          )}
        </div>
      </div>

      <Link
        href="/api/auth/spotify"
        className="flex-shrink-0 h-8 px-4 rounded-lg bg-[#1DB954] text-white text-[13px] font-medium flex items-center gap-2 hover:bg-[#18a349] active:bg-[#148f3f] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] focus-visible:ring-offset-2"
      >
        <SpotifyLogo size={14} />
        Connect Spotify
      </Link>
    </div>
  )
}

function errorMessage(code: string): string {
  const map: Record<string, string> = {
    access_denied: 'You declined the Spotify authorization. Try again when ready.',
    state_mismatch: 'Authorization failed (CSRF check). Please try again.',
    missing_params: 'Authorization failed (missing parameters). Please try again.',
    db_artist: 'Could not save your artist profile. Please try again.',
    db_connection: 'Could not save your Spotify connection. Please try again.',
    unexpected: 'Something went wrong. Please try again.',
  }
  return map[code] ?? 'Authorization failed. Please try again.'
}
