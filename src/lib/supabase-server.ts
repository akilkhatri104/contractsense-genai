import "server-only";

import { auth } from "@clerk/nextjs/server";

import { createClerkSupabaseClient } from "@/lib/supabase";

export async function createClerkSupabaseServerClient() {
  const { getToken } = await auth();

  return createClerkSupabaseClient(() => getToken());
}
