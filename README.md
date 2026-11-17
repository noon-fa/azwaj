# Azwaj — Wali-Mediated Muslim Marriage & Scholarly Counselling Platform

Azwaj is a dignified, privacy-conscious platform built for Sri Lanka (`LK`) to facilitate wali-mediated Muslim marriage introductions and confidential Islamic marriage counselling with appointed Alims and Alimahs.

## Architecture & Technology Stack

- **Frontend**: Vite, React 19, TypeScript, React Router, Tailwind CSS v4, shadcn/ui (Radix UI), React Hook Form, Zod, Lucide React.
- **Backend**: Firebase Authentication (Passwordless Email-Link & Google Sign-In), Cloud Firestore (named database provisioned in `azwaj-lk`), Firebase Storage, Firebase Cloud Functions v2 (TypeScript), Firebase App Check, and Firebase Hosting.
- **Architecture & Security Docs**:
  - `docs/ARCHITECTURE.md`
  - `security_spec.md`
  - `firebase-blueprint.json`

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project (`azwaj-lk`)

## 1. Installation & Environment Variables

Install frontend dependencies:

```bash
npm install
```

Install Cloud Functions dependencies:

```bash
cd functions
npm install
cd ..
```

Optional frontend environment variables (`.env.local`):

```env
VITE_COUNTRY_CODE="LK"
VITE_RECAPTCHA_SITE_KEY=""
VITE_USE_FIREBASE_EMULATORS="false"
```

Cloud Functions environment variables (`functions/.env`):

```env
APP_URL="https://azwaj-lk.web.app"
EMAIL_FROM="Azwaj <noreply@azwaj.lk>"
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
ADMIN_ALERT_EMAIL="itsmefminsaf@gmail.com"
FIRESTORE_DATABASE_ID="ai-studio-2aed7eba-d628-418b-abf2-b2a242d57a01"
```

## 2. Firebase Authentication Configuration

1. Open **Firebase Console → Project `azwaj-lk` → Authentication → Sign-in method**.
2. **Email/Password**: Enable **Email/Password** AND toggle **Email link (passwordless sign-in)** to ON.
3. **Google**: Already configured during provisioning.
4. **Authorized domains**: Add your local, AI Studio preview, and production Hosting domains under **Authentication → Settings → Authorized domains**.

## 3. Firestore, Indexes & Storage Setup

Deploy security rules and composite indexes:

```bash
firebase use azwaj-lk
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Lint Firestore security rules locally:

```bash
npx eslint firestore.rules
```

## 4. Cloud Functions Deployment

Build and deploy the TypeScript Cloud Functions (`submitMarriageRequest`, `respondToMarriageRequest`, `expirePendingMarriageRequests`, `createCounsellingBooking`, `cancelCounsellingBooking`, `reviewBrotherProfile`, `sendCounsellingReminders`):

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 5. Local Development & Emulator Testing

Start the frontend development server (port 3000):

```bash
npm run dev
```

Or run against the local Firebase Emulator Suite (`firebase.json`):

```bash
firebase emulators:start
```

Set `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local` when testing against emulators.

## 6. Production Build & Hosting Deployment

```bash
npm run build
firebase deploy --only hosting
```

## Security & Privacy Notes

- Public brother directory (`brotherProfiles`) isolates all PII (`brotherPrivateDetails`) and exposes profiles only when `status == 'approved' && isPublished == true`.
- Marriage introduction requests (`marriageRequests`) and duplicate locks (`marriageRequestLocks`) enforce `brotherId + normalizedWaliEmail` uniqueness and 7-day expiry.
- Counselling records (`counsellingBookings`) are completely separate from marriage data; public calendars read only zero-PII `counsellingSlotLocks`.
- Email verification confirms mailbox ownership only and does not represent government identity verification.
- Counselling payment processing is explicitly marked `payment_not_enabled` until a billing provider is integrated.
