import { createClient } from '@/lib/supabase-server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { UserMenu } from '@/components/dashboard/UserMenu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.email
    ? user.email[0].toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-[#E8E8EA] p-4">
      <div
        className="flex h-[calc(100vh-32px)] rounded-xl overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}
      >
        <Sidebar userEmail={user?.email ?? null} />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F4F6]">
          {/* Top bar */}
          <header className="flex items-center h-11 px-6 bg-[#F4F4F6] flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="flex-1 h-9 bg-[#EBEBED] rounded-lg flex items-center px-3 gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="7" cy="7" r="5" stroke="#9B9BA4" strokeWidth="1.5" />
                  <path d="M11 11l2.5 2.5" stroke="#9B9BA4" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-[#9B9BA4]">Search...</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <UserMenu initials={initials} email={user?.email ?? ''} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
