import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import { COUNSELLING_FORMAT_LABELS, COUNSELLING_TYPE_LABELS } from '@/src/lib/utils';
import {
  cancelCounsellingBooking,
  listScholarBookings,
  markBookingCompleted,
} from '@/src/services/bookingService';
import type { CounsellingBooking } from '@/src/types/domain';

export function ScholarBookingsPage() {
  const { firebaseUser } = useAuth();
  const [bookings, setBookings] = useState<CounsellingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const rows = await listScholarBookings(firebaseUser.uid);
      setBookings(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, [firebaseUser]);

  const handleComplete = async (bookingId: string) => {
    try {
      await markBookingCompleted(bookingId);
      toast.success('Session marked as completed.');
      await loadBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update session.');
    }
  };

  const handleCancel = async (booking: CounsellingBooking) => {
    try {
      await cancelCounsellingBooking({
        bookingId: booking.bookingId,
        slotLockId: booking.slotLockId,
        cancelledBy: 'cancelled_by_scholar',
        reason: 'Cancelled by scholar via portal',
      });
      toast.success('Booking cancelled and time slot released.');
      await loadBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to cancel booking.');
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Assigned Counselling Bookings
        </h1>
        <p className="text-sm text-[#54615C]">
          Confidential counselling consultations scheduled with you.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No bookings assigned yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <article
              key={b.bookingId}
              className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E0D5] pb-3">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#1A2421]">
                    {b.clientName}
                  </h2>
                  <p className="text-xs text-[#54615C]">
                    {COUNSELLING_TYPE_LABELS[b.counsellingType]} ·{' '}
                    {COUNSELLING_FORMAT_LABELS[b.format]}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <StatusText status={b.status} />
                  <span className="font-mono text-xs text-[#54615C] tabular-nums">
                    {b.slotStartIso.slice(0, 16).replace('T', ' ')} ({b.timezone})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <p className="text-[#54615C]">
                  Email: <span className="font-mono text-[#1A2421]">{b.clientEmail}</span>
                </p>
                <p className="text-[#54615C]">
                  Phone: <span className="font-mono text-[#1A2421]">{b.clientPhone}</span>
                </p>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-xs font-medium text-[#7B8682]">Client Consultation Summary</p>
                <p className="text-[#1A2421] whitespace-pre-line">{b.issueSummary}</p>
              </div>

              {b.status === 'confirmed' && (
                <div className="flex flex-wrap gap-2 border-t border-[#E5E0D5] pt-3">
                  <Button size="sm" onClick={() => handleComplete(b.bookingId)}>
                    Mark Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(b)}
                  >
                    Cancel Session
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
