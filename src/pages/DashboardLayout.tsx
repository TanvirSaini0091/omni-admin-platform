import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden selection:bg-primary/30">
      
      {/* Clean background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-background"></div>

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-border/50 bg-background/50 backdrop-blur-xl z-30 sticky top-0">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-card/50 hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-gradient">Omni</span>
          </div>
        </div>

        {/* Top subtle fade out for scrolling (Desktop only) */}
        <div className="hidden md:block sticky top-0 w-full h-8 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none"></div>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
