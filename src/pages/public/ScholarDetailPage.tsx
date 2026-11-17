import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Info, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  COUNSELLING_FORMAT_LABELS,
  COUNSELLING_TYPE_LABELS,
  formatCurrencyLkr,
  generateAvailableSlots,
} from '@/src/lib/utils';
import { counsellingBookingSchema, type CounsellingBookingInput } from '@/src/schemas/validation';
import {
  createCounsellingBooking,
  listBookedSlotsForScholar,
} from '@/src/services/bookingService';
import { getScholarAvailability, getScholarById } from '@/src/services/scholarService';
import type {
  CounsellingSlotLock,
  ScholarAvailability,
  ScholarProfile,
} from '@/src/types/domain';

function getUpcomingDates(days = 14): { dateStr: string; label: string; dayShort: string }[] {
  const out: { dateStr: string; label: string; dayShort: string }[] = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    out.push({
      dateStr: `${yyyy}-${mm}-${dd}`,
      dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return out;
}

export function ScholarDetailPage() {
  const { scholarId } = useParams<{ scholarId: string }>();
  const [scholar, setScholar] = useState<ScholarProfile | null>(null);
  const [availability, setAvailability] = useState<ScholarAvailability | null>(null);
  const [slotLocks, setSlotLocks] = useState<CounsellingSlotLock[]>([]);
  const [loading, setLoading] = useState(true);

  const upcomingDates = useMemo(() => getUpcomingDates(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0]?.dateStr || '');
  const [selectedSlot, setSelectedSlot] = useState<{
    startIso: string;
    endIso: string;
    label: string;
  } | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<{
    bookingId: string;
    slotLabel: string;
    dateStr: string;
  } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CounsellingBookingInput>({
    resolver: zodResolver(counsellingBookingSchema),
    defaultValues: {
      counsellingType: 'pre_marital',
      format: 'online',
    },
  });

  const selectedType = watch('counsellingType');
  const selectedFormat = watch('format');

  useEffect(() => {
    if (!scholarId) return;
    setLoading(true);
    Promise.all([
      getScholarById(scholarId),
      getScholarAvailability(scholarId),
      listBookedSlotsForScholar(scholarId),
    ])
      .then(([sch, avail, locks]) => {
        if (sch && sch.isActive) {
          setScholar(sch);
          setAvailability(avail);
          setSlotLocks(locks);
          if (sch.counsellingTypes.length > 0) {
            setValue('counsellingType', sch.counsellingTypes[0]);
          }
          if (sch.counsellingFormats.length > 0) {
            setValue('format', sch.counsellingFormats[0]);
          }
        } else {
          setScholar(null);
        }
      })
      .finally(() => setLoading(false));
  }, [scholarId, setValue]);

  const bookedStartIsos = useMemo(
    () => new Set(slotLocks.filter((l) => l.status === 'booked').map((l) => l.slotStartIso)),
    [slotLocks]
  );

  const daySlots = useMemo(() => {
    if (!scholar) return [];
    return generateAvailableSlots({
      dateStr: selectedDate,
      availability,
      durationMinutes: scholar.sessionDurationMinutes,
      bookedStartIsos,
      timezone: scholar.timezone,
    });
  }, [scholar, selectedDate, availability, bookedStartIsos]);

  const onSubmit = async (values: CounsellingBookingInput) => {
    if (!scholar || !selectedSlot) {
      setBookingError('Please select an available date and time slot.');
      return;
    }
    setBookingError(null);
    try {
      const res = await createCounsellingBooking({
        scholarId: scholar.scholarId,
        slotStartIso: selectedSlot.startIso,
        slotEndIso: selectedSlot.endIso,
        input: values,
      });
      setBookingConfirmed({
        bookingId: res.bookingId,
        slotLabel: selectedSlot.label,
        dateStr: selectedDate,
      });
      const updatedLocks = await listBookedSlotsForScholar(scholar.scholarId);
      setSlotLocks(updatedLocks);
      toast.success('Counselling session confirmed.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to confirm booking.';
      setBookingError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="h-96 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />
      </div>
    );
  }

  if (!scholar) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">Scholar Unavailable</h1>
        <p className="text-sm text-[#54615C]">
          This scholar profile is inactive or does not exist.
        </p>
        <Button asChild variant="outline">
          <Link to="/scholars">Back to Scholars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Link
        to="/scholars"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#54615C] hover:text-[#14533C]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Scholars Directory</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Scholar Details Panel */}
        <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-5 lg:col-span-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] flex items-center justify-center">
              {scholar.photoUrl ? (
                <img
                  src={scholar.photoUrl}
                  alt={scholar.fullName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[#7B8682]" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[#1A2421]">
                {scholar.fullName}
              </h1>
              <p className="text-xs font-medium text-[#14533C] mt-0.5">{scholar.title}</p>
              <p className="text-xs text-[#54615C] mt-1">{scholar.experienceYears} years experience</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#E5E0D5] pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#54615C]">Session Duration</span>
              <span className="font-mono font-medium tabular-nums">
                {scholar.sessionDurationMinutes} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#54615C]">Per-Session Fee</span>
              <span className="font-mono font-semibold text-[#1A2421] tabular-nums">
                {formatCurrencyLkr(scholar.sessionPriceLkr, scholar.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#54615C]">Timezone</span>
              <span className="font-mono text-xs">{scholar.timezone}</span>
            </div>
            {scholar.cityLocation && (
              <div className="flex items-center justify-between">
                <span className="text-[#54615C]">In-Person Location</span>
                <span className="text-xs text-[#1A2421]">
                  {scholar.cityLocation}, {scholar.country}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-[#E5E0D5] pt-4 text-xs text-[#54615C]">
            <p className="font-semibold text-[#1A2421]">Qualification &amp; Education</p>
            <p>{scholar.qualification}</p>
            <p>{scholar.education}</p>
            <p className="pt-2 font-semibold text-[#1A2421]">Biography</p>
            <p className="leading-relaxed">{scholar.biography}</p>
          </div>
        </section>

        {/* Cal.com-style Booking Flow */}
        <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 sm:p-8 lg:col-span-8">
          {bookingConfirmed ? (
            <div className="space-y-5 py-4">
              <div className="flex items-center gap-2.5 text-[#15803D]">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
                  Counselling Session Confirmed
                </h2>
              </div>
              <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-5 space-y-2 text-sm">
                <p>
                  <span className="text-[#54615C]">Booking ID:</span>{' '}
                  <span className="font-mono font-medium">{bookingConfirmed.bookingId}</span>
                </p>
                <p>
                  <span className="text-[#54615C]">Scholar:</span>{' '}
                  <strong className="text-[#1A2421]">{scholar.fullName}</strong>
                </p>
                <p>
                  <span className="text-[#54615C]">Date &amp; Time:</span>{' '}
                  <span className="font-mono tabular-nums">
                    {bookingConfirmed.dateStr} at {bookingConfirmed.slotLabel} ({scholar.timezone})
                  </span>
                </p>
                <p>
                  <span className="text-[#54615C]">Payment Status:</span>{' '}
                  <span className="font-medium text-[#1A2421]">
                    Payment processing is not yet enabled (recorded as unpaid / pending future
                    billing integration)
                  </span>
                </p>
              </div>
              <p className="text-xs text-[#54615C]">
                Your session details are strictly confidential and isolated from marriage
                introduction records.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setBookingConfirmed(null);
                  setSelectedSlot(null);
                }}
              >
                Book Another Session
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <div className="border-b border-[#E5E0D5] pb-4">
                <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
                  Schedule Your Consultation
                </h2>
                <p className="text-sm text-[#54615C]">
                  Choose counselling type, format, date, and an open time slot.
                </p>
              </div>

              {bookingError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#B91C1C]/30 bg-[#FEF2F2] p-3.5 text-sm text-[#B91C1C]"
                >
                  {bookingError}
                </div>
              )}

              {/* Step 1: Type & Format */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>01. Counselling Type</Label>
                  <div className="flex flex-col gap-2">
                    {scholar.counsellingTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('counsellingType', type)}
                        className={`rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                          selectedType === type
                            ? 'border-[#14533C] bg-[#14533C]/5 font-medium text-[#14533C]'
                            : 'border-[#E5E0D5] text-[#1A2421] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        {COUNSELLING_TYPE_LABELS[type] || type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>02. Counselling Format</Label>
                  <div className="flex flex-col gap-2">
                    {scholar.counsellingFormats.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setValue('format', fmt)}
                        className={`rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                          selectedFormat === fmt
                            ? 'border-[#14533C] bg-[#14533C]/5 font-medium text-[#14533C]'
                            : 'border-[#E5E0D5] text-[#1A2421] hover:bg-[#FAF9F6]'
                        }`}
                      >
                        {COUNSELLING_FORMAT_LABELS[fmt] || fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Date & Time Picker */}
              <div className="space-y-4 border-t border-[#E5E0D5] pt-5">
                <div className="flex items-center justify-between">
                  <Label className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#14533C]" />
                    <span>03. Select Date &amp; Time ({scholar.timezone})</span>
                  </Label>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {upcomingDates.map((d) => (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`rounded-lg border p-2 text-center transition-colors cursor-pointer ${
                        selectedDate === d.dateStr
                          ? 'border-[#14533C] bg-[#14533C] text-white'
                          : 'border-[#E5E0D5] bg-[#FAF9F6] text-[#1A2421] hover:border-[#14533C]/50'
                      }`}
                    >
                      <span className="block text-[11px] opacity-80">{d.dayShort}</span>
                      <span className="block text-xs font-medium tabular-nums mt-0.5">
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#54615C] inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Available Slots for {selectedDate}</span>
                  </p>
                  {daySlots.length === 0 ? (
                    <p className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 text-sm text-[#54615C]">
                      No available slots on this date. Please select another day.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {daySlots.map((slot) => (
                        <button
                          key={slot.startIso}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-sm font-mono tabular-nums transition-colors ${
                            slot.isBooked
                              ? 'border-[#E5E0D5] bg-[#F2EFE9] text-[#9A968E] line-through cursor-not-allowed'
                              : selectedSlot?.startIso === slot.startIso
                                ? 'border-[#14533C] bg-[#14533C] text-white cursor-pointer'
                                : 'border-[#E5E0D5] bg-white text-[#1A2421] hover:border-[#14533C] cursor-pointer'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Contact Details */}
              <div className="space-y-4 border-t border-[#E5E0D5] pt-5">
                <Label>04. Your Contact Details &amp; Summary</Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="clientName">Full Name</Label>
                    <Input id="clientName" {...register('clientName')} placeholder="Your name" />
                    {errors.clientName && (
                      <p className="text-xs text-[#B91C1C]">{errors.clientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clientEmail">Email Address</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      {...register('clientEmail')}
                      placeholder="you@example.com"
                    />
                    {errors.clientEmail && (
                      <p className="text-xs text-[#B91C1C]">{errors.clientEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      {...register('clientPhone')}
                      placeholder="+94 77 123 4567"
                    />
                    {errors.clientPhone && (
                      <p className="text-xs text-[#B91C1C]">{errors.clientPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issueSummary">Brief Summary for the Scholar</Label>
                  <Textarea
                    id="issueSummary"
                    rows={3}
                    {...register('issueSummary')}
                    placeholder="Briefly describe what you would like to discuss (kept confidential with the scholar)…"
                  />
                  {errors.issueSummary && (
                    <p className="text-xs text-[#B91C1C]">{errors.issueSummary.message}</p>
                  )}
                </div>
              </div>

              {/* Payment Status Transparency Notice */}
              <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 flex items-start gap-3 text-xs text-[#54615C]">
                <Info className="h-4 w-4 text-[#14533C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1A2421]">
                    Payment Processing Status: Not Yet Enabled
                  </p>
                  <p className="mt-0.5">
                    Session fee ({formatCurrencyLkr(scholar.sessionPriceLkr, scholar.currency)}) is
                    recorded with your booking, and online card checkout is not yet active. You
                    will not be charged online right now.
                  </p>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting || !selectedSlot}>
                {isSubmitting ? 'Confirming Booking…' : 'Confirm Counselling Booking'}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
