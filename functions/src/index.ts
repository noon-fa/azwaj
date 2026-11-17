import * as crypto from 'node:crypto';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { z } from 'zod';
import { dispatchEmail, emailTemplates } from './email/templates.js';

admin.initializeApp();

const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-2aed7eba-d628-418b-abf2-b2a242d57a01';
const db = admin.firestore();
db.settings({ databaseId: DATABASE_ID, ignoreUndefinedProperties: true });

const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'itsmefminsaf@gmail.com';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function makeLockId(brotherId: string, normalizedWaliEmail: string): string {
  const hash = crypto.createHash('sha256').update(normalizedWaliEmail).digest('hex').slice(0, 32);
  return `${brotherId}__${hash}`;
}

function makeSlotLockId(scholarId: string, slotStartIso: string): string {
  const compact = slotStartIso.replace(/[^a-zA-Z0-9]/g, '');
  return `${scholarId}__${compact}`;
}

async function assertAdminOrStaff(uid: string, email: string | undefined, perm?: string): Promise<void> {
  if (email && email.toLowerCase() === ADMIN_ALERT_EMAIL.toLowerCase()) return;
  const adminSnap = await db.collection('admins').doc(uid).get();
  if (adminSnap.exists) return;
  if (perm) {
    const staffSnap = await db.collection('staffPermissions').doc(uid).get();
    if (staffSnap.exists && staffSnap.data()?.isActive === true && staffSnap.data()?.[perm] === true) {
      return;
    }
  }
  throw new HttpsError('permission-denied', 'Authorized administrator or staff access required.');
}

async function writeAuditLog(params: {
  actorUid: string;
  actorEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  summary: string;
}): Promise<void> {
  const logId = db.collection('auditLogs').doc().id;
  await db.collection('auditLogs').doc(logId).set({
    logId,
    actorUid: params.actorUid,
    actorEmail: params.actorEmail,
    action: params.action,
    targetCollection: params.targetCollection,
    targetId: params.targetId,
    summary: params.summary.slice(0, 500),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// 1. Submit Wali Marriage Introduction Request (Duplicate-proof + 7-day deadline)
const submitMarriageRequestSchema = z.object({
  brotherId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  waliName: z.string().min(2).max(100),
  waliRelationship: z.string().min(2).max(60),
  waliEmail: z.string().email().max(180),
  waliPhone: z.string().min(7).max(24),
  waliCountry: z.string().min(2).max(60),
  waliCityDistrict: z.string().min(2).max(80),
  sisterName: z.string().min(2).max(100),
  sisterAge: z.number().int().min(18).max(80),
  sisterCountry: z.string().min(2).max(60),
  sisterCityDistrict: z.string().min(2).max(80),
  sisterEducation: z.string().min(2).max(140),
  sisterOccupation: z.string().max(120).optional(),
  sisterLanguages: z.array(z.string().min(1).max(40)).min(1).max(10),
  sisterMarriageInfo: z.string().min(10).max(800),
  sisterNote: z.string().min(10).max(1000),
  additionalMessage: z.string().max(800).optional(),
  confirmedWaliAuthority: z.literal(true),
  privacyConsent: z.literal(true),
});

export const submitMarriageRequest = onCall({ enforceAppCheck: false }, async (request) => {
  const parsed = submitMarriageRequestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid introduction request details.');
  }
  const input = parsed.data;
  const normalizedWaliEmail = normalizeEmail(input.waliEmail);
  const lockId = makeLockId(input.brotherId, normalizedWaliEmail);
  const requestId = db.collection('marriageRequests').doc().id;
  const now = admin.firestore.Timestamp.now();
  const deadline = admin.firestore.Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);

  let brotherDisplayName = '';
  let brotherEmail = '';

  await db.runTransaction(async (tx) => {
    const brotherRef = db.collection('brotherProfiles').doc(input.brotherId);
    const brotherPrivateRef = db.collection('brotherPrivateDetails').doc(input.brotherId);
    const lockRef = db.collection('marriageRequestLocks').doc(lockId);

    const [brotherSnap, brotherPrivateSnap, lockSnap] = await Promise.all([
      tx.get(brotherRef),
      tx.get(brotherPrivateRef),
      tx.get(lockRef),
    ]);

    if (!brotherSnap.exists || brotherSnap.data()?.status !== 'approved' || brotherSnap.data()?.isPublished !== true) {
      throw new HttpsError('failed-precondition', 'Selected brother profile is not available for introductions.');
    }

    if (lockSnap.exists) {
      const lockStatus = lockSnap.data()?.status;
      if (lockStatus === 'pending' || lockStatus === 'accepted') {
        throw new HttpsError(
          'already-exists',
          'An active introduction request from this wali email already exists for this brother.'
        );
      }
    }

    brotherDisplayName = brotherSnap.data()?.displayName || 'Brother';
    brotherEmail = brotherPrivateSnap.data()?.email || '';

    const requestRef = db.collection('marriageRequests').doc(requestId);
    tx.set(requestRef, {
      requestId,
      lockId,
      brotherId: input.brotherId,
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
      ...(input.sisterOccupation ? { sisterOccupation: input.sisterOccupation.trim() } : {}),
      sisterLanguages: input.sisterLanguages,
      sisterMarriageInfo: input.sisterMarriageInfo.trim(),
      sisterNote: input.sisterNote.trim(),
      ...(input.additionalMessage ? { additionalMessage: input.additionalMessage.trim() } : {}),
      confirmedWaliAuthority: true,
      privacyConsent: true,
      status: 'pending',
      responseDeadlineAt: deadline,
      contactSharingStatus: 'locked',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(lockRef, {
      lockId,
      brotherId: input.brotherId,
      activeRequestId: requestId,
      status: 'pending',
      createdAt: lockSnap.exists ? lockSnap.data()?.createdAt : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  if (brotherEmail) {
    await dispatchEmail(
      db,
      emailTemplates.newMarriageRequestToBrother({
        to: brotherEmail,
        brotherName: brotherDisplayName,
        waliName: input.waliName,
        waliRelationship: input.waliRelationship,
        sisterCity: `${input.sisterCityDistrict}, ${input.sisterCountry}`,
        deadlineDate: deadline.toDate().toISOString().slice(0, 10),
      })
    );
  }

  return { requestId, status: 'pending', responseDeadlineAt: deadline.toDate().toISOString() };
});

// 2. Brother responds to marriage request (Accept / Decline)
const respondSchema = z.object({
  requestId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  decision: z.enum(['accepted', 'declined']),
  brotherSharedContact: z.string().max(300).optional(),
});

export const respondToMarriageRequest = onCall(async (request) => {
  if (!request.auth || !request.auth.token.email_verified) {
    throw new HttpsError('unauthenticated', 'Verified authentication required.');
  }
  const parsed = respondSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid response payload.');
  }
  const { requestId, decision, brotherSharedContact } = parsed.data;
  if (decision === 'accepted' && (!brotherSharedContact || brotherSharedContact.trim().length < 5)) {
    throw new HttpsError('invalid-argument', 'Please provide contact details to share with the wali upon acceptance.');
  }

  let waliEmail = '';
  let waliName = '';
  let brotherDisplayName = '';

  await db.runTransaction(async (tx) => {
    const reqRef = db.collection('marriageRequests').doc(requestId);
    const reqSnap = await tx.get(reqRef);
    if (!reqSnap.exists) {
      throw new HttpsError('not-found', 'Introduction request not found.');
    }
    const data = reqSnap.data()!;
    if (data.brotherId !== request.auth!.uid) {
      throw new HttpsError('permission-denied', 'You can only respond to requests addressed to your profile.');
    }
    if (data.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'This request has already been finalized.');
    }

    waliEmail = data.waliEmail;
    waliName = data.waliName;
    brotherDisplayName = data.brotherDisplayName;

    const lockRef = db.collection('marriageRequestLocks').doc(data.lockId);
    tx.update(reqRef, {
      status: decision,
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      contactSharingStatus: decision === 'accepted' ? 'exchanged' : 'locked',
      ...(decision === 'accepted' ? { brotherSharedContact: brotherSharedContact!.trim() } : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    tx.update(lockRef, {
      status: decision,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  if (waliEmail) {
    await dispatchEmail(
      db,
      decision === 'accepted'
        ? emailTemplates.requestAcceptedToWali({
            to: waliEmail,
            waliName,
            brotherDisplayName,
            brotherSharedContact: brotherSharedContact!.trim(),
          })
        : emailTemplates.requestDeclinedToWali({
            to: waliEmail,
            waliName,
            brotherDisplayName,
          })
    );
  }

  return { requestId, status: decision };
});

// 3. Scheduled 7-day request expiry processor (runs every hour)
export const expirePendingMarriageRequests = onSchedule('every 60 minutes', async () => {
  const now = admin.firestore.Timestamp.now();
  const expiredSnap = await db
    .collection('marriageRequests')
    .where('status', '==', 'pending')
    .where('responseDeadlineAt', '<=', now)
    .limit(100)
    .get();

  for (const docSnap of expiredSnap.docs) {
    const data = docSnap.data();
    const batch = db.batch();
    batch.update(docSnap.ref, {
      status: 'expired',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (data.lockId) {
      batch.update(db.collection('marriageRequestLocks').doc(data.lockId), {
        status: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    if (data.waliEmail) {
      await dispatchEmail(
        db,
        emailTemplates.requestExpiredToWali({
          to: data.waliEmail,
          waliName: data.waliName,
          brotherDisplayName: data.brotherDisplayName,
        })
      );
    }
  }
});

// 4. Create Counselling Booking (Transaction conflict-proof + server price enforcement)
const createBookingSchema = z.object({
  scholarId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  counsellingType: z.enum(['pre_marital', 'married_couples', 'individual']),
  format: z.enum(['online', 'in_person']),
  slotStartIso: z.string().min(10).max(40),
  slotEndIso: z.string().min(10).max(40),
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email().max(180),
  clientPhone: z.string().min(7).max(24),
  issueSummary: z.string().min(10).max(1000),
});

export const createCounsellingBooking = onCall(async (request) => {
  const parsed = createBookingSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid booking details.');
  }
  const input = parsed.data;
  const bookingId = db.collection('counsellingBookings').doc().id;
  const slotLockId = makeSlotLockId(input.scholarId, input.slotStartIso);

  let scholarName = '';
  let scholarEmail = '';
  let timezone = 'Asia/Colombo';

  await db.runTransaction(async (tx) => {
    const scholarRef = db.collection('scholars').doc(input.scholarId);
    const lockRef = db.collection('counsellingSlotLocks').doc(slotLockId);

    const [scholarSnap, lockSnap] = await Promise.all([tx.get(scholarRef), tx.get(lockRef)]);
    if (!scholarSnap.exists || scholarSnap.data()?.isActive !== true) {
      throw new HttpsError('failed-precondition', 'Selected scholar is not currently active.');
    }
    if (lockSnap.exists && lockSnap.data()?.status === 'booked') {
      throw new HttpsError('already-exists', 'This time slot has already been booked.');
    }

    const scholar = scholarSnap.data()!;
    scholarName = scholar.fullName;
    scholarEmail = scholar.email || '';
    timezone = scholar.timezone || 'Asia/Colombo';

    tx.set(db.collection('counsellingBookings').doc(bookingId), {
      bookingId,
      slotLockId,
      scholarId: input.scholarId,
      ...(scholar.uid ? { scholarUid: scholar.uid } : {}),
      scholarName,
      counsellingType: input.counsellingType,
      format: input.format,
      slotStartIso: input.slotStartIso,
      slotEndIso: input.slotEndIso,
      timezone,
      durationMinutes: scholar.sessionDurationMinutes,
      sessionPriceLkr: scholar.sessionPriceLkr,
      currency: scholar.currency || 'LKR',
      clientName: input.clientName.trim(),
      clientEmail: input.clientEmail.trim(),
      clientPhone: input.clientPhone.trim(),
      issueSummary: input.issueSummary.trim(),
      status: 'confirmed',
      paymentStatus: 'payment_not_enabled',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(lockRef, {
      slotLockId,
      scholarId: input.scholarId,
      bookingId,
      slotStartIso: input.slotStartIso,
      slotEndIso: input.slotEndIso,
      status: 'booked',
      createdAt: lockSnap.exists ? lockSnap.data()?.createdAt : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await dispatchEmail(
    db,
    emailTemplates.counsellingBookingConfirmation({
      to: input.clientEmail,
      clientName: input.clientName,
      scholarName,
      counsellingType: input.counsellingType,
      format: input.format,
      slotIso: input.slotStartIso,
      timezone,
    })
  );

  if (scholarEmail) {
    await dispatchEmail(
      db,
      emailTemplates.counsellingScholarAlert({
        to: scholarEmail,
        scholarName,
        clientName: input.clientName,
        counsellingType: input.counsellingType,
        format: input.format,
        slotIso: input.slotStartIso,
      })
    );
  }

  return { bookingId, status: 'confirmed', paymentStatus: 'payment_not_enabled' };
});

// 5. Cancel Counselling Booking
const cancelBookingSchema = z.object({
  bookingId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  reason: z.string().max(400).optional(),
});

export const cancelCounsellingBooking = onCall(async (request) => {
  if (!request.auth || !request.auth.token.email_verified) {
    throw new HttpsError('unauthenticated', 'Verified authentication required.');
  }
  const parsed = cancelBookingSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid cancellation request.');
  }
  const { bookingId, reason } = parsed.data;
  const bookingRef = db.collection('counsellingBookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new HttpsError('not-found', 'Booking not found.');
  }
  const booking = bookingSnap.data()!;
  const isAssignedScholar = booking.scholarUid === request.auth.uid;
  if (!isAssignedScholar) {
    await assertAdminOrStaff(request.auth.uid, request.auth.token.email, 'canManageBookings');
  }

  const nextStatus = isAssignedScholar ? 'cancelled_by_scholar' : 'cancelled_by_admin';
  const batch = db.batch();
  batch.update(bookingRef, {
    status: nextStatus,
    ...(reason ? { cancellationReason: reason } : {}),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.update(db.collection('counsellingSlotLocks').doc(booking.slotLockId), {
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorEmail: request.auth.token.email || 'unknown',
    action: 'cancel_counselling_booking',
    targetCollection: 'counsellingBookings',
    targetId: bookingId,
    summary: `Cancelled booking ${bookingId} (${nextStatus})`,
  });

  if (booking.clientEmail) {
    await dispatchEmail(
      db,
      emailTemplates.counsellingCancellation({
        to: booking.clientEmail,
        recipientName: booking.clientName,
        scholarName: booking.scholarName,
        slotIso: booking.slotStartIso,
        reason,
      })
    );
  }

  return { bookingId, status: nextStatus };
});

// 6. Admin / Staff moderation of Brother Profiles
const reviewBrotherSchema = z.object({
  brotherId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  status: z.enum(['approved', 'changes_requested', 'rejected', 'suspended']),
  isPublished: z.boolean(),
  note: z.string().max(800).optional(),
});

export const reviewBrotherProfile = onCall(async (request) => {
  if (!request.auth || !request.auth.token.email_verified) {
    throw new HttpsError('unauthenticated', 'Verified authentication required.');
  }
  await assertAdminOrStaff(request.auth.uid, request.auth.token.email, 'canReviewBrothers');

  const parsed = reviewBrotherSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid moderation payload.');
  }
  const { brotherId, status, isPublished, note } = parsed.data;
  const profileRef = db.collection('brotherProfiles').doc(brotherId);
  const privateRef = db.collection('brotherPrivateDetails').doc(brotherId);
  const [profileSnap, privateSnap] = await Promise.all([profileRef.get(), privateRef.get()]);

  if (!profileSnap.exists) {
    throw new HttpsError('not-found', 'Brother profile not found.');
  }

  const effectivePublished = status === 'approved' ? isPublished && profileSnap.data()?.consentToPublish === true : false;

  const batch = db.batch();
  batch.update(profileRef, {
    status,
    isPublished: effectivePublished,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  if (privateSnap.exists) {
    batch.update(privateRef, {
      ...(note !== undefined ? { adminReviewNote: note } : {}),
      reviewedBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  await writeAuditLog({
    actorUid: request.auth.uid,
    actorEmail: request.auth.token.email || 'unknown',
    action: `brother_${status}`,
    targetCollection: 'brotherProfiles',
    targetId: brotherId,
    summary: `Set brother ${brotherId} status=${status}, published=${effectivePublished}`,
  });

  if (privateSnap.exists && privateSnap.data()?.email) {
    await dispatchEmail(
      db,
      emailTemplates.brotherApplicationStatus({
        to: privateSnap.data()!.email,
        fullName: privateSnap.data()!.fullName,
        status,
        note,
      })
    );
  }

  return { brotherId, status, isPublished: effectivePublished };
});

// 7. Scheduled Counselling Reminder Processor
export const sendCounsellingReminders = onSchedule('every 60 minutes', async () => {
  const now = Date.now();
  const in24Hours = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date(now).toISOString();

  const snap = await db
    .collection('counsellingBookings')
    .where('status', '==', 'confirmed')
    .where('slotStartIso', '>=', nowIso)
    .where('slotStartIso', '<=', in24Hours)
    .limit(50)
    .get();

  for (const docSnap of snap.docs) {
    const b = docSnap.data();
    await dispatchEmail(
      db,
      emailTemplates.counsellingReminder({
        to: b.clientEmail,
        clientName: b.clientName,
        scholarName: b.scholarName,
        slotIso: b.slotStartIso,
        format: b.format,
      })
    );
  }
});
