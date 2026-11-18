import { apiPost } from '@/src/lib/api';
import { supabase } from '@/src/lib/supabase';
import type { CounsellingBookingInput } from '@/src/schemas/validation';
import type { CounsellingBooking, CounsellingSlotLock } from '@/src/types/domain';

export async function listBookedSlotsForScholar(scholarId: string): Promise<CounsellingSlotLock[]> {
  const { data, error } = await supabase
    .from('counselling_bookings')
    .select('booking_id,scholar_id,slot_start,slot_end,status')
    .eq('scholar_id', scholarId)
    .neq('status', 'cancelled_by_client');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    slotLockId: row.booking_id,
    bookingId: row.booking_id,
    scholarId: row.scholar_id,
    slotStartIso: row.slot_start,
    slotEndIso: row.slot_end,
    status: row.status === 'confirmed' ? 'booked' : 'cancelled',
    createdAt: '',
    updatedAt: '',
  }));
}

export async function createCounsellingBooking(params: {
  scholarId: string;
  slotStartIso: string;
  slotEndIso: string;
  input: CounsellingBookingInput;
}) {
  return apiPost<{ bookingId: string }>('/api/counselling/book', params);
}

export async function listScholarBookings(scholarUid: string): Promise<CounsellingBooking[]> {
  const { data: scholar } = await supabase.from('scholars').select('scholar_id').eq('uid', scholarUid).maybeSingle();
  if (!scholar) return [];
  const { data, error } = await supabase.from('counselling_bookings').select('*').eq('scholar_id', scholar.scholar_id).order('slot_start');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    bookingId: row.booking_id,
    scholarId: row.scholar_id,
    slotStartIso: row.slot_start,
    slotEndIso: row.slot_end,
    sessionPriceLkr: row.session_price_lkr,
  }));
}

export async function cancelCounsellingBooking(params: {
  bookingId: string;
  slotLockId: string;
  cancelledBy: 'cancelled_by_scholar' | 'cancelled_by_admin';
  reason?: string;
}) {
  const { error } = await supabase.from('counselling_bookings').update({
    status: params.cancelledBy,
    cancellation_reason: params.reason,
    updated_at: new Date().toISOString(),
  }).eq('booking_id', params.bookingId);
  if (error) throw error;
}

export async function markBookingCompleted(bookingId: string) {
  const { error } = await supabase.from('counselling_bookings').update({
    status: 'completed',
    updated_at: new Date().toISOString(),
  }).eq('booking_id', bookingId);
  if (error) throw error;
}
