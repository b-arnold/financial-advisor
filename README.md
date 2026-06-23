This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase

This project is wired up to [Supabase](https://supabase.com) for auth and data.

### Local development

The local stack runs entirely in Docker via the Supabase CLI (installed as a dev
dependency), so you don't need a cloud project to develop. You'll need
[Docker](https://docs.docker.com/get-docker/) running.

1. Copy the env template — its defaults already point at the local stack:

   ```bash
   cp .env.example .env.local
   ```

2. Start the stack (first run pulls the container images, so it takes a minute):

   ```bash
   pnpm db:start
   ```

   This applies everything in `supabase/migrations/` and loads `supabase/seed.sql`,
   so the database opens with the same demo data the app ships with. Studio is at
   http://127.0.0.1:54323. Run `pnpm db:status` to print the API URL and keys (the
   defaults in `.env.example` match a stock CLI, but confirm if yours differ).

   | Command          | What it does                                            |
   | ---------------- | ------------------------------------------------------- |
   | `pnpm db:start`  | Start the local Supabase stack                          |
   | `pnpm db:stop`   | Stop it (data is preserved between runs)                |
   | `pnpm db:reset`  | Drop, re-run every migration, and re-seed from scratch  |
   | `pnpm db:status` | Print the local URL, anon key, and service-role key     |
   | `pnpm db:types`  | Regenerate `lib/supabase/database.types.ts` from schema |

3. Changing the schema: add a migration with
   `pnpm exec supabase migration new <name>`, write your SQL, then
   `pnpm db:reset` to apply it and reload the seed. Regenerate types with
   `pnpm db:types` afterward.

> **Note:** the schema and seed mirror the in-memory domain model in
> `lib/types.ts` / `lib/seed.ts`, but the app currently still reads from that
> in-memory store — wiring the screens to read/write Supabase is the next step.
> RLS is enabled on every table; because there's no login yet (auth gating is
> stubbed in `lib/supabase/proxy.ts`), the policies grant the `authenticated`
> role full access and nothing is exposed to `anon`.

### Hosted project

To point at a cloud project instead, swap the values in `.env.local` for your
project's, from **Project Settings → API** in the Supabase dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Push your local migrations to it with `pnpm exec supabase db push`.

### Using the clients

Use the right client for the right place:

- **Client Components** — `import { createClient } from "@/lib/supabase/client"`
- **Server Components / Route Handlers / Server Functions** —
  `import { createClient } from "@/lib/supabase/server"` (this one is `async`)

`proxy.ts` (the Next.js 16 rename of Middleware) refreshes the auth session on
every request via `lib/supabase/proxy.ts`. Route-gating is stubbed out there with
a commented example, ready to enable when you add auth.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
