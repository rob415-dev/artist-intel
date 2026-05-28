import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#E8E8EA] p-4">
      <div
        className="flex h-[calc(100vh-32px)] rounded-xl overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F4F6]">
          {/* Top search bar */}
          <header className="flex items-center h-11 px-6 bg-[#F4F4F6] flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="flex-1 h-9 bg-[#EBEBED] rounded-lg flex items-center px-3 gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-text-tertiary flex-shrink-0"
                >
                  <circle cx="7" cy="7" r="5" stroke="#9B9BA4" strokeWidth="1.5" />
                  <path d="M11 11l2.5 2.5" stroke="#9B9BA4" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-text-tertiary">Search...</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-[#EBEBED] flex items-center justify-center hover:bg-[#E0E0E2] transition-colors duration-150">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2a4 4 0 0 0-4 4c0 3-1.5 4-1.5 4h11S12 9 12 6a4 4 0 0 0-4-4Z" stroke="#6B6B72" strokeWidth="1.5" />
                  <path d="M9.5 13.5a1.5 1.5 0 0 1-3 0" stroke="#6B6B72" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">M</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
