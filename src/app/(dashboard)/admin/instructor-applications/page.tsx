"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  ExternalLink,
  Calendar,
  MessageSquare,
  Loader2,
  Filter,
} from "lucide-react";

interface Application {
  id: string;
  userId: string;
  pitch: string;
  topics: string[];
  portfolioUrl: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function InstructorApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      fetchApplications();
    }
  }, [session, status, router]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/instructor-applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!confirm("Are you sure you want to approve this application?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action: "approve",
        }),
      });

      if (res.ok) {
        alert("Application approved!");
        fetchApplications();
        setSelectedApp(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve");
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve application");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action: "reject",
          rejectionReason,
        }),
      });

      if (res.ok) {
        alert("Application rejected");
        fetchApplications();
        setSelectedApp(null);
        setRejectionReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject");
      }
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Failed to reject application");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Instructor Applications
          </h1>
          <p className="text-gray-400">
            Review and manage instructor applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.total}
            </div>
            <div className="text-sm text-gray-400">Total Applications</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-400">Pending Review</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-400">Rejected</div>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedApp(app)}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {app.user.image ? (
                      <img
                        src={app.user.image}
                        alt={app.user.name || "User"}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {app.user.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-400">{app.user.email}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : app.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {app.status}
                  </div>
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {app.topics.slice(0, 3).map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300"
                    >
                      {topic}
                    </span>
                  ))}
                  {app.topics.length > 3 && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-400">
                      +{app.topics.length - 3} more
                    </span>
                  )}
                </div>

                {/* Pitch Preview */}
                <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                  {app.pitch}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                  {app.portfolioUrl && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <ExternalLink className="w-4 h-4" />
                      Portfolio
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedApp(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {selectedApp.user.image ? (
                    <img
                      src={selectedApp.user.image}
                      alt={selectedApp.user.name || "User"}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedApp.user.name || "Unknown"}
                  </h2>
                  <p className="text-gray-400">{selectedApp.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Topics */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Teaching Topics</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApp.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Pitch */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Why They Want to Teach
              </h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {selectedApp.pitch}
                </p>
              </div>
            </div>

            {/* Portfolio */}
            {selectedApp.portfolioUrl && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Portfolio</h3>
                <a
                  href={selectedApp.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  {selectedApp.portfolioUrl}
                </a>
              </div>
            )}

            {/* Actions */}
            {selectedApp.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Optional: Explain why this application is being rejected..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-600 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedApp.status !== "pending" && (
              <div className="text-center py-4">
                <p className="text-gray-400">
                  This application has already been{" "}
                  {selectedApp.status === "approved" ? "approved" : "rejected"}.
                </p>
                {selectedApp.reviewedAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Reviewed on{" "}
                    {new Date(selectedApp.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
