import { useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { StatusText } from '@/src/components/ui/StatusText';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';

export function BrotherSettingsPage() {
  const { firebaseUser, account, refreshAccount } = useAuth();
  const [requesting, setRequesting] = useState(false);

  const handleRequestDeletion = async () => {
    if (!firebaseUser) return;
    setRequesting(true);
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        accountStatus: 'deletion_requested',
        updatedAt: serverTimestamp(),
      });
      await refreshAccount();
      toast.success('Account deletion request recorded. Azwaj staff will process your request.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">Account Settings</h1>
        <p className="text-sm text-[#54615C]">
          Manage your account status and privacy preferences.
        </p>
      </div>

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#54615C]">Signed-in Email</span>
          <span className="font-mono text-[#1A2421]">{firebaseUser?.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#54615C]">Account Status</span>
          <StatusText
            status={account?.accountStatus === 'deletion_requested' ? 'pending' : 'active'}
            labelOverride={
              account?.accountStatus === 'deletion_requested'
                ? 'Deletion Requested'
                : 'Active'
            }
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-3">
        <h2 className="text-base font-semibold text-[#1A2421]">Request Account Deletion</h2>
        <p className="text-sm text-[#54615C]">
          Requesting deletion removes your profile from public consideration and queues your
          personal data for permanent removal by Azwaj administrators.
        </p>
        <Button
          variant="destructive"
          size="sm"
          disabled={requesting || account?.accountStatus === 'deletion_requested'}
          onClick={handleRequestDeletion}
        >
          {account?.accountStatus === 'deletion_requested'
            ? 'Deletion Request Pending'
            : requesting
              ? 'Submitting…'
              : 'Request Account Deletion'}
        </Button>
      </div>
    </div>
  );
}
