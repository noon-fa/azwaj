import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MinusCircle,
  ShieldAlert,
} from 'lucide-react';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE_MAP: Record<string, { tone: Tone; label: string }> = {
  approved: { tone: 'success', label: 'Approved' },
  accepted: { tone: 'success', label: 'Accepted' },
  confirmed: { tone: 'success', label: 'Confirmed' },
  completed: { tone: 'success', label: 'Completed' },
  active: { tone: 'success', label: 'Active' },
  published: { tone: 'success', label: 'Published' },
  pending_review: { tone: 'warning', label: 'Pending Review' },
  pending: { tone: 'warning', label: 'Pending Response' },
  changes_requested: { tone: 'warning', label: 'Changes Requested' },
  new: { tone: 'warning', label: 'New' },
  reviewed: { tone: 'neutral', label: 'Reviewed' },
  resolved: { tone: 'success', label: 'Resolved' },
  rejected: { tone: 'danger', label: 'Rejected' },
  suspended: { tone: 'danger', label: 'Suspended' },
  declined: { tone: 'neutral', label: 'Declined' },
  expired: { tone: 'neutral', label: 'Expired' },
  cancelled_by_client: { tone: 'neutral', label: 'Cancelled by Client' },
  cancelled_by_scholar: { tone: 'neutral', label: 'Cancelled by Scholar' },
  cancelled_by_admin: { tone: 'neutral', label: 'Cancelled by Admin' },
  payment_not_enabled: { tone: 'neutral', label: 'Payment Processing Not Yet Enabled' },
};

export function StatusText({ status, labelOverride }: { status: string; labelOverride?: string }) {
  const entry = TONE_MAP[status] || { tone: 'neutral' as Tone, label: status };
  const label = labelOverride || entry.label;

  const colorClass =
    entry.tone === 'success'
      ? 'text-[#15803D]'
      : entry.tone === 'warning'
        ? 'text-[#B45309]'
        : entry.tone === 'danger'
          ? 'text-[#B91C1C]'
          : 'text-[#54615C]';

  const Icon =
    entry.tone === 'success'
      ? CheckCircle2
      : entry.tone === 'warning'
        ? Clock
        : entry.tone === 'danger'
          ? ShieldAlert
          : status === 'declined' || status === 'expired'
            ? MinusCircle
            : AlertCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${colorClass}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
