"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  ExternalLink,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Zap,
  Brain,
  Code,
  Users,
  Rocket,
  ArrowRight,
} from "lucide-react";

interface Skill {
  name: string;
  level: number;
  required: number;
  category: "technical" | "soft" | "tools";
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  logo: string;
  match: number;
  salary: string;
  location: string;
  type: string;
  skills: string[];
}

export default function CareerDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    "overview" | "skills" | "resume" | "interview" | "jobs"
  >("overview");

  // Career Readiness Score (calculated from skills)
  const readinessScore = 68;

  const skills: Skill[] = [
    { name: "React.js", level: 80, required: 90, category: "technical" },
    { name: "TypeScript", level: 75, required: 85, category: "technical" },
    { name: "Node.js", level: 60, required: 80, category: "technical" },
    { name: "Database Design", level: 70, required: 85, category: "technical" },
    { name: "Git/GitHub", level: 85, required: 90, category: "tools" },
    { name: "Problem Solving", level: 90, required: 95, category: "soft" },
    { name: "Communication", level: 65, required: 80, category: "soft" },
    { name: "Team Collaboration", level: 70, required: 85, category: "soft" },
  ];

  const jobMatches: JobMatch[] = [
    {
      id: "1",
      title: "Junior Frontend Developer",
      company: "TechCorp",
      logo: "🚀",
      match: 85,
      salary: "$60k - $80k",
      location: "Remote",
      type: "Full-time",
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: "2",
      title: "React Developer",
      company: "StartupXYZ",
      logo: "⚡",
      match: 78,
      salary: "$55k - $75k",
      location: "New York, NY",
      type: "Full-time",
      skills: ["React", "JavaScript", "REST APIs"],
    },
    {
      id: "3",
      title: "Web Developer",
      company: "DigitalAgency",
      logo: "🎨",
      match: 72,
      salary: "$50k - $70k",
      location: "San Francisco, CA",
      type: "Contract",
      skills: ["HTML", "CSS", "JavaScript"],
    },
  ];

  const milestones = [
    { title: "Complete React Course", completed: true },
    { title: "Build 3 Portfolio Projects", completed: true },
    { title: "Master TypeScript", completed: false },
    { title: "Contribute to Open Source", completed: false },
    { title: "Complete 50 Coding Challenges", completed: false },
    { title: "Build Full-Stack App", completed: false },
  ];

  const interviewTopics = [
    { topic: "JavaScript Fundamentals", confidence: 85, questions: 24 },
    { topic: "React Hooks & State", confidence: 78, questions: 18 },
    { topic: "Async Programming", confidence: 65, questions: 15 },
    { topic: "Data Structures", confidence: 55, questions: 12 },
    { topic: "System Design Basics", confidence: 40, questions: 8 },
  ];

  const getSkillColor = (category: string) => {
    switch (category) {
      case "technical":
        return "from-blue-500 to-cyan-500";
      case "soft":
        return "from-purple-500 to-pink-500";
      case "tools":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Career Dashboard
              </h1>
              <p className="text-slate-300">
                Track your journey to becoming job-ready
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Target },
              { id: "skills", label: "Skills", icon: Zap },
              { id: "resume", label: "Resume", icon: FileText },
              { id: "interview", label: "Interview Prep", icon: MessageSquare },
              { id: "jobs", label: "Job Matches", icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Readiness Score */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Career Readiness Score
                  </h2>
                  <p className="text-blue-100">
                    You're almost job-ready! Keep going 💪
                  </p>
                </div>
                <div className="text-6xl font-bold">{readinessScore}%</div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-white rounded-full h-4 flex items-center justify-end pr-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </motion.div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp className="w-5 h-5" />
                <span>+12% this month</span>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Milestones */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Career Milestones
                </h3>
                <div className="space-y-3">
                  {milestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 flex-shrink-0" />
                      )}
                      <span
                        className={
                          milestone.completed
                            ? "text-slate-400 line-through"
                            : "text-white"
                        }
                      >
                        {milestone.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-400" />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Portfolio Projects</span>
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GitHub Contributions</span>
                    <span className="text-2xl font-bold text-white">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skills Mastered</span>
                    <span className="text-2xl font-bold text-white">8/12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Interview Practice</span>
                    <span className="text-2xl font-bold text-white">24</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Job Matches Preview */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-orange-400" />
                  Top Job Matches
                </h3>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {jobMatches.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{job.logo}</div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {job.title}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          job.match >= 80
                            ? "bg-green-500/20 text-green-300"
                            : job.match >= 70
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {job.match}% Match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-7 h-7 text-purple-400" />
                Skills Assessment
              </h3>

              {["technical", "soft", "tools"].map((category) => (
                <div key={category} className="mb-8 last:mb-0">
                  <h4 className="text-lg font-semibold text-white mb-4 capitalize">
                    {category} Skills
                  </h4>
                  <div className="space-y-4">
                    {skills
                      .filter((s) => s.category === category)
                      .map((skill, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              {skill.name}
                            </span>
                            <span className="text-sm text-slate-400">
                              {skill.level}% / {skill.required}% required
                            </span>
                          </div>
                          <div className="relative w-full bg-white/10 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`bg-gradient-to-r ${getSkillColor(
                                skill.category
                              )} rounded-full h-3`}
                            />
                            <div
                              className="absolute top-0 h-3 w-0.5 bg-white/50"
                              style={{ left: `${skill.required}%` }}
                            />
                          </div>
                          {skill.level < skill.required && (
                            <p className="text-xs text-yellow-400 mt-1">
                              +{skill.required - skill.level}% needed for job
                              readiness
                            </p>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 text-white"
            >
              <FileText className="w-12 h-12 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Build Your Resume</h2>
              <p className="text-purple-100 mb-6">
                Create a professional resume using our AI-powered builder
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/20 rounded-xl font-bold flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Template
                </motion.button>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Modern Minimal",
                  preview: "📄",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Creative Bold",
                  preview: "🎨",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  title: "Professional",
                  preview: "💼",
                  color: "from-green-500 to-emerald-500",
                },
              ].map((template, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:border-purple-500/50 transition-all"
                >
                  <div
                    className={`w-full aspect-[8.5/11] bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-6xl mb-4`}
                  >
                    {template.preview}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {template.title}
                  </h4>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-colors">
                    Use Template
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Prep Tab */}
        {activeTab === "interview" && (
          <div className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-green-400" />
                Interview Confidence
              </h3>

              <div className="space-y-4">
                {interviewTopics.map((topic, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          {topic.topic}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {topic.questions} questions practiced
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          topic.confidence >= 75
                            ? "bg-green-500/20 text-green-300"
                            : topic.confidence >= 50
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {topic.confidence}%
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.confidence}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start Mock Interview
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {jobMatches.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{job.logo}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {job.title}
                      </h3>
                      <p className="text-lg text-slate-300">{job.company}</p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-lg font-bold ${
                      job.match >= 80
                        ? "bg-green-500/20 text-green-300"
                        : job.match >= 70
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {job.match}% Match
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-5 h-5 text-purple-400" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Star className="w-5 h-5 text-yellow-400" />
                    4.8/5 rating
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold"
                  >
                    Apply Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
