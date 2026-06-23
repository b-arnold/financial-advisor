// Supabase client for use on the server (Server Components, Route Handlers,
// Server Functions). It bridges Supabase's auth cookies to Next.js's cookie
// store so the user's session is read on every request.
//
// `cookies()` is async in Next.js 16 — see
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` was called from a Server Component, where writing cookies
            // is not allowed. This can be ignored when the session is refreshed
            // in proxy.ts (the renamed middleware) on every request.
          }
        },
      },
    }
  );
}
