import Hero3D from "@/components/home/Hero3D";
import FeaturesShowcase from "@/components/home/FeaturesShowcase";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import Footer from "@/components/home/Footer";
import ScrollProgress from "@/components/effects/ScrollProgress";
import MouseGlow from "@/components/effects/MouseGlow";
import LiveActivityFeed from "@/components/effects/LiveActivityFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0E27] overflow-hidden">
      {/* Scroll Progress Indicator - Top Bar + Circular */}
      <ScrollProgress />

      {/* Mouse Glow Effect */}
      <MouseGlow />

      {/* Live Activity Feed - Bottom Left */}
      <LiveActivityFeed />

      {/* INSANE 3D Hero Section with Floating Book */}
      <Hero3D />

      {/* Premium Features Showcase with Animated Cards */}
      <FeaturesShowcase />

      {/* Animated Stats with Counting Numbers */}
      <StatsSection />

      {/* Testimonials with 3D Cards & Sparkles */}
      <TestimonialsSection />

      {/* Pricing Plans with Glow Effects */}
      <PricingSection />

      {/* Footer with Wave Divider */}
      <Footer />
    </div>
  );
}
