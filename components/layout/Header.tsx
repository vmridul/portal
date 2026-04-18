import { useUIStore } from "@/store/uiStore";

export default function Header() {
  const { toggleSidebar, isSidebarOpen } = useUIStore();

  return (
    <header className="hidden md:flex items-center justify-between px-4 py-3 bg-theme-base border-b border-theme-border">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-blue-500/20 rounded-[6px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-white">Portal</div>
          <div className="text-xs text-gray-400">Realtime chat application</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => toggleSidebar()}
          className="p-2 rounded-[6px] hover:bg-theme-surface transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}