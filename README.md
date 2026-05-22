# ContractSense

This app uses Clerk for authentication and Supabase for database access. The
current integration uses Supabase's native third-party Clerk support, not the
older Clerk JWT template flow.

## Local setup

1. Fill in `.env` from `.env.example` with your Clerk keys and Supabase URL and
   publishable key.
2. In the Clerk dashboard, use the Supabase integration flow or manually ensure
   Clerk session tokens include the `role: authenticated` claim.
3. In the Supabase dashboard, add Clerk under `Authentication > Third-Party
   Auth`, using your exact Clerk instance domain.
4. Update [supabase/config.toml](supabase/config.toml) with the same Clerk
   domain for local Supabase CLI usage.
5. Apply the sample RLS-backed table with `supabase db push`.
6. Start the app with `npm run dev` and visit `/tasks` after signing in.

## What was wired

- Clerk stays the source of truth for auth.
- Supabase clients in [src/lib/supabase.ts](src/lib/supabase.ts) attach the
  active Clerk session token through the `accessToken` callback.
- The sample tasks page uses that token server-side and relies on RLS policies
  in [supabase/migrations/20260522090000_create_tasks.sql](supabase/migrations/20260522090000_create_tasks.sql)
  to scope rows to the signed-in Clerk user.
