import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './providers'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dynasty Built Academy - Build Your Future | Online Learning Platform",
  description: "Empowering individuals through education, books, and community. Join our award-winning platform for personal development, courses, and social learning.",
  keywords: "online learning, education platform, books, courses, personal development, community learning",
  authors: [{ name: 'Dynasty Built Academy' }],
  openGraph: {
    title: 'Dynasty Built Academy - Build Your Future',
    description: 'Empowering individuals through education, books, and community',
    type: 'website',
    locale: 'en_US',
    siteName: 'Dynasty Built Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynasty Built Academy - Build Your Future',
    description: 'Empowering individuals through education, books, and community',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
