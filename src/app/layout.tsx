import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
// import OnboardingCheck from "@/components/profile/OnboardingCheck";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dynasty Built Academy - Build Your Future | Online Learning Platform",
  description:
    "Empowering individuals through education, books, and community. Join our award-winning platform for personal development, courses, and social learning.",
  keywords:
    "online learning, education platform, books, courses, personal development, community learning",
  authors: [{ name: "Dynasty Built Academy" }],
  openGraph: {
    title: "Dynasty Built Academy - Build Your Future",
    description:
      "Empowering individuals through education, books, and community",
    type: "website",
    locale: "en_US",
    siteName: "Dynasty Built Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dynasty Built Academy - Build Your Future",
    description:
      "Empowering individuals through education, books, and community",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
