# Architecture

Azwaj is a React and TypeScript Vite application backed by Supabase PostgreSQL/Auth/Storage and Vercel serverless routes. Privileged operations run only through authenticated server routes. PostgreSQL RPC functions provide atomic marriage-request and counselling-booking operations. RLS protects direct database access.

Database migrations are in `supabase/migrations/`. Email delivery is implemented server-side with Resend. Scheduled request expiration is served from `/api/cron/expire-marriage` and authorized by `CRON_SECRET`.
