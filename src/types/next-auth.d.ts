// TypeScript declaration file for NextAuth
// Extends NextAuth types with custom user properties

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      bio?: string | null;
      username?: string | null;
      createdAt?: Date;
      isPremium?: boolean;
      premiumUntil?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    bio?: string | null;
    username?: string | null;
    createdAt?: Date;
    isPremium?: boolean;
    premiumUntil?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
