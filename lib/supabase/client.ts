// Supabase client for use in the browser (Client Components).
//
// Reads the public URL + anon key, which are safe to expose to the browser
// (they are protected by Row Level Security on the database side). Both must be
// prefixed with `NEXT_PUBLIC_` so Next.js inlines them into the client bundle —
// see node_modules/next/dist/docs/01-app/02-guides/environment-variables.md.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
