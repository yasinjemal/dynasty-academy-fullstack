"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Flame,
  Star,
  Rocket,
} from "lucide-react";

export default function FinalCTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { data: session } = useSession();
  const router = useRouter();

  const handleCTA = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#030014] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/30 via-violet-950/20 to-transparent" />

        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px]"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 60%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px]"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-violet-500/10 border border-orange-500/30 mb-8"
            animate={{
              boxShadow: [
                "0 0 20px rgba(249, 115, 22, 0.2)",
                "0 0 40px rgba(249, 115, 22, 0.4)",
                "0 0 20px rgba(249, 115, 22, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Rocket className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              Start Building Your Dynasty Today
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-white">Ready to </span>
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            <span className="text-white">Your Future?</span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of ambitious learners who are building their
            knowledge empire.
            <br className="hidden sm:block" />
            <span className="text-white font-semibold">
              Start free, grow forever.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={handleCTA}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl font-bold text-white text-xl overflow-hidden shadow-2xl shadow-pink-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                {session ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <Link href="/books">
              <motion.button
                className="group px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-white text-xl hover:bg-white/10 hover:border-orange-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">Browse Library</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { icon: Star, label: "4.9/5 Rating", color: "text-amber-400" },
              {
                icon: Flame,
                label: "10K+ Active Users",
                color: "text-orange-400",
              },
              {
                icon: Crown,
                label: "Premium Content",
                color: "text-violet-400",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1 }}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-gray-400 font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 1 }}
      />
    </section>
  );
}
