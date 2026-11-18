import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  fetchAdminDashboardData,
  initializeSriLankaDirectorySeed,
  updateInquiryStatus,
} from '@/src/services/adminService';
import type {
  BrotherPublicProfile,
  ContactInquiry,
  CounsellingBooking,
  MarriageRequest,
  ScholarProfile,
} from '@/src/types/domain';

export function AdminOverviewPage() {
  const { supabaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [data, setData] = useState<{
    brothers: BrotherPublicProfile[];
    requests: MarriageRequest[];
    scholars: ScholarProfile[];
    bookings: CounsellingBooking[];
    inquiries: ContactInquiry[];
  }>({
    brothers: [],
    requests: [],
    scholars: [],
    bookings: [],
    inquiries: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboardData();
      setData({
        brothers: res.brothers,
        requests: res.requests,
        scholars: res.scholars,
        bookings: res.bookings,
        inquiries: res.inquiries,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSeedSriLanka = async () => {
    if (!supabaseUser || !supabaseUser.email) return;
    setSeeding(true);
    try {
      await initializeSriLankaDirectorySeed({
        actorUid: supabaseUser.id,
        actorEmail: supabaseUser.email,
      });
      toast.success('Initialized Sri Lanka settings and starter Alim & Alimah scholar records.');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to initialize defaults.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="h-72 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  const metrics = [
    { label: 'Total Registered Brothers', value: data.brothers.length },
    {
      label: 'Pending Applications',
      value: data.brothers.filter((b) => b.status === 'pending_review').length,
    },
    {
      label: 'Approved Profiles',
      value: data.brothers.filter((b) => b.status === 'approved').length,
    },
    {
      label: 'Published Profiles',
      value: data.brothers.filter((b) => b.status === 'approved' && b.isPublished).length,
    },
    {
      label: 'Pending Marriage Requests',
      value: data.requests.filter((r) => r.status === 'pending').length,
    },
    {
      label: 'Accepted Requests',
      value: data.requests.filter((r) => r.status === 'accepted').length,
    },
    {
      label: 'Expired Requests',
      value: data.requests.filter((r) => r.status === 'expired').length,
    },
    {
      label: 'Active Scholars',
      value: data.scholars.filter((s) => s.isActive).length,
    },
    {
      label: 'Upcoming Counselling Bookings',
      value: data.bookings.filter((b) => b.status === 'confirmed').length,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Operational Overview
          </h1>
          <p className="text-sm text-[#54615C]">
            Real-time metrics across Sri Lanka marriage introductions and scholarly counselling.
          </p>
        </div>
        {data.scholars.length === 0 && (
          <Button size="sm" onClick={handleSeedSriLanka} disabled={seeding}>
            {seeding ? 'Initializing…' : 'Initialize Sri Lanka Settings & Sample Scholars'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-1.5"
          >
            <p className="text-xs text-[#54615C]">{m.label}</p>
            <p className="font-mono text-2xl font-semibold text-[#1A2421] tabular-nums">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Contact Inquiries & Reports */}
      <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A2421]">
            Recent Contact Inquiries &amp; Reports
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/brothers">Review Brother Queue</Link>
          </Button>
        </div>

        {data.inquiries.length === 0 ? (
          <p className="text-sm text-[#54615C]">No inquiries received yet.</p>
        ) : (
          <div className="divide-y divide-[#E5E0D5]">
            {data.inquiries.slice(0, 8).map((inq) => (
              <div
                key={inq.inquiryId}
                className="py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1A2421]">
                    {inq.topic} — {inq.name}{' '}
                    <span className="font-mono text-xs font-normal text-[#54615C]">
                      ({inq.email})
                    </span>
                  </p>
                  <p className="text-sm text-[#54615C]">{inq.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusText status={inq.status} />
                  {inq.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await updateInquiryStatus({
                          inquiryId: inq.inquiryId,
                          status: 'resolved',
                        });
                        toast.success('Inquiry marked resolved.');
                        await loadData();
                      }}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
