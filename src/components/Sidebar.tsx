import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import TeamSwitcher from "./TeamSwitcher";
import { LayoutDashboard, Users, Package, LogOut, ChevronLeft, ChevronRight, Settings as SettingsIcon, Lock, Zap } from "lucide-react";
import { usePermissions } from "../lib/usePermissions";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const { canEditSettings } = usePermissions();

  useEffect(() => {
    if (isMobileOpen) {
      setIsExpanded(true);
    }
  }, [isMobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/dashboard/products", icon: Package },
    { name: "Customers", path: "/dashboard/customers", icon: Users },
    { name: "Settings", path: "/dashboard/settings", icon: SettingsIcon, restricted: !canEditSettings },
    { name: "Upgrade Plan", path: "/dashboard/upgrade", icon: Zap },
  ];

  const widthClass = isExpanded ? "w-64" : "w-64 md:w-20";
  const mobileClass = isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <aside 
      className={`fixed md:relative top-0 left-0 h-screen border-r border-border bg-background flex flex-col z-50 transition-all duration-300 ease-in-out ${widthClass} ${mobileClass}`}
    >
      <div className={`p-4 md:p-6 ${!isExpanded ? 'items-center' : ''} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-8 ${!isExpanded ? 'justify-center' : ''}`}>
           <div className="w-8 h-8 shrink-0 bg-primary rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {isExpanded && <span className="font-bold text-xl tracking-tight whitespace-nowrap animate-in fade-in duration-300">Omni</span>}
        </div>

        <TeamSwitcher isExpanded={isExpanded} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {isExpanded && <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-3">Navigation</div>}
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.restricted ? "#" : item.path}
            end={item.path === "/dashboard"}
            onClick={() => {
              setIsMobileOpen(false);
            }}
            className={({ isActive }) =>
              `flex items-center justify-between py-2.5 rounded-lg transition-all duration-300 font-medium text-sm group ${
                item.restricted ? "opacity-50 cursor-not-allowed text-muted-foreground" :
                isActive && !item.restricted
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
            title={!isExpanded ? item.name : undefined}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center w-full'}`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
            </div>
            {item.restricted && isExpanded && <Lock className="w-4 h-4 mr-3 text-muted-foreground" />}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border mt-auto">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center'} py-2.5 w-full rounded-lg transition-all duration-300 font-medium text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive group`}
          title={!isExpanded ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isExpanded && <span>Log Out</span>}
        </button>
      </div>

      {/* PC Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="hidden md:flex absolute -right-3.5 top-8 w-7 h-7 bg-background border border-border rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors z-50"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
}
