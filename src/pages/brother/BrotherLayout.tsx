import { Outlet } from 'react-router-dom';
import { FileText, HeartHandshake, LayoutDashboard, Settings } from 'lucide-react';
import { DashboardShell, type DashboardNavItem } from '@/src/components/layout/DashboardShell';

const BROTHER_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Profile', to: '/dashboard/profile', icon: FileText },
  { label: 'Marriage Requests', to: '/dashboard/requests', icon: HeartHandshake },
  { label: 'Account Settings', to: '/dashboard/settings', icon: Settings },
];

export function BrotherLayout() {
  return (
    <DashboardShell
      workspaceTitle="Brother Portal"
      breadcrumb="Azwaj / Brother Workspace"
      navItems={BROTHER_NAV}
    >
      <Outlet />
    </DashboardShell>
  );
}
