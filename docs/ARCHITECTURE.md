# Azwaj — System Architecture, Data Model, Security Model & Roadmap

## 1. System Architecture

Azwaj uses a **Zero-Trust Serverless Firebase Architecture** paired with a modular **React + TypeScript + Vite** frontend:

- **Frontend (Vite + React 19 + TypeScript)**:
  - `react-router-dom` for public, authenticated brother, scholar, and administrative routes.
  - `shadcn/ui` primitives (Radix UI + Tailwind CSS v4 + class-variance-authority) with heritage Islamic design tokens (`#FAF9F6` warm limestone canvas, `#14533C` deep emerald accent, `Cormorant Garamond` + `Plus Jakarta Sans` + `IBM Plex Mono`).
  - `react-hook-form` + `zod` for client-side schema validation synchronized with `firebase-blueprint.json` and `firestore.rules`.
  - Centralized Firebase SDK initialization (`src/lib/firebase.ts`), App Check integration, connection validation (`getDocFromServer`), and structured `handleFirestoreError` diagnostics.
- **Backend (Firebase)**:
  - **Firebase Authentication**: Passwordless Email-Link Sign-In (`sendSignInLinkToEmail` / `signInWithEmailLink`) + Google Sign-In (`signInWithPopup`) with strict email verification checks (`email_verified == true`).
  - **Cloud Firestore**: Normalized, PII-isolated collections (`brotherProfiles` public-safe vs `brotherPrivateDetails` private PII; `counsellingSlotLocks` public-safe slot reservations vs `counsellingBookings` confidential counselling data).
  - **Firebase Storage**: Modest profile photos stored under `brothers/{uid}/profile/*` and `scholars/{scholarId}/profile/*` with strict MIME type and 5MB size rules.
  - **Firebase Cloud Functions v2 (`/functions`)**: Trusted server-side Admin SDK workflows for marriage request creation & duplicate enforcement, 7-day scheduled request expiry, request acceptance/decline & contact sharing, atomic counselling booking transactions, privileged role/staff permission management, and configurable transactional email delivery (Resend/SMTP).

## 2. Folder Structure

```text
/
├── docs/ARCHITECTURE.md              # Architecture, schema, security & roadmap
├── security_spec.md                  # Phase 0 security invariants & Dirty Dozen payloads
├── firebase-blueprint.json           # Formal JSON Schema IR for Firestore
├── firebase.json                     # Hosting, Firestore, Storage, Functions, Emulators
├── firestore.rules                   # Hardened Eight Pillars Firestore Security Rules
├── firestore.indexes.json            # Composite indexes for directory & dashboards
├── storage.rules                     # Hardened Firebase Storage rules
├── firebase-applet-config.json       # Provisioned Firebase project config (azwaj-lk)
├── functions/                        # Firebase Cloud Functions (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                  # Callable & scheduled Cloud Functions
│       ├── email/templates.ts        # Transactional email templates & provider adapter
│       └── types.ts                  # Shared backend types
└── src/
    ├── config/countries.ts           # Sri Lanka (LK) default + multi-country registry
    ├── lib/
    │   ├── firebase.ts               # App, Auth, Firestore, Storage, Functions, App Check
    │   ├── firestoreError.ts         # OperationType & structured handleFirestoreError
    │   └── utils.ts                  # Classnames, date/age helpers, slot generators
    ├── types/domain.ts               # Strict TypeScript domain interfaces
    ├── schemas/validation.ts         # Shared Zod validation schemas
    ├── contexts/AuthContext.tsx      # Firebase Auth state, role resolution, email-link flow
    ├── services/                     # Data access layer (no raw Firestore queries in UI)
    │   ├── brotherService.ts
    │   ├── marriageService.ts
    │   ├── scholarService.ts
    │   ├── bookingService.ts
    │   └── adminService.ts
    ├── components/
    │   ├── ui/                       # shadcn/ui components
    │   ├── layout/                   # Header (3-zone contract), Footer, DashboardShell
    │   ├── auth/ProtectedRoute.tsx   # Role-based route guards
    │   └── ErrorBoundary.tsx         # Resilient error boundary
    └── pages/
        ├── public/                   # Home, About, HowItWorks, MarriageDirectory,
        │                             # BrotherDetail, Scholars, ScholarDetail,
        │                             # Counselling, Contact, Privacy, Terms
        ├── auth/                     # SignIn, AuthComplete, AuthAction
        ├── brother/                  # Dashboard, Profile, Requests, Settings
        ├── scholar/                  # Dashboard, Availability, Bookings, Profile
        └── admin/                    # Overview, Brothers, Requests, Scholars,
                                      # Bookings, Users, Settings, AuditLogs
```

## 3. Firestore Data Model Summary

- `users/{uid}` — Role (`brother`, `scholar`, `staff`, `admin`), account status, country code.
- `admins/{uid}` — Trusted admin registry for zero-trust `isAdmin()` checks.
- `staffPermissions/{uid}` — Granular staff responsibility flags.
- `brotherProfiles/{brotherId}` — Public-safe approved brother directory fields (no email/phone/DOB).
- `brotherPrivateDetails/{brotherId}` — Isolated brother PII (`fullName`, `email`, `phone`, `dateOfBirth`, `adminReviewNote`).
- `marriageRequests/{requestId}` — Private wali-mediated introduction requests (`status`, `responseDeadlineAt`, sister info, wali info).
- `marriageRequestLocks/{lockId}` — Deterministic duplicate-prevention lock (`brotherId + normalizedWaliEmailHash`).
- `scholars/{scholarId}` — Public directory of Azwaj-appointed Alims and Alimahs.
- `scholarAvailability/{scholarId}` — Timezone-aware working hours, breaks, and unavailable dates.
- `counsellingSlotLocks/{slotLockId}` — Zero-PII slot lock (`scholarId__slotStartIso`) preventing double booking.
- `counsellingBookings/{bookingId}` — Strictly isolated confidential counselling bookings (`paymentStatus: 'payment_not_enabled'`).
- `contactInquiries/{inquiryId}` — Public contact submissions.
- `notifications/{notificationId}` — Email dispatch log/queue.
- `auditLogs/{logId}` — Immutable administrative audit trail.
- `platformSettings/{settingId}` — Country defaults (`LK`, `LKR`, `Asia/Colombo`, `7`-day expiry).

## 4. Security Model

1. **Default Deny**: `match /{document=**} { allow read, write: if false; }` at root.
2. **PII Isolation**: Public queries on `brotherProfiles` require `status == 'approved' && isPublished == true` and never contain email/phone/DOB. `marriageRequests` and `counsellingBookings` are completely unreadable by public visitors or unrelated users.
3. **Role Protection**: Users cannot self-assign `admin`, `staff`, or `scholar` roles on `users/{uid}`. `admins/{uid}` and `staffPermissions/{uid}` are writable only by existing admins or Admin SDK.
4. **Transaction & Lock Integrity**: Deterministic `marriageRequestLocks` prevents duplicate `brotherId + normalizedWaliEmail` active requests; `counsellingSlotLocks` paired with `existsAfter()` prevents concurrent double-bookings; `sessionPriceLkr` is verified against the scholar document in rules and Cloud Functions.
5. **Immutable Audit & Timestamps**: `createdAt == request.time`, `updatedAt == request.time`, and `auditLogs` forbid update/delete.

## 5. Implementation Roadmap

- **Phase 1 — Foundation**: Vite/React/TS, Tailwind v4 tokens, shadcn/ui primitives, Firebase provisioning (`azwaj-lk`), routing, and public website.
- **Phase 2 — Authentication**: Passwordless email-link sign-in + Google Auth, verified email enforcement, user bootstrap, and role-based route guards.
- **Phase 3 — Marriage Introductions**: Brother registration & consent, admin review workflow, public directory with filters, wali request form with deterministic duplicate prevention, brother 7-day response workflow, and scheduled expiry.
- **Phase 4 — Counselling**: Scholar directory & profiles (Alims & Alimahs), scholar availability management, Cal.com-style booking calendar with timezone & conflict prevention, and clear `payment_not_enabled` status.
- **Phase 5 — Administration**: Operational overview, brother moderation, marriage request oversight, scholar CRUD, booking management, staff RBAC permissions, and immutable audit logs.
- **Phase 6 — Security & Production**: Hardened `firestore.rules`, `storage.rules`, ESLint security rule verification, `firestore.rules.test.ts` dirty-dozen suite, App Check, Cloud Functions (`functions/`), and complete `README.md`.
