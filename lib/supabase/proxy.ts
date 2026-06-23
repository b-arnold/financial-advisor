// Session-refresh helper invoked from the root `proxy.ts` (Proxy is what
// Next.js 16 calls the former Middleware — see
// node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
//
// Running this on every request keeps the user's Supabase auth tokens fresh by
// re-issuing the auth cookies on the outgoing response. Server Components can
// read cookies but not write them, so this is the one place the refreshed
// session actually gets persisted.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the session so expired access tokens are refreshed. Do not run code
  // between client creation and this call, or you risk hard-to-debug logouts.
  await supabase.auth.getUser();

  // Auth gating lives here once you add it. For now the app is open; to protect
  // routes, redirect unauthenticated requests, e.g.:
  //
  //   const { data: { user } } = await supabase.auth.getUser();
  //   if (!user && !request.nextUrl.pathname.startsWith("/login")) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/login";
  //     return NextResponse.redirect(url);
  //   }
  //
  // IMPORTANT: always return the `response` object as-is so the refreshed auth
  // cookies survive. If you build a new response, copy over its cookies first.
  return response;
}
