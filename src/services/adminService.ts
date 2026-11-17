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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import { AZWAJ_IMAGES } from '@/src/lib/images';
import { generateRandomId } from '@/src/lib/utils';
import type { ContactInquiryInput, ScholarFormInput } from '@/src/schemas/validation';
import type {
  AuditLog,
  BrotherPrivateDetail,
  BrotherProfileStatus,
  BrotherPublicProfile,
  ContactInquiry,
  CounsellingBooking,
  MarriageRequest,
  PlatformSetting,
  ScholarProfile,
  StaffPermission,
  UserAccount,
  UserRole,
} from '@/src/types/domain';

export async function logAdminAction(params: {
  actorUid: string;
  actorEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  summary: string;
}): Promise<void> {
  try {
    const logId = generateRandomId('log');
    await setDoc(doc(db, 'auditLogs', logId), {
      logId,
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: params.action,
      targetCollection: params.targetCollection,
      targetId: params.targetId,
      summary: params.summary.slice(0, 500),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'auditLogs');
  }
}

export async function submitContactInquiry(input: ContactInquiryInput): Promise<string> {
  const inquiryId = generateRandomId('inq');
  try {
    await setDoc(doc(db, 'contactInquiries', inquiryId), {
      inquiryId,
      name: input.name.trim(),
      email: input.email.trim(),
      topic: input.topic.trim(),
      message: input.message.trim(),
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `contactInquiries/${inquiryId}`);
  }
}

export async function fetchAdminDashboardData(): Promise<{
  brothers: BrotherPublicProfile[];
  requests: MarriageRequest[];
  scholars: ScholarProfile[];
  bookings: CounsellingBooking[];
  users: UserAccount[];
  inquiries: ContactInquiry[];
  auditLogs: AuditLog[];
  staffPermissions: StaffPermission[];
  settings: PlatformSetting | null;
}> {
  try {
    const [
      brothersSnap,
      requestsSnap,
      scholarsSnap,
      bookingsSnap,
      usersSnap,
      inquiriesSnap,
      logsSnap,
      staffSnap,
      settingSnap,
    ] = await Promise.all([
      getDocs(query(collection(db, 'brotherProfiles'), orderBy('updatedAt', 'desc'))),
      getDocs(query(collection(db, 'marriageRequests'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'scholars'), orderBy('fullName', 'asc'))),
      getDocs(query(collection(db, 'counsellingBookings'), orderBy('slotStartIso', 'desc'))),
      getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'contactInquiries'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'staffPermissions')),
      getDoc(doc(db, 'platformSettings', 'LK')),
    ]);

    return {
      brothers: brothersSnap.docs.map((d) => d.data() as BrotherPublicProfile),
      requests: requestsSnap.docs.map((d) => d.data() as MarriageRequest),
      scholars: scholarsSnap.docs.map((d) => d.data() as ScholarProfile),
      bookings: bookingsSnap.docs.map((d) => d.data() as CounsellingBooking),
      users: usersSnap.docs.map((d) => d.data() as UserAccount),
      inquiries: inquiriesSnap.docs.map((d) => d.data() as ContactInquiry),
      auditLogs: logsSnap.docs.map((d) => d.data() as AuditLog),
      staffPermissions: staffSnap.docs.map((d) => d.data() as StaffPermission),
      settings: settingSnap.exists() ? (settingSnap.data() as PlatformSetting) : null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_dashboard');
  }
}

export async function getBrotherFullApplicationForAdmin(brotherId: string): Promise<{
  publicProfile: BrotherPublicProfile | null;
  privateDetail: BrotherPrivateDetail | null;
}> {
  try {
    const [pubSnap, privSnap] = await Promise.all([
      getDoc(doc(db, 'brotherProfiles', brotherId)),
      getDoc(doc(db, 'brotherPrivateDetails', brotherId)),
    ]);
    return {
      publicProfile: pubSnap.exists() ? (pubSnap.data() as BrotherPublicProfile) : null,
      privateDetail: privSnap.exists() ? (privSnap.data() as BrotherPrivateDetail) : null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `brotherPrivateDetails/${brotherId}`);
  }
}

export async function moderateBrotherProfile(params: {
  actorUid: string;
  actorEmail: string;
  brotherId: string;
  status: BrotherProfileStatus;
  isPublished: boolean;
  consentToPublish: boolean;
  note?: string;
}): Promise<void> {
  const { actorUid, actorEmail, brotherId, status, isPublished, consentToPublish, note } = params;
  const finalPublished = status === 'approved' && consentToPublish ? isPublished : false;

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'brotherProfiles', brotherId), {
      status,
      isPublished: finalPublished,
      updatedAt: serverTimestamp(),
    });
    const privRef = doc(db, 'brotherPrivateDetails', brotherId);
    const privSnap = await getDoc(privRef);
    if (privSnap.exists()) {
      const privUpdate: Record<string, unknown> = {
        reviewedBy: actorUid,
        updatedAt: serverTimestamp(),
      };
      if (note !== undefined) {
        privUpdate.adminReviewNote = note.trim();
      }
      batch.update(privRef, privUpdate);
    }
    await batch.commit();

    await logAdminAction({
      actorUid,
      actorEmail,
      action: `brother_${status}`,
      targetCollection: 'brotherProfiles',
      targetId: brotherId,
      summary: `Updated brother ${brotherId}: status=${status}, published=${finalPublished}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `brotherProfiles/${brotherId}`);
  }
}

export async function saveScholarRecord(params: {
  actorUid: string;
  actorEmail: string;
  scholarId?: string;
  input: ScholarFormInput;
}): Promise<string> {
  const { actorUid, actorEmail, input } = params;
  const scholarId = params.scholarId || generateRandomId('sch');

  try {
    const refDoc = doc(db, 'scholars', scholarId);
    const existingSnap = await getDoc(refDoc);

    const payload: Record<string, unknown> = {
      scholarId,
      fullName: input.fullName.trim(),
      gender: input.gender,
      title: input.title.trim(),
      qualification: input.qualification.trim(),
      education: input.education.trim(),
      expertise: input.expertise,
      languages: input.languages,
      biography: input.biography.trim(),
      experienceYears: input.experienceYears,
      counsellingFormats: input.counsellingFormats,
      counsellingTypes: input.counsellingTypes,
      sessionDurationMinutes: input.sessionDurationMinutes,
      sessionPriceLkr: input.sessionPriceLkr,
      currency: 'LKR',
      country: input.country.trim(),
      timezone: input.timezone.trim(),
      isActive: input.isActive,
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (input.email?.trim()) payload.email = input.email.trim();
    if (input.uid?.trim()) payload.uid = input.uid.trim();
    if (input.cityLocation?.trim()) payload.cityLocation = input.cityLocation.trim();
    if (input.photoUrl?.trim()) payload.photoUrl = input.photoUrl.trim();

    await setDoc(refDoc, payload);

    // Ensure default availability document exists for new scholars
    const availRef = doc(db, 'scholarAvailability', scholarId);
    const availSnap = await getDoc(availRef);
    if (!availSnap.exists()) {
      await setDoc(availRef, {
        scholarId,
        ...(input.uid?.trim() ? { scholarUid: input.uid.trim() } : {}),
        timezone: input.timezone.trim(),
        weeklyHours: {
          '0': { enabled: false, startTime: '09:00', endTime: '17:00' },
          '1': { enabled: true, startTime: '09:00', endTime: '17:00' },
          '2': { enabled: true, startTime: '09:00', endTime: '17:00' },
          '3': { enabled: true, startTime: '09:00', endTime: '17:00' },
          '4': { enabled: true, startTime: '09:00', endTime: '17:00' },
          '5': { enabled: true, startTime: '14:00', endTime: '18:00' },
          '6': { enabled: true, startTime: '09:00', endTime: '13:00' },
        },
        breaks: [{ dayOfWeek: 1, startTime: '12:30', endTime: '13:30' }],
        unavailableDates: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await logAdminAction({
      actorUid,
      actorEmail,
      action: existingSnap.exists() ? 'update_scholar' : 'create_scholar',
      targetCollection: 'scholars',
      targetId: scholarId,
      summary: `${existingSnap.exists() ? 'Updated' : 'Created'} scholar ${input.fullName}`,
    });

    return scholarId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `scholars/${scholarId}`);
  }
}

export async function updateUserRoleAndStaffPermissions(params: {
  actorUid: string;
  actorEmail: string;
  targetUser: UserAccount;
  newRole: UserRole;
  staffPerms?: {
    canReviewBrothers: boolean;
    canManageRequests: boolean;
    canManageScholars: boolean;
    canManageBookings: boolean;
    canViewAuditLogs: boolean;
    isActive: boolean;
  };
}): Promise<void> {
  const { actorUid, actorEmail, targetUser, newRole, staffPerms } = params;
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', targetUser.uid), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    if (newRole === 'admin') {
      batch.set(doc(db, 'admins', targetUser.uid), {
        uid: targetUser.uid,
        email: targetUser.email,
        grantedBy: actorUid,
        createdAt: serverTimestamp(),
      });
    }

    if (newRole === 'staff' && staffPerms) {
      const existingStaffSnap = await getDoc(doc(db, 'staffPermissions', targetUser.uid));
      batch.set(doc(db, 'staffPermissions', targetUser.uid), {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        ...staffPerms,
        updatedBy: actorUid,
        createdAt: existingStaffSnap.exists()
          ? existingStaffSnap.data().createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();

    await logAdminAction({
      actorUid,
      actorEmail,
      action: 'update_user_role',
      targetCollection: 'users',
      targetId: targetUser.uid,
      summary: `Assigned role=${newRole} to ${targetUser.email}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUser.uid}`);
  }
}

export async function updateInquiryStatus(params: {
  inquiryId: string;
  status: 'new' | 'reviewed' | 'resolved';
}): Promise<void> {
  try {
    await updateDoc(doc(db, 'contactInquiries', params.inquiryId), {
      status: params.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contactInquiries/${params.inquiryId}`);
  }
}

export async function savePlatformSettings(params: {
  actorUid: string;
  actorEmail: string;
  requestExpiryDays: number;
  emailProvider: 'resend' | 'smtp' | 'disabled';
  supportEmail: string;
}): Promise<void> {
  try {
    const refDoc = doc(db, 'platformSettings', 'LK');
    const snap = await getDoc(refDoc);
    await setDoc(refDoc, {
      settingId: 'LK',
      countryCode: 'LK',
      countryName: 'Sri Lanka',
      defaultCurrency: 'LKR',
      defaultTimezone: 'Asia/Colombo',
      requestExpiryDays: params.requestExpiryDays,
      paymentsEnabled: false,
      emailProvider: params.emailProvider,
      supportEmail: params.supportEmail.trim(),
      createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logAdminAction({
      actorUid: params.actorUid,
      actorEmail: params.actorEmail,
      action: 'update_platform_settings',
      targetCollection: 'platformSettings',
      targetId: 'LK',
      summary: `Updated Sri Lanka platform settings (expiry=${params.requestExpiryDays}d, email=${params.emailProvider})`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platformSettings/LK');
  }
}

export async function initializeSriLankaDirectorySeed(params: {
  actorUid: string;
  actorEmail: string;
}): Promise<void> {
  const { actorUid, actorEmail } = params;
  try {
    await savePlatformSettings({
      actorUid,
      actorEmail,
      requestExpiryDays: 7,
      emailProvider: 'disabled',
      supportEmail: 'support@azwaj.lk',
    });

    const batch = writeBatch(db);
    const defaultWeeklyHours = {
      '0': { enabled: false, startTime: '09:00', endTime: '17:00' },
      '1': { enabled: true, startTime: '09:00', endTime: '17:00' },
      '2': { enabled: true, startTime: '09:00', endTime: '17:00' },
      '3': { enabled: true, startTime: '09:00', endTime: '17:00' },
      '4': { enabled: true, startTime: '09:00', endTime: '17:00' },
      '5': { enabled: true, startTime: '14:30', endTime: '18:30' },
      '6': { enabled: true, startTime: '09:00', endTime: '13:00' },
    };

    batch.set(doc(db, 'scholars', 'sch_alim_colombo'), {
      scholarId: 'sch_alim_colombo',
      fullName: 'Moulavi Ash-Sheikh Farook Nazeer',
      photoUrl: AZWAJ_IMAGES.scholarAlim,
      gender: 'male',
      title: 'Alim & Senior Marriage Counsellor',
      qualification: 'Al-Alimiyyah (Jamiah Naleemiah), B.A. Islamic Jurisprudence',
      education: 'Jamiah Naleemiah Sri Lanka · Postgraduate Diploma in Family Counselling',
      expertise: ['Pre-marital preparation', 'Conflict resolution', 'Nikah rights & duties'],
      languages: ['English', 'Tamil', 'Sinhala', 'Arabic'],
      biography:
        'Serving Sri Lankan Muslim families for over fourteen years in pre-marital guidance, spousal mediation, and Islamic family jurisprudence with quiet confidentiality.',
      experienceYears: 14,
      counsellingFormats: ['online', 'in_person'],
      counsellingTypes: ['pre_marital', 'married_couples', 'individual'],
      sessionDurationMinutes: 45,
      sessionPriceLkr: 3500,
      currency: 'LKR',
      country: 'Sri Lanka',
      cityLocation: 'Colombo 04',
      timezone: 'Asia/Colombo',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'scholarAvailability', 'sch_alim_colombo'), {
      scholarId: 'sch_alim_colombo',
      timezone: 'Asia/Colombo',
      weeklyHours: defaultWeeklyHours,
      breaks: [{ dayOfWeek: 1, startTime: '12:30', endTime: '13:30' }],
      unavailableDates: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'scholars', 'sch_alimah_kandy'), {
      scholarId: 'sch_alimah_kandy',
      fullName: 'Ustadha Ayesha Rizwan',
      photoUrl: AZWAJ_IMAGES.scholarAlimah,
      gender: 'female',
      title: 'Alimah & Family Mediator',
      qualification: 'Alimah (Kulliyyah), M.A. Islamic Family Studies',
      education: 'Colombo Islamic Institute · Certificate in Systemic Marital Counselling',
      expertise: ['Sisters & family consultation', 'Pre-marital compatibility', 'In-law harmony'],
      languages: ['English', 'Tamil', 'Sinhala'],
      biography:
        'Specializes in compassionate, Islamically grounded guidance for sisters, couples navigating early marriage transitions, and extended family harmony across Sri Lanka.',
      experienceYears: 10,
      counsellingFormats: ['online', 'in_person'],
      counsellingTypes: ['pre_marital', 'married_couples', 'individual'],
      sessionDurationMinutes: 45,
      sessionPriceLkr: 3500,
      currency: 'LKR',
      country: 'Sri Lanka',
      cityLocation: 'Kandy',
      timezone: 'Asia/Colombo',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'scholarAvailability', 'sch_alimah_kandy'), {
      scholarId: 'sch_alimah_kandy',
      timezone: 'Asia/Colombo',
      weeklyHours: defaultWeeklyHours,
      breaks: [{ dayOfWeek: 2, startTime: '13:00', endTime: '14:00' }],
      unavailableDates: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    await logAdminAction({
      actorUid,
      actorEmail,
      action: 'initialize_sri_lanka_seed',
      targetCollection: 'scholars',
      targetId: 'LK',
      summary: 'Initialized Sri Lanka platform settings and starter Alim & Alimah scholar profiles',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'scholars');
  }
}
