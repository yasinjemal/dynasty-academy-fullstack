import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
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
    async signIn({ user, account }) {
      // For Google OAuth, ensure user exists in database
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
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
      if (user) {
        // For Google OAuth, fetch the user from database to get the actual ID
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          token.id = user.id;
          token.role = user.role;
        }
      }

      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Fetch username from database
        if (token.id) {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { username: true, bio: true },
          });
          if (user) {
            session.user.username = user.username;
            session.user.bio = user.bio;
          }
        }
      }
      return session;
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
