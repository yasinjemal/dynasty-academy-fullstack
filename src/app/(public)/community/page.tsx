'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { useToast } from '@/hooks/use-toast';

type Tab = 'hot' | 'following' | 'topic';

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('hot');
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab;
    const topicParam = searchParams.get('topic');
    
    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    if (topicParam) {
      setTopic(topicParam);
      setActiveTab('topic');
    }
  }, [searchParams]);

  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        tab: activeTab,
      });

      if (activeTab === 'topic' && topic) {
        params.append('topic', topic);
      }

      const response = await fetch(`/api/feed?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feed');
      }

      if (append) {
        setFeedItems((prev) => [...prev, ...data.feedItems]);
      } else {
        setFeedItems(data.feedItems);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching feed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load feed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setFeedItems([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false);
  }, [activeTab, topic]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (tab === 'topic' && topic) {
      params.set('topic', topic);
    }
    router.push(`/community?${params.toString()}`);
  };

  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like content',
        variant: 'destructive',
      });
      return;
    }

    try {
      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like');
      }

      setFeedItems((prev) =>
        prev.map((item) => {
          if (type === 'POST' && item.post?.id === itemId) {
            return {
              ...item,
              hasLiked: data.liked,
              post: {
                ...item.post!,
                likeCount: data.likeCount,
              },
            };
          }
          if (type === 'REFLECTION' && item.reflection?.id === itemId) {
            return {
              ...item,
              hasLiked: data.liked,
              reflection: {
                ...item.reflection!,
                likeCount: data.likeCount,
              },
            };
          }
          return item;
        })
      );
    } catch (error: any) {
      console.error('Error liking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to like',
        variant: 'destructive',
      });
    }
  };

  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {
    const item = feedItems.find((i) =>
      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId
    );

    if (item) {
      const url = type === 'POST'
        ? `/posts/${item.post!.slug}`
        : `/reflections/${itemId}`;
      router.push(url);
    }
  };

  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {
    toast({
      title: 'Coming Soon',
      description: 'Collections feature is coming soon!',
    });
  };

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {
    const item = feedItems.find((i) =>
      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId
    );

    if (item) {
      const url = type === 'POST'
        ? `${window.location.origin}/posts/${item.post!.slug}`
        : `${window.location.origin}/reflections/${itemId}`;

      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied!',
          description: 'Share link copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Community</h1>
            {session && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              variant={activeTab === 'hot' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('hot')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Hot
            </Button>
            <Button
              variant={activeTab === 'following' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('following')}
              className="gap-2"
              disabled={!session}
            >
              <Users className="h-4 w-4" />
              Following
            </Button>
            {topic && activeTab === 'topic' && (
              <Button variant="default" className="gap-2">
                <Hash className="h-4 w-4" />
                {topic}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {activeTab === 'following'
                ? 'No posts from people you follow yet. Start following some users!'
                : activeTab === 'topic'
                ? `No posts found for #${topic}`
                : 'No posts yet. Be the first to create one!'}
            </p>
            {session && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {feedItems.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                onLike={handleLike}
                onComment={handleComment}
                onSave={handleSave}
                onShare={handleShare}
                currentUserId={session?.user?.id}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center py-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setFeedItems([]);
          setPage(1);
          fetchFeed(1, false);
        }}
      />
    </div>
  );
}
