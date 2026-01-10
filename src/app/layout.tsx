import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ToasterWrapper } from "@/components/ui/toaster-wrapper";
import AiChatWidget from "@/components/ai/AiChatWidget";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import DynastyBackground from "@/components/voice/DynastyBackground";
// import OnboardingCheck from "@/components/profile/OnboardingCheck";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mobile viewport configuration (Next.js 15+ requires separate export)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For iPhone notch support
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#030014" },
    { media: "(prefers-color-scheme: dark)", color: "#030014" },
  ],
};

export const metadata: Metadata = {
  title: "Dynasty Built Academy - Build Your Future | Online Learning Platform",
  description:
    "Empowering individuals through education, books, and community. Join our award-winning platform for personal development, courses, and social learning.",
  keywords:
    "online learning, education platform, books, courses, personal development, community learning",
  authors: [{ name: "Dynasty Built Academy" }],
  // Apple mobile web app configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dynasty Academy",
  },
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
        <ToasterWrapper />
        <Providers>
          {/* 🌌 Dynasty Neural Network Background - Cool 3D holographic effect */}
          <DynastyBackground />
          {/* Main content with bottom padding for mobile nav */}
          <div className="mobile-bottom-spacing md:pb-0">{children}</div>
          {/* 📱 Mobile Bottom Navigation */}
          <MobileBottomNav />
          {/* 🤖 Dynasty AI Coach - Available on all pages */}
          <AiChatWidget />
        </Providers>
      </body>
    </html>
  );
}
