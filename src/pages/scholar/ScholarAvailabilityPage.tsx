import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getScholarAvailability,
  getScholarByUid,
  saveScholarAvailability,
} from '@/src/services/scholarService';
import type { BreakWindow, DayAvailability, ScholarProfile } from '@/src/types/domain';

const DAY_LABELS: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
};

const DEFAULT_HOURS: Record<string, DayAvailability> = {
  '0': { enabled: false, startTime: '09:00', endTime: '17:00' },
  '1': { enabled: true, startTime: '09:00', endTime: '17:00' },
  '2': { enabled: true, startTime: '09:00', endTime: '17:00' },
  '3': { enabled: true, startTime: '09:00', endTime: '17:00' },
  '4': { enabled: true, startTime: '09:00', endTime: '17:00' },
  '5': { enabled: true, startTime: '14:30', endTime: '18:30' },
  '6': { enabled: true, startTime: '09:00', endTime: '13:00' },
};

export function ScholarAvailabilityPage() {
  const { supabaseUser } = useAuth();
  const [scholar, setScholar] = useState<ScholarProfile | null>(null);
  const [timezone, setTimezone] = useState('Asia/Colombo');
  const [weeklyHours, setWeeklyHours] = useState<Record<string, DayAvailability>>(DEFAULT_HOURS);
  const [breaks, setBreaks] = useState<BreakWindow[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabaseUser) return;
    setLoading(true);
    getScholarByUid(supabaseUser.id)
      .then(async (sch) => {
        setScholar(sch);
        if (sch) {
          const avail = await getScholarAvailability(sch.scholarId);
          if (avail) {
            setTimezone(avail.timezone);
            setWeeklyHours(avail.weeklyHours);
            setBreaks(avail.breaks || []);
            setUnavailableDates(avail.unavailableDates || []);
          } else {
            setTimezone(sch.timezone || 'Asia/Colombo');
          }
        }
      })
      .finally(() => setLoading(false));
  }, [supabaseUser]);

  const handleSave = async () => {
    if (!scholar || !supabaseUser) return;
    setSaving(true);
    try {
      await saveScholarAvailability({
        scholarId: scholar.scholarId,
        scholarUid: supabaseUser.id,
        timezone,
        weeklyHours,
        breaks,
        unavailableDates,
      });
      toast.success('Availability schedule saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-72 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  if (!scholar) {
    return (
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 text-sm text-[#54615C]">
        No linked scholar profile found for your account.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Availability &amp; Working Hours
          </h1>
          <p className="text-sm text-[#54615C]">
            Configure your weekly counselling hours, breaks, and blocked dates ({timezone}).
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Schedule'}
        </Button>
      </div>

      {/* Weekly Hours */}
      <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1A2421]">Weekly Hours</h2>
        <div className="divide-y divide-[#E5E0D5]">
          {Object.keys(DAY_LABELS).map((dayKey) => {
            const cfg = weeklyHours[dayKey] || {
              enabled: false,
              startTime: '09:00',
              endTime: '17:00',
            };
            return (
              <div
                key={dayKey}
                className="py-3 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-36">
                  <Switch
                    checked={cfg.enabled}
                    onCheckedChange={(checked) =>
                      setWeeklyHours((prev) => ({
                        ...prev,
                        [dayKey]: { ...cfg, enabled: checked },
                      }))
                    }
                  />
                  <span className="text-sm font-medium text-[#1A2421]">
                    {DAY_LABELS[dayKey]}
                  </span>
                </div>

                {cfg.enabled ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Input
                      type="time"
                      value={cfg.startTime}
                      onChange={(e) =>
                        setWeeklyHours((prev) => ({
                          ...prev,
                          [dayKey]: { ...cfg, startTime: e.target.value },
                        }))
                      }
                      className="w-32 font-mono text-xs"
                    />
                    <span className="text-[#54615C]">to</span>
                    <Input
                      type="time"
                      value={cfg.endTime}
                      onChange={(e) =>
                        setWeeklyHours((prev) => ({
                          ...prev,
                          [dayKey]: { ...cfg, endTime: e.target.value },
                        }))
                      }
                      className="w-32 font-mono text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-[#7B8682]">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Breaks */}
      <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A2421]">Daily Breaks / Prayer Windows</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setBreaks((prev) => [
                ...prev,
                { dayOfWeek: 1, startTime: '12:30', endTime: '13:30' },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Break</span>
          </Button>
        </div>
        {breaks.length === 0 ? (
          <p className="text-xs text-[#54615C]">No break windows configured.</p>
        ) : (
          <div className="space-y-2.5">
            {breaks.map((brk, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <select
                  value={brk.dayOfWeek}
                  onChange={(e) =>
                    setBreaks((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, dayOfWeek: Number(e.target.value) } : item
                      )
                    )
                  }
                  className="h-9 rounded-lg border border-[#E5E0D5] bg-white px-2.5 text-xs"
                >
                  {Object.entries(DAY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={brk.startTime}
                  onChange={(e) =>
                    setBreaks((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, startTime: e.target.value } : item
                      )
                    )
                  }
                  className="h-9 w-28 font-mono text-xs"
                />
                <span className="text-xs text-[#54615C]">–</span>
                <Input
                  type="time"
                  value={brk.endTime}
                  onChange={(e) =>
                    setBreaks((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, endTime: e.target.value } : item
                      )
                    )
                  }
                  className="h-9 w-28 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove break"
                  onClick={() => setBreaks((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-[#B91C1C]" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Unavailable Dates */}
      <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1A2421]">Unavailable Dates (Holidays / Leave)</h2>
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="block-date" className="text-xs">
              Select Date
            </Label>
            <Input
              id="block-date"
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="w-44 font-mono text-xs"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (!newBlockedDate) return;
              if (!unavailableDates.includes(newBlockedDate)) {
                setUnavailableDates((prev) => [...prev, newBlockedDate].sort());
              }
              setNewBlockedDate('');
            }}
          >
            Block Date
          </Button>
        </div>

        {unavailableDates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unavailableDates.map((d) => (
              <div
                key={d}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] px-3 py-1 text-xs font-mono"
              >
                <span>{d}</span>
                <button
                  type="button"
                  aria-label={`Unblock ${d}`}
                  onClick={() =>
                    setUnavailableDates((prev) => prev.filter((item) => item !== d))
                  }
                  className="text-[#B91C1C] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
