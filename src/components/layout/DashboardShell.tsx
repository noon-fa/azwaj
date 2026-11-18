import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/button';
import { AzwajLogo } from './AzwajLogo';

export interface DashboardNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

interface DashboardShellProps {
  workspaceTitle: string;
  breadcrumb: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  workspaceTitle,
  breadcrumb,
  navItems,
  children,
}: DashboardShellProps) {
  const { account, supabaseUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-2 pt-1">
          <AzwajLogo />
          <p className="mt-2 text-xs font-medium text-[#54615C]">{workspaceTitle}</p>
        </div>

        <nav aria-label="Workspace navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#14533C] text-white'
                      : 'text-[#54615C] hover:bg-[#F2EFE9] hover:text-[#1A2421]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-[#E5E0D5] pt-4">
        <div className="px-2">
          <p className="truncate text-sm font-medium text-[#1A2421]">
            {account?.displayName || supabaseUser?.email}
          </p>
          <p className="truncate text-xs text-[#54615C]">{supabaseUser?.email}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/">Public Website</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-[#B91C1C] hover:bg-[#FEE2E2]/40 hover:text-[#B91C1C]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-[#1A2421]">
      <aside className="hidden w-64 shrink-0 border-r border-[#E5E0D5] bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{navContent}</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#1A2421]/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-white border-r border-[#E5E0D5] h-full overflow-y-auto">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded-md text-[#54615C] hover:bg-[#F2EFE9]"
            >
              <X className="h-4 w-4" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#E5E0D5] bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open workspace navigation"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E0D5] lg:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="truncate text-sm font-medium text-[#54615C]">
              {breadcrumb}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/marriage"
              className="text-xs font-medium text-[#14533C] hover:underline whitespace-nowrap"
            >
              View Directory
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
