import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ScholarAvailability } from '@/src/types/domain';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAgeFromBirthYear(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(18, currentYear - birthYear);
}

export function formatTimestamp(ts?: string | Date | null): string {
  if (!ts) return '—';
  let date: Date;
  if (typeof ts === 'string') {
    date = new Date(ts);
  } else if (ts instanceof Date) {
    date = ts;
  } else {
    return '—';
  }
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrencyLkr(amount: number, currency = 'LKR'): string {
  return `${currency} ${amount.toLocaleString('en-LK')}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function makeMarriageLockId(
  brotherId: string,
  normalizedWaliEmail: string
): Promise<string> {
  const hash = await sha256Hex(normalizedWaliEmail);
  return `${brotherId}__${hash.slice(0, 32)}`;
}

export function makeSlotLockId(scholarId: string, slotStartIso: string): string {
  const compact = slotStartIso.replace(/[^a-zA-Z0-9]/g, '');
  return `${scholarId}__${compact}`;
}

export function generateRandomId(prefix: string): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

export function timeStringToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTimeString(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface ComputedSlot {
  startIso: string;
  endIso: string;
  label: string;
  isBooked: boolean;
}

/**
 * Generates available time slots for a given YYYY-MM-DD date in the scholar's timezone,
 * respecting weekly hours, break windows, unavailable dates, and active slot locks.
 */
export function generateAvailableSlots(params: {
  dateStr: string; // YYYY-MM-DD
  availability: ScholarAvailability | null;
  durationMinutes: number;
  bookedStartIsos: Set<string>;
  timezone?: string;
}): ComputedSlot[] {
  const { dateStr, availability, durationMinutes, bookedStartIsos } = params;
  if (!availability) return [];
  if (availability.unavailableDates.includes(dateStr)) return [];

  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return [];
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = utcDate.getUTCDay();
  const dayConfig = availability.weeklyHours[String(dayOfWeek)];
  if (!dayConfig || !dayConfig.enabled) return [];

  const startMin = timeStringToMinutes(dayConfig.startTime);
  const endMin = timeStringToMinutes(dayConfig.endTime);
  const dayBreaks = availability.breaks.filter((b) => b.dayOfWeek === dayOfWeek);

  // Offset calculation for Asia/Colombo (+05:30) or general UTC offset
  const tz = availability.timezone || params.timezone || 'Asia/Colombo';
  const offsetMinutes = tz === 'Asia/Colombo' ? 330 : 0;

  const slots: ComputedSlot[] = [];
  const nowMs = Date.now();

  for (let cursor = startMin; cursor + durationMinutes <= endMin; cursor += durationMinutes) {
    const slotEnd = cursor + durationMinutes;
    const overlapsBreak = dayBreaks.some((brk) => {
      const bStart = timeStringToMinutes(brk.startTime);
      const bEnd = timeStringToMinutes(brk.endTime);
      return cursor < bEnd && slotEnd > bStart;
    });
    if (overlapsBreak) continue;

    const slotStartUtcMs = Date.UTC(y, m - 1, d, 0, cursor - offsetMinutes);
    const slotEndUtcMs = Date.UTC(y, m - 1, d, 0, slotEnd - offsetMinutes);

    if (slotStartUtcMs <= nowMs + 30 * 60 * 1000) continue; // Cannot book past or <30m away

    const startIso = new Date(slotStartUtcMs).toISOString();
    const endIso = new Date(slotEndUtcMs).toISOString();
    const hour24 = Math.floor(cursor / 60);
    const min = cursor % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const label = `${hour12}:${String(min).padStart(2, '0')} ${period}`;

    slots.push({
      startIso,
      endIso,
      label,
      isBooked: bookedStartIsos.has(startIso),
    });
  }

  return slots;
}

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  never_married: 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
};

export const BROTHER_STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

export const COUNSELLING_TYPE_LABELS: Record<string, string> = {
  pre_marital: 'Pre-Marital Counselling',
  married_couples: 'Married Couples Counselling',
  individual: 'Individual Marriage Consultation',
};

export const COUNSELLING_FORMAT_LABELS: Record<string, string> = {
  online: 'Online Video Session',
  in_person: 'In-Person Consultation',
};
