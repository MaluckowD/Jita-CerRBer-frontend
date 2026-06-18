import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../../lib/auth-context";
import { cn } from "../ui/utils";
import {
  LayoutGrid, FolderKanban, Settings, LogOut, ChevronLeft, ChevronRight,
  User, Bell, Search, Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const navItems = [
  { to: "/", icon: LayoutGrid, label: "Дашборд", exact: true },
  { to: "/projects", icon: FolderKanban, label: "Проекты" },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 shrink-0",
            collapsed ? "w-14" : "w-60",
          )}
        >
          {/* Logo */}
          <div className={cn("flex items-center h-14 px-3 border-b border-sidebar-border gap-2", collapsed && "justify-center")}>
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M4 10C4 6.69 6.69 4 10 4s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z" fill="white" opacity="0.3"/>
                <path d="M7 10c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z" fill="white"/>
                <path d="M2 5l3 3M2 15l3-3M18 5l-3 3M18 15l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            {!collapsed && (
              <span className="text-sm tracking-tight text-sidebar-foreground font-mono">
                CeRBeR<span className="text-primary">JIRA</span>
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={to}
                    end={exact}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all w-full min-w-0 overflow-hidden",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/25"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span className="min-w-0 truncate">{label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-popover border-border text-foreground">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all w-full min-w-0 overflow-hidden",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/25"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <User className="size-4 shrink-0" />
                  {!collapsed && (
                    <span className="min-w-0 truncate">{user?.name} {user?.surname}</span>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover border-border text-foreground">
                  Профиль
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all w-full min-w-0 overflow-hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <LogOut className="size-4 shrink-0" />
                  {!collapsed && <span className="min-w-0 truncate">Выйти</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover border-border text-foreground">
                  Выйти
                </TooltipContent>
              )}
            </Tooltip>

            <button
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all w-full min-w-0 overflow-hidden",
                collapsed && "justify-center px-2",
              )}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4 shrink-0" /><span className="min-w-0 truncate">Свернуть</span></>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-14 flex items-center px-4 border-b border-border gap-3 bg-background/80 backdrop-blur shrink-0">
            <div className="flex-1 flex items-center gap-2 max-w-md">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border w-full text-sm text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors">
                <Search className="size-3.5 shrink-0" />
                <span>Поиск задач...</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <Bell className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground shrink-0 hover:opacity-80 transition-opacity">
                    {user?.name?.[0]}{user?.surname?.[0]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <div className="px-2 py-1.5">
                    <p className="text-sm text-foreground">{user?.name} {user?.surname}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <Settings className="size-4 mr-2" />Настройки профиля
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="size-4 mr-2" />Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
