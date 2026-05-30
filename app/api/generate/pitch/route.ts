import { NextRequest } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 60

const PITCH_TYPE_LABELS: Record<string, string> = {
  playlist: 'Playlist Pitch',
  label: 'Label Pitch',
  press: 'Press Pitch',
  sync: 'Sync Pitch',
}

const PITCH_TYPE_GUIDE: Record<string, string> = {
  playlist:
    'Focus on track-to-playlist fit, listener demographic overlap, recent streaming velocity, and save rate momentum. Goal: convince a curator this track belongs on their playlist.',
  label:
    'Focus on artist trajectory, commercial potential, streaming momentum, and what makes this artist signable. Lead with growth velocity, not vanity numbers.',
  press:
    'Focus on story, cultural moment, and narrative angles. Lead with the most compelling hook. Data supports the story — not the other way around.',
  sync:
    'Focus on sonic qualities, mood/emotion, lyrical themes, and placement scenarios. Frame the music in terms of visual storytelling opportunities.',
}

function fmt(n: number | null | undefined): string {
  if (n == null) return 'N/A'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

export async function POST(req: NextRequest) {
  try {
    const { artistId, pitchType, targetName, notes } = await req.json()

    if (!artistId || !pitchType || !targetName) {
      return new Response('Missing required fields', { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const [{ data: artist }, { data: stats }, { data: tracks }] = await Promise.all([
      supabase.from('artists').select('name').eq('id', artistId).single(),
      supabase
        .from('spotify_stats')
        .select('monthly_listeners, followers, active_playlists, streams_30d')
        .eq('artist_id', artistId)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('tracks')
        .select('title, album, streams_30d')
        .eq('artist_id', artistId)
        .order('streams_30d', { ascending: false, nullsFirst: false })
        .limit(5),
    ])

    if (!artist) return new Response('Artist not found', { status: 404 })

    const trackList =
      (tracks ?? [])
        .map(
          (t) =>
            `- "${t.title}"${t.album ? ` (${t.album})` : ''}${t.streams_30d ? `, ${fmt(t.streams_30d)} streams/30d` : ''}`
        )
        .join('\n') || '- No track data synced yet'

    const userPrompt = `Write a ${PITCH_TYPE_LABELS[pitchType]} for ${artist.name} targeting ${targetName}.

ARTIST DATA:
- Name: ${artist.name}
- Monthly Listeners: ${fmt(stats?.monthly_listeners)}
- Followers: ${fmt(stats?.followers)}
- Streams (30d): ${fmt(stats?.streams_30d)}
- Active Playlists: ${stats?.active_playlists ?? 'N/A'}

TOP TRACKS:
${trackList}
${notes ? `\nMANAGER NOTES:\n${notes}` : ''}

PITCH GUIDELINES:
${PITCH_TYPE_GUIDE[pitchType]}

FORMAT RULES:
- First line must be: Subject: [a compelling, specific subject line]
- Blank line after the subject
- Pitch body: 150–250 words
- Professional, confident tone — no hollow superlatives
- Use the actual numbers from the data above
- No placeholder brackets, no "I am an AI" disclaimers`

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system:
        'You are an expert music industry pitch writer. Your pitches are concise, data-driven, and compelling. You write with professional authority — never sycophantic, never vague.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          // Propagate the error so the client reader throws instead of silently getting done=true
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[generate/pitch]', err)
    return new Response('Generation failed', { status: 500 })
  }
}
