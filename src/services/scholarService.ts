import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import type { ScholarAvailability, ScholarProfile } from '@/src/types/domain';

export async function listActiveScholars(): Promise<ScholarProfile[]> {
  try {
    const q = query(
      collection(db, 'scholars'),
      where('isActive', '==', true),
      orderBy('fullName', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ScholarProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'scholars');
  }
}

export async function getScholarById(scholarId: string): Promise<ScholarProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'scholars', scholarId));
    if (!snap.exists()) return null;
    return snap.data() as ScholarProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `scholars/${scholarId}`);
  }
}

export async function getScholarByUid(uid: string): Promise<ScholarProfile | null> {
  try {
    const q = query(collection(db, 'scholars'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as ScholarProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'scholars');
  }
}

export async function getScholarAvailability(
  scholarId: string
): Promise<ScholarAvailability | null> {
  try {
    const snap = await getDoc(doc(db, 'scholarAvailability', scholarId));
    if (!snap.exists()) return null;
    return snap.data() as ScholarAvailability;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `scholarAvailability/${scholarId}`);
  }
}

export async function saveScholarAvailability(params: {
  scholarId: string;
  scholarUid?: string;
  timezone: string;
  weeklyHours: ScholarAvailability['weeklyHours'];
  breaks: ScholarAvailability['breaks'];
  unavailableDates: string[];
}): Promise<void> {
  const { scholarId, scholarUid, timezone, weeklyHours, breaks, unavailableDates } = params;
  try {
    const refDoc = doc(db, 'scholarAvailability', scholarId);
    const existingSnap = await getDoc(refDoc);
    const payload: Record<string, unknown> = {
      scholarId,
      timezone,
      weeklyHours,
      breaks,
      unavailableDates,
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (scholarUid) {
      payload.scholarUid = scholarUid;
    }
    await setDoc(refDoc, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `scholarAvailability/${scholarId}`);
  }
}

export async function updateScholarOwnProfile(params: {
  scholarId: string;
  biography: string;
  counsellingFormats: ('online' | 'in_person')[];
  cityLocation: string;
}): Promise<void> {
  try {
    await updateDoc(doc(db, 'scholars', params.scholarId), {
      biography: params.biography.trim(),
      counsellingFormats: params.counsellingFormats,
      cityLocation: params.cityLocation.trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `scholars/${params.scholarId}`);
  }
}
