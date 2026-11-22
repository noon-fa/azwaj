# Azwaj

Azwaj is a privacy-first Muslim marriage introduction platform. This repository
is being rebuilt as an Expo and React Native application, with iOS and Android
as the primary targets and Expo web support where practical.

## Phase 1 status

The current foundation includes:

- Expo Router with a shared design system and member navigation.
- Supabase email/password registration, email verification, sign-in, password
  reset, and sign-out.
- SecureStore-backed native session persistence and browser storage on web.
- Role selection, minimum-age validation, private onboarding details, and
  separate data-processing and profile-visibility consent.
- A private `profiles` table and server-assigned `member` role protected by
  Row Level Security.
- Account deletion requests that are recorded privately for trusted
  administrator processing; requests do not immediately delete an account.

Marriage-profile submission/review, discovery, wali authorization, introduction
workflows, services, payments, notifications, and automated account-deletion
processing are not yet implemented. The former Vite application and its
migrations were removed as part of the in-progress Expo conversion; the
migration in this repository is the initial Phase 1 schema, not a replacement
for the later feature schemas.

## Prerequisites

- Node.js supported by the installed Expo SDK.
- pnpm.
- A Supabase project with Email/Password enabled.
- Supabase CLI for applying migrations from the command line.

## Local development

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Configure the public Supabase client values:

   ```sh
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (or the
   project's publishable key) in `.env`. These values are included in the
   client app; **never** put a Supabase service-role key in an `EXPO_PUBLIC_`
   variable or mobile bundle. Database access is restricted by RLS.

3. Link the Supabase project and apply the migration:

   ```sh
   supabase login
   supabase link --project-ref <project-ref>
   supabase db push
   ```

   Alternatively, review and apply
   `supabase/migrations/202611220001_phase1_profiles_and_roles.sql` in the
   Supabase SQL Editor.

4. In Supabase Authentication, enable email/password and add the app's
   development redirect URL and `azwaj://**` to the allowed redirect URLs.
   Keep confirmation and reset email links configured to return to the app; the
   client uses PKCE to exchange the returned authorization code.

5. Start Expo:

   ```sh
   pnpm start
   ```

   Use `pnpm android`, `pnpm ios`, or `pnpm web` to select a target.

## Configuration

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon client key |

Email verification and password reset use deep links. A production iOS/Android
build must retain the `azwaj` app scheme and the matching Supabase redirect URL.
On web, configure the deployed site URL and redirect URL in Supabase.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test
```

Apply migrations to a non-production Supabase project before testing
authentication and onboarding end-to-end. RLS should be tested with separate
ordinary-user accounts before introducing profile discovery or administrative
workflows.

## Security boundaries

- The mobile client uses only the Supabase publishable/anon key.
- `profiles` contains private onboarding information; authenticated users can
  read and write only their own row.
- `user_roles` assignments are created by a database trigger. The client can
  read its own roles but cannot assign or change roles.
- The account's intended introduction role (brother or sister) is separate
  from its trusted authorization role.
- Profile visibility consent does not publish profile data. Discovery requires
  a separately reviewed and authorized database design in a later phase.
- The `profiles` policies allow an authenticated user to select, insert, or
  update only the row whose `id` matches `auth.uid()`. There is no anonymous
  access, and column grants prevent clients from changing the profile ID or
  consent timestamp.
- The `user_roles` policy grants users read access only to their own assigned
  roles. There are no client insert, update, or delete grants; a database
  trigger assigns only the default `member` role at account creation.
- `account_deletion_requests` permits users to read their own requests and
  create a pending request for their own user ID. Clients cannot alter request
  status or processing timestamps; trusted administrator processing is not
  implemented in this phase.
