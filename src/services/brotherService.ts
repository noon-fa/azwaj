import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import type { BrotherRegistrationInput } from '@/src/schemas/validation';
import type { BrotherPrivateDetail, BrotherPublicProfile } from '@/src/types/domain';

export async function listPublishedBrothers(): Promise<BrotherPublicProfile[]> {
  try {
    const q = query(
      collection(db, 'brotherProfiles'),
      where('status', '==', 'approved'),
      where('isPublished', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BrotherPublicProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'brotherProfiles');
  }
}

export async function getBrotherPublicProfile(
  brotherId: string
): Promise<BrotherPublicProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'brotherProfiles', brotherId));
    if (!snap.exists()) return null;
    return snap.data() as BrotherPublicProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `brotherProfiles/${brotherId}`);
  }
}

export async function getBrotherPrivateDetail(
  brotherId: string
): Promise<BrotherPrivateDetail | null> {
  try {
    const snap = await getDoc(doc(db, 'brotherPrivateDetails', brotherId));
    if (!snap.exists()) return null;
    return snap.data() as BrotherPrivateDetail;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `brotherPrivateDetails/${brotherId}`);
  }
}

export async function uploadBrotherPhoto(uid: string, file: File): Promise<string> {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPEG, PNG, or WebP images are permitted.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Profile photograph must be 5 MB or smaller.');
  }
  const safeName = `profile_${Date.now()}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
  const storageRef = ref(storage, `brothers/${uid}/profile/${safeName}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function saveBrotherProfile(params: {
  uid: string;
  email: string;
  input: BrotherRegistrationInput;
  photoUrl?: string;
}): Promise<void> {
  const { uid, email, input, photoUrl } = params;
  const birthYear = new Date(input.dateOfBirth).getFullYear();

  try {
    const publicRef = doc(db, 'brotherProfiles', uid);
    const privateRef = doc(db, 'brotherPrivateDetails', uid);
    const [publicSnap, privateSnap] = await Promise.all([
      getDoc(publicRef),
      getDoc(privateRef),
    ]);

    const batch = writeBatch(db);

    const publicPayload: Record<string, unknown> = {
      brotherId: uid,
      displayName: input.displayName.trim(),
      birthYear,
      country: input.country.trim(),
      cityDistrict: input.cityDistrict.trim(),
      nationality: input.nationality.trim(),
      education: input.education.trim(),
      occupation: input.occupation.trim(),
      maritalStatus: input.maritalStatus,
      religiousPractice: input.religiousPractice.trim(),
      languages: input.languages,
      marriagePreferences: input.marriagePreferences.trim(),
      about: input.about.trim(),
      showPhotoPublicly: input.showPhotoPublicly,
      consentToPublish: true,
      status: 'pending_review',
      isPublished: false,
      updatedAt: serverTimestamp(),
      createdAt: publicSnap.exists() ? publicSnap.data().createdAt : serverTimestamp(),
    };

    const resolvedPhoto = photoUrl ?? (publicSnap.exists() ? publicSnap.data().photoUrl : undefined);
    if (resolvedPhoto) {
      publicPayload.photoUrl = resolvedPhoto;
    }

    batch.set(publicRef, publicPayload);

    const privatePayload: Record<string, unknown> = {
      brotherId: uid,
      fullName: input.fullName.trim(),
      email: email.trim(),
      phone: input.phone.trim(),
      dateOfBirth: input.dateOfBirth,
      updatedAt: serverTimestamp(),
      createdAt: privateSnap.exists() ? privateSnap.data().createdAt : serverTimestamp(),
    };

    if (privateSnap.exists() && privateSnap.data().adminReviewNote) {
      privatePayload.adminReviewNote = privateSnap.data().adminReviewNote;
    }
    if (privateSnap.exists() && privateSnap.data().reviewedBy) {
      privatePayload.reviewedBy = privateSnap.data().reviewedBy;
    }

    batch.set(privateRef, privatePayload);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `brotherProfiles/${uid}`);
  }
}

export async function toggleBrotherPublication(params: {
  uid: string;
  isPublished: boolean;
}): Promise<void> {
  try {
    await updateDoc(doc(db, 'brotherProfiles', params.uid), {
      isPublished: params.isPublished,
      consentToPublish: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brotherProfiles/${params.uid}`);
  }
}
