import { Outlet } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  FileCheck,
  HeartHandshake,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react';
import { DashboardShell, type DashboardNavItem } from '@/src/components/layout/DashboardShell';

const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Brothers', to: '/admin/brothers', icon: FileCheck },
  { label: 'Marriage Requests', to: '/admin/marriage-requests', icon: HeartHandshake },
  { label: 'Scholars', to: '/admin/scholars', icon: BookOpen },
  { label: 'Counselling Bookings', to: '/admin/bookings', icon: Calendar },
  { label: 'Users & Staff', to: '/admin/users', icon: Users },
  { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
];

export function AdminLayout() {
  return (
    <DashboardShell
      workspaceTitle="Administration Console"
      breadcrumb="Azwaj / Staff & Administration"
      navItems={ADMIN_NAV}
    >
      <Outlet />
    </DashboardShell>
  );
}
