import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authLimiter } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ─── OAuth fast sign-in ─────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // ─── Email + Password credentials ───────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        
        // Fetch fresh user data from DB so plan updates and profile changes are instant
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { planTier: true, createdAt: true, name: true, image: true, autoSaveEnabled: true },
        });

        if (dbUser) {
          session.user.planTier = dbUser.planTier;
          session.user.createdAt = dbUser.createdAt;
          session.user.autoSaveEnabled = dbUser.autoSaveEnabled;
          if (dbUser.name) session.user.name = dbUser.name;
          if (dbUser.image) session.user.image = dbUser.image;
        }
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
};

const handler = NextAuth(authOptions);

async function rateLimitedHandler(req, res) {
  if (authLimiter) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      const { success, limit, reset, remaining } = await authLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many authentication attempts. Please try again later." },
          { 
            status: 429, 
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString()
            }
          }
        );
      }
    } catch (error) {
      console.error("Auth Limiter Error:", error);
    }
  }
  return handler(req, res);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
