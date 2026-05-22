import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

type DatabaseGlobals = {
  __drizzleClient?: Sql;
  __drizzleDb?: ReturnType<typeof createDatabase>;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL. Set the Supabase pooled Postgres connection string for Drizzle.",
    );
  }

  return databaseUrl;
}

function createClient() {
  return postgres(getDatabaseUrl(), {
    prepare: false,
  });
}

function createDatabase(client: Sql) {
  return drizzle(client, { schema });
}

const globalForDatabase = globalThis as typeof globalThis & DatabaseGlobals;

export const sqlClient = globalForDatabase.__drizzleClient ?? createClient();
export const db = globalForDatabase.__drizzleDb ?? createDatabase(sqlClient);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__drizzleClient = sqlClient;
  globalForDatabase.__drizzleDb = db;
}

export type Database = typeof db;
