import { Outlet } from 'react-router-dom';
import { Calendar, Clock, LayoutDashboard, UserCheck } from 'lucide-react';
import { DashboardShell, type DashboardNavItem } from '@/src/components/layout/DashboardShell';

const SCHOLAR_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/scholar/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Availability', to: '/scholar/availability', icon: Clock },
  { label: 'My Bookings', to: '/scholar/bookings', icon: Calendar },
  { label: 'Scholar Profile', to: '/scholar/profile', icon: UserCheck },
];

export function ScholarLayout() {
  return (
    <DashboardShell
      workspaceTitle="Scholar Portal"
      breadcrumb="Azwaj / Scholar Counselling"
      navItems={SCHOLAR_NAV}
    >
      <Outlet />
    </DashboardShell>
  );
}
