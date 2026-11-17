import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import {
  generateRandomId,
  makeMarriageLockId,
  normalizeEmail,
} from '@/src/lib/utils';
import type { WaliIntroductionInput } from '@/src/schemas/validation';
import type { MarriageRequest } from '@/src/types/domain';

export async function submitWaliIntroductionRequest(params: {
  brotherId: string;
  input: WaliIntroductionInput;
}): Promise<{ requestId: string; responseDeadlineIso: string; usedCloudFunction: boolean }> {
  const { brotherId, input } = params;

  // Attempt trusted Cloud Function first
  try {
    const fn = httpsCallable<Record<string, unknown>, { requestId: string; responseDeadlineAt: string }>(
      functions,
      'submitMarriageRequest'
    );
    const res = await fn({
      brotherId,
      ...input,
      sisterOccupation: input.sisterOccupation || undefined,
      additionalMessage: input.additionalMessage || undefined,
    });
    return {
      requestId: res.data.requestId,
      responseDeadlineIso: res.data.responseDeadlineAt,
      usedCloudFunction: true,
    };
  } catch (fnError: unknown) {
    const code = (fnError as { code?: string })?.code || '';
    // Propagate legitimate validation/duplicate errors immediately
    if (
      code.includes('already-exists') ||
      code.includes('failed-precondition') ||
      code.includes('invalid-argument')
    ) {
      throw fnError;
    }
    // Fall back to hardened transactional Firestore write if Cloud Functions are not yet deployed
  }

  const normalizedWaliEmail = normalizeEmail(input.waliEmail);
  const lockId = await makeMarriageLockId(brotherId, normalizedWaliEmail);
  const requestId = generateRandomId('mreq');
  const deadlineMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const responseDeadlineAt = Timestamp.fromMillis(deadlineMs);

  try {
    await runTransaction(db, async (tx) => {
      const brotherRef = doc(db, 'brotherProfiles', brotherId);
      const lockRef = doc(db, 'marriageRequestLocks', lockId);
      const requestRef = doc(db, 'marriageRequests', requestId);

      const brotherSnap = await tx.get(brotherRef);
      if (
        !brotherSnap.exists() ||
        brotherSnap.data().status !== 'approved' ||
        brotherSnap.data().isPublished !== true
      ) {
        throw new Error('This brother profile is not currently open for introduction requests.');
      }

      const lockSnap = await tx.get(lockRef);
      if (lockSnap.exists()) {
        const lockStatus = lockSnap.data().status;
        if (lockStatus === 'pending' || lockStatus === 'accepted') {
          throw new Error(
            'An active introduction request from this wali email address has already been submitted to this brother.'
          );
        }
      }

      const brotherDisplayName = brotherSnap.data().displayName as string;

      const reqPayload: Record<string, unknown> = {
        requestId,
        lockId,
        brotherId,
        brotherDisplayName,
        waliName: input.waliName.trim(),
        waliRelationship: input.waliRelationship.trim(),
        waliEmail: input.waliEmail.trim(),
        normalizedWaliEmail,
        waliPhone: input.waliPhone.trim(),
        waliCountry: input.waliCountry.trim(),
        waliCityDistrict: input.waliCityDistrict.trim(),
        sisterName: input.sisterName.trim(),
        sisterAge: input.sisterAge,
        sisterCountry: input.sisterCountry.trim(),
        sisterCityDistrict: input.sisterCityDistrict.trim(),
        sisterEducation: input.sisterEducation.trim(),
        sisterLanguages: input.sisterLanguages,
        sisterMarriageInfo: input.sisterMarriageInfo.trim(),
        sisterNote: input.sisterNote.trim(),
        confirmedWaliAuthority: true,
        privacyConsent: true,
        status: 'pending',
        responseDeadlineAt,
        contactSharingStatus: 'locked',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (input.sisterOccupation?.trim()) {
        reqPayload.sisterOccupation = input.sisterOccupation.trim();
      }
      if (input.additionalMessage?.trim()) {
        reqPayload.additionalMessage = input.additionalMessage.trim();
      }

      tx.set(requestRef, reqPayload);
      tx.set(lockRef, {
        lockId,
        brotherId,
        activeRequestId: requestId,
        status: 'pending',
        createdAt: lockSnap.exists() ? lockSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return {
      requestId,
      responseDeadlineIso: new Date(deadlineMs).toISOString(),
      usedCloudFunction: false,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('already been submitted') ||
        error.message.includes('not currently open'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'marriageRequests');
  }
}

export async function listBrotherMarriageRequests(
  brotherId: string
): Promise<MarriageRequest[]> {
  try {
    const q = query(
      collection(db, 'marriageRequests'),
      where('brotherId', '==', brotherId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MarriageRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'marriageRequests');
  }
}

export async function respondToBrotherMarriageRequest(params: {
  requestId: string;
  lockId: string;
  decision: 'accepted' | 'declined';
  brotherSharedContact?: string;
}): Promise<void> {
  const { requestId, lockId, decision, brotherSharedContact } = params;

  try {
    const fn = httpsCallable(functions, 'respondToMarriageRequest');
    await fn({ requestId, decision, brotherSharedContact });
    return;
  } catch (fnError: unknown) {
    const code = (fnError as { code?: string })?.code || '';
    if (code.includes('permission-denied') || code.includes('invalid-argument')) {
      throw fnError;
    }
  }

  try {
    await runTransaction(db, async (tx) => {
      const reqRef = doc(db, 'marriageRequests', requestId);
      const lockRef = doc(db, 'marriageRequestLocks', lockId);
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists()) throw new Error('Request not found.');
      if (reqSnap.data().status !== 'pending') {
        throw new Error('This request has already been answered.');
      }

      const updateFields: Record<string, unknown> = {
        status: decision,
        respondedAt: serverTimestamp(),
        contactSharingStatus: decision === 'accepted' ? 'exchanged' : 'locked',
        updatedAt: serverTimestamp(),
      };
      if (decision === 'accepted' && brotherSharedContact) {
        updateFields.brotherSharedContact = brotherSharedContact.trim();
      }

      tx.update(reqRef, updateFields);
      tx.update(lockRef, {
        status: decision,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `marriageRequests/${requestId}`);
  }
}
