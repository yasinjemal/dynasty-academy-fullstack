"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BlackholePortal from "@/components/intro/BlackholePortal";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor";
import HolographicDashboard from "@/components/courses/HolographicDashboard";
import { Sparkles, Rocket, Cpu, Atom } from "lucide-react";

export default function ExtraordinaryFeaturesDemo() {
  const [currentDemo, setCurrentDemo] = useState<
    "portal" | "avatar" | "holographic" | null
  >(null);
  const [showPortal, setShowPortal] = useState(false);

  const features = [
    {
      id: "portal",
      title: "🌌 Blackhole Portal",
      description:
        "Epic cinematic intro that sucks users into a different dimension",
      icon: Atom,
      color: "from-purple-500 to-blue-500",
      gradient: "bg-gradient-to-br from-purple-900/30 to-blue-900/30",
      demoUrl: undefined as string | undefined,
    },
    {
      id: "avatar",
      title: "🤖 AI Avatar Mentor",
      description:
        "3D AI guide that speaks and helps students through their journey",
      icon: Cpu,
      color: "from-green-500 to-teal-500",
      gradient: "bg-gradient-to-br from-green-900/30 to-teal-900/30",
      demoUrl: undefined as string | undefined,
    },
    {
      id: "holographic",
      title: "✨ Holographic Dashboard",
      description:
        "Navigate courses in 3D space with floating cards and gesture controls",
      icon: Rocket,
      color: "from-pink-500 to-orange-500",
      gradient: "bg-gradient-to-br from-pink-900/30 to-orange-900/30",
      demoUrl: undefined as string | undefined,
    },
    {
      id: "books",
      title: "📚 Immersive Books",
      description:
        "3D book portal, realistic page-turning, and ambient reading modes",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
      gradient: "bg-gradient-to-br from-amber-900/30 to-orange-900/30",
      demoUrl: "/books/immersive",
    },
  ];

  const handleDemoClick = (featureId: string, demoUrl?: string) => {
    if (featureId === "books" && demoUrl) {
      window.location.href = demoUrl;
    } else if (featureId === "portal") {
      setShowPortal(true);
    } else {
      setCurrentDemo(featureId as any);
    }
  };

  const handlePortalComplete = () => {
    setShowPortal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* Blackhole Portal Demo */}
      {showPortal && (
        <BlackholePortal onComplete={handlePortalComplete} skipIntro={false} />
      )}

      {/* AI Avatar Mentor Demo */}
      {currentDemo === "avatar" && (
        <AIAvatarMentor context="dashboard" minimizable={true} />
      )}

      {/* Holographic Dashboard Demo */}
      {currentDemo === "holographic" && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setCurrentDemo(null)}
            className="absolute top-8 right-8 z-10 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            ← Back to Menu
          </button>
          <HolographicDashboard />
        </div>
      )}

      {/* Main Demo Menu */}
      {!currentDemo && !showPortal && (
        <div className="container mx-auto px-6 py-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-20 h-20 text-purple-400" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Extraordinary
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Features
              </span>
            </h1>

            <p className="text-xl text-purple-300 max-w-3xl mx-auto">
              Three revolutionary features that will transform your learning
              platform into a futuristic experience
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative group cursor-pointer ${feature.gradient} backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden`}
                onClick={() => handleDemoClick(feature.id, feature.demoUrl)}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-purple-200 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* CTA Button */}
                  <div
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${feature.color} text-white font-semibold group-hover:shadow-2xl transition-all duration-300`}
                  >
                    <span>Try it Live</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>

                {/* Corner Sparkle */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-4 text-white/20"
                >
                  ✨
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Technical Details Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                🔧 Technical Stack
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">
                    Blackhole Portal
                  </h3>
                  <ul className="space-y-2 text-purple-200 text-sm">
                    <li>• Three.js + React Three Fiber</li>
                    <li>• GLSL Shaders</li>
                    <li>• Framer Motion</li>
                    <li>• Custom particle system</li>
                    <li>• MeshDistortMaterial</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">
                    AI Avatar Mentor
                  </h3>
                  <ul className="space-y-2 text-green-200 text-sm">
                    <li>• 3D Avatar with Three.js</li>
                    <li>• Web Speech API (TTS)</li>
                    <li>• Context-aware responses</li>
                    <li>• Minimizable UI</li>
                    <li>• Real-time animations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-pink-400 mb-4">
                    Holographic Dashboard
                  </h3>
                  <ul className="space-y-2 text-pink-200 text-sm">
                    <li>• 3D Spatial Navigation</li>
                    <li>• Floating course cards</li>
                    <li>• Orbit controls</li>
                    <li>• Grid & Carousel modes</li>
                    <li>• Interactive particles</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-20"
          >
            <p className="text-purple-300 text-lg mb-6">
              Ready to integrate these into your platform?
            </p>
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Start Building 🚀
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
