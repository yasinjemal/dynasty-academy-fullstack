"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  User,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Youtube,
  Settings,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FollowButton from "./FollowButton";
import SignalBar from "./SignalBar";
import DopamineStats from "./DopamineStats";

interface ProfileHeroProps {
  user: {
    username: string | null;
    name: string | null;
    image: string | null;
    bannerImage: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    xHandle: string | null;
    instagram: string | null;
    youtube: string | null;
    role: string;
    dynastyScore: number;
    level: number;
    streakDays: number;
    readingMinutesLifetime: number;
    booksCompleted: number;
    followersCount: number;
    followingCount: number;
    thanksReceived: number;
    dmOpen: boolean;
  };
  isOwner: boolean;
  isFollowing: boolean;
  currentBook: {
    title: string;
    slug: string;
    coverImage: string;
    total_pages: number;
  } | null;
  isPrivate?: boolean;
}

export default function ProfileHero({
  user,
  isOwner,
  isFollowing,
  currentBook,
  isPrivate = false,
}: ProfileHeroProps) {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 md:h-64">
        {user.bannerImage && (
          <Image
            src={user.bannerImage}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="relative -mt-20 px-6 pb-6">
        {/* Avatar */}
        <div className="mb-4 flex items-end justify-between">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white dark:border-gray-900 dark:bg-gray-900">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOwner ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <>
                <FollowButton userId={user.id} initialFollowing={isFollowing} />
                {user.dmOpen && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Name, Username, Role */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            {user.role !== "USER" && (
              <Badge variant="secondary" className="capitalize">
                {user.role.toLowerCase()}
              </Badge>
            )}
          </div>
          {user.username && (
            <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
          )}
        </div>

        {/* Bio */}
        {user.bio && !isPrivate && (
          <p className="mb-4 max-w-2xl text-gray-700 dark:text-gray-300">
            {user.bio}
          </p>
        )}

        {/* Links */}
        {!isPrivate && (
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600"
              >
                <LinkIcon className="h-4 w-4" />
                {new URL(user.website).hostname}
              </a>
            )}
            {user.xHandle && (
              <a
                href={`https://x.com/${user.xHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600"
              >
                <Twitter className="h-4 w-4" />@{user.xHandle}
              </a>
            )}
            {user.instagram && (
              <a
                href={`https://instagram.com/${user.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600"
              >
                <Instagram className="h-4 w-4" />@{user.instagram}
              </a>
            )}
            {user.youtube && (
              <a
                href={`https://youtube.com/@${user.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600"
              >
                <Youtube className="h-4 w-4" />@{user.youtube}
              </a>
            )}
          </div>
        )}

        {/* Follower Counts */}
        <div className="mb-6 flex gap-6 text-sm">
          <div>
            <span className="font-semibold">{user.followingCount}</span>{" "}
            <span className="text-gray-600 dark:text-gray-400">Following</span>
          </div>
          <div>
            <span className="font-semibold">{user.followersCount}</span>{" "}
            <span className="text-gray-600 dark:text-gray-400">Followers</span>
          </div>
        </div>

        {/* Signal Bar */}
        {!isPrivate && (
          <SignalBar
            dynastyScore={user.dynastyScore}
            level={user.level}
            streakDays={user.streakDays}
            thanksReceived={user.thanksReceived}
          />
        )}
      </div>
    </div>
  );
}
