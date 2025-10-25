import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import crypto from "crypto";
import {
  enhancedJWTCallback,
  enhancedSessionCallback,
  TOKEN_CONFIG,
} from "@/lib/auth/token-manager";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: TOKEN_CONFIG.ACCESS_TOKEN_LIFETIME, // 15 minutes
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, ensure user exists in database and link accounts
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // User exists - check if this OAuth account is already linked
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          // If account not linked, link it to the existing user
          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }

          // Update user info from Google if needed
          if (profile?.picture && !existingUser.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                image: profile.picture as string,
                emailVerified: existingUser.emailVerified || new Date(),
              },
            });
          }
        } else {
          // Create user in database if they don't exist
          await prisma.user.create({
            data: {
              id: user.id || crypto.randomUUID(),
              email: user.email,
              name: user.name || "User",
              image: user.image,
              role: "USER",
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      // Use enhanced JWT callback with automatic token rotation
      const enhancedToken = await enhancedJWTCallback({ token, user, trigger });

      if (user) {
        // For Google OAuth, fetch the user from database to get the actual ID
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            enhancedToken.id = dbUser.id;
            enhancedToken.role = dbUser.role;
          }
        } else {
          enhancedToken.id = user.id;
          enhancedToken.role = user.role;
        }
      }

      // Handle session update
      if (trigger === "update" && session) {
        return { ...enhancedToken, ...session };
      }

      return enhancedToken;
    },
    async session({ session, token }) {
      // Use enhanced session callback with validation
      return await enhancedSessionCallback({ session, token });
    },
  },
  events: {
    async signIn({ user }) {
      // Update last login time
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (error) {
        console.error("Error updating last login:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
