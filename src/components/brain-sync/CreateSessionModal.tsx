"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  BookOpen,
  Play,
  Sparkles,
  Users,
  Lock,
  Mic,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  category: string;
  type: "book" | "course";
  totalPages?: number;
  lessonCount?: number;
  authorName?: string;
  instructorName?: string;
  level?: string;
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: {
    name: string;
    contentType: "book" | "course";
    contentId: string;
    contentSlug: string;
    maxParticipants: number;
    level: string;
    isPrivate: boolean;
    voiceEnabled: boolean;
    tags: string[];
  }) => Promise<void>;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  onCreateSession,
}: CreateSessionModalProps) {
  const [step, setStep] = useState<"content" | "settings">("content");
  const [books, setBooks] = useState<ContentItem[]>([]);
  const [courses, setCourses] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<"book" | "course">("book");

  // Selected content
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );

  // Session settings
  const [sessionName, setSessionName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [level, setLevel] = useState("all");
  const [isPrivate, setIsPrivate] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Fetch available content
  useEffect(() => {
    if (isOpen) {
      fetchContent();
    }
  }, [isOpen]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/brain-sync/content");
      const data = await response.json();
      setBooks(data.books || []);
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter content
  const filteredContent = (contentType === "book" ? books : courses).filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContent = (content: ContentItem) => {
    setSelectedContent(content);
    setSessionName(`${content.title} Study Session`);
    setStep("settings");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = async () => {
    if (!selectedContent) return;

    setIsCreating(true);
    try {
      await onCreateSession({
        name: sessionName,
        contentType: selectedContent.type,
        contentId: selectedContent.id,
        contentSlug: selectedContent.slug,
        maxParticipants,
        level,
        isPrivate,
        voiceEnabled,
        tags,
      });
      onClose();
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep("content");
    setSelectedContent(null);
    setSessionName("");
    setTags([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 rounded-xl sm:rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {step === "content" ? "Choose Content" : "Session Settings"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {step === "content"
                  ? "Select a book or course to study together"
                  : "Configure your study session"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] sm:max-h-[60vh]">
            {step === "content" ? (
              <>
                {/* Content type tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setContentType("book")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      contentType === "book"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Books ({books.length})
                  </button>
                  <button
                    onClick={() => setContentType("course")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      contentType === "course"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Courses ({courses.length})
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Content list */}
                {isLoading ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                    <p className="text-slate-400">Loading your content...</p>
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-slate-400 mb-2">
                      No {contentType}s available
                    </p>
                    <p className="text-sm text-slate-500">
                      Purchase books or enroll in courses to create study
                      sessions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredContent.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectContent(item)}
                        className="w-full flex items-center gap-4 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all text-left"
                      >
                        {/* Cover */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === "book" ? (
                                <BookOpen className="w-6 h-6 text-slate-500" />
                              ) : (
                                <Play className="w-6 h-6 text-slate-500" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-400 truncate">
                            {item.authorName || item.instructorName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                              {item.category}
                            </span>
                            {item.totalPages && (
                              <span className="text-xs text-slate-500">
                                {item.totalPages} pages
                              </span>
                            )}
                            {item.lessonCount && (
                              <span className="text-xs text-slate-500">
                                {item.lessonCount} lessons
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Selected content preview */}
                {selectedContent && (
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 mb-6">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-700">
                      {selectedContent.coverImage ? (
                        <img
                          src={selectedContent.coverImage}
                          alt={selectedContent.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {selectedContent.title}
                      </p>
                      <p className="text-sm text-purple-300">
                        {selectedContent.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("content")}
                      className="ml-auto text-slate-400"
                    >
                      Change
                    </Button>
                  </div>
                )}

                {/* Session settings form */}
                <div className="space-y-4">
                  {/* Session name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="Give your session a catchy name..."
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  {/* Max participants & Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) =>
                          setMaxParticipants(parseInt(e.target.value) || 10)
                        }
                        min={2}
                        max={50}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Recommended Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Tags (for discovery)
                    </label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Add a tag..."
                        className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <Button variant="ghost" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceEnabled}
                        onChange={(e) => setVoiceEnabled(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                      <Mic className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        Enable voice chat
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        Private session (invite only)
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10">
            {step === "settings" && (
              <Button
                variant="ghost"
                onClick={() => setStep("content")}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={step === "content" ? handleClose : handleCreate}
              disabled={
                step === "settings" &&
                (!selectedContent || !sessionName || isCreating)
              }
              className={`flex-1 ${
                step === "content"
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              }`}
            >
              {step === "content" ? (
                "Cancel"
              ) : isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
