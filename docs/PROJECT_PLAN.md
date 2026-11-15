# Azwaj — Project Plan & Technical Architecture

> **Status:** Product and architecture baseline — 15 November 2026  
> **Purpose:** Living plan for product, design, engineering and operations. Items marked **Open** require a decision before implementation.

## 1. Product overview

Azwaj is a Sri Lankan Muslim marriage-introduction and counselling service. It facilitates respectful, privacy-conscious, wali-mediated marriage introductions and provides access to Islamic scholars for pre-marital and marital guidance.

Azwaj is **not a dating platform**. Its counselling area is **not an open counsellor marketplace**: Azwaj recruits and hires scholars, manages their profiles, services, prices and schedules, and lists them on the website.

### Product areas
1. **Marriage introductions:** public browsing of approved brothers' profiles, brother applications and review, wali-submitted introduction requests, brother-controlled decisions and controlled contact sharing.
2. **Counselling:** directory of Azwaj-hired scholars, service listings, availability and Cal.com-style appointment booking for online or in-person sessions.
3. **Administration:** application review, profile publication, wali request operations, scholar and service management, scheduling, bookings, payments and staff access.

## 2. Product principles

- Wali-mediated introductions, not dating mechanics.
- Consent, dignity and data minimization.
- Private application, contact and counselling information by default.
- Human review for brother profiles; direct recruitment and management of scholars by Azwaj.
- Email verification proves control of an email address, not identity or wali status.
- Authorization must be enforced server-side and in database/storage policies.
- Email-first communication; no SMS OTP in the initial release.
- Sri Lanka first: LKR where applicable and Asia/Colombo scheduling, while avoiding hard-coded assumptions that prevent future expansion.

## 3. Confirmed product decisions

### 3.1 Marriage introductions

- Public visitors can browse published brother profiles without an account.
- Public profile photographs may be displayed only with the brother's explicit consent.
- Never publish legal full name, phone, email, exact home address, identity documents or certificates.
- Brother applications are multi-step. The form may save unfinished, non-sensitive text locally.
- Verify the brother's email early. After verification, create a server-side draft and use Supabase Auth email OTP for the private status portal.
- Brothers do not need password-based accounts.
- A private monitoring link is a locator, not authorization by itself. Require email OTP; use high-entropy, expiring and revocable tokens; store token hashes if persisted.
- Azwaj staff review applications before publication.
- A wali submits a request without a permanent account or login.
- Collect wali name, email, optional phone and relationship to the sister, plus limited sister introduction details such as name, age, district/location, education and an optional note.
- Require the wali to confirm that the sister has permitted the information to be shared for this introduction.
- The brother is notified by email and can accept or decline after email OTP verification.
- The brother has seven days to respond. Expired requests close automatically.
- Multiple requests may be pending for one brother; accepting one does not automatically decline the others.
- Enforce one request per normalized wali email per brother using a database unique constraint. This applies even after decline, acceptance, expiry or withdrawal unless an administrator intervenes.
- Normalize email by trimming and lowercasing. Add rate limits and CAPTCHA because a person can use another email.
- Do not claim that the wali's identity or relationship has been verified.

### 3.2 Counselling service

- Audience: people preparing for marriage (pre-marital) and married people.
- Formats: online and in-person.
- Pricing: per session.
- Booking: instant booking of available time slots, not a request awaiting scholar approval.
- Scholars are **hired and managed by Azwaj**. There is no public scholar application or self-approval workflow.
- Azwaj admins create scholar records, manage qualifications and biographies, assign services, set prices and configure availability.
- Only active Azwaj-managed scholars appear in the public directory.
- Visitors can select a scholar, service, format and specific available time through a Cal.com-style calendar.
- Clients do not need permanent accounts; use email OTP and a private booking portal.
- Scholars and administrators have permanent authenticated staff accounts.
- Resend is the transactional email provider. Supabase is the selected backend platform for database, authentication and storage.
- Counselling data is separate from marriage-introduction data.
- Do not store counselling session notes by default.
- Islamic guidance is distinct from clinical mental-health counselling. Do not imply that an Islamic qualification is a clinical credential.

## 4. Roles and permissions

| Role | Access |
|---|---|
| Public visitor | Published brother profiles, active scholars/services, submit wali request, start booking |
| Brother | Own application/profile via verified email OTP; edit permitted fields, view status, withdraw, respond to requests |
| Wali | No permanent account; own request via secure link and email verification |
| Scholar | Own calendar and assigned bookings; permitted availability management |
| Operations admin | Brother applications, profiles, wali requests and support |
| Counselling manager | Hired scholars, services, prices, availability and counselling bookings |
| Finance admin | Payment records, reconciliation and authorized refunds |
| Super admin | Staff roles and security-sensitive settings |

A scholar must not automatically gain access to marriage-introduction records. Counselling and marriage permissions are separate and least-privilege.

## 5. Main user journeys

### 5.1 Brother application

1. Complete personal information and verify email early.
2. Enter education, occupation, religious background and marriage preferences.
3. Upload original profile photograph and required supporting documents.
4. Review and submit.
5. Server validates and creates an application reference.
6. Brother receives confirmation and private portal link.
7. Brother returns via email OTP to monitor status, respond to change requests or withdraw.
8. Azwaj staff review: approve, request changes or reject.
9. On approval, confirm public fields and photo consent, then publish.

Application sections: personal information; photograph; certificates/documents; education; work/occupation; religious background; marriage preferences; review and submit.

**Draft storage:** localStorage may hold non-sensitive form text only. Never store documents, original photographs, OTPs, session tokens or sensitive personal information there. Consider IndexedDB only if temporary file persistence is essential and device-sharing risks are explained. Use server-side drafts after email verification.

### 5.2 Wali request

1. Wali opens a brother profile and submits an introduction request.
2. Wali enters contact information, relationship and limited sister details, then confirms permission.
3. Server validates, rate-limits, checks CAPTCHA and enforces the duplicate constraint.
4. Request is created and brother receives email.
5. Brother opens private action page and verifies email using OTP.
6. Brother accepts or declines within seven days.
7. If accepted, show a deliberate contact-sharing step.
8. Wali receives an email and uses a private verified route to view only authorized information.

**Open:** exact contact fields released and whether both parties must verify email before release.

### 5.3 Counselling booking

**Scholar-first flow (initial priority):**
1. Browse active scholars.
2. Open scholar profile.
3. Select service.
4. Select online or in-person, where supported.
5. Select a date and available time.
6. Enter client details and email.
7. Verify email using OTP.
8. Create temporary slot hold.
9. Complete payment.
10. Confirm only after verified payment webhook.
11. Send confirmation and notifications.

**Time-first flow (same booking engine; can follow the first release):**
1. Choose service, format and preferred date/time.
2. Show scholars with matching availability.
3. Select a scholar and continue through the same hold/payment process.

### 5.4 Scholar/admin operations

- Admin creates scholar record after recruitment.
- Admin manages biography, photo consent, languages, qualifications, experience and specialisms.
- Admin assigns services, duration, prices, formats and availability.
- Scholar signs into staff portal to view own calendar and assigned bookings.
- Scholar may manage permitted availability/time-off if delegated.
- Pricing, employment status and directory publication remain admin-controlled unless explicitly delegated.
- Deactivation must trigger review of future bookings; it must not erase appointments.

## 6. Technical stack and architecture

### Current repository baseline

The repository currently contains:
- TanStack Start, React, Vite and TypeScript
- Tailwind CSS 4
- Drizzle ORM and Drizzle Kit
- PostgreSQL driver (pg)
- Biome
- Vercel/Nitro configuration

This is a starter scaffold; installed packages do not imply that product workflows are implemented.

### Target platform

- **Web:** TanStack Start, React, TypeScript, Tailwind CSS.
- **Hosting:** Vercel.
- **Backend:** Supabase PostgreSQL, Supabase Auth, Supabase Storage, RLS and Edge Functions/trusted server functions.
- **ORM/migrations:** Drizzle may be retained for schema definitions and migrations, but establish one migration authority. Do not mix uncontrolled Drizzle pushes with Supabase SQL migrations.
- **Email:** Resend for transactional email; configure Supabase Auth SMTP/templates as needed for OTP delivery.
- **Payments:** provider-neutral integration; choose a Sri Lankan gateway after comparing eligibility, fees, settlement, refunds and webhook support.
- **Files:** Supabase Storage only; no Cloudinary.
- **Time:** store instants in UTC using timestamptz; retain IANA timezone, default Asia/Colombo.

### Important Supabase/Drizzle boundary

The current repository uses Drizzle and a direct PostgreSQL driver, while the product decision is Supabase for database, auth and storage. Before feature development, explicitly define this boundary:
- Supabase Auth is the identity/session provider.
- Supabase Storage stores uploaded files.
- Supabase PostgreSQL is the database.
- Drizzle can define schema and generate/apply migrations, but there must be one source of truth for migrations.
- Prefer user-scoped Supabase clients for user-authorized operations.
- Use narrowly scoped trusted server functions/RPC for privileged operations.
- A privileged server-side Drizzle connection may bypass RLS. If used, authorization must be enforced in the server function and transaction; never assume RLS protects a privileged connection.
- Never expose service-role keys or unrestricted database credentials to the browser.

### High-level architecture

    Browser
      |
      v
    TanStack Start (public pages, private portals, staff/admin portals)
      |---- Supabase Auth (email OTP and staff sessions)
      |---- Supabase PostgreSQL (RLS, constraints, transactions)
      |       |---- Marriage introductions
      |       |---- Scholars, services and availability
      |       |---- Counselling bookings and payments
      |       |---- Staff roles and audit events
      |---- Supabase Storage (private files, approved public photos)
      |
      v
    Trusted server functions / Supabase Edge Functions
      |---- Resend (transactional email)
      |---- Payment gateway (checkout and verified webhooks)

### Suggested application structure

    src/
      db/schema/                 # Drizzle schema modules
      lib/supabase/
      lib/auth/
      lib/email/
      lib/payments/
      lib/validation/
      lib/scheduling/
      lib/permissions/
      server/
        marriage/
        wali-requests/
        scholars/
        availability/
        bookings/
        payments/
        admin/
      routes/
        marriage/
        counselling/
        portal/
        staff/
      components/
        forms/
        calendar/
        booking/
        profiles/
    supabase/
      migrations/
      functions/
      templates/
    docs/
      PROJECT_PLAN.md

Adapt to existing TanStack file-router conventions. Keep business rules in server/domain modules, not React components. Validate all input server-side. Public route loaders must select only public columns or views.

## 7. Database architecture

Use UUID primary keys unless there is a reason not to. Add created_at/updated_at where useful. Use timestamptz for instants, date for calendar dates, and explicit currency codes. Store money as integer minor units or a consistent PostgreSQL numeric policy; never use floating point for money.

### 7.1 Staff and roles

**staff_profiles**
- user_id (Supabase Auth user), display_name, status, timestamps.

**staff_roles**
- user_id, role: super_admin, operations_admin, counselling_manager, finance_admin, scholar.
- Unique (user_id, role).

Roles must be assigned by trusted admin operations, never accepted from browser input.

### 7.2 Marriage

**brother_applications**
- id, application_reference, owner_user_id.
- status: draft, submitted, under_review, changes_requested, approved, rejected, published, withdrawn, expired.
- Private personal fields, submission/review timestamps, reviewer and internal review metadata.

**brother_profile_private**
- application/brother reference, legal name, email, phone, private address/location and other non-public details.

**brother_profiles**
- id, application_id, public_reference.
- Approved public fields such as age/age band, district, education/occupation summaries, religious background summary and marriage preferences.
- publication_status, published_at, photo_public_consent_at.
- Never expose legal name, private contact details, exact address or document paths.

**brother_profile_media**
- profile ID, private original path, public sanitized-copy path, media status and consent/metadata-stripping timestamps.
- Keep original private and unchanged; public copy should be visually unchanged except metadata removal.

**brother_documents**
- application ID, document type, private storage path, MIME type, byte size, review status, reviewer and timestamp.
- Private and staff-only.

**wali_requests**
- id, request_reference, brother_profile_id.
- Wali name, normalized email, optional phone, relationship.
- Limited sister introduction details and consent confirmation/timestamp.
- status: pending, accepted, declined, withdrawn, expired, reported.
- submitted_at, expires_at, responded_at, decision and optional response message.
- Store released contact data separately.

**Duplicate rule:** unique constraint on (brother_profile_id, wali_email_normalized). Keep this uniqueness after decline, acceptance, expiry or withdrawal. Any exception requires an explicit audited admin workflow. Add rate limits per IP, brother and normalized email; CAPTCHA is defense in depth.

**wali_request_events**
- request ID, event type, actor type/user ID, safe metadata and timestamp.
- Never log sensitive sister details or secrets.

**wali_request_access_tokens**
- token hash, request ID, purpose, expiry and revocation metadata.
- Require email OTP before showing sensitive details.

**contact_releases**
- request ID, releasing party, fields authorized, timestamp and authorization evidence.
- Acceptance alone must not automatically disclose all contact details.

### 7.3 Azwaj-managed scholars

There is no scholar application table or public self-registration workflow.

**scholars**
- id, optional linked staff_user_id.
- Public display name, biography, photo path/public URL.
- Languages, specialisms, Islamic qualifications summary, institutions and experience.
- Separate fields for clinical/professional credentials, if any.
- employment_status: active, inactive, suspended, ended.
- directory_status: draft, published, hidden.
- created_by, updated_by and timestamps.

**scholar_qualifications**
- scholar_id, qualification, institution, optional completion year.
- Internal verification status/metadata. Admin-managed, not an application approval workflow.

**scholar_services**
- scholar_id, service name/description.
- Audience: pre_marital, married, individual, couple, family as supported.
- Duration minutes, price in minor units, currency code.
- Supported formats, active/public status, booking notice and optional buffers.

**scholar_availability**
- scholar_id, weekday, local start/end time, IANA timezone, effective date range and optional service/format restrictions.

**availability_exceptions**
- scholar_id, date/time range, type (unavailable block, additional availability, leave or special hours), internal reason.

**scholar_employment_events**
- Optional history of hiring, contract dates, employment status changes and admin notes. Restrict to management roles.

### 7.4 Counselling bookings and payments

**counselling_bookings**
- id, booking_reference, scholar_id, service_id.
- Client name/email and optional phone.
- session_format, scheduled_start/end (UTC), timezone.
- status: awaiting_payment, confirmed, completed, cancelled, no_show, expired.
- Separate payment status.
- Restricted meeting URL or in-person location.
- timestamps.

**booking_reservations**
- scholar/service, start/end, client email, expiry and status.
- Temporary hold while checkout is completed.

**counselling_payments**
- booking_id, provider, provider reference, amount, currency.
- status: pending, paid, failed, refunded, partially_refunded.
- Verified webhook event/reference and paid/refunded timestamps.

**booking_events**
- booking ID, event type, actor, safe metadata and timestamp.

**booking_access_tokens**
- booking ID, token hash, expiry and revocation.
- Require email OTP before private portal access.

### 7.5 Data separation

- Marriage and counselling have separate tables, policies, server modules and staff permissions.
- Do not attach counselling bookings to brother applications or wali requests.
- Do not copy counselling notes into marriage profiles.
- No session notes by default. If later required, define purpose, consent, retention, safeguarding and access first.

## 8. Scheduling and availability engine

Availability must be calculated server-side, never trusted from the browser.

For a selected scholar/service:
1. Read active recurring availability in the scholar's timezone.
2. Expand it into candidate intervals for the requested date range.
3. Apply service duration, buffers and minimum booking notice.
4. Exclude times outside the scholar's active employment/directory period.
5. Subtract confirmed bookings and unexpired holds.
6. Apply leave, blocked periods and special availability exceptions.
7. Return valid future slots only.

### Concurrency and holds

- Create holds in a database transaction or trusted RPC.
- Prevent overlapping confirmed bookings and active holds for the same scholar using PostgreSQL range/exclusion constraints where practical, or transaction-level locking plus conflict checks.
- Re-check availability when creating a hold and when confirming payment.
- A 10-minute hold is a proposed default, not yet confirmed.
- Expired holds must stop blocking availability.
- Use idempotency keys for booking creation and webhook handling.
- If payment arrives after a hold expires, reconcile safely; never double-book.

### Calendar rules

- Default timezone Asia/Colombo; display timezone explicitly.
- Store UTC instants and IANA timezone.
- Handle DST for future international users/scholars.
- Allow admin blocks and additional availability.
- Deactivating a scholar prevents new bookings but existing bookings remain visible and manageable.

## 9. Authentication and authorization

### Authentication
- Supabase Auth email OTP for brothers, scholars and admins.
- Wali and counselling clients do not need permanent accounts.
- Private links are not sufficient authorization: require email OTP before displaying sensitive data.
- No SMS OTP/routine SMS in the initial release.
- Configure Resend/Supabase SMTP and templates so OTP and transactional email are reliable.

### Authorization
- Enable RLS on all tables exposed through Supabase APIs.
- Public access only through restricted views or explicit public columns.
- Brothers access only their own applications and allowed profile fields.
- Wali access limited to the relevant request after verification.
- Scholars access only their own schedule and assigned bookings.
- Counselling managers manage scholars/services/schedules.
- Finance staff access payment records needed for finance tasks.
- Admin roles are checked server-side and in RLS where applicable.
- Service-role credentials are server-only.
- UUIDs and unguessable URLs are not authorization controls.

### Token/session security
- High-entropy, short-lived, purpose-bound and revocable tokens.
- Store token hashes when persisted.
- Rate-limit OTP and sensitive actions.
- Do not put secrets or private details in URLs, analytics or logs.

## 10. File storage and privacy

Supabase Storage only. Suggested buckets:
- application-photos-private — original brother photographs, private before approval.
- verification-documents-private — certificates and supporting documents, admin-only.
- published-profile-photos — sanitized public copies of approved photographs.

Controls:
- Keep originals private and unchanged.
- Create public copy only after explicit photo consent and publication approval.
- Strip EXIF metadata, especially GPS, from public copies.
- Validate extension, MIME type, file signature, size and image dimensions.
- Use short-lived signed URLs for private files.
- Restrict certificates to authorized reviewers.
- Define retention/deletion for rejected, withdrawn and expired applications.
- Store file paths/metadata in PostgreSQL, not binary data.
- Never expose storage credentials in the browser.

## 11. Email and notifications

Use Resend for transactional messages. Configure SPF, DKIM and DMARC for the Azwaj sending domain.

Events:
- Brother application received, review started, changes requested, approved/rejected/published.
- Wali request received, accepted/declined, nearing expiry and expired.
- Counselling booking awaiting payment, confirmed, cancelled or rescheduled.
- Payment receipt/refund.
- Appointment reminders.
- Relevant admin/security alerts.

Requirements:
- Branded templates with plain-text fallback.
- Do not put sensitive sister details, certificates or private contact information in email.
- Link to secure portals and verify email before revealing sensitive data.
- Queue/retry transient failures and record delivery attempts without secrets.
- Make sending idempotent to avoid duplicate notifications.

## 12. Payments and booking lifecycle

Payment provider is **Open**. Select after evaluating Sri Lankan merchant eligibility, methods, fees, settlement currency, refunds and webhook reliability.

- Keep provider behind a provider-neutral payment interface.
- Create pending booking/temporary reservation before checkout.
- Create payment intent/order server-side.
- Verify webhook signatures and event authenticity.
- Confirm booking only after verified successful payment event.
- Handle duplicate/out-of-order webhooks idempotently.
- Reconcile provider transactions with local payment records.
- Support failed, expired, refunded and partially-refunded states.
- Never store card number or CVV.
- Define cancellation, rescheduling, refund and no-show policy before launch.

## 13. Portals and page map

### Public
- Landing page; how Azwaj works; browse brothers; brother profile; wali request form.
- Counselling landing page; scholar directory; scholar detail; booking calendar.
- About, contact, privacy, terms and safeguarding pages.

### Brother portal
- Email OTP; application status; continue draft; edit permitted fields; upload requested documents; review public profile; withdraw; respond to introduction requests.

### Wali access
- Secure request status; email verification; permitted next steps; contact details only after authorized release.

### Counselling client portal
- Email OTP/private booking access; upcoming/past bookings; payment status/receipt; meeting details/location; cancellation/reschedule request under policy.

### Scholar portal
- Dashboard; own calendar; assigned bookings; permitted availability/time-off; profile preview.

### Admin portal
- Applications; published profiles; wali requests; scholars/employment; services/prices; availability; bookings; payments/refunds; staff/roles; audit log/settings.

## 14. Security, privacy and safeguarding

- Prepare privacy notice, terms, consent wording, retention schedule and incident-response process before public launch.
- Obtain explicit consent for public brother profile fields and photographs.
- Confirm sister permission before wali submission; define reporting and withdrawal for unauthorized submissions.
- Minimize sensitive data and staff access.
- Prevent private data leaking through API responses, logs, metadata, analytics or email.
- Encrypt in transit; use managed encryption at rest and secure secret management.
- Audit staff access and sensitive status/contact-release actions.
- Define retention/deletion for rejected/withdrawn applications, documents, inactive accounts and expired requests.
- Establish abuse reporting and safeguarding escalation for coercion, abuse, immediate danger and serious mental-health concerns.
- Explain that Islamic guidance is not a substitute for licensed clinical or emergency care.
- Verify scholar identity, Islamic qualifications and any claimed professional credentials as part of Azwaj's hiring process.
- Obtain qualified Sri Lankan legal/privacy/payment advice before launch; this document is not legal advice.

## 15. Testing strategy

### Unit tests
- Email normalization and duplicate detection.
- Request expiry and state transitions.
- Availability generation, timezone conversion, duration and buffers.
- Payment state transitions and webhook idempotency.
- Role/permission helpers.

### Integration/security tests
- RLS boundary for every role.
- Brother cannot read another brother's application.
- Public user cannot read private contact fields/documents.
- Scholar cannot access another scholar's bookings.
- Wali cannot access another wali's request.
- Database rejects duplicate wali request.
- Concurrent bookings cannot reserve same scholar/time.
- Expired holds stop blocking availability.
- Invalid/replayed payment webhook cannot confirm or duplicate a booking.

### End-to-end tests
- Brother application through publication.
- Wali request through decision and contact release.
- Scholar setup through public directory and booking.
- Scholar-first booking through verified payment.
- Cancellation/refund once policy and gateway are chosen.
- OTP expiry, resend limits and private portal authorization.

### Operations
- Backup and restore rehearsal.
- Email deliverability; storage permissions; error monitoring.
- Payment reconciliation; audit review.
- Accessibility and mobile calendar usability.

## 16. Implementation roadmap

Build vertical slices. Each phase must be testable before moving on.

### Phase 0 — Foundation
- Confirm Supabase/Drizzle migration and data-access boundary.
- Configure environments, secrets, Vercel and Supabase projects.
- Establish migration and RLS conventions.
- Add validation, logging, error handling and test setup.
- Configure Resend and domain authentication.
- Define initial privacy, consent and retention requirements.

**Exit:** deployable foundation, repeatable migrations, no privileged secrets in client bundle.

### Phase 1 — Brother application and review
- Multi-step form and safe local draft behavior.
- Email OTP and server-side drafts.
- Private file uploads and metadata.
- Admin application queue/review.
- Brother status portal.
- Approved public profile and metadata-stripped photo publication.

**Exit:** brother can apply, staff can review, only approved/consented fields are public.

### Phase 2 — Wali requests
- Public request form and sister permission confirmation.
- Server validation, CAPTCHA/rate limits and unique constraint.
- Email notifications.
- Brother OTP action portal and seven-day expiry.
- Accept/decline and audited contact release.
- Wali request status access.

**Exit:** complete lifecycle without wali accounts or cross-request data leakage.

### Phase 3 — Scholar directory and management
- Admin-only scholar creation/management.
- Scholar profiles, qualifications, services, prices and formats.
- Public directory and detail pages.
- Scholar staff accounts and restricted portal.
- Employment/directory status controls.

**Exit:** only active Azwaj-managed scholars are listed; listings are Supabase-driven.

### Phase 4 — Availability and booking
- Recurring availability and exceptions.
- Cal.com-style date/time selection.
- Scholar-first flow.
- Time-first matching if feasible after scholar-first.
- Temporary holds and concurrency protection.
- Client email OTP/private booking page.
- Confirmation/reminder emails.

**Exit:** no double-booking under concurrent requests; slots reflect schedules, exceptions, bookings and holds.

### Phase 5 — Payments and booking lifecycle
- Select and integrate Sri Lankan gateway.
- Webhook verification and idempotency.
- Payment confirmation, receipts and reconciliation.
- Cancellation, rescheduling, refund and no-show workflows.

**Exit:** booking confirmation is webhook-based and finance can reconcile transactions.

### Phase 6 — Launch readiness
- Security/RLS review; privacy and safeguarding review.
- Accessibility/mobile testing.
- Backup/monitoring and operational training.
- Pilot with a small group of brothers, wali users and hired scholars.

**Exit:** workflows are secure, supportable and understood by operations.

## 17. Open decisions register

| Topic | Decision still required |
|---|---|
| Payment gateway | Sri Lankan provider, merchant account, settlement currency |
| Payment amount | Full payment or deposit |
| Slot hold | Proposed 10-minute duration — confirm |
| Cancellation | Cancellation window, refund amount and admin override |
| Rescheduling | Self-service or request-based; cutoff |
| No-show | Client/scholar no-show handling |
| Scholar compensation | Salary, per-session share or contract model (internal) |
| Availability ownership | Scholar-managed blocks or admin-only; proposed delegated scholar control with admin oversight |
| Booking discovery | Scholar-first is initial priority; when to add time-first |
| Contact release | Exact fields and whether wali email verification is required |
| Sister information | Minimum fields and correction/withdrawal procedure |
| Brother profile | Final public/private field list and document requirements |
| Retention | Retention for rejected/withdrawn applications, photos and certificates |
| Safeguarding | Escalation, confidentiality limits and referral process |
| In-person | Venues, privacy and when location is disclosed |
| Online | Meeting provider and when meeting link is revealed |
| Reminders | Timing and opt-out rules |
| Legal review | Applicable Sri Lankan privacy, consumer, employment, safeguarding and payment obligations |

## 18. Initial-release non-goals

- Dating, swiping, in-platform romantic chat or public comments.
- Public scholar self-registration/application.
- Open scholar marketplace or bidding.
- Built-in video conferencing.
- Counselling session notes.
- SMS OTP or routine SMS notifications.
- Subscriptions/memberships.
- Multi-country tax/payment handling.
- AI compatibility scoring or automated marriage recommendations.

## 19. Definition of done

A feature is not complete because its UI exists. It must include:
- Server-side validation and authorization.
- Database constraints and safe state transitions.
- RLS/storage permissions.
- Loading, empty, success and error states.
- Accessible, mobile-friendly UI.
- Required transactional email.
- Audit events for sensitive actions.
- Automated tests for critical business/security rules.
- Operational documentation and failure recovery.

---

**Maintenance:** Update this document when product decisions change. Keep confirmed decisions, proposed defaults and unresolved questions distinct. Illustrative values such as a 10-minute hold are not final until confirmed.
