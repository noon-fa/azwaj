import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import type { UserRole } from '@/src/types/domain';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { supabaseUser, role, account, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#14533C] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-[#54615C]">Verifying your session…</p>
        </div>
      </div>
    );
  }

  if (!supabaseUser || !supabaseUser.email_confirmed_at) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  if (account?.accountStatus === 'suspended') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#E5E0D5] rounded-xl space-y-3">
        <h1 className="text-2xl font-semibold text-[#1A2421]">Account Suspended</h1>
        <p className="text-sm text-[#54615C]">
          Your Azwaj account is currently suspended. Please contact our moderation team via the Contact page for clarification.
        </p>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#E5E0D5] rounded-xl space-y-3">
        <h1 className="text-2xl font-semibold text-[#1A2421]">Access Restricted</h1>
        <p className="text-sm text-[#54615C]">
          Your account role does not have permission to open this workspace.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
