"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  Info,
  CreditCard,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Feature tooltips for enhanced understanding
const FEATURE_TOOLTIPS: Record<string, string> = {
  "🌌 3D Book Portal (exclusive!)":
    "Experience a cinematic dimensional gateway before entering each book — complete with swirling vortex, floating book physics, and magical star fields.",
  "📖 3D Physics-Based Pages":
    "Real-time page physics that react to your hover and clicks — watch pages curl realistically just like a physical book in your hands.",
  "✨ 3 Ambient Reading Modes":
    "Choose between Cosmic (purple space), Library (warm amber), or Nature (green forest) environments to match your reading mood.",
  "💫 500 Magical Particles":
    "Floating particle effects that create an enchanting atmosphere around your book — toggle on/off anytime.",
  "🤖 AI Avatar Reading Guide":
    "Your personal 3D AI companion that speaks, explains concepts, and guides you through complex material 24/7.",
  "👑 1-on-1 AI Reading Coach":
    "Weekly personalized coaching sessions with advanced AI to optimize your reading strategy and retention.",
  "🥽 VR/AR Support":
    "Read in virtual reality with Vision Pro or Meta Quest — fully immersive 3D library experience.",
};

const PRICING_TIERS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with basic reading",
    tagline: "Entry-level engagement",
    idealUser: "Curious visitors",
    features: [
      {
        text: "3 books per month",
        included: true,
        tooltip: "Access our curated collection to test the platform",
      },
      { text: "Standard 2D reader", included: true },
      { text: "Basic bookmarks", included: true },
      { text: "Community access", included: true },
      { text: "3D immersive reading", included: false },
      { text: "AI Avatar guide", included: false },
      { text: "Ambient modes", included: false },
      { text: "Unlimited books", included: false },
    ],
    cta: "Start Free",
    color: "from-slate-600 to-slate-700",
    popular: false,
  },
  {
    name: "Standard",
    price: 19,
    period: "month",
    description: "For consistent readers building habits",
    tagline: "Habit builders",
    idealUser: "Regular readers",
    features: [
      { text: "50 books per month", included: true },
      { text: "Enhanced reader", included: true },
      { text: "Highlights & notes", included: true },
      {
        text: "Download offline",
        included: true,
        tooltip: "Read anywhere, even without internet",
      },
      { text: "Progress tracking", included: true },
      { text: "3D immersive reading", included: false },
      { text: "AI Avatar guide", included: false },
      { text: "Premium soundscapes", included: false },
    ],
    cta: "Start 7-Day Trial",
    color: "from-blue-600 to-blue-700",
    popular: false,
  },
  {
    name: "Premium",
    price: 99,
    period: "month",
    description: "Power users who demand excellence",
    tagline: "Main revenue driver — Experience jump",
    idealUser: "Power readers",
    features: [
      { text: "Unlimited books", included: true },
      {
        text: "🌌 3D Book Portal (exclusive!)",
        included: true,
        tooltip: FEATURE_TOOLTIPS["🌌 3D Book Portal (exclusive!)"],
      },
      {
        text: "📖 3D Physics-Based Pages",
        included: true,
        tooltip: FEATURE_TOOLTIPS["📖 3D Physics-Based Pages"],
      },
      {
        text: "✨ 3 Ambient Reading Modes",
        included: true,
        tooltip: FEATURE_TOOLTIPS["✨ 3 Ambient Reading Modes"],
      },
      {
        text: "💫 500 Magical Particles",
        included: true,
        tooltip: FEATURE_TOOLTIPS["💫 500 Magical Particles"],
      },
      {
        text: "🤖 AI Avatar Reading Guide",
        included: true,
        tooltip: FEATURE_TOOLTIPS["🤖 AI Avatar Reading Guide"],
      },
      { text: "📊 Advanced Analytics", included: true },
      { text: "🎵 Premium Soundscapes", included: true },
      { text: "👥 Social Reading Rooms", included: true },
      { text: "⚡ Priority Support", included: true },
    ],
    cta: "Start 7-Day Free Trial",
    color: "from-purple-600 via-pink-600 to-orange-600",
    popular: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Elite",
    price: 299,
    period: "month",
    description: "For the readers who don't just read — they lead",
    tagline: "Identity jump — Luxury prestige",
    idealUser: "Leaders, creators, scholars",
    features: [
      { text: "Everything in Premium", included: true },
      {
        text: "👑 1-on-1 AI Reading Coach",
        included: true,
        tooltip: FEATURE_TOOLTIPS["👑 1-on-1 AI Reading Coach"],
      },
      { text: "🎨 Custom 3D Environments", included: true },
      {
        text: "🥽 VR/AR Support",
        included: true,
        tooltip: FEATURE_TOOLTIPS["🥽 VR/AR Support"],
      },
      { text: "🤖 Personalized AI Recommendations", included: true },
      { text: "🎁 Dynasty Merchandise", included: true },
      { text: "🏆 Exclusive Elite Community", included: true },
      { text: "🚀 Beta Access to Features", included: true },
      { text: "💎 White-glove Onboarding", included: true },
    ],
    cta: "Contact Sales",
    color: "from-amber-600 via-yellow-500 to-orange-600",
    popular: false,
    hasAura: true,
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Premium Member",
    avatar: "SJ",
    quote:
      "This is absolutely jaw-dropping! The 3D reading experience is unlike anything I've ever seen. Worth every penny of the $99.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Elite Member",
    avatar: "MC",
    quote:
      "I read 100+ books a year and Dynasty Premium has 3x'd my retention. The AI avatar is like having a personal tutor 24/7.",
    rating: 5,
  },
  {
    name: "Jessica Rodriguez",
    role: "Premium Member",
    avatar: "JR",
    quote:
      "The ambient modes and 3D pages make reading feel magical. I can't go back to regular e-readers now!",
    rating: 5,
  },
];

export default function PremiumPricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    if (planName === "Free") {
      router.push("/register");
    } else if (planName === "Elite") {
      window.location.href =
        "mailto:elite@dynastyacademy.com?subject=Elite Membership Inquiry";
    } else {
      router.push(`/register?plan=${planName.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{
              x:
                typeof window !== "undefined"
                  ? Math.random() * window.innerWidth
                  : Math.random() * 1920,
              y:
                typeof window !== "undefined"
                  ? Math.random() * window.innerHeight
                  : Math.random() * 1080,
            }}
            animate={{
              y: [
                null,
                typeof window !== "undefined"
                  ? Math.random() * window.innerHeight
                  : Math.random() * 1080,
              ],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6 relative"
          >
            <motion.div
              className="absolute inset-0 blur-3xl bg-amber-400/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Crown className="w-20 h-20 text-amber-400 relative z-10" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Reading. Reimagined
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              in 3D
            </span>
          </h1>

          <p className="text-xl text-purple-300 max-w-3xl mx-auto mb-8">
            Experience books like never before with jaw-dropping 3D effects, AI
            guidance, and immersive environments.{" "}
            <span className="text-white font-semibold">
              Trusted by 3,000+ lifelong learners.
            </span>
          </p>

          {/* Annual/Monthly Toggle with Animation */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <motion.button
              onClick={() => setBillingPeriod("monthly")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setBillingPeriod("annual")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingPeriod === "annual"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                  : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save 20%
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
          {PRICING_TIERS.map((tier, index) => {
            const annualPrice =
              billingPeriod === "annual" ? tier.price * 12 * 0.8 : null;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className={`relative ${
                  tier.popular ? "lg:scale-110 lg:z-10" : ""
                }`}
              >
                {tier.badge && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                  >
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </motion.div>
                )}

                {/* Elite Tier Diamond Aura */}
                {tier.hasAura && (
                  <motion.div
                    className="absolute -inset-4 rounded-3xl"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.3), transparent)",
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}

                <motion.div
                  className={`h-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border relative ${
                    tier.popular
                      ? "border-purple-500 shadow-lg shadow-purple-500/20"
                      : tier.hasAura
                      ? "border-amber-500 shadow-lg shadow-amber-500/20"
                      : "border-white/10"
                  } hover:shadow-2xl transition-all`}
                  whileHover={{
                    boxShadow: tier.popular
                      ? "0 20px 50px rgba(168, 85, 247, 0.4)"
                      : tier.hasAura
                      ? "0 20px 50px rgba(251, 191, 36, 0.4)"
                      : "0 20px 50px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* Tier Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-purple-300 text-sm mb-2">
                    {tier.description}
                  </p>
                  <p className="text-xs text-purple-400/60 italic mb-4">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {tier.price === 0 ? (
                      <div className="text-5xl font-bold text-white">Free</div>
                    ) : (
                      <>
                        <motion.div
                          className="flex items-baseline gap-2"
                          key={billingPeriod}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <span className="text-5xl font-bold text-white">
                            $
                            {billingPeriod === "annual" && annualPrice
                              ? Math.round(annualPrice / 12)
                              : tier.price}
                          </span>
                          <span className="text-purple-300">
                            /{tier.period}
                          </span>
                        </motion.div>
                        <AnimatePresence>
                          {billingPeriod === "annual" && annualPrice && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-sm text-green-400 mt-2 overflow-hidden"
                            >
                              ${Math.round(annualPrice)} billed annually
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 relative group"
                        onMouseEnter={() =>
                          feature.tooltip && setHoveredFeature(feature.text)
                        }
                        onMouseLeave={() => setHoveredFeature(null)}
                      >
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`flex items-center gap-2 ${
                            feature.included
                              ? "text-purple-200"
                              : "text-slate-600"
                          }`}
                        >
                          {feature.text}
                          {feature.tooltip && (
                            <Info className="w-4 h-4 text-purple-400/50 group-hover:text-purple-400 transition-colors" />
                          )}
                        </span>

                        {/* Tooltip */}
                        <AnimatePresence>
                          {feature.tooltip &&
                            hoveredFeature === feature.text && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-0 top-full mt-2 z-50 w-72 p-3 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl text-xs text-purple-200 leading-relaxed"
                              >
                                {feature.tooltip}
                                <div className="absolute -top-1 left-6 w-2 h-2 bg-slate-900 border-l border-t border-purple-500/30 rotate-45" />
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    onClick={() => handleSelectPlan(tier.name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                      tier.popular || tier.hasAura
                        ? `bg-gradient-to-r ${tier.color} text-white`
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {(tier.popular || tier.hasAura) && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tier.cta}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Why Premium Is Worth $99/Month
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Unique Technology
                  </h3>
                  <p className="text-purple-200 text-sm">
                    Nobody else has 3D immersive reading. This is years ahead of
                    the competition.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Read 3x Faster
                  </h3>
                  <p className="text-purple-200 text-sm">
                    Our AI and immersive features help you retain more and read
                    faster.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Unlimited Access
                  </h3>
                  <p className="text-purple-200 text-sm">
                    Thousands of books worth $500+/month. Pay once, read
                    everything.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    AI Personal Tutor
                  </h3>
                  <p className="text-purple-200 text-sm">
                    24/7 AI reading coach worth $200+/month on its own. Included
                    free.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-purple-300 mb-4">
                That's just{" "}
                <span className="text-white font-semibold">$3.30 per day</span>{" "}
                — less than a coffee!
              </p>
              <button
                onClick={() => handleSelectPlan("Premium")}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold hover:shadow-2xl hover:scale-105 transition-all"
              >
                Try Premium Free for 7 Days
              </button>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            What Premium Members Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-purple-300 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-purple-200 text-sm italic">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Is Premium really worth $99/month?",
                a: "Absolutely! At $3.30/day, it's less than a coffee. You get unlimited access to technology that doesn't exist anywhere else, plus an AI reading coach worth $200+/month. Try it free for 7 days and see for yourself!",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes! No contracts, no commitments. Cancel in one click from your account settings. We're confident you'll love it though!",
              },
              {
                q: "What makes Dynasty different from Kindle/Apple Books?",
                a: "We're the only platform with true 3D immersive reading. It's like comparing Netflix in 4K to VHS tapes. Plus, our AI avatar provides personal guidance that helps you retain 3x more.",
              },
              {
                q: "Does the 7-day free trial really include everything?",
                a: "Yes! Full access to all Premium features. No credit card required upfront. We want you to experience the magic before committing.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-purple-200">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Payment Methods */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Secure Payment
                  </h3>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-semibold">
                    VISA
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-semibold">
                    Mastercard
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-semibold">
                    PayPal
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-semibold">
                    Apple Pay
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    100% Secure
                  </h3>
                </div>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Cancel anytime, no questions asked
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Money-back guarantee (30 days)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Trusted by 3,000+ lifelong learners
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Reading?
          </h2>
          <motion.button
            onClick={() => handleSelectPlan("Premium")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="relative z-10">Start Your Free 7-Day Trial</span>
          </motion.button>
          <p className="text-purple-300 mt-4">
            No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}
