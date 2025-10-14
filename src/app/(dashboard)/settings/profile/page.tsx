"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Youtube,
  Save,
  Loader2,
  Eye,
  EyeOff,
  MessageSquare,
  Palette,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    xHandle: "",
    instagram: "",
    youtube: "",
    profileTheme: "classic" as string,
    isPrivate: false,
    dmOpen: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          xHandle: data.xHandle || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          profileTheme: data.profileTheme || "classic",
          isPrivate: data.isPrivate || false,
          dmOpen: data.dmOpen ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        await update(); // Update session
        toast.success("Profile updated successfully! 🎉");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const themes = [
    { id: "classic", name: "Classic", gradient: "from-purple-500 to-blue-500" },
    { id: "midnight", name: "Midnight", gradient: "from-gray-800 to-blue-900" },
    { id: "ocean", name: "Ocean", gradient: "from-blue-400 to-cyan-500" },
    { id: "forest", name: "Forest", gradient: "from-green-500 to-teal-600" },
    { id: "sunset", name: "Sunset", gradient: "from-orange-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Edit Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your public profile and privacy settings
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <User className="h-5 w-5 text-purple-600" />
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Your display name"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Tell the world about yourself..."
                  maxLength={300}
                />
                <div className="mt-1 text-right text-xs text-gray-500">
                  {formData.bio.length}/300
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </motion.div>

          {/* Social Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <LinkIcon className="h-5 w-5 text-purple-600" />
              Social Links
            </h2>

            <div className="space-y-4">
              {/* Website */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <LinkIcon className="mr-1 inline h-4 w-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* X/Twitter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Twitter className="mr-1 inline h-4 w-4" />X (Twitter) Handle
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">@</span>
                  <input
                    type="text"
                    value={formData.xHandle}
                    onChange={(e) =>
                      setFormData({ ...formData, xHandle: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="username"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Instagram className="mr-1 inline h-4 w-4" />
                  Instagram Handle
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">@</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="username"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Youtube className="mr-1 inline h-4 w-4" />
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="@YourChannel or channel URL"
                />
              </div>
            </div>
          </motion.div>

          {/* Theme Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <Palette className="h-5 w-5 text-purple-600" />
              Profile Theme
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, profileTheme: theme.id })
                  }
                  className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                    formData.profileTheme === theme.id
                      ? "border-purple-600 ring-2 ring-purple-600/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div
                    className={`mb-2 h-16 rounded-lg bg-gradient-to-br ${theme.gradient}`}
                  />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {theme.name}
                  </p>
                  {formData.profileTheme === theme.id && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <Lock className="h-5 w-5 text-purple-600" />
              Privacy & Preferences
            </h2>

            <div className="space-y-4">
              {/* Private Profile Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? (
                    <EyeOff className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-purple-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Private Profile
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only followers can see your posts and reflections
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPrivate: !formData.isPrivate })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.isPrivate ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData.isPrivate ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* DM Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Direct Messages
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow others to send you messages
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, dmOpen: !formData.dmOpen })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.dmOpen ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData.dmOpen ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/@${profile.username}`)}
              className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
