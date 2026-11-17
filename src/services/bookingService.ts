import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import { generateRandomId, makeSlotLockId } from '@/src/lib/utils';
import type { CounsellingBookingInput } from '@/src/schemas/validation';
import type { CounsellingBooking, CounsellingSlotLock } from '@/src/types/domain';

export async function listBookedSlotsForScholar(
  scholarId: string
): Promise<CounsellingSlotLock[]> {
  try {
    const q = query(
      collection(db, 'counsellingSlotLocks'),
      where('scholarId', '==', scholarId),
      where('status', '==', 'booked')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CounsellingSlotLock);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'counsellingSlotLocks');
  }
}

export async function createCounsellingBooking(params: {
  scholarId: string;
  slotStartIso: string;
  slotEndIso: string;
  input: CounsellingBookingInput;
}): Promise<{ bookingId: string; usedCloudFunction: boolean }> {
  const { scholarId, slotStartIso, slotEndIso, input } = params;

  try {
    const fn = httpsCallable<Record<string, unknown>, { bookingId: string }>(
      functions,
      'createCounsellingBooking'
    );
    const res = await fn({
      scholarId,
      slotStartIso,
      slotEndIso,
      ...input,
    });
    return { bookingId: res.data.bookingId, usedCloudFunction: true };
  } catch (fnError: unknown) {
    const code = (fnError as { code?: string })?.code || '';
    if (
      code.includes('already-exists') ||
      code.includes('failed-precondition') ||
      code.includes('invalid-argument')
    ) {
      throw fnError;
    }
  }

  const bookingId = generateRandomId('book');
  const slotLockId = makeSlotLockId(scholarId, slotStartIso);

  try {
    await runTransaction(db, async (tx) => {
      const scholarRef = doc(db, 'scholars', scholarId);
      const lockRef = doc(db, 'counsellingSlotLocks', slotLockId);
      const bookingRef = doc(db, 'counsellingBookings', bookingId);

      const [scholarSnap, lockSnap] = await Promise.all([
        tx.get(scholarRef),
        tx.get(lockRef),
      ]);

      if (!scholarSnap.exists() || scholarSnap.data().isActive !== true) {
        throw new Error('This scholar is not currently accepting bookings.');
      }

      if (lockSnap.exists() && lockSnap.data().status === 'booked') {
        throw new Error('This time slot was just reserved. Please choose another slot.');
      }

      const scholar = scholarSnap.data();

      const bookingPayload: Record<string, unknown> = {
        bookingId,
        slotLockId,
        scholarId,
        scholarName: scholar.fullName,
        counsellingType: input.counsellingType,
        format: input.format,
        slotStartIso,
        slotEndIso,
        timezone: scholar.timezone || 'Asia/Colombo',
        durationMinutes: scholar.sessionDurationMinutes,
        sessionPriceLkr: scholar.sessionPriceLkr,
        currency: scholar.currency || 'LKR',
        clientName: input.clientName.trim(),
        clientEmail: input.clientEmail.trim(),
        clientPhone: input.clientPhone.trim(),
        issueSummary: input.issueSummary.trim(),
        status: 'confirmed',
        paymentStatus: 'payment_not_enabled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (scholar.uid) {
        bookingPayload.scholarUid = scholar.uid;
      }

      tx.set(bookingRef, bookingPayload);
      tx.set(lockRef, {
        slotLockId,
        scholarId,
        bookingId,
        slotStartIso,
        slotEndIso,
        status: 'booked',
        createdAt: lockSnap.exists() ? lockSnap.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return { bookingId, usedCloudFunction: false };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('just reserved') || error.message.includes('not currently accepting'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'counsellingBookings');
  }
}

export async function listScholarBookings(
  scholarUid: string
): Promise<CounsellingBooking[]> {
  try {
    const q = query(
      collection(db, 'counsellingBookings'),
      where('scholarUid', '==', scholarUid),
      orderBy('slotStartIso', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CounsellingBooking);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'counsellingBookings');
  }
}

export async function cancelCounsellingBooking(params: {
  bookingId: string;
  slotLockId: string;
  cancelledBy: 'cancelled_by_scholar' | 'cancelled_by_admin';
  reason?: string;
}): Promise<void> {
  const { bookingId, slotLockId, cancelledBy, reason } = params;

  try {
    const fn = httpsCallable(functions, 'cancelCounsellingBooking');
    await fn({ bookingId, reason });
    return;
  } catch (fnError: unknown) {
    const code = (fnError as { code?: string })?.code || '';
    if (code.includes('permission-denied')) throw fnError;
  }

  try {
    await runTransaction(db, async (tx) => {
      const bookingRef = doc(db, 'counsellingBookings', bookingId);
      const lockRef = doc(db, 'counsellingSlotLocks', slotLockId);
      const snap = await tx.get(bookingRef);
      if (!snap.exists()) throw new Error('Booking not found.');

      const updateFields: Record<string, unknown> = {
        status: cancelledBy,
        updatedAt: serverTimestamp(),
      };
      if (reason?.trim()) {
        updateFields.cancellationReason = reason.trim();
      }

      tx.update(bookingRef, updateFields);
      tx.update(lockRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `counsellingBookings/${bookingId}`);
  }
}

export async function markBookingCompleted(bookingId: string): Promise<void> {
  try {
    await runTransaction(db, async (tx) => {
      const refDoc = doc(db, 'counsellingBookings', bookingId);
      tx.update(refDoc, {
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `counsellingBookings/${bookingId}`);
  }
}
