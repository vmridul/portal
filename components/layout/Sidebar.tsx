import { useUIStore } from "@/store/uiStore";
import { useEffect } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const { toggleSidebar, isSidebarOpen } = useUIStore();

  useEffect(() => {
    // Close sidebar on route change in mobile view
    const handleRouteChange = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        // Sidebar closes automatically on navigation in mobile
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handleRouteChange);
      return () => window.removeEventListener("popstate", handleRouteChange);
    }
  }, []);

  return (
    <aside
      className={`
        flex flex-col flex-shrink-0 bg-theme-base border-r border-theme-border
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64" : "w-16"}
      `}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-theme-border">
        <div className="flex items-center space-x-2">
          <Menu className="h-5 w-5 text-gray-400 hover:text-white" />
          <span className="font-semibold text-white whitespace-nowrap">
            Portal
          </span>
        </div>
        <button
          onClick={() => toggleSidebar()}
          className="p-2 rounded-[6px] hover:bg-theme-surface transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <ChevronRight className="h-4 w-4 text-gray-400 hover:text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-white" />
          )}
        </button>
      </div>

      <nav className="flex-1 flex-col overflow-y-auto p-4 space-y-2">
        {/* Sidebar navigation items */}
        <div className="flex items-center space-x-3 p-3 rounded-[6px] hover:bg-theme-surface transition-colors">
          <div className="h-8 w-8 bg-blue-500/20 rounded-[6px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-white">Messages</div>
            <div className="text-xs text-gray-400">Direct &amp; group chats</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-[6px] hover:bg-theme-surface transition-colors">
          <div className="h-8 w-8 bg-green-500/20 rounded-[6px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000-4h-2a2 2 0 00-2 2v2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 104 0v-2a2 2 0 002-2h2a2 2 0 002-2v-2h-2a2 2 0 00-2-2v-2z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-white">Teams</div>
            <div className="text-xs text-gray-400">Your workspaces</div>
          </div>
        </div>
      </nav>

      <div className="border-t border-theme-border px-4 py-3">
        <div className="text-xs text-gray-500">v1.0.0</div>
      </div>
    </aside>
  );
}