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
import { Label } from '@/src/components/ui/label';
import { StatusText } from '@/src/components/ui/StatusText';
import { Textarea } from '@/src/components/ui/textarea';
import { useAuth } from '@/src/contexts/AuthContext';
import { calculateAgeFromBirthYear, formatTimestamp } from '@/src/lib/utils';
import {
  fetchAdminDashboardData,
  getBrotherFullApplicationForAdmin,
  moderateBrotherProfile,
} from '@/src/services/adminService';
import type {
  BrotherPrivateDetail,
  BrotherProfileStatus,
  BrotherPublicProfile,
} from '@/src/types/domain';

export function AdminBrothersPage() {
  const { supabaseUser } = useAuth();
  const [brothers, setBrothers] = useState<BrotherPublicProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const [selectedBrother, setSelectedBrother] = useState<BrotherPublicProfile | null>(null);
  const [privateDetail, setPrivateDetail] = useState<BrotherPrivateDetail | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBrothers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboardData();
      setBrothers(res.brothers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBrothers();
  }, []);

  const openInspector = async (b: BrotherPublicProfile) => {
    setSelectedBrother(b);
    setPrivateDetail(null);
    setModeratorNote('');
    try {
      const full = await getBrotherFullApplicationForAdmin(b.brotherId);
      setPrivateDetail(full.privateDetail);
      setModeratorNote(full.privateDetail?.adminReviewNote || '');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load private details.');
    }
  };

  const applyDecision = async (status: BrotherProfileStatus, isPublished: boolean) => {
    if (!supabaseUser || !supabaseUser.email || !selectedBrother) return;
    setSaving(true);
    try {
      await moderateBrotherProfile({
        actorUid: supabaseUser.id,
        actorEmail: supabaseUser.email,
        brotherId: selectedBrother.brotherId,
        status,
        isPublished,
        consentToPublish: selectedBrother.consentToPublish,
        note: moderatorNote,
      });
      toast.success(`Profile updated to ${status}.`);
      setSelectedBrother(null);
      await loadBrothers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Moderation update failed.');
    } finally {
      setSaving(false);
    }
  };

  const filtered =
    statusFilter === 'All'
      ? brothers
      : brothers.filter((b) => b.status === statusFilter);

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Brother Applications &amp; Profiles
          </h1>
          <p className="text-sm text-[#54615C]">
            Review, approve, request modifications, suspend, or toggle publication.
          </p>
        </div>

        <select
          aria-label="Filter brothers by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No brother profiles match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
              <tr>
                <th className="px-4 py-3">Display Name</th>
                <th className="px-4 py-3">Age / District</th>
                <th className="px-4 py-3">Occupation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Directory</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filtered.map((b) => (
                <tr key={b.brotherId} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3 font-medium text-[#1A2421]">{b.displayName}</td>
                  <td className="px-4 py-3 text-[#54615C] tabular-nums">
                    {calculateAgeFromBirthYear(b.birthYear)} yrs · {b.cityDistrict}
                  </td>
                  <td className="px-4 py-3 text-[#54615C]">{b.occupation}</td>
                  <td className="px-4 py-3">
                    <StatusText status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#54615C]">
                    {b.isPublished ? 'Published' : 'Hidden'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#7B8682] tabular-nums">
                    {formatTimestamp(b.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openInspector(b)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(selectedBrother)} onOpenChange={(o) => !o && setSelectedBrother(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Brother Profile: {selectedBrother?.displayName}</DialogTitle>
            <DialogDescription>
              All moderation actions are recorded in the immutable audit log.
            </DialogDescription>
          </DialogHeader>

          {selectedBrother && (
            <div className="space-y-5 text-sm">
              {privateDetail && (
                <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <p>
                    <strong>Full Legal Name:</strong> {privateDetail.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {privateDetail.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {privateDetail.phone}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {privateDetail.dateOfBirth}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p>
                  <strong>Education:</strong> {selectedBrother.education}
                </p>
                <p>
                  <strong>Occupation:</strong> {selectedBrother.occupation}
                </p>
                <p>
                  <strong>Languages:</strong> {selectedBrother.languages.join(' · ')}
                </p>
                <p>
                  <strong>Religious Practice:</strong> {selectedBrother.religiousPractice}
                </p>
                <p>
                  <strong>About:</strong> {selectedBrother.about}
                </p>
                <p>
                  <strong>Marriage Preferences:</strong> {selectedBrother.marriagePreferences}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-note">Moderator Note (Visible to Brother)</Label>
                <Textarea
                  id="mod-note"
                  rows={3}
                  value={moderatorNote}
                  onChange={(e) => setModeratorNote(e.target.value)}
                  placeholder="Optional feedback or change requests…"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E0D5]">
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={() => applyDecision('approved', true)}
                >
                  Approve &amp; Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => applyDecision('approved', false)}
                >
                  Approve (Unpublished)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => applyDecision('changes_requested', false)}
                >
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => applyDecision('rejected', false)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => applyDecision('suspended', false)}
                >
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
