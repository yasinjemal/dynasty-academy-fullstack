import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
  level: number;
  isMentor?: boolean;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt: Date | null;
}

interface Reflection {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number | null;
  excerpt: string | null;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  book: {
    id: string;
    title: string;
    coverImage: string | null;
    slug: string;
  };
}

export interface FeedItemData {
  id: string;
  type: "POST" | "REFLECTION";
  publishedAt: Date;
  hotScore: number;
  author: Author;
  post?: Post | null;
  reflection?: Reflection | null;
  hasLiked: boolean;
}

interface FeedItemProps {
  item: FeedItemData;
  onLike: (itemId: string, type: "POST" | "REFLECTION") => void;
  onComment: (itemId: string, type: "POST" | "REFLECTION") => void;
  onSave?: (itemId: string, type: "POST" | "REFLECTION") => void;
  onShare?: (itemId: string, type: "POST" | "REFLECTION") => void;
  currentUserId?: string;
}

export function FeedItem({
  item,
  onLike,
  onComment,
  onSave,
  onShare,
  currentUserId,
}: FeedItemProps) {
  const isPost = item.type === "POST";
  const content = isPost ? item.post : item.reflection;
  const isAuthor = currentUserId === item.author.id;

  if (!content) return null;

  // Generate URLs
  const authorUrl = item.author.username
    ? `/@${item.author.username}`
    : `/profile/${item.author.id}`;

  const contentUrl = isPost
    ? `/posts/${item.post!.slug}`
    : `/reflections/${item.reflection!.id}`;

  const bookUrl = !isPost ? `/books/${item.reflection!.book.slug}` : null;

  // Format timestamps
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  return (
    <Card className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm overflow-hidden">
      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-lg blur-sm animate-pulse" />
      </div>

      <CardHeader className="space-y-4 relative z-10">
        {/* Author Info */}
        <div className="flex items-start justify-between">
          <Link
            href={authorUrl}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar className="h-12 w-12 ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
              <AvatarImage
                src={item.author.image || ""}
                alt={item.author.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                {item.author.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">
                  {item.author.name || "Anonymous"}
                </span>
                {item.author.isMentor && (
                  <Badge className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                    ⭐ Mentor
                  </Badge>
                )}
                <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30">
                  Lvl {item.author.level}
                </Badge>
              </div>
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
          </Link>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor ? (
                <>
                  <DropdownMenuItem>
                    <Link href={`${contentUrl}/edit`} className="w-full">
                      Edit {isPost ? "Post" : "Reflection"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>Report Content</DropdownMenuItem>
                  <DropdownMenuItem>Hide</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Type Badge */}
        {!isPost && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Reflection</Badge>
            <span>on</span>
            <Link
              href={bookUrl!}
              className="font-medium text-primary hover:underline"
            >
              {item.reflection!.bookTitle}
            </Link>
            {item.reflection!.pageNumber && (
              <span className="text-xs">
                (Page {item.reflection!.pageNumber})
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Title (Posts only) */}
        {isPost && item.post!.title && (
          <Link href={contentUrl}>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 hover:from-purple-200 hover:to-blue-200 transition-all duration-300 cursor-pointer">
              {item.post!.title}
            </h2>
          </Link>
        )}

        {/* Cover Image */}
        {isPost && item.post!.coverImage && (
          <Link href={contentUrl} className="block">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={item.post!.coverImage}
                alt={item.post!.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}

        {/* Book Cover (Reflections only) */}
        {!isPost && item.reflection!.book.coverImage && (
          <Link href={bookUrl!} className="block">
            <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-md">
              <Image
                src={item.reflection!.book.coverImage}
                alt={item.reflection!.bookTitle}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}

        {/* Excerpt/Content */}
        <Link href={contentUrl}>
          <div className="prose prose-sm max-w-none cursor-pointer">
            {isPost ? (
              <p className="text-muted-foreground line-clamp-3">
                {item.post!.excerpt}
              </p>
            ) : (
              <>
                {item.reflection!.excerpt && (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground mb-2">
                    "{item.reflection!.excerpt}"
                  </blockquote>
                )}
                <p className="text-foreground line-clamp-4">
                  {item.reflection!.content}
                </p>
              </>
            )}
          </div>
        </Link>

        {/* Tags (Posts only) */}
        {isPost && item.post!.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.post!.tags.map((tag) => (
              <Link key={tag} href={`/community?tab=topic&topic=${tag}`}>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-500/50 transition-all cursor-pointer">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-700/50 pt-4 relative z-10">
        {/* Engagement Stats */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 hover:bg-red-500/10 hover:text-red-400 transition-all ${
              item.hasLiked ? "text-red-500" : "text-gray-400"
            }`}
            onClick={() => onLike(content.id, item.type)}
          >
            <Heart
              className={`h-5 w-5 transition-all ${
                item.hasLiked ? "fill-red-500 scale-110" : ""
              }`}
            />
            <span className="text-sm font-semibold">{content.likeCount}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
            onClick={() => onComment(content.id, item.type)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {content.commentCount}
            </span>
          </Button>

          {/* View Count (Posts only) */}
          {isPost && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <span className="text-emerald-400">👁</span> {item.post!.viewCount}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
              onClick={() => onSave(content.id, item.type)}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          )}

          {/* Share Button */}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              onClick={() => onShare(content.id, item.type)}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
