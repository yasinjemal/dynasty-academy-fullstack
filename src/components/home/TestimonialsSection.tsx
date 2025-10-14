'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Star, Quote, Sparkles } from 'lucide-react'
import { useRef } from 'react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechVision",
    avatar: "SC",
    rating: 5,
    text: "Dynasty Academy completely transformed how I approach personal development. The gamification and community support are unmatched.",
    gradient: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.4)"
  },
  {
    name: "Marcus Johnson",
    role: "Entrepreneur",
    avatar: "MJ",
    rating: 5,
    text: "I've tried countless reading platforms, but Dynasty Academy's premium experience and Dynasty Points system keep me engaged every single day.",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.4)"
  },
  {
    name: "Elena Rodriguez",
    role: "Author & Coach",
    avatar: "ER",
    rating: 5,
    text: "The streak system is addictive in the best way! I've read more books in 3 months here than I did all last year. Absolutely revolutionary.",
    gradient: "from-orange-500 to-pink-500",
    glowColor: "rgba(249, 115, 22, 0.4)"
  },
  {
    name: "David Kim",
    role: "Product Manager",
    avatar: "DK",
    rating: 5,
    text: "The community features and goal tracking make this feel like a social network for readers. I'm genuinely excited to log in every day.",
    gradient: "from-green-500 to-emerald-500",
    glowColor: "rgba(34, 197, 94, 0.4)"
  },
  {
    name: "Aisha Patel",
    role: "Designer",
    avatar: "AP",
    rating: 5,
    text: "This is hands-down the most beautiful reading platform I've ever used. The UI alone is worth the premium membership!",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "rgba(139, 92, 246, 0.4)"
  },
  {
    name: "James Wilson",
    role: "Investor",
    avatar: "JW",
    rating: 5,
    text: "Dynasty Points and achievements turned reading into a game I can't stop playing. Best investment in myself this year, period.",
    gradient: "from-yellow-500 to-orange-500",
    glowColor: "rgba(234, 179, 8, 0.4)"
  }
]

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
      style={{ perspective: '1000px' }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        style={{ background: testimonial.glowColor }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Card */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
        {/* Quote Icon with Gradient */}
        <div className={`absolute top-4 right-4 bg-gradient-to-br ${testimonial.gradient} p-2 rounded-lg`}>
          <Quote className="w-4 h-4 text-white" />
        </div>
        
        {/* Sparkle Effect */}
        <motion.div
          className="absolute top-2 left-2"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Sparkles className={`w-4 h-4 bg-gradient-to-br ${testimonial.gradient} bg-clip-text text-transparent`} />
        </motion.div>
        
        {/* Rating Stars */}
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
            >
              <Star className={`w-5 h-5 fill-yellow-400 text-yellow-400`} />
            </motion.div>
          ))}
        </div>
        
        {/* Testimonial Text */}
        <p className="text-white/90 text-sm leading-relaxed mb-6">
          "{testimonial.text}"
        </p>
        
        {/* Author Info */}
        <div className="flex items-center gap-3 mt-auto">
          {/* Avatar with Gradient Border */}
          <div className={`relative p-0.5 rounded-full bg-gradient-to-br ${testimonial.gradient}`}>
            <div className="bg-[#0A0E27] rounded-full w-12 h-12 flex items-center justify-center">
              <span className={`text-sm font-bold bg-gradient-to-br ${testimonial.gradient} bg-clip-text text-transparent`}>
                {testimonial.avatar}
              </span>
            </div>
          </div>
          
          {/* Name & Role */}
          <div>
            <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
            <p className="text-white/60 text-xs">{testimonial.role}</p>
          </div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${testimonial.gradient}`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })
  
  return (
    <section ref={containerRef} className="relative py-32 px-4 overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"
        style={{ opacity }}
      />
      
      {/* Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-64 h-64 rounded-full blur-3xl ${
            i % 3 === 0 ? 'bg-purple-500/10' :
            i % 3 === 1 ? 'bg-blue-500/10' :
            'bg-pink-500/10'
          }`}
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          ref={titleRef}
          style={{ y }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={titleInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4 inline-block">
              <Sparkles className="inline w-4 h-4 mr-2" />
              What Our Dynasty Members Say
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Transforming Lives
            </span>
            <br />
            <span className="text-white">One Book at a Time</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Join thousands of readers who've discovered the future of reading
          </motion.p>
        </motion.div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
