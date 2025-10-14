"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Check, Crown, Zap, Star, Sparkles, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.3)",
    icon: Zap,
    features: [
      "Access to 50+ free books",
      "Basic Dynasty Points",
      "Community access",
      "Reading streaks",
      "Goal tracking",
      "Weekly book recommendations",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$12",
    period: "per month",
    description: "For serious readers",
    gradient: "from-purple-500 via-pink-500 to-orange-500",
    glowColor: "rgba(168, 85, 247, 0.5)",
    icon: Crown,
    features: [
      "Unlimited access to 500+ premium books",
      "3x Dynasty Points multiplier",
      "Exclusive community forums",
      "Advanced analytics & insights",
      "Priority support",
      "Early access to new features",
      "Download for offline reading",
      "Ad-free experience",
      "Custom reading themes",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$299",
    period: "one-time",
    description: "Ultimate investment in yourself",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    glowColor: "rgba(234, 179, 8, 0.4)",
    icon: Star,
    features: [
      "Everything in Premium",
      "Lifetime access - pay once, use forever",
      "10x Dynasty Points multiplier",
      "Exclusive lifetime member badge",
      "Priority feature requests",
      "Annual exclusive content drops",
      "Direct line to founders",
      "Legacy member perks",
    ],
    cta: "Claim Lifetime Access",
    popular: false,
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = plan.icon;
  const router = useRouter();
  const { data: session } = useSession();

  const handlePlanClick = () => {
    if (plan.name === "Free") {
      if (session) {
        router.push("/books");
      } else {
        router.push("/register");
      }
    } else if (plan.name === "Premium") {
      router.push("/premium");
    } else {
      router.push("/premium");
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative group ${
        plan.popular ? "md:-mt-8 md:scale-105" : ""
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div
            className={`bg-gradient-to-r ${plan.gradient} px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1`}
          >
            <Sparkles className="w-3 h-3" />
            MOST POPULAR
            <Sparkles className="w-3 h-3" />
          </div>
        </motion.div>
      )}

      {/* Animated Glow */}
      <motion.div
        className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 ${
          plan.popular ? "opacity-60" : ""
        }`}
        style={{ background: plan.glowColor }}
        animate={{
          opacity: plan.popular ? [0.4, 0.7, 0.4] : [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Card */}
      <div
        className={`relative backdrop-blur-xl bg-white/5 border-2 ${
          plan.popular ? "border-purple-500/50" : "border-white/10"
        } rounded-3xl p-8 h-full flex flex-col`}
      >
        {/* Icon with Gradient */}
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5 mb-6`}
          animate={{
            rotate: plan.popular ? [0, 5, 0, -5, 0] : 0,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-[#0A0E27] rounded-2xl flex items-center justify-center">
            <Icon
              className={`w-8 h-8 bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent`}
            />
          </div>
        </motion.div>

        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-white/60 text-sm mb-6">{plan.description}</p>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-end gap-2">
            <span
              className={`text-5xl font-bold bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent`}
            >
              {plan.price}
            </span>
            <span className="text-white/60 text-sm mb-2">{plan.period}</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8 flex-grow">
          {plan.features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
              className="flex items-start gap-3"
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/80 text-sm leading-relaxed">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handlePlanClick}
            className={`w-full bg-gradient-to-r ${plan.gradient} text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn cursor-pointer`}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Floating Particles */}
        {plan.popular &&
          [...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${plan.gradient}`}
              style={{
                left: `${10 + i * 20}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section ref={containerRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10" />

      {/* Animated Grid */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div ref={titleRef} style={{ y }} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={titleInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-6 inline-block">
              <Crown className="inline w-4 h-4 mr-2" />
              Invest in Your Dynasty
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Choose Your Path
            </span>
            <br />
            <span className="text-white">To Greatness</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Every great dynasty starts with a single decision. Make yours today.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-white/60 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-400" />
            </div>
            <span>
              30-day money-back guarantee • Cancel anytime • No questions asked
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
