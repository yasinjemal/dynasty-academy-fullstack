'use client'

import { motion } from 'framer-motion'
import { BookOpen, Github, Twitter, Instagram, Linkedin, Mail, Heart, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Premium', href: '/premium' },
    { name: 'Library', href: '/books' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press Kit', href: '/press' },
  ],
  resources: [
    { name: 'Community', href: '/community' },
    { name: 'Help Center', href: '/help' },
    { name: 'API Docs', href: '/docs' },
    { name: 'Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Licenses', href: '/licenses' },
  ]
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/dynastyacademy', color: 'from-blue-400 to-cyan-400' },
  { icon: Instagram, href: 'https://instagram.com/dynastyacademy', color: 'from-pink-400 to-purple-400' },
  { icon: Linkedin, href: 'https://linkedin.com/company/dynastyacademy', color: 'from-blue-500 to-blue-600' },
  { icon: Github, href: 'https://github.com/dynastyacademy', color: 'from-gray-400 to-gray-500' },
]

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0E27] border-t border-white/10 overflow-hidden">
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16"
        >
          <motion.path
            d="M0,0 C300,80 600,80 900,40 C1050,20 1100,10 1200,0 L1200,120 L0,120 Z"
            fill="url(#footerWaveGradient)"
            animate={{
              d: [
                "M0,0 C300,80 600,80 900,40 C1050,20 1100,10 1200,0 L1200,120 L0,120 Z",
                "M0,20 C300,60 600,100 900,60 C1050,40 1100,20 1200,10 L1200,120 L0,120 Z",
                "M0,0 C300,80 600,80 900,40 C1050,20 1100,10 1200,0 L1200,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="footerWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Floating Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-96 h-96 rounded-full blur-3xl ${
            i === 0 ? 'bg-purple-500/5' :
            i === 1 ? 'bg-blue-500/5' :
            'bg-pink-500/5'
          }`}
          style={{
            left: `${i * 40}%`,
            bottom: `${i * 20}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <BookOpen className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Dynasty Academy
              </span>
            </Link>
            
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Build your reading dynasty. Transform your life one book at a time with our premium reading platform.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, i) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.color} p-0.5 hover:scale-110 transition-transform`}
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-full h-full bg-[#0A0E27] rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </motion.a>
                )
              })}
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-pink-400" />
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4">
              <Mail className="w-4 h-4" />
              Stay Updated
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">
              Get weekly book recommendations
            </h3>
            
            <p className="text-white/60 mb-6">
              Join 10,000+ readers receiving curated book picks every Monday
            </p>
            
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm flex items-center gap-2">
            © 2024 Dynasty Academy. Made with 
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            for readers worldwide.
          </p>
          
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <motion.div
              className="flex items-center gap-2"
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>All systems operational</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}
