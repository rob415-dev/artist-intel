-- Artist Intel — Initial Schema
-- 7 tables: artists, spotify_connections, spotify_stats, tracks, pitches, reports, subscriptions

-- ─────────────────────────────────────────────
-- 1. artists
-- One artist profile per manager account.
-- Linked to auth.users via manager_id (the logged-in manager owns the artist).
-- ─────────────────────────────────────────────
create table public.artists (
  id           uuid primary key default gen_random_uuid(),
  manager_id   uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  spotify_id   text,                        -- Spotify artist URI (e.g. "0du5cEVh5yTK9QJze8zA0C")
  image_url    text,
  genre        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index artists_manager_id_idx on public.artists(manager_id);

-- RLS
alter table public.artists enable row level security;

create policy "Manager can view own artists"
  on public.artists for select
  using (auth.uid() = manager_id);

create policy "Manager can insert own artists"
  on public.artists for insert
  with check (auth.uid() = manager_id);

create policy "Manager can update own artists"
  on public.artists for update
  using (auth.uid() = manager_id);

create policy "Manager can delete own artists"
  on public.artists for delete
  using (auth.uid() = manager_id);


-- ─────────────────────────────────────────────
-- 2. spotify_connections
-- OAuth tokens per artist. Refreshed on each sync.
-- ─────────────────────────────────────────────
create table public.spotify_connections (
  id                uuid primary key default gen_random_uuid(),
  artist_id         uuid not null references public.artists(id) on delete cascade,
  access_token      text not null,
  refresh_token     text not null,
  token_expires_at  timestamptz not null,
  scope             text,
  connected_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index spotify_connections_artist_idx on public.spotify_connections(artist_id);

-- RLS: only the artist's manager can read/write tokens
alter table public.spotify_connections enable row level security;

create policy "Manager can manage own artist's Spotify connection"
  on public.spotify_connections for all
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- 3. spotify_stats
-- Snapshot of artist-level metrics, one row per sync.
-- ─────────────────────────────────────────────
create table public.spotify_stats (
  id                   uuid primary key default gen_random_uuid(),
  artist_id            uuid not null references public.artists(id) on delete cascade,
  synced_at            timestamptz not null default now(),
  monthly_listeners    bigint,
  streams_30d          bigint,
  followers            bigint,
  active_playlists     int,
  saves_30d            bigint,
  playlist_adds_30d    int,
  artist_page_views    bigint,
  skip_rate            numeric(5, 2),        -- percentage, e.g. 18.40
  save_rate            numeric(5, 2)
);

create index spotify_stats_artist_id_idx on public.spotify_stats(artist_id);
create index spotify_stats_synced_at_idx on public.spotify_stats(synced_at desc);

alter table public.spotify_stats enable row level security;

create policy "Manager can view own artist stats"
  on public.spotify_stats for select
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );

create policy "Manager can insert own artist stats"
  on public.spotify_stats for insert
  with check (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- 4. tracks
-- Individual track metrics, refreshed each sync.
-- ─────────────────────────────────────────────
create table public.tracks (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists(id) on delete cascade,
  spotify_track_id text not null,
  title            text not null,
  album            text,
  release_date     date,
  streams_30d      bigint,
  listeners_30d    bigint,
  saves_30d        bigint,
  save_rate        numeric(5, 2),
  skip_rate        numeric(5, 2),
  playlist_adds    int,
  status           text not null default 'neutral'
                   check (status in ('good', 'review', 'neutral')),
  synced_at        timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create unique index tracks_artist_spotify_idx on public.tracks(artist_id, spotify_track_id);
create index tracks_artist_id_idx on public.tracks(artist_id);

alter table public.tracks enable row level security;

create policy "Manager can view own artist tracks"
  on public.tracks for select
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );

create policy "Manager can insert own artist tracks"
  on public.tracks for insert
  with check (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );

create policy "Manager can update own artist tracks"
  on public.tracks for update
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- 5. pitches
-- AI-generated pitch documents per artist.
-- ─────────────────────────────────────────────
create table public.pitches (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists(id) on delete cascade,
  created_by       uuid not null references auth.users(id),
  title            text not null,
  body_md          text,                    -- markdown content from Claude
  pdf_url          text,                    -- path in Supabase Storage
  target_label     text,                    -- who this pitch is addressed to
  status           text not null default 'draft'
                   check (status in ('draft', 'review', 'sent', 'archived')),
  sent_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index pitches_artist_id_idx on public.pitches(artist_id);
create index pitches_status_idx on public.pitches(status);

alter table public.pitches enable row level security;

create policy "Manager can manage own artist pitches"
  on public.pitches for all
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- 6. reports
-- Monthly reports sent to labels via Resend.
-- ─────────────────────────────────────────────
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists(id) on delete cascade,
  created_by       uuid not null references auth.users(id),
  title            text not null,
  body_md          text,
  pdf_url          text,
  recipient_email  text,
  recipient_name   text,
  resend_message_id text,                   -- Resend message ID for delivery tracking
  status           text not null default 'draft'
                   check (status in ('draft', 'generating', 'ready', 'sent', 'failed')),
  period_start     date,                    -- reporting period start
  period_end       date,                    -- reporting period end
  sent_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index reports_artist_id_idx on public.reports(artist_id);
create index reports_status_idx on public.reports(status);

alter table public.reports enable row level security;

create policy "Manager can manage own artist reports"
  on public.reports for all
  using (
    exists (
      select 1 from public.artists a
      where a.id = artist_id and a.manager_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- 7. subscriptions
-- Stripe subscription state per user.
-- ─────────────────────────────────────────────
create table public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  stripe_price_id       text,
  plan                  text not null default 'free'
                        check (plan in ('free', 'pro', 'agency')),
  status                text not null default 'inactive'
                        check (status in ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index subscriptions_user_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "User can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Stripe webhook (service role) writes subscription updates.
-- No insert/update policy for anon/authenticated — use service role in webhook handler.


-- ─────────────────────────────────────────────
-- Shared: updated_at trigger
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artists_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

create trigger spotify_connections_updated_at
  before update on public.spotify_connections
  for each row execute function public.set_updated_at();

create trigger pitches_updated_at
  before update on public.pitches
  for each row execute function public.set_updated_at();

create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
