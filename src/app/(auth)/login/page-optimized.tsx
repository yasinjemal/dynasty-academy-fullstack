'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Crown, BookOpen, Users, Trophy, Gem, Star, Zap, Rocket
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/books')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/books' })
  }

  const handleGithubSignIn = () => {
    signIn('github', { callbackUrl: '/books' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A1628]">
      
      {/* LUXURY STATIC BACKGROUND - Zero CPU Cost */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rich Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-purple-500/10 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-orange-500/10 via-orange-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-radial from-pink-500/8 via-transparent to-transparent blur-3xl" />
        
        {/* Elegant Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      
      {/* Floating Logo - Single Animation */}
      <motion.div
        className="fixed top-8 left-8 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Dynasty
            </h2>
            <p className="text-xs text-white/60">Academy</p>
          </div>
        </Link>
      </motion.div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Benefits (Hidden on mobile for performance) */}
          <div className="hidden lg:block space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-semibold">Welcome Back!</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Continue Your
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Dynasty Journey
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-white/60 leading-relaxed">
                Access your personalized library, track progress, and unlock achievements
              </p>
            </div>
            
            {/* Benefit Cards - Static, No Animations */}
            <div className="space-y-3">
              {[
                { icon: BookOpen, title: "Your Library Awaits", desc: "50+ books ready to read", gradient: "from-blue-500 to-cyan-500" },
                { icon: Trophy, title: "Track Your Progress", desc: "See your reading streaks", gradient: "from-orange-500 to-yellow-500" },
                { icon: Users, title: "Community Access", desc: "Join discussions", gradient: "from-purple-500 to-pink-500" },
                { icon: Gem, title: "Exclusive Content", desc: "Premium early access", gradient: "from-emerald-500 to-teal-500" },
              ].map((benefit, i) => (
                <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.07] transition-colors">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{benefit.title}</h3>
                    <p className="text-white/60 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Stats - Simple, No Animations */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { icon: Users, value: "12.5K+", label: "Active Users" },
                { icon: BookOpen, value: "500+", label: "Books" },
                { icon: Star, value: "4.9", label: "Rating" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-white font-bold text-sm">{stat.value}</p>
                    <p className="text-white/60 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="relative">
              {/* Subtle Glow - Static CSS */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Form Card */}
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-white/60 text-sm sm:text-base">Sign in to continue your journey</p>
                </div>
                
                {/* Error Message - Only Animates When Visible */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm font-semibold flex items-center gap-2">
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
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        Password
                      </Label>
                      <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        Forgot?
                      </Link>
                    </div>
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
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 pr-12 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Submit Button - Minimal Animation */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5 animate-pulse" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 text-white/40 bg-[#0A0E27]">OR CONTINUE WITH</span>
                  </div>
                </div>
                
                {/* Social Login - Simple Hover */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="h-11 sm:h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="hidden sm:inline">Google</span>
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleGithubSignIn}
                    disabled={isLoading}
                    className="h-11 sm:h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="hidden sm:inline">GitHub</span>
                  </Button>
                </div>
                
                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold underline transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  )
}
