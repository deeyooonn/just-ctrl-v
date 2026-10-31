"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children, session }) {
  const demo = process.env.NEXT_PUBLIC_PORTFOLIO_DEMO !== 'false';
  return (
    <SessionProvider
      session={demo ? null : session}
      // Re-check session every 5 minutes and whenever the window regains focus
      refetchInterval={demo ? 0 : 5 * 60}
      refetchOnWindowFocus={!demo}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
