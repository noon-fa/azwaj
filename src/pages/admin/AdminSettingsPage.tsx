import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  fetchAdminDashboardData,
  initializeSriLankaDirectorySeed,
  savePlatformSettings,
} from '@/src/services/adminService';

export function AdminSettingsPage() {
  const { firebaseUser } = useAuth();
  const [requestExpiryDays, setRequestExpiryDays] = useState(7);
  const [emailProvider, setEmailProvider] = useState<'resend' | 'smtp' | 'disabled'>('disabled');
  const [supportEmail, setSupportEmail] = useState('support@azwaj.lk');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboardData()
      .then((res) => {
        if (res.settings) {
          setRequestExpiryDays(res.settings.requestExpiryDays);
          setEmailProvider(res.settings.emailProvider);
          setSupportEmail(res.settings.supportEmail);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !firebaseUser.email) return;
    setSaving(true);
    try {
      await savePlatformSettings({
        actorUid: firebaseUser.uid,
        actorEmail: firebaseUser.email,
        requestExpiryDays,
        emailProvider,
        supportEmail,
      });
      toast.success('Platform settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Country &amp; Platform Settings
        </h1>
        <p className="text-sm text-[#54615C]">
          Active Deployment: Sri Lanka (LK) · Currency: LKR · Timezone: Asia/Colombo
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-5 text-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="expiry-days">Marriage Request Expiry Window (Days)</Label>
          <Input
            id="expiry-days"
            type="number"
            min={1}
            max={30}
            value={requestExpiryDays}
            onChange={(e) => setRequestExpiryDays(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email-provider">Server-Side Email Provider (Cloud Functions)</Label>
          <select
            id="email-provider"
            value={emailProvider}
            onChange={(e) =>
              setEmailProvider(e.target.value as 'resend' | 'smtp' | 'disabled')
            }
            className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
          >
            <option value="disabled">Queued Only (Provider Disabled)</option>
            <option value="resend">Resend API (Configured in Cloud Functions env)</option>
            <option value="smtp">Custom SMTP Adapter</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="support-email">Support Email Address</Label>
          <Input
            id="support-email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 text-xs text-[#54615C]">
          Payment Gateway Status: <strong>Not Yet Enabled</strong>. Counselling bookings store LKR
          session fees with status <span className="font-mono">payment_not_enabled</span> until a
          payment provider is integrated.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!firebaseUser || !firebaseUser.email) return;
              await initializeSriLankaDirectorySeed({
                actorUid: firebaseUser.uid,
                actorEmail: firebaseUser.email,
              });
              toast.success('Starter Sri Lanka Alim & Alimah records ensured.');
            }}
          >
            Ensure Starter Sri Lanka Scholars
          </Button>
        </div>
      </form>
    </div>
  );
}
