import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import {
  COUNSELLING_FORMAT_LABELS,
  COUNSELLING_TYPE_LABELS,
  formatCurrencyLkr,
} from '@/src/lib/utils';
import { fetchAdminDashboardData } from '@/src/services/adminService';
import { cancelCounsellingBooking } from '@/src/services/bookingService';
import type { CounsellingBooking } from '@/src/types/domain';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<CounsellingBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboardData();
      setBookings(res.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const filtered =
    statusFilter === 'All'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Counselling Bookings
          </h1>
          <p className="text-sm text-[#54615C]">
            Operational overview of counselling appointments. Counselling notes are never exposed
            publicly.
          </p>
        </div>

        <select
          aria-label="Filter bookings by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled_by_scholar">Cancelled by Scholar</option>
          <option value="cancelled_by_admin">Cancelled by Admin</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No counselling bookings match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Scholar</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Fee / Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filtered.map((b) => (
                <tr key={b.bookingId} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A2421]">{b.clientName}</p>
                    <p className="font-mono text-xs text-[#7B8682]">{b.clientEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[#1A2421]">{b.scholarName}</td>
                  <td className="px-4 py-3 text-xs text-[#54615C]">
                    {COUNSELLING_TYPE_LABELS[b.counsellingType]}
                    <span className="block">{COUNSELLING_FORMAT_LABELS[b.format]}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#54615C]">
                    {b.slotStartIso.slice(0, 16).replace('T', ' ')}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrencyLkr(b.sessionPriceLkr, b.currency)}
                    </span>
                    <span className="block text-[#7B8682]">Payment not enabled</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusText status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await cancelCounsellingBooking({
                            bookingId: b.bookingId,
                            slotLockId: b.slotLockId,
                            cancelledBy: 'cancelled_by_admin',
                            reason: 'Cancelled by Azwaj administration',
                          });
                          toast.success('Booking cancelled and slot released.');
                          await loadBookings();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
