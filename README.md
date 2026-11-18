# Azwaj

Azwaj is a React/Vite marriage introduction and counselling platform using Supabase, Vercel serverless API routes, and Resend.

## Local development

1. Create a Supabase project.
2. Apply migrations with `supabase db push` or the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and configure Supabase keys.
4. Run `npm install && npm run dev`.

Supabase Auth must enable Email/Password and, optionally, Google OAuth. Configure the site URL and redirect URLs for the Vercel domain and local development URL.

## Deployment

Set all server-only variables in Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `CRON_SECRET`
- `ADMIN_ALERT_EMAIL`

Set browser variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Deploy the frontend and `/api` routes with Vercel. The migration in `supabase/migrations/` creates the schema, RLS policies, storage buckets, and atomic RPC functions. Configure the Vercel Cron Authorization bearer value using `CRON_SECRET`.
