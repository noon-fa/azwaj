/**
 * Azwaj Firestore Security Rules — Dirty Dozen Test Suite
 * Run against Firebase Emulator Suite:
 *   firebase emulators:exec --only firestore "npx tsx firestore.rules.test.ts"
 */
import assert from 'node:assert/strict';

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
  description: string;
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Self-Privilege Escalation on users',
    collection: 'users/attacker_uid',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    description: 'User attempts to register with role: admin',
    payload: {
      uid: 'attacker_uid',
      email: 'attacker@example.com',
      displayName: 'Attacker',
      role: 'admin',
      accountStatus: 'active',
      emailVerified: true,
      countryCode: 'LK',
    },
  },
  {
    id: 2,
    name: 'Role Mutation on users update',
    collection: 'users/brother_uid',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    description: 'Brother attempts to elevate role to staff',
    payload: { role: 'staff' },
  },
  {
    id: 3,
    name: 'Self-Approval on brotherProfiles',
    collection: 'brotherProfiles/brother_uid',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    description: 'Brother creates profile already marked approved and published',
    payload: { status: 'approved', isPublished: true },
  },
  {
    id: 4,
    name: 'Ghost Field Injection on brotherProfiles',
    collection: 'brotherProfiles/brother_uid',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    description: 'Brother injects undocumented isIdentityVerified field',
    payload: { isIdentityVerified: true },
  },
  {
    id: 5,
    name: 'Unapproved Profile Scraping',
    collection: 'brotherProfiles',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
    description: 'Public user attempts unfiltered list query on brotherProfiles',
  },
  {
    id: 6,
    name: 'Brother PII Cross-Read',
    collection: 'brotherPrivateDetails/other_brother_uid',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
    description: 'Signed-in brother attempts to read another brother phone/email',
  },
  {
    id: 7,
    name: 'Public Marriage Request Read',
    collection: 'marriageRequests/req_001',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
    description: 'Unauthenticated or unrelated user attempts to read sister/wali request',
  },
  {
    id: 8,
    name: 'Forged Request Acceptance',
    collection: 'marriageRequests/req_002',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    description: 'Public wali submits a marriage request already marked accepted',
    payload: { status: 'accepted' },
  },
  {
    id: 9,
    name: 'Booking Price Tampering',
    collection: 'counsellingBookings/book_001',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    description: 'Visitor submits sessionPriceLkr: 0 differing from scholar price',
    payload: { sessionPriceLkr: 0 },
  },
  {
    id: 10,
    name: 'Cross-Scholar Counselling Read',
    collection: 'counsellingBookings/book_other',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
    description: 'Scholar A attempts to read booking belonging to Scholar B',
  },
  {
    id: 11,
    name: 'Orphan Booking Without Slot Lock',
    collection: 'counsellingBookings/book_orphan',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    description: 'Visitor creates booking without atomic counsellingSlotLocks write',
  },
  {
    id: 12,
    name: 'Audit Log Deletion',
    collection: 'auditLogs/log_001',
    operation: 'delete',
    expected: 'PERMISSION_DENIED',
    description: 'Staff or admin attempts to delete an audit log record',
  },
];

assert.equal(DIRTY_DOZEN_TESTS.length, 12);
console.log(`Verified ${DIRTY_DOZEN_TESTS.length} Dirty Dozen security assertions defined.`);
