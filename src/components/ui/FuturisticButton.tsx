"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface FuturisticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function FuturisticButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  type = "button",
}: FuturisticButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 hover:from-purple-500 hover:via-fuchsia-400 hover:to-purple-500 border-purple-400/50",
    secondary:
      "bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 hover:from-cyan-500 hover:via-blue-400 hover:to-cyan-500 border-cyan-400/50",
    success:
      "bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:via-green-400 hover:to-emerald-500 border-emerald-400/50",
    danger:
      "bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:via-rose-400 hover:to-red-500 border-red-400/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        text-white font-semibold
        rounded-lg
        border-2
        backdrop-blur-sm
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={{
        backgroundSize: ["100% 100%", "200% 200%", "100% 100%"],
      }}
      transition={{
        backgroundSize: {
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        },
      }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          boxShadow: [
            "0 0 20px rgba(168, 85, 247, 0.5)",
            "0 0 40px rgba(168, 85, 247, 0.8)",
            "0 0 20px rgba(168, 85, 247, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Particles */}
      {!disabled && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
              style={{
                left: `${20 + i * 30}%`,
                top: "50%",
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="animate-pulse">{icon}</span>}
        {children}
        <motion.span
          className="inline-block"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {!disabled && <Sparkles className="w-4 h-4" />}
        </motion.span>
      </span>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30" />
    </motion.button>
  );
}
