import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  fetchAdminDashboardData,
  updateUserRoleAndStaffPermissions,
} from '@/src/services/adminService';
import type { StaffPermission, UserAccount, UserRole } from '@/src/types/domain';

export function AdminUsersPage() {
  const { supabaseUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [staffMap, setStaffMap] = useState<Record<string, StaffPermission>>({});
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('brother');
  const [perms, setPerms] = useState({
    canReviewBrothers: false,
    canManageRequests: false,
    canManageScholars: false,
    canManageBookings: false,
    canViewAuditLogs: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboardData();
      setUsers(res.users);
      const map: Record<string, StaffPermission> = {};
      res.staffPermissions.forEach((s) => {
        map[s.uid] = s;
      });
      setStaffMap(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const openRoleDialog = (u: UserAccount) => {
    setSelectedUser(u);
    setNewRole(u.role);
    const existingPerms = staffMap[u.uid];
    setPerms({
      canReviewBrothers: existingPerms?.canReviewBrothers ?? false,
      canManageRequests: existingPerms?.canManageRequests ?? false,
      canManageScholars: existingPerms?.canManageScholars ?? false,
      canManageBookings: existingPerms?.canManageBookings ?? false,
      canViewAuditLogs: existingPerms?.canViewAuditLogs ?? false,
      isActive: existingPerms?.isActive ?? true,
    });
  };

  const handleSaveRole = async () => {
    if (!supabaseUser || !supabaseUser.email || !selectedUser) return;
    setSaving(true);
    try {
      await updateUserRoleAndStaffPermissions({
        actorUid: supabaseUser.id,
        actorEmail: supabaseUser.email,
        targetUser: selectedUser,
        newRole,
        staffPerms: newRole === 'staff' ? perms : undefined,
      });
      toast.success(`Updated role for ${selectedUser.email}.`);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update user role.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Users &amp; Staff Permissions
        </h1>
        <p className="text-sm text-[#54615C]">
          Assign scholar, staff, or administrator roles and configure granular staff permissions.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">UID</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D5]">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-[#FAF9F6]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#1A2421]">{u.displayName}</p>
                  <p className="font-mono text-xs text-[#7B8682]">{u.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#54615C]">{u.uid}</td>
                <td className="px-4 py-3 capitalize font-medium text-[#1A2421]">{u.role}</td>
                <td className="px-4 py-3">
                  <StatusText status={u.accountStatus} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => openRoleDialog(u)}>
                    Manage Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Role &amp; Access</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} ({selectedUser?.uid})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="role-select">Account Role</Label>
              <select
                id="role-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
              >
                <option value="brother">Brother</option>
                <option value="scholar">Scholar</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {newRole === 'staff' && (
              <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 space-y-3">
                <p className="text-xs font-semibold text-[#1A2421]">
                  Staff Responsibility Permissions
                </p>
                {(
                  [
                    ['canReviewBrothers', 'Review & Moderate Brother Profiles'],
                    ['canManageRequests', 'Monitor Marriage Introduction Requests'],
                    ['canManageScholars', 'Manage Scholars & Pricing'],
                    ['canManageBookings', 'Manage Counselling Bookings'],
                    ['canViewAuditLogs', 'View Administrative Audit Logs'],
                    ['isActive', 'Staff Access Active'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2.5 text-xs cursor-pointer">
                    <Checkbox
                      checked={perms[key]}
                      onCheckedChange={(checked) =>
                        setPerms((prev) => ({ ...prev, [key]: checked === true }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole} disabled={saving}>
                {saving ? 'Saving…' : 'Save Role & Permissions'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
