// Proxy is the Next.js 16 rename of Middleware — same functionality, new name
// and file convention (`proxy.ts` at the project root, exporting `proxy`).
// See node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
//
// We delegate to the Supabase session-refresh helper so auth tokens stay fresh
// on every request.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon, sitemap, robots (metadata files)
     * - common image extensions
     * Feel free to refine this matcher for your own routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
