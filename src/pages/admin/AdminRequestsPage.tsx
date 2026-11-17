import { useEffect, useState } from 'react';
import { StatusText } from '@/src/components/ui/StatusText';
import { formatTimestamp } from '@/src/lib/utils';
import { fetchAdminDashboardData } from '@/src/services/adminService';
import type { MarriageRequest } from '@/src/types/domain';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<MarriageRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboardData()
      .then((res) => setRequests(res.requests))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === 'All'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Marriage Introduction Requests
          </h1>
          <p className="text-sm text-[#54615C]">
            Monitor request statuses and 7-day response deadlines across the platform.
          </p>
        </div>

        <select
          aria-label="Filter marriage requests by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No marriage introduction requests found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
              <tr>
                <th className="px-4 py-3">Brother</th>
                <th className="px-4 py-3">Wali</th>
                <th className="px-4 py-3">Sister</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filtered.map((req) => (
                <tr key={req.requestId} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3 font-medium text-[#1A2421]">
                    {req.brotherDisplayName}
                  </td>
                  <td className="px-4 py-3 text-[#54615C]">
                    {req.waliName} ({req.waliRelationship})
                    <span className="block font-mono text-xs text-[#7B8682]">
                      {req.waliEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#54615C]">
                    {req.sisterName} ({req.sisterAge} yrs) · {req.sisterCityDistrict}
                  </td>
                  <td className="px-4 py-3">
                    <StatusText status={req.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#54615C] tabular-nums">
                    {formatTimestamp(req.responseDeadlineAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#7B8682] tabular-nums">
                    {formatTimestamp(req.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
