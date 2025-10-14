"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Sparkles,
  Zap,
  Crown,
  BookOpen,
  Users,
  Shield,
  Rocket,
  Star,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculator
  useEffect(() => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [formData.password]);

  // Confetti explosion on success
  useEffect(() => {
    if (success && typeof window !== "undefined") {
      const newConfetti = [];
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -50,
          color: ["#f97316", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981"][
            Math.floor(Math.random() * 5)
          ],
        });
      }
      setConfetti(newConfetti);

      setTimeout(() => setConfetti([]), 3000);
    }
  }, [success]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "from-red-500 to-red-600";
    if (passwordStrength < 50) return "from-orange-500 to-orange-600";
    if (passwordStrength < 75) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
      {/* LUXURY STATIC BACKGROUND - Zero CPU Cost */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rich Gradient Overlays - Static */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-orange-500/10 via-orange-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-pink-500/8 via-transparent to-transparent blur-3xl" />
        
        {/* Elegant Grid Pattern - Static */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Confetti - Only Animates On Success */}
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm z-[10001]"
            style={{
              backgroundColor: piece.color,
              left: piece.x,
            }}
            initial={{ y: piece.y, opacity: 1, rotate: 0 }}
            animate={{
              y:
                typeof window !== "undefined" ? window.innerHeight + 100 : 1000,
              opacity: 0,
              rotate: 720,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeIn" }}
          />
        ))}
      </AnimatePresence>

      {/* SURPRISE ELEMENT - Floating Dynasty Logo */}
      <motion.div
        className="fixed top-8 left-8 z-50"
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15, delay: 0.5 }}
      >
        <Link href="/">
          <motion.div
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Dynasty
              </h2>
              <p className="text-xs text-white/60">Academy</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Main Content - Form Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            {/* Glow Effect */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-30"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Form Card */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  Create Account
                </h2>
                <p className="text-white/60">Join the Dynasty in 30 seconds</p>
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                  >
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">
                      🎉 Account created! Redirecting to login...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 focus:border-blue-500/50 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-orange-400" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 pl-4 pr-12 focus:border-orange-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-white/60">
                        Password strength:{" "}
                        <span
                          className={`font-semibold ${
                            passwordStrength < 50
                              ? "text-orange-400"
                              : "text-green-400"
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-white text-sm font-semibold flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-pink-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 pl-4 pr-12 focus:border-pink-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">
                            Passwords don't match
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <p className="text-sm text-white/60">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Zap className="w-5 h-5" />
                          </motion.div>
                          Creating your account...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Create Account
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-semibold underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
