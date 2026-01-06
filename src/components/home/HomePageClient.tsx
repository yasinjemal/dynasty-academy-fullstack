"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { HomepageData } from "@/lib/api/homepage-data";

// Dynamic imports for better code splitting
const FuturePortalSimple = dynamic(
  () => import("@/components/intro/FuturePortalSimple"),
  { ssr: false }
);
const HeroBillion = dynamic(() => import("@/components/home/HeroBillion"));
const FeaturedBooksSection = dynamic(
  () => import("@/components/home/FeaturedBooksSection")
);
const FeaturedCoursesSection = dynamic(
  () => import("@/components/home/FeaturedCoursesSection")
);
const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection")
);
const SocialProofSection = dynamic(
  () => import("@/components/home/SocialProofSection")
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection")
);
const PricingSection = dynamic(
  () => import("@/components/home/PricingSection")
);
const FinalCTASection = dynamic(
  () => import("@/components/home/FinalCTASection")
);
const Footer = dynamic(() => import("@/components/home/Footer"));
const ScrollProgress = dynamic(
  () => import("@/components/effects/ScrollProgress"),
  { ssr: false }
);
const MouseGlow = dynamic(() => import("@/components/effects/MouseGlow"), {
  ssr: false,
});

interface HomePageClientProps {
  data: HomepageData;
}

export default function HomePageClient({ data }: HomePageClientProps) {
  const [showIntro, setShowIntro] = useState(true);

  const {
    stats,
    featuredBooks,
    popularBooks,
    featuredCourses,
    topLearners,
    recentActivity,
  } = data;

  return (
    <>
      {/* Epic Intro Animation */}
      {showIntro && (
        <FuturePortalSimple onComplete={() => setShowIntro(false)} />
      )}

      {/* Main Homepage */}
      <main className="min-h-screen bg-[#030014] overflow-hidden">
        {/* Scroll Progress Indicator */}
        <ScrollProgress />

        {/* Mouse Glow Effect */}
        <MouseGlow />

        {/* 🚀 HERO SECTION - Real Data */}
        <HeroBillion stats={stats} featuredBooks={featuredBooks} />

        {/* 📚 FEATURED BOOKS - Real Data */}
        <FeaturedBooksSection
          featuredBooks={featuredBooks}
          popularBooks={popularBooks}
        />

        {/* 🎓 FEATURED COURSES - Real Data */}
        {featuredCourses.length > 0 && (
          <FeaturedCoursesSection courses={featuredCourses} />
        )}

        {/* ⚡ AI FEATURES SHOWCASE */}
        <FeaturesSection />

        {/* 🏆 SOCIAL PROOF & STATS - Real Data */}
        <SocialProofSection
          stats={stats}
          topLearners={topLearners}
          recentActivity={recentActivity}
        />

        {/* 💬 TESTIMONIALS */}
        <TestimonialsSection />

        {/* 💎 PRICING PLANS */}
        <PricingSection />

        {/* 🔥 FINAL CTA */}
        <FinalCTASection />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
