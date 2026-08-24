import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Just CTRL + V",
  description: "Paste a screenshot. Get flashcards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 antialiased selection:bg-accent/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
