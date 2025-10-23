"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Rocket,
  Award,
  BookOpen,
  Video,
  BarChart3,
  Shield,
  Heart,
  Zap,
  Globe,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function BecomeInstructorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    pitch: "",
    topics: [] as string[],
    portfolioUrl: "",
  });
  const [topicInput, setTopicInput] = useState("");

  // Check if user already has an application
  useEffect(() => {
    if (session?.user) {
      checkApplicationStatus();
    }
  }, [session]);

  const checkApplicationStatus = async () => {
    try {
      const res = await fetch("/api/instructors/apply");
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setApplicationStatus(data.application.status);
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && formData.topics.length < 5) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()],
      });
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (index: number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("Please sign in to apply");
      router.push("/login");
      return;
    }

    if (formData.topics.length === 0) {
      alert("Please add at least one teaching topic");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/instructors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setApplicationStatus("pending");
        alert(
          "Application submitted successfully! We'll review it within 48 hours."
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already applied
  if (applicationStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            {applicationStatus === "approved" ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : applicationStatus === "rejected" ? (
              <Award className="w-10 h-10 text-white" />
            ) : (
              <Rocket className="w-10 h-10 text-white" />
            )}
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {applicationStatus === "approved"
              ? "Welcome, Instructor!"
              : applicationStatus === "rejected"
              ? "Application Reviewed"
              : "Application Under Review"}
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            {applicationStatus === "approved"
              ? "Your application has been approved! Start creating courses now."
              : applicationStatus === "rejected"
              ? "Unfortunately, your application was not approved this time. You can reapply in 30 days."
              : "We're reviewing your application. You'll hear from us within 48 hours."}
          </p>

          {applicationStatus === "approved" && (
            <Link href="/instructor/create">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                Start Teaching Now
              </button>
            </Link>
          )}

          {applicationStatus === "pending" && (
            <p className="text-sm text-gray-400">
              Check your email for updates, or visit your dashboard.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-6 py-2 rounded-full border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-medium">
                Join 1,000+ Educators
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Teach the World,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Build Your Empire
              </span>
            </h1>

            <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Share your knowledge. Earn income. Impact lives. Dynasty Academy
              gives you everything you need to succeed as an online instructor.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span>70% Revenue Share</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>Global Reach</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {[
              {
                icon: BookOpen,
                value: "500+",
                label: "Active Courses",
                color: "purple",
              },
              {
                icon: Users,
                value: "50K+",
                label: "Student Enrollments",
                color: "blue",
              },
              {
                icon: DollarSign,
                value: "R2M+",
                label: "Paid to Instructors",
                color: "green",
              },
              {
                icon: TrendingUp,
                value: "4.8/5",
                label: "Average Rating",
                color: "pink",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Teach with Dynasty?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: "AI-Powered Tools",
                description:
                  "Create courses 10x faster with AI course generators, lesson planners, and quiz makers.",
                color: "purple",
              },
              {
                icon: DollarSign,
                title: "Earn While You Sleep",
                description:
                  "70% revenue share on all sales. Get paid weekly via Stripe Connect.",
                color: "green",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description:
                  "Track student engagement, completion rates, and revenue with powerful dashboards.",
                color: "blue",
              },
              {
                icon: Users,
                title: "Built-In Audience",
                description:
                  "Tap into our growing community of 10,000+ active learners.",
                color: "pink",
              },
              {
                icon: Shield,
                title: "Fair & Transparent",
                description:
                  "Algorithm ensures quality content gets visibility, not just big names.",
                color: "yellow",
              },
              {
                icon: Heart,
                title: "24/7 Support",
                description:
                  "Dedicated instructor success team to help you grow.",
                color: "red",
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 rounded-xl flex items-center justify-center mb-4`}
                >
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20"
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Apply to Become an Instructor
              </h2>
              <p className="text-gray-300">
                Tell us about yourself and what you want to teach. We review
                applications within 48 hours.
              </p>
            </div>

            {status === "unauthenticated" ? (
              <div className="text-center">
                <p className="text-gray-300 mb-6">
                  Please sign in to submit your application
                </p>
                <Link href="/login">
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                    Sign In to Apply
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pitch */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Why do you want to teach? *
                  </label>
                  <textarea
                    value={formData.pitch}
                    onChange={(e) =>
                      setFormData({ ...formData, pitch: e.target.value })
                    }
                    placeholder="Tell us about your teaching philosophy, experience, and why you're passionate about education..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Minimum 100 characters
                  </p>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    What will you teach? *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTopic()}
                      placeholder="e.g., React, Python, Marketing..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      disabled={
                        !topicInput.trim() || formData.topics.length >= 5
                      }
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-xl text-white font-semibold transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 flex items-center gap-2"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="text-purple-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Add up to 5 topics ({formData.topics.length}/5)
                  </p>
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Portfolio or Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolioUrl: e.target.value })
                    }
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || formData.topics.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Success Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Web Development Instructor",
                image: "👩‍💻",
                revenue: "R45,000/month",
                students: "2,300",
                quote:
                  "Dynasty's AI tools helped me create 5 courses in my first month!",
              },
              {
                name: "Michael Chen",
                role: "Business Coach",
                image: "👨‍💼",
                revenue: "R38,000/month",
                students: "1,800",
                quote:
                  "The fair ranking system gave my courses visibility from day one.",
              },
              {
                name: "Priya Patel",
                role: "Design Mentor",
                image: "👩‍🎨",
                revenue: "R52,000/month",
                students: "3,100",
                quote: "Best decision I ever made. Teaching full-time now!",
              },
            ].map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
              >
                <div className="text-6xl mb-4">{story.image}</div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {story.name}
                </h3>
                <p className="text-purple-400 mb-4">{story.role}</p>
                <p className="text-gray-300 italic mb-6">"{story.quote}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {story.revenue}
                    </div>
                    <div className="text-sm text-gray-400">Monthly Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {story.students}
                    </div>
                    <div className="text-sm text-gray-400">Students</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Who can become an instructor?",
                a: "Anyone with expertise and passion for teaching! We welcome professionals, educators, and subject matter experts from all fields.",
              },
              {
                q: "How long does approval take?",
                a: "We review applications within 48 hours. You'll receive an email with our decision.",
              },
              {
                q: "What's the revenue share?",
                a: "Instructors keep 70% of all course sales. We handle payments, hosting, and student support.",
              },
              {
                q: "Do I need video equipment?",
                a: "Not required! You can start with just a smartphone. We also support text-based courses.",
              },
              {
                q: "How do payouts work?",
                a: "Weekly payouts via Stripe Connect. Minimum payout threshold is R500.",
              },
              {
                q: "Can I teach for free?",
                a: "Yes! You can offer free courses to build your audience, then monetize later.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-300">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12"
          >
            <Zap className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Build Your Teaching Empire?
            </h2>
            <p className="text-2xl text-white/90 mb-8">
              Join Dynasty Academy and start earning today.
            </p>
            <a href="#application">
              <button className="px-12 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-white/20 transition-all">
                Apply Now - It's Free
              </button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
