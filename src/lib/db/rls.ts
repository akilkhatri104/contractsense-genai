import { sql } from "drizzle-orm";

import { db } from "./client";

type TokenGetter = () => Promise<string | null>;
type JwtClaims = Record<string, unknown> & {
  role?: unknown;
  sub?: unknown;
};
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const ALLOWED_ROLES = new Set(["anon", "authenticated"]);

function decodeJwtClaims(token: string): JwtClaims {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error("Invalid Clerk session token.");
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "=",
  );
  const decodedPayload = Buffer.from(paddedPayload, "base64").toString("utf8");
  const claims = JSON.parse(decodedPayload);

  if (!claims || typeof claims !== "object") {
    throw new Error("Invalid Clerk session token payload.");
  }

  return claims as JwtClaims;
}

function resolvePostgresRole(roleClaim: unknown) {
  return typeof roleClaim === "string" && ALLOWED_ROLES.has(roleClaim)
    ? roleClaim
    : "authenticated";
}

export async function withClerkSupabaseRls<T>(
  getToken: TokenGetter,
  callback: (db: Transaction) => Promise<T>,
) {
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const claims = decodeJwtClaims(token);
  const userId = typeof claims.sub === "string" ? claims.sub : null;

  if (!userId) {
    throw new Error("Clerk token is missing the `sub` claim required for Supabase RLS.");
  }

  const role = resolvePostgresRole(claims.role);
  const serializedClaims = JSON.stringify({
    ...claims,
    role,
    sub: userId,
  });

  return db.transaction(async (transactionDb) => {
    await transactionDb.execute(sql.raw(`set local role ${role}`));
    await transactionDb.execute(
      sql`select set_config('request.jwt.claim.role', ${role}, true)`,
    );
    await transactionDb.execute(
      sql`select set_config('request.jwt.claim.sub', ${userId}, true)`,
    );
    await transactionDb.execute(
      sql`select set_config('request.jwt.claims', ${serializedClaims}, true)`,
    );

    return callback(transactionDb);
  });
}
