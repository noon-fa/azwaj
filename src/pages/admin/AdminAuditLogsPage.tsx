import { useEffect, useState } from 'react';
import { formatTimestamp } from '@/src/lib/utils';
import { fetchAdminDashboardData } from '@/src/services/adminService';
import type { AuditLog } from '@/src/types/domain';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboardData()
      .then((res) => setLogs(res.auditLogs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Administrative Audit Logs
        </h1>
        <p className="text-sm text-[#54615C]">
          Immutable record of sensitive moderation, scholar, role, and settings operations.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No administrative actions recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {logs.map((log) => (
                <tr key={log.logId} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#7B8682]">
                    {formatTimestamp(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#1A2421]">
                    {log.actorEmail}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#14533C]">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#54615C]">
                    {log.targetCollection}/{log.targetId}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#54615C]">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
