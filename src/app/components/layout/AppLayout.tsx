import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../../lib/auth-context";
import { cn } from "../ui/utils";
import {
  LayoutDashboard, FolderKanban, Settings, LogOut, ChevronLeft, ChevronRight,
  User, Bell, Search,
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
  { to: "/", icon: LayoutDashboard, label: "Дашборд", exact: true },
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

  const navItemClass = (isActive: boolean) =>
    cn(
      "group relative flex h-11 items-center gap-3 rounded-lg px-2 text-sm transition-all w-full min-w-0 overflow-hidden",
      collapsed && "justify-center px-1.5",
      isActive
        ? "bg-[#eff6ff] text-[#1d4ed8] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.18)]"
        : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]",
    );

  const iconBoxClass = (isActive: boolean) =>
    cn(
      "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
      isActive ? "bg-[#2563eb] text-white" : "bg-[#eef2f7] text-[#64748b] group-hover:bg-white group-hover:text-[#2563eb]",
    );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden">
        <aside
          className={cn(
            "flex flex-col bg-white text-[#475569] border-r border-[#dbe3ef] shadow-sm transition-all duration-200 shrink-0",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <div className={cn("flex items-center h-16 px-3 border-b border-[#dbe3ef] gap-3", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M4 10C4 6.69 6.69 4 10 4s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z" fill="white" opacity="0.28"/>
                <path d="M7 10c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z" fill="white"/>
                <path d="M2 5l3 3M2 15l3-3M18 5l-3 3M18 15l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm leading-tight tracking-tight text-[#0f172a] font-mono">
                  CeRBeR<span className="text-[#2563eb]">JIRA</span>
                </p>
                <p className="text-[11px] leading-tight text-[#64748b]">управление задачами</p>
              </div>
            )}
          </div>

          <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
            {!collapsed && (
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
                Навигация
              </p>
            )}
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <NavLink to={to} end={exact} className={({ isActive }) => navItemClass(isActive)}>
                    {({ isActive }) => (
                      <>
                        <span className={iconBoxClass(isActive)}>
                          <Icon className="size-4" />
                        </span>
                        {!collapsed && (
                          <span className="min-w-0 truncate font-medium">{label}</span>
                        )}
                      </>
                    )}
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

          <div className="px-2.5 py-3 border-t border-[#dbe3ef] space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink to="/profile" className={({ isActive }) => navItemClass(isActive)}>
                  {({ isActive }) => (
                    <>
                      <span className={iconBoxClass(isActive)}>
                        <User className="size-4" />
                      </span>
                      {!collapsed && (
                        <span className="min-w-0 truncate font-medium">{user?.name} {user?.surname}</span>
                      )}
                    </>
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
                    "group flex h-11 items-center gap-3 rounded-lg px-2 text-sm transition-all w-full min-w-0 overflow-hidden text-[#475569] hover:bg-red-50 hover:text-destructive",
                    collapsed && "justify-center px-1.5",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eef2f7] text-[#64748b] transition-colors group-hover:bg-white group-hover:text-destructive">
                    <LogOut className="size-4" />
                  </span>
                  {!collapsed && <span className="min-w-0 truncate font-medium">Выйти</span>}
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
                "group flex h-10 items-center gap-3 rounded-lg px-2 text-sm text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all w-full min-w-0 overflow-hidden",
                collapsed && "justify-center px-1.5",
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md">
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </span>
              {!collapsed && <span className="min-w-0 truncate font-medium">Свернуть</span>}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 flex items-center px-4 border-b border-border gap-3 bg-background/80 backdrop-blur shrink-0">
            <div className="flex-1 flex items-center gap-2 max-w-md min-w-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border border-border w-full text-sm text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors min-w-0">
                <Search className="size-3.5 shrink-0" />
                <span className="truncate">Поиск задач...</span>
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

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
