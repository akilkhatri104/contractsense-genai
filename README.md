# ContractSense

This app uses Clerk for authentication, Supabase for Postgres, and Drizzle ORM
for typed SQL access. The auth integration uses Supabase's native third-party
Clerk support, not the older Clerk JWT template flow.

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
- Drizzle is configured through [drizzle.config.ts](drizzle.config.ts) and the
  typed schema in [src/lib/db/schema.ts](src/lib/db/schema.ts).
- The request-scoped helper in [src/lib/db/rls.ts](src/lib/db/rls.ts) decodes
  the active Clerk session token and sets transaction-local Supabase JWT claims
  before running Drizzle queries, so RLS still scopes rows to the signed-in
  Clerk user.
