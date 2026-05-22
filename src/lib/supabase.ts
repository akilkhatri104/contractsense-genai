import { createClient } from "@supabase/supabase-js";

type TokenGetter = () => Promise<string | null>;

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}

export function createClerkSupabaseClient(getToken: TokenGetter) {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createClient(supabaseUrl, supabasePublishableKey, {
    accessToken: getToken,
  });
}
