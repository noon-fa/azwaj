import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import { Switch } from '@/src/components/ui/switch';
import { useAuth } from '@/src/contexts/AuthContext';
import { formatTimestamp } from '@/src/lib/utils';
import {
  getBrotherPrivateDetail,
  getBrotherPublicProfile,
  toggleBrotherPublication,
} from '@/src/services/brotherService';
import { listBrotherMarriageRequests } from '@/src/services/marriageService';
import type {
  BrotherPrivateDetail,
  BrotherPublicProfile,
  MarriageRequest,
} from '@/src/types/domain';

export function BrotherDashboardPage() {
  const { firebaseUser } = useAuth();
  const [profile, setProfile] = useState<BrotherPublicProfile | null>(null);
  const [privateDetail, setPrivateDetail] = useState<BrotherPrivateDetail | null>(null);
  const [requests, setRequests] = useState<MarriageRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);
    Promise.all([
      getBrotherPublicProfile(firebaseUser.uid),
      getBrotherPrivateDetail(firebaseUser.uid),
      listBrotherMarriageRequests(firebaseUser.uid),
    ])
      .then(([pub, priv, reqs]) => {
        setProfile(pub);
        setPrivateDetail(priv);
        setRequests(reqs);
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const handleTogglePublish = async (next: boolean) => {
    if (!firebaseUser || !profile) return;
    try {
      await toggleBrotherPublication({ uid: firebaseUser.uid, isPublished: next });
      setProfile({ ...profile, isPublished: next });
      toast.success(next ? 'Profile published to public directory.' : 'Profile unpublished.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update visibility.');
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Brother Dashboard
          </h1>
          <p className="text-sm text-[#54615C]">
            Manage your moderated marriage profile and review incoming wali-mediated requests.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/dashboard/profile">
            {profile ? 'Edit My Profile' : 'Complete Marriage Profile'}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Profile Moderation Status</p>
          {profile ? (
            <StatusText status={profile.status} />
          ) : (
            <p className="text-sm font-medium text-[#1A2421]">Not Submitted Yet</p>
          )}
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Pending Introduction Requests</p>
          <p className="font-mono text-2xl font-semibold text-[#1A2421] tabular-nums">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-2">
          <p className="text-xs text-[#54615C]">Accepted Introductions</p>
          <p className="font-mono text-2xl font-semibold text-[#1A2421] tabular-nums">
            {acceptedCount}
          </p>
        </div>
      </div>

      {!profile ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            Submit Your Marriage Profile for Review
          </h2>
          <p className="text-sm text-[#54615C] max-w-2xl">
            Your email ownership is verified. Complete your public introduction details and private
            contact record so Azwaj moderators can review and approve your profile.
          </p>
          <Button asChild>
            <Link to="/dashboard/profile">Begin Profile Registration</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#1A2421]">
                Directory Visibility
              </h2>
              <p className="text-xs text-[#54615C]">
                {profile.status === 'approved'
                  ? 'Your profile is approved. You may toggle its public listing at any time.'
                  : 'Your profile becomes eligible for public listing once approved by Azwaj administrators.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={profile.isPublished}
                disabled={profile.status !== 'approved'}
                onCheckedChange={handleTogglePublish}
                aria-label="Publish profile in public directory"
              />
              <span className="text-sm font-medium text-[#1A2421]">
                {profile.isPublished ? 'Published' : 'Hidden'}
              </span>
            </div>
          </div>

          {privateDetail?.adminReviewNote && (
            <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 text-sm space-y-1">
              <p className="text-xs font-semibold text-[#9A7B3E]">Administrator Review Note</p>
              <p className="text-[#1A2421]">{privateDetail.adminReviewNote}</p>
            </div>
          )}

          <div className="border-t border-[#E5E0D5] pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#54615C]">
            <span>Last updated: {formatTimestamp(profile.updatedAt)}</span>
            <Link to="/dashboard/requests" className="font-medium text-[#14533C] hover:underline">
              Review Marriage Requests →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
