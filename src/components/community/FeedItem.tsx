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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-4">
        {/* Author Info */}
        <div className="flex items-start justify-between">
          <Link
            href={authorUrl}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={item.author.image || ""}
                alt={item.author.name || "User"}
              />
              <AvatarFallback>
                {item.author.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {item.author.name || "Anonymous"}
                </span>
                {item.author.isMentor && (
                  <Badge variant="secondary" className="text-xs">
                    Mentor
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Level {item.author.level}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
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
            <h2 className="text-2xl font-bold hover:text-primary transition-colors cursor-pointer">
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
                <Badge
                  variant="outline"
                  className="hover:bg-secondary cursor-pointer"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        {/* Engagement Stats */}
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onLike(content.id, item.type)}
          >
            <Heart
              className={`h-5 w-5 ${
                item.hasLiked ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span className="text-sm font-medium">{content.likeCount}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onComment(content.id, item.type)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{content.commentCount}</span>
          </Button>

          {/* View Count (Posts only) */}
          {isPost && (
            <span className="text-sm text-muted-foreground">
              {item.post!.viewCount} views
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(content.id, item.type)}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          )}

          {/* Share Button */}
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
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
