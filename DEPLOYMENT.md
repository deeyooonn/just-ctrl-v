# Original application deployment

The root URL serves the original Next.js application. The old /demo URL redirects to /. The portfolio proxy that redirected account/auth pages and blocked APIs has been removed.

Use npm ci and npm run build. Vercel uses the existing private database, authentication, Gemini and optional billing settings. NEXT_PUBLIC_PORTFOLIO_DEMO is no longer used.

The existing Google OAuth client authorizes `https://just-ctrl-v-zst2.vercel.app/api/auth/callback/google`. Pre-login validation on 2026-11-03 confirmed that this URL and the original localhost callback reach Google's account page, while the shorter `just-ctrl-v.vercel.app` URL and `just-ctrl-v-qzoc.vercel.app` produce `redirect_uri_mismatch`. All three projects serve the same application commit. The portfolio now uses the existing authorized `zst2` domain; a host-specific temporary redirect preserves links to the shorter domain without redirecting the authorized domain back to itself.

Keep the authorized deployment on its own origin throughout sign-in so its session and state cookies stay together. If setting NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL on that project, use `https://just-ctrl-v-zst2.vercel.app`. Do not copy the shorter project's URL overrides into it. Any future canonical-domain change must first be authorized in Google.

The original Supabase project `yciyxejttclbjzeopfxn` was restored on 2026-11-03, preserving its existing Prisma tables and database connection settings. A nonexistent-account lookup now returns the expected credentials rejection instead of a database failure. This verifies connectivity, not a successful real-account sign-in.

`supabase/migrations/001_protect_prisma_tables.sql` was applied to enable row-level security and revoke browser-role access to the six Prisma tables, including stored accounts and sessions. The application uses its private server-side Prisma connection and does not need browser Supabase access. Metadata checks confirm anonymous and authenticated browser roles cannot select those tables.

Verify root rendering, /api/auth/session, sign-in/account screens, and invalid-input API responses. Successful AI processing, saved data and billing require working external services; route availability alone does not prove those integrations. Google OAuth must allow the production callback URL.
