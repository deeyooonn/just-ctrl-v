# Vercel deployment
Import deeyooonn/just-ctrl-v, root directory ".", Next.js, Node 22.x. vercel.json uses npm ci and npm run build. Leave environment variables empty or set NEXT_PUBLIC_PORTFOLIO_DEMO=true.

Demo mode is the default: / redirects to /demo; original account/billing pages redirect to the demo and /api/* returns 403 before any database or paid service call. Notes are parsed locally, and saved decks use browser storage. Existing flashcard/reviewer/export components remain interactive. No live AI generation or authentication is claimed.

Verify: npm ci, npm run build, npm start. Open /, create flashcards, flip cards, switch to reviewer, save and reopen a deck, and try export on phone/desktop. A POST to /api/process-image must return 403 in demo mode.

Only set NEXT_PUBLIC_PORTFOLIO_DEMO=false when intentionally deploying the full product with its original database, auth, AI and billing prerequisites. That mode is outside this portfolio setup and was not integration tested.

After verifying the deployed public URL, set VITE_DEMO_CTRL_V_URL in Portfolio-Website and redeploy it.
