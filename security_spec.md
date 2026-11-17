# Azwaj — Phase 0 Security Specification

## 1. Core Data Invariants

1. **Role Integrity**: No authenticated user may register or update their `users/{uid}` document to `role: 'admin'`, `'staff'`, or `'scholar'`. Self-registration only permits `role: 'brother'`.
2. **PII Isolation**:
   - `brotherProfiles` contains zero email addresses, phone numbers, exact dates of birth, or administrative review notes.
   - `brotherPrivateDetails` is readable/writable only by the owning brother (`brotherId == request.auth.uid`) or verified admin/staff.
   - `marriageRequests` (containing wali and sister information) is never publicly readable; only the target brother (`brotherId == request.auth.uid`) or verified admin/staff may read it.
   - `counsellingBookings` is completely isolated from marriage records and readable only by the assigned scholar (`scholarUid == request.auth.uid`) or verified admin/staff.
3. **Publication Gate**: Public visitors may only `get` or `list` `brotherProfiles` where `status == 'approved' && isPublished == true`, and `scholars` where `isActive == true`.
4. **Duplicate Request Prevention**: A wali cannot create an active (`pending` or `accepted`) marriage request for the same `(brotherId, normalizedWaliEmail)` pair, enforced via deterministic `marriageRequestLocks/{lockId}` document creation/transition.
5. **Booking Integrity**: A counselling booking must reference an existing active scholar, match the scholar's canonical `sessionPriceLkr` and `sessionDurationMinutes`, force `paymentStatus == 'payment_not_enabled'`, and atomically create a `counsellingSlotLocks/{slotLockId}` via `existsAfter()`.
6. **Temporal & Terminal Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time`. Terminal statuses (`expired`, `declined`, `cancelled_*`, `completed`) cannot be reverted by non-admin users.
7. **Immutable Audit Trail**: `auditLogs` can only be created by verified admins/authorized staff and can never be updated or deleted from client SDKs.

## 2. The "Dirty Dozen" Attack Payloads

1. **Self-Privilege Escalation (`users`)**: User creates `users/{uid}` with `{ role: 'admin', emailVerified: true }`. -> **DENIED**.
2. **Role Mutation (`users`)**: Brother updates own `users/{uid}` to `{ role: 'staff' }`. -> **DENIED**.
3. **Self-Approval (`brotherProfiles`)**: Brother creates or updates `brotherProfiles/{uid}` with `{ status: 'approved', isPublished: true }`. -> **DENIED**.
4. **Ghost Field Injection (`brotherProfiles`)**: Brother injects `{ isIdentityVerified: true }` on profile update. -> **DENIED**.
5. **Unapproved Profile Scraping (`brotherProfiles`)**: Public user queries `brotherProfiles` without `where('status', '==', 'approved')` and `where('isPublished', '==', true)`. -> **DENIED**.
6. **PII Leak (`brotherPrivateDetails`)**: Another signed-in brother attempts `get` on `brotherPrivateDetails/{otherUid}`. -> **DENIED**.
7. **Sister/Wali Data Leak (`marriageRequests`)**: Unauthenticated user or another brother attempts `get` or `list` on `marriageRequests`. -> **DENIED**.
8. **Fake Request Status (`marriageRequests`)**: Public wali submits a `marriageRequests` document with `{ status: 'accepted' }`. -> **DENIED**.
9. **Price Tampering (`counsellingBookings`)**: Visitor submits a booking with `{ sessionPriceLkr: 0 }` instead of scholar's canonical price. -> **DENIED**.
10. **Counselling Privacy Breach (`counsellingBookings`)**: Scholar A attempts `get` or `list` on bookings where `scholarUid == Scholar B`. -> **DENIED**.
11. **Double-Booking Race (`counsellingBookings`)**: Visitor creates `counsellingBookings/{id}` without atomically locking `counsellingSlotLocks/{slotLockId}`. -> **DENIED**.
12. **Audit Log Tampering (`auditLogs`)**: Staff member attempts to `update` or `delete` an entry in `auditLogs`. -> **DENIED**.
