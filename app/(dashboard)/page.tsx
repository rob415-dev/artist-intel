import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardRoot() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: artist } = await supabase
    .from('artists')
    .select('id')
    .eq('manager_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Fall back to demo shell if the user has no artists yet
  if (!artist) redirect('/demo')

  redirect(`/${artist.id}`)
}
