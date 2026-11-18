import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import { listScholarBookings } from '@/src/services/bookingService';
import { getScholarByUid } from '@/src/services/scholarService';
import type { CounsellingBooking, ScholarProfile } from '@/src/types/domain';

export function ScholarDashboardPage() {
  const { supabaseUser } = useAuth();
  const [scholar, setScholar] = useState<ScholarProfile | null>(null);
  const [bookings, setBookings] = useState<CounsellingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseUser) return;
    setLoading(true);
    Promise.all([
      getScholarByUid(supabaseUser.id),
      listScholarBookings(supabaseUser.id),
    ])
      .then(([sch, bk]) => {
        setScholar(sch);
        setBookings(bk);
      })
      .finally(() => setLoading(false));
  }, [supabaseUser]);

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  if (!scholar) {
    return (
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-3">
        <h1 className="font-serif text-2xl font-semibold text-[#1A2421]">
          Scholar Profile Not Linked
        </h1>
        <p className="text-sm text-[#54615C]">
          Your account has the scholar role, but an administrator has not yet linked your UID to a
          scholar profile record. Please contact Azwaj administration.
        </p>
      </div>
    );
  }

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Scholar Overview
          </h1>
          <p className="text-sm text-[#54615C]">
            {scholar.fullName} · {scholar.title}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/scholar/availability">Manage Availability</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Directory Status</p>
          <StatusText
            status={scholar.isActive ? 'active' : 'declined'}
            labelOverride={scholar.isActive ? 'Active & Accepting Bookings' : 'Inactive'}
          />
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Upcoming Confirmed Sessions</p>
          <p className="font-mono text-2xl font-semibold text-[#1A2421] tabular-nums">
            {confirmedCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Completed Sessions</p>
          <p className="font-mono text-2xl font-semibold text-[#1A2421] tabular-nums">
            {completedCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1A2421]">
            Confidential Session Schedule
          </h2>
          <p className="text-xs text-[#54615C]">
            View only sessions assigned directly to your scholar profile.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/scholar/bookings">Open Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
