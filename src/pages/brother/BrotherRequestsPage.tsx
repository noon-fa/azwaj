import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import { formatTimestamp } from '@/src/lib/utils';
import {
  listBrotherMarriageRequests,
  respondToBrotherMarriageRequest,
} from '@/src/services/marriageService';
import type { MarriageRequest } from '@/src/types/domain';

export function BrotherRequestsPage() {
  const { firebaseUser } = useAuth();
  const [requests, setRequests] = useState<MarriageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptTarget, setAcceptTarget] = useState<MarriageRequest | null>(null);
  const [sharedContact, setSharedContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const rows = await listBrotherMarriageRequests(firebaseUser.uid);
      setRequests(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [firebaseUser]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTarget || sharedContact.trim().length < 5) {
      toast.error('Please enter family or personal contact details to share with the wali.');
      return;
    }
    setSubmitting(true);
    try {
      await respondToBrotherMarriageRequest({
        requestId: acceptTarget.requestId,
        lockId: acceptTarget.lockId,
        decision: 'accepted',
        brotherSharedContact: sharedContact.trim(),
      });
      toast.success('Request accepted. Contact details exchanged with the wali.');
      setAcceptTarget(null);
      setSharedContact('');
      await loadRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to accept request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (req: MarriageRequest) => {
    setSubmitting(true);
    try {
      await respondToBrotherMarriageRequest({
        requestId: req.requestId,
        lockId: req.lockId,
        decision: 'declined',
      });
      toast.success('Request respectfully declined.');
      await loadRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to decline request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Wali-Mediated Introduction Requests
        </h1>
        <p className="text-sm text-[#54615C]">
          You have 7 days to review and respond to each request before it expires automatically.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            No introduction requests yet
          </h2>
          <p className="text-sm text-[#54615C]">
            When a sister’s wali submits an introduction request for your approved profile, it will
            appear here confidentially.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <article
              key={req.requestId}
              className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E0D5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#1A2421]">
                    Introduction for {req.sisterName} ({req.sisterAge} yrs)
                  </h2>
                  <p className="text-xs text-[#54615C]">
                    Submitted by Wali: {req.waliName} ({req.waliRelationship}) ·{' '}
                    {req.waliCityDistrict}, {req.waliCountry}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <StatusText status={req.status} />
                  <span className="text-xs font-mono text-[#7B8682] tabular-nums">
                    Deadline: {formatTimestamp(req.responseDeadlineAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#7B8682]">Sister’s Location &amp; Education</p>
                  <p className="text-[#1A2421]">
                    {req.sisterCityDistrict}, {req.sisterCountry}
                  </p>
                  <p className="text-[#54615C]">{req.sisterEducation}</p>
                  {req.sisterOccupation && (
                    <p className="text-[#54615C]">Occupation: {req.sisterOccupation}</p>
                  )}
                  <p className="text-xs text-[#7B8682]">
                    Languages: {req.sisterLanguages.join(' · ')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#7B8682]">Marriage Background</p>
                  <p className="text-[#54615C] whitespace-pre-line">{req.sisterMarriageInfo}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-xs font-medium text-[#7B8682]">Introduction Note from Wali</p>
                <p className="text-[#1A2421] whitespace-pre-line">{req.sisterNote}</p>
                {req.additionalMessage && (
                  <p className="text-xs text-[#54615C] pt-1">
                    Additional message: {req.additionalMessage}
                  </p>
                )}
              </div>

              {req.status === 'accepted' && (
                <div className="rounded-lg border border-[#15803D]/30 bg-[#F0FDF4] p-4 text-sm space-y-1">
                  <p className="font-semibold text-[#15803D]">
                    Accepted — Wali Contact Details Released
                  </p>
                  <p className="text-[#1A2421]">
                    Wali Email: <span className="font-mono">{req.waliEmail}</span> · Phone:{' '}
                    <span className="font-mono">{req.waliPhone}</span>
                  </p>
                  {req.brotherSharedContact && (
                    <p className="text-xs text-[#54615C]">
                      Shared by you: {req.brotherSharedContact}
                    </p>
                  )}
                </div>
              )}

              {req.status === 'pending' && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5E0D5]">
                  <Button
                    size="sm"
                    onClick={() => {
                      setAcceptTarget(req);
                      setSharedContact('');
                    }}
                  >
                    Accept &amp; Share Contact
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleDecline(req)}
                  >
                    Respectfully Decline
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(acceptTarget)} onOpenChange={(o) => !o && setAcceptTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Introduction &amp; Share Contact</DialogTitle>
            <DialogDescription>
              Provide your preferred phone number or family guardian contact so the sister’s wali
              can coordinate the next step respectfully.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccept} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="brother-contact">Contact Details to Share with Wali</Label>
              <Input
                id="brother-contact"
                value={sharedContact}
                onChange={(e) => setSharedContact(e.target.value)}
                placeholder="e.g. Father (+94 77 234 5678) or personal phone/email"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAcceptTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Confirming…' : 'Confirm Acceptance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
