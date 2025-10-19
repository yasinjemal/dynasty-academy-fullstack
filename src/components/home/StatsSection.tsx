"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useRef, useEffect } from "react";
import { Users, BookOpen, Award, TrendingUp, Zap, Crown } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Active Members",
    gradient: "from-blue-500 to-cyan-500",
    description: "Building their dynasty",
  },
  {
    icon: BookOpen,
    value: 500,
    suffix: "+",
    label: "Premium Books",
    gradient: "from-orange-500 to-pink-500",
    description: "Carefully curated",
  },
  {
    icon: Award,
    value: 50000,
    suffix: "+",
    label: "Books Read",
    gradient: "from-purple-500 to-pink-500",
    description: "Lives transformed",
  },
  {
    icon: TrendingUp,
    value: 99,
    suffix: "%",
    label: "Success Rate",
    gradient: "from-green-500 to-emerald-500",
    description: "Member satisfaction",
  },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = latest.toLocaleString() + suffix;
      }
    });
  }, [rounded, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
}

export default function StatsSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <div
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-[#0A0E27] to-[#0A1628]"
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="wave-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z"
            fill="url(#wave-gradient)"
            animate={{
              d: [
                "M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z",
                "M0,100 Q250,150 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z",
                "M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100 V200 H0 Z",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6"
            animate={{
              boxShadow: [
                "0 0 20px rgba(168, 85, 247, 0.2)",
                "0 0 40px rgba(168, 85, 247, 0.4)",
                "0 0 20px rgba(168, 85, 247, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">
              Trusted Worldwide
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Join the
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Dynasty Movement
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Thousands are already transforming their lives. Will you be next?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card with Glass Effect */}
              <motion.div
                className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden"
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient Glow on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />

                {/* Sparkle Effect */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 flex items-center justify-center`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Number Counter */}
                <div className="mb-2">
                  <motion.span
                    className={`text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  >
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </motion.span>
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {stat.description}
                </p>

                {/* Progress Bar */}
                <motion.div
                  className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.gradient}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                  />
                </motion.div>

                {/* Floating Particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/50"
                    style={{
                      left: `${i * 20 + 10}%`,
                      top: `${i * 15 + 20}%`,
                    }}
                    animate={{
                      y: [-10, -30, -10],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.4,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative z-10 text-center">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-black text-white">
                Ready to Start Your Journey?
              </span>
              <Zap className="w-6 h-6 text-orange-400" />
            </motion.div>
            <p className="text-gray-400 mb-6">
              Join thousands of members building their dynasty today
            </p>
            <motion.button
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-white text-lg"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
          </div>

          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "30px 30px"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
