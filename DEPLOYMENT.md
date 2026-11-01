# Original application deployment

The root URL serves the original Next.js application. The old /demo URL redirects to /. The portfolio proxy that redirected account/auth pages and blocked APIs has been removed.

Use npm ci and npm run build. Vercel uses the existing private database, authentication, Gemini and optional billing settings. NEXTAUTH_URL and NEXT_PUBLIC_BASE_URL point to https://just-ctrl-v.vercel.app. NEXT_PUBLIC_PORTFOLIO_DEMO is no longer used.

Verify root rendering, /api/auth/session, sign-in/account screens, and invalid-input API responses. Successful AI processing, saved data and billing require working external services; route availability alone does not prove those integrations. Google OAuth must allow the production callback URL.
