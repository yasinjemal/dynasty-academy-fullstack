"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Play,
} from "lucide-react";
import type { InstructorInfo } from "@/lib/api/course-data";

interface InstructorProfileProps {
  instructor: InstructorInfo;
}

export function InstructorProfile({ instructor }: InstructorProfileProps) {
  const socialIcons = {
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    website: Globe,
  };

  return (
    <section className="py-16 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Meet Your Instructor</h2>
          <p className="text-gray-400">Learn from an industry expert</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/10 rounded-3xl p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Instructor Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative">
                <Image
                  src={instructor.image || "/images/instructors/default.jpg"}
                  alt={instructor.name}
                  width={180}
                  height={180}
                  className="rounded-2xl ring-4 ring-purple-500/20"
                />
                {/* Verified Badge */}
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {instructor.name}
                </h3>
                <p className="text-purple-400 font-medium">{instructor.title}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{instructor.averageRating}</p>
                    <p className="text-gray-500 text-xs">Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">
                      {instructor.totalStudents.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{instructor.totalCourses}</p>
                    <p className="text-gray-500 text-xs">Courses</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-300 leading-relaxed mb-6">
                {instructor.bio}
              </p>

              {/* Social Links */}
              {Object.keys(instructor.socialLinks).length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {Object.entries(instructor.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[platform as keyof typeof socialIcons];
                    if (!Icon) return null;

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
