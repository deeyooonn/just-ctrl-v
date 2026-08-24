"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children, session }) {
  return (
    <SessionProvider
      session={session}
      // Re-check session every 5 minutes and whenever the window regains focus
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
