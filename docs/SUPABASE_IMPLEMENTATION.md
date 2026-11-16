# Azwaj — Supabase Implementation Guide

> Companion to docs/PROJECT_PLAN.md and supabase/migrations/20261116000100_initial_schema.sql.
> Status: implementation specification. Payment provider, hold duration and cancellation/refund policy remain open.

## 1. Platform boundary

- Supabase PostgreSQL: authoritative data, constraints, transactions and RLS.
- Supabase Auth: brother and staff authentication.
- Supabase Storage: application originals, private documents and approved public photographs.
- Supabase Edge Functions: privileged workflows, custom OTP for no-account visitors, Resend integration and payment webhooks.
- Resend: transactional email delivery.
- TanStack Start: user interface and authenticated server-side orchestration; Vercel hosts the app.

Use SQL files under supabase/migrations as the sole migration history. Do not run drizzle-kit push against the same Supabase database. Drizzle may be used for typed queries, but must not become a second schema writer.

Sensitive writes are deliberately not granted directly to browser clients. Mutations go through Edge Functions/RPC so validation, ownership checks and state transitions cannot be bypassed.

## 2. Schema map and relationships

### Identity and staff
- auth.users 1:1 staff_profiles; auth.users 1:N staff_roles.
- scholars.staff_user_id optionally maps a scholar to one staff account.
- Roles: super_admin, operations_admin, counselling_manager, finance_admin, scholar. Role assignment is trusted-admin-only.

### Marriage
- brother_applications.owner_user_id references auth.users.
- brother_application_details is 1:1 private application data.
- brother_profiles maps the owner/application; brother_public_profiles contains only approved public fields.
- brother_documents and brother_application_events belong to an application.
- wali_requests.brother_profile_id references a brother profile; events, access links and contact releases belong to a request.
- Unique (brother_profile_id, wali_email_normalized) is unconditional across all request statuses. Declined, accepted, withdrawn and expired requests still block a duplicate from that email to that brother.
- Requests expire seven days after submission. Multiple distinct wali requests may remain pending; accepting one does not close others.

### Scholars and counselling
- Azwaj creates scholars; there is no public scholar application.
- scholar_public_profiles is public-facing; qualifications, verification checks and employment events are staff-managed.
- scholar_services belongs to a scholar; scholar_service_formats constrains online/in-person options.
- scholar_weekly_availability and scholar_availability_exceptions belong to a scholar and may be scoped to a service/format.
- counselling_bookings references a scholar and that scholar's service. Payments, refunds, cancellation requests and events reference bookings/payments.
- There are no foreign keys between counselling records and brother applications/wali requests. Keep counselling data separate and confidential.

## 3. Database rules

### Wali requests
1. Normalize email server-side with trim + lowercase; the generated column is the database-level normalization.
2. Insert request and initial event in one transaction.
3. Translate unique violation into a generic duplicate response. Do not reveal another request's status.
4. Set expires_at to submitted_at plus seven days.
5. A scheduled job conditionally expires pending rows; the brother decision function must independently check expires_at at decision time.
6. Never auto-decline other pending requests when one is accepted.

### Brother applications and publication
- Verify the brother's Supabase Auth email before creating a server-side draft.
- Only staff review actions may approve, reject or publish. Brother writes cannot set status, reviewer or public fields.
- Copy approved allowlisted fields into brother_public_profiles. Never join private application details into public responses.
- A public photo requires explicit consent and a sanitized public copy.

### Booking concurrency
- The migration adds a GiST exclusion constraint on scholar ID and a half-open time range. It blocks overlapping active holds/confirmed bookings; service buffers are included in the blocked range.
- create_booking_hold serializes holds per scholar with a transaction-scoped advisory lock, checks idempotency, expires old holds for that scholar, rechecks scholar/service/audience/format/notice/availability/exceptions, then inserts the hold.
- The exclusion constraint remains the final race-condition guard.
- The hold duration is read from booking_settings. No default is inserted: the proposed 10 minutes is not a confirmed decision. Configure the value before enabling bookings.
- Add a scheduled global expiry job for awaiting_payment rows. The hold RPC also cleans stale holds when another request arrives for that scholar, but this alone is insufficient.
- Availability shown in the browser is advisory. Creating a hold is the authoritative recheck.

### Money and payment
- Store amounts as integer minor units and a 3-letter currency code.
- Snapshot the service fee/currency into the booking; later price edits must not alter existing bookings.
- Never store card numbers, CVV or raw payment credentials.
- Confirm only after a verified provider webhook. Record provider event IDs uniquely and process idempotently.
- A late payment after hold expiry must enter reconciliation; never blindly double-book.
- A refund request is not a completed refund. Record provider outcome and partial refunds separately.

## 4. RLS and authorization

RLS is enabled on all application tables in the migration. Policies are intentionally conservative.

| Data | Anonymous | Brother | Wali | Scholar | Staff |
|---|---|---|---|---|---|
| Published brother directory | Public fields | Public fields | Public fields | Public fields | Read |
| Private application/details | No | Own rows | No | No | Operations/super admin |
| Brother documents | No | Own scoped Storage files | No | No | Operations/super admin |
| Wali request | No | Requests for own profile | OTP Edge Function only | No | Operations/super admin |
| Public scholar/services | Published rows | Published rows | Published rows | Published rows | Read |
| Scholar verification/employment | No | No | No | Own limited records | Counselling manager |
| Bookings | No | No | OTP Edge Function only | Own assigned bookings | Counselling manager |
| Payments/refunds | No | No | OTP Edge Function only | No | Finance/counselling manager |
| OTP/session/outbox secrets | No | No | No | No | Edge Function only |

Implementation rules:
- anon has SELECT only on explicitly public directory data. No anonymous INSERT policy exists for wali requests or bookings.
- Authenticated brother policies are SELECT-only; validated Edge Functions perform mutations.
- Wali and counselling clients use short-lived custom OTP sessions in private_access_sessions. They do not become SQL/RLS identities.
- service_role bypasses RLS. Keep it only in Edge Function secrets/trusted server runtime. Every function using it must independently authenticate, authorize and validate ownership.
- Return allowlisted response DTOs, never raw privileged query results.
- SECURITY DEFINER functions must be small, use a fixed search_path, revoke PUBLIC execution and grant only intended roles.
- Never allow user-controlled SQL fragments, table names or arbitrary filters in privileged queries.

## 5. Storage

| Bucket | Public | Purpose | Access |
|---|---:|---|---|
| brother-original-photos | No | Original brother photos | Owner upload/read; operations read |
| brother-documents | No | Certificates/supporting documents | Owner upload/read; operations read |
| brother-public-photos | Yes | Sanitized approved brother photos | Public read; staff writes |
| scholar-public-photos | Yes | Approved scholar photos | Public read; counselling-manager writes |

Path conventions:
- brother-original-photos/{auth-user-id}/{application-id}/{random-file-id}.ext
- brother-documents/{auth-user-id}/{application-id}/{random-file-id}.ext
- brother-public-photos/{public-profile-id}/{random-file-id}.ext
- scholar-public-photos/{scholar-id}/{random-file-id}.ext

Private upload policies scope the first path segment to the owner's UID. The server must also check that the application belongs to that owner before attaching an object to an application. Use random object names; never trust client filenames as storage paths.

Public photo workflow: verify ownership and staff approval; confirm explicit consent; read private original; validate file signature, MIME, size and dimensions; strip EXIF/GPS metadata; write a new public object; update the public pointer and consent timestamp; on unpublish/withdrawal remove pointer and object as an audited action. The SQL migration does not implement image processing. Use a maintained image library in a trusted Edge Function/server runtime. A malware scanner is not assumed; select one explicitly if required.

Private object access should use short-lived signed URLs after checking owner/staff permission. Store paths, never signed URLs, in PostgreSQL.

## 6. Edge Function contracts

### Brother application

brother-application-create-draft — Auth: verified Supabase Auth JWT. Verify authenticated email matches the submitted verified email. Create application and private details in one transaction. Set owner_user_id from auth.uid(); never accept owner, status or reviewer from input. Return reference and safe draft DTO.

brother-application-save — Auth: brother JWT. Check ownership and editable state (draft/changes_requested). Validate allowlisted section fields and length limits. Do not accept status/reviewer/publication changes. Write significant-change events.

brother-application-submit — Auth: brother JWT. Check ownership, verified email, required sections/documents and consent. Guard transition to submitted, write event and enqueue confirmation email. Make retries idempotent.

brother-application-review — Auth: operations_admin/super_admin. Actions: start_review, request_changes, approve, reject, publish, unpublish. Enforce state transitions, require internal reason for rejection/change requests, publish only allowlisted public fields and consented sanitized photo, write events/audit and enqueue email.

### Public browsing

Read public_brother_directory and public_scholar_directory only. Use bounded pagination and allowlisted filters. Public responses must not contain owner IDs, legal names, email, phone, exact address, original file paths or document metadata. Use public_reference for profile URLs; it is not an authorization secret.

### Wali

create-wali-request — Auth: anonymous; CAPTCHA and rate limits required. Validate allowlisted brother reference, wali details, limited sister details and explicit sister-permission attestation. Verify CAPTCHA server-side through an adapter (provider not selected). Rate-limit by IP hash, normalized-email hash and brother. Resolve currently published profile. Insert request/event transactionally; enforce unique key; return generic duplicate response. Notify brother without sister details. Email/relationship is not verified identity.

wali-otp-send and wali-otp-verify — Auth: anonymous, rate-limited. Purpose-bound to request ID and normalized wali email. Generate random short numeric OTP; store keyed HMAC using server-held secret, not plaintext or ordinary unsalted hash. Expire quickly, limit attempts/resends, invalidate previous challenges. Verify constant-time and consume once. On success create high-entropy access session and store only token hash. Use Secure, HttpOnly, SameSite cookie; never localStorage.

wali-request-status — Auth: valid custom OTP session. Return only that request's safe status. Match session subject and normalized email to the row; do not allow arbitrary request IDs.

brother-wali-request-decision — Auth: brother Supabase Auth JWT. Verify request belongs to profile owned by auth.uid(); check pending and expires_at > now(); conditionally update in a transaction; write event/audit; notify wali. Multiple pending requests remain independent. Acceptance does not disclose contact details.

wali-contact-release — Auth: brother JWT plus explicit confirmation. Require accepted request and ownership. Release only fields selected under the eventual contact policy; record contact_releases and audit. Notify wali; require wali OTP before showing any private release payload if that is the chosen policy. Exact fields and second-party OTP remain open.

wali-request-expire — Scheduled internal job. Batch pending rows with expires_at <= now(), conditionally set expired, write events and queue notification. Safe to retry. Decision endpoint still checks expiry independently.

### Scholar and service administration

scholar-admin-upsert — Auth: counselling_manager/super_admin. Create/update hired scholar, public profile, qualifications and employment state. No public registration. Keep private evidence private; audit verification changes. Deactivation prevents new bookings but does not delete existing appointments.

scholar-service-upsert — Auth: counselling_manager/super_admin. Validate audience, duration, fee, currency, formats, notice and advance window. Save formats separately. Store fee in minor units. Scholars cannot change price or publication state unless delegated later.

scholar-availability-upsert — Auth: counselling_manager/super_admin or linked scholar only if explicitly delegated. Validate weekday/time windows, IANA timezone and effective dates. Changes do not silently cancel existing bookings.

### Availability and booking

get-scholar-availability — Public read for published service. Input scholar, service, format and bounded date range. Expand weekly availability in scholar timezone; apply duration, buffers, notice, advance window, employment/directory state and exceptions; subtract confirmed bookings and unexpired holds. Return UTC instants plus timezone/local labels. Output is advisory.

create-booking-hold — Anonymous client after email OTP verification; service role calls SQL RPC. Verify client email session is bound to normalized email. Input scholar/service/start/format/audience/client details/idempotency key. Never accept duration, price, currency, end time, hold expiry or status from browser. Return booking reference, quoted fee/currency, expiry and next step.

create-payment-session — Auth: valid client booking session. Require awaiting_payment and unexpired hold. Create checkout/order server-side through provider adapter (provider undecided); store pending payment and provider reference. Return only checkout URL/token. Never accept amount from browser.

payment-webhook — Auth: provider signature, not browser JWT. Verify raw body signature and merchant/account identifiers. Insert unique provider event. Lock payment/booking rows. Validate amount, currency and reference. Process once. Confirm only if valid and slot can be honored. Late success after expiry/conflict goes to reconciliation and finance alert, not double booking. Duplicate event returns provider-required success after idempotent handling.

booking-access-otp-send/verify — Same custom OTP pattern as wali, purpose counselling_booking, bound to booking's normalized client email. Booking reference alone is not authorization.

booking-cancel-request — Auth: client OTP session, assigned scholar or authorized admin. Record actor and reason. Until policy is chosen, route to admin review; do not hardcode refund decisions.

refund-process — Auth: finance_admin/super_admin. Check authorization and remaining refundable amount. Create refund request, call provider idempotently, update from verified provider result/webhook. Support partial refunds and audit every action.

expire-booking-holds — Scheduled job. Batch awaiting_payment bookings with expired hold; conditionally mark expired and write events. Never expire paid bookings. Lock rows and define one transition policy for races with payment webhooks.

### Email

email-outbox-dispatch — Scheduled worker. Claim pending/retryable rows safely (e.g. FOR UPDATE SKIP LOCKED). Render allowlisted templates; send via Resend with idempotency where supported; save provider message ID and delivery state; bounded exponential retry; alert after configured limit. Never log OTPs, tokens, sister details, document names or raw provider payloads.

Supabase Auth OTP for brothers/staff should use supported custom SMTP configuration. The custom no-account wali/client OTP functions send via Resend directly.

## 7. Notification templates

| Template | Recipient | Safe content |
|---|---|---|
| brother_application_received | Brother | Reference and secure portal link |
| brother_application_changes_requested | Brother | Safe summary and portal link |
| brother_application_approved/rejected | Brother | Decision and next step |
| brother_profile_published | Brother | Public profile link |
| wali_request_received | Brother | New request notice; no sister details |
| wali_request_decision | Wali | Decision and OTP-protected status link |
| wali_request_expiring/expired | Brother/Wali | Reminder or status |
| wali_otp / booking_otp | Wali/client | OTP and short expiry |
| booking_payment_pending | Client | Checkout continuation and hold expiry |
| booking_confirmed/cancelled | Client and scholar | Appropriate session details |
| payment_receipt/refund_update | Client | Amount, currency, reference and status |
| appointment_reminder | Client and scholar | Necessary reminder details only |

Use plain-text alternatives and verified sending domain with SPF/DKIM/DMARC. Do not email sister details, certificates, private counselling details or meeting links unless explicitly authorized and policy permits.

## 8. Scheduled jobs

1. wali-request-expire — frequent batch job, e.g. every 10–15 minutes.
2. expire-booking-holds — frequent job, e.g. every minute.
3. email-outbox-dispatch — frequent worker, e.g. every minute.
4. Appointment reminders — cadence and lead times open.
5. Payment reconciliation — cadence depends on selected gateway.

Cadence is operational configuration, not a product promise. Every job must be safe to repeat.

## 9. Production security checklist

- [ ] Apply migration to development Supabase first; review SQL and query plans.
- [ ] Verify RLS on every table and no unintended default grants.
- [ ] Test direct REST calls with anon, brother, scholar, operations, counselling-manager and finance JWTs.
- [ ] Confirm anon cannot read private applications, wali records, client records, payments, tokens, OTPs or outbox.
- [ ] Confirm brother cannot read another brother's application or mutate status.
- [ ] Confirm scholar cannot read another scholar's bookings or marriage data.
- [ ] Confirm finance cannot read private marriage-introduction data.
- [ ] Confirm public views expose only published allowlisted fields.
- [ ] Confirm private Storage is owner-scoped and signed URLs expire.
- [ ] Confirm public photo metadata is stripped and consent is required.
- [ ] Rate-limit OTP issue/verify, wali submission and booking holds; add CAPTCHA before public launch.
- [ ] Store only HMACs of OTPs and hashes of high-entropy session tokens; use secure HttpOnly cookies.
- [ ] Verify payment webhooks with the selected gateway's official signature scheme.
- [ ] Test duplicate wali requests and concurrent overlapping slot holds.
- [ ] Test expiry/payment race, duplicate/out-of-order webhook and late payment.
- [ ] Rehearse backups/restores; establish retention, deletion, consent withdrawal and incident response.

## 10. Decisions still open

| Decision | Current treatment |
|---|---|
| Payment gateway | Provider-neutral adapter; no gateway assumed |
| Full payment or deposit | Not decided |
| Hold duration | Required config; no default; 10 minutes was only proposed |
| Cancellation/refund window | Admin review until policy is approved |
| Rescheduling | No automatic self-service policy assumed |
| No-show | Status exists; operational/financial rules open |
| Wali contact release | Field-level records exist; exact fields and second-party OTP open |
| CAPTCHA provider | Adapter required; choose before public launch |
| Sister data fields | Initial fields need minimization and correction/withdrawal review |
| Scholar availability delegation | Admin-first; exact scholar permissions open |
| In-person venue disclosure | Decide when location is shown |
| Online meeting provider | Not assumed |
| Reminders | Timing/opt-out open |
| Legal/privacy obligations | Obtain qualified Sri Lankan advice; this guide is not legal advice |
| Clinical services | None assumed; separate credentials and service decision required |

## 11. Recommended build order

1. Apply and test schema/RLS in Supabase development.
2. Implement staff role bootstrap and brother Auth OTP/draft/application slice.
3. Implement review, approval and sanitized public profile publication.
4. Implement wali submission, unique constraint, brother decision and custom wali OTP.
5. Implement scholar administration and directory.
6. Implement availability and transactional hold RPC; run concurrent integration tests.
7. Implement client OTP, booking portal and provider-neutral payment interface.
8. Select gateway; implement verified webhook/refund adapter.
9. Add cancellation policy, reminders, operations tooling and launch review.

Do not start with the calendar UI. First prove that concurrent holds cannot overlap and that private records are inaccessible outside their intended role.