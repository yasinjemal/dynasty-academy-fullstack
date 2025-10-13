'use client';'use client';'use client';



import React, { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { useSearchParams, useRouter } from 'next/navigation';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';

import { Button } from '@/components/ui/button';import { useSession } from 'next-auth/react';import { useSession } from 'next-auth/react';

import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';

import { CreatePostModal } from '@/components/community/CreatePostModal';import { useSearchParams, useRouter } from 'next/navigation';import { useSearchParams, useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';

import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';

type Tab = 'hot' | 'following' | 'topic';

import { Button } from '@/components/ui/button';import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';

export default function CommunityPage() {

  const { data: session } = useSession();import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';

  const router = useRouter();

  const searchParams = useSearchParams();import { CreatePostModal } from '@/components/community/CreatePostModal';import { Button } from '@/components/ui/button';import { useSession } from 'next-auth/react';

  const { toast } = useToast();

import { useToast } from '@/hooks/use-toast';

  const [activeTab, setActiveTab] = useState<Tab>('hot');

  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';

  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);type Tab = 'hot' | 'following' | 'topic';

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);import { CreatePostModal } from '@/components/community/CreatePostModal';import { useSearchParams, useRouter } from 'next/navigation';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [topic, setTopic] = useState<string | null>(null);export default function CommunityPage() {



  useEffect(() => {  const { data: session } = useSession();import { useToast } from '@/hooks/use-toast';

    const tabParam = searchParams.get('tab') as Tab;

    const topicParam = searchParams.get('topic');  const router = useRouter();

    

    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {  const searchParams = useSearchParams();import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';

      setActiveTab(tabParam);

    }  const { toast } = useToast();

    

    if (topicParam) {type Tab = 'hot' | 'following' | 'topic';

      setTopic(topicParam);

      setActiveTab('topic');  const [activeTab, setActiveTab] = useState<Tab>('hot');

    }

  }, [searchParams]);  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);import { Button } from '@/components/ui/button';import { useSession } from 'next-auth/react';import { useSession } from 'next-auth/react';



  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {  const [isLoading, setIsLoading] = useState(true);

    try {

      if (pageNum === 1) {  const [isLoadingMore, setIsLoadingMore] = useState(false);export default function CommunityPage() {

        setIsLoading(true);

      } else {  const [page, setPage] = useState(1);

        setIsLoadingMore(true);

      }  const [hasMore, setHasMore] = useState(true);  const { data: session } = useSession();import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';



      const params = new URLSearchParams({  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

        page: pageNum.toString(),

        limit: '20',  const [topic, setTopic] = useState<string | null>(null);  const router = useRouter();

        tab: activeTab,

      });



      if (activeTab === 'topic' && topic) {  useEffect(() => {  const searchParams = useSearchParams();import { CreatePostModal } from '@/components/community/CreatePostModal';import { useSearchParams, useRouter } from 'next/navigation';import { useSearchParams, useRouter } from 'next/navigation';

        params.append('topic', topic);

      }    const tabParam = searchParams.get('tab') as Tab;



      const response = await fetch(`/api/feed?${params.toString()}`);    const topicParam = searchParams.get('topic');  const { toast } = useToast();

      const data = await response.json();

    

      if (!response.ok) {

        throw new Error(data.error || 'Failed to fetch feed');    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {import { useToast } from '@/hooks/use-toast';

      }

      setActiveTab(tabParam);

      if (append) {

        setFeedItems((prev) => [...prev, ...data.feedItems]);    }  const [activeTab, setActiveTab] = useState<Tab>('hot');

      } else {

        setFeedItems(data.feedItems);    

      }

    if (topicParam) {  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';

      setHasMore(data.pagination.hasMore);

      setPage(pageNum);      setTopic(topicParam);

    } catch (error: any) {

      console.error('Error fetching feed:', error);      setActiveTab('topic');  const [isLoading, setIsLoading] = useState(true);

      toast({

        title: 'Error',    }

        description: error.message || 'Failed to load feed',

        variant: 'destructive',  }, [searchParams]);  const [isLoadingMore, setIsLoadingMore] = useState(false);type Tab = 'hot' | 'following' | 'topic';

      });

    } finally {

      setIsLoading(false);

      setIsLoadingMore(false);  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {  const [page, setPage] = useState(1);

    }

  };    try {



  useEffect(() => {      if (pageNum === 1) {  const [hasMore, setHasMore] = useState(true);import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

    setFeedItems([]);

    setPage(1);        setIsLoading(true);

    setHasMore(true);

    fetchFeed(1, false);      } else {  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  }, [activeTab, topic]);

        setIsLoadingMore(true);

  const handleTabChange = (tab: Tab) => {

    setActiveTab(tab);      }  const [topic, setTopic] = useState<string | null>(null);export default function CommunityPage() {

    const params = new URLSearchParams();

    params.set('tab', tab);

    if (tab === 'topic' && topic) {

      params.set('topic', topic);      const params = new URLSearchParams({

    }

    router.push(`/community?${params.toString()}`);        page: pageNum.toString(),

  };

        limit: '20',  useEffect(() => {  const { data: session } = useSession();import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';

  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    if (!session) {        tab: activeTab,

      toast({

        title: 'Sign in required',      });    const tabParam = searchParams.get('tab') as Tab;

        description: 'Please sign in to like content',

        variant: 'destructive',

      });

      return;      if (activeTab === 'topic' && topic) {    const topicParam = searchParams.get('topic');  const router = useRouter();

    }

        params.append('topic', topic);

    try {

      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;      }    

      const response = await fetch(endpoint, { method: 'POST' });

      const data = await response.json();



      if (!response.ok) {      const response = await fetch(`/api/feed?${params.toString()}`);    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {  const searchParams = useSearchParams();import { CreatePostModal } from '@/components/community/CreatePostModal';import { CreatePostModal } from '@/components/community/CreatePostModal';

        throw new Error(data.error || 'Failed to like');

      }      const data = await response.json();



      setFeedItems((prev) =>      setActiveTab(tabParam);

        prev.map((item) => {

          if (type === 'POST' && item.post?.id === itemId) {      if (!response.ok) {

            return {

              ...item,        throw new Error(data.error || 'Failed to fetch feed');    }  const { toast } = useToast();

              hasLiked: data.liked,

              post: {      }

                ...item.post!,

                likeCount: data.likeCount,    

              },

            };      if (append) {

          }

          if (type === 'REFLECTION' && item.reflection?.id === itemId) {        setFeedItems((prev) => [...prev, ...data.feedItems]);    if (topicParam) {import { useToast } from '@/hooks/use-toast';import { useToast } from '@/hooks/use-toast';

            return {

              ...item,      } else {

              hasLiked: data.liked,

              reflection: {        setFeedItems(data.feedItems);      setTopic(topicParam);

                ...item.reflection!,

                likeCount: data.likeCount,      }

              },

            };      setActiveTab('topic');  // State

          }

          return item;      setHasMore(data.pagination.hasMore);

        })

      );      setPage(pageNum);    }

    } catch (error: any) {

      console.error('Error liking:', error);    } catch (error: any) {

      toast({

        title: 'Error',      console.error('Error fetching feed:', error);  }, [searchParams]);  const [activeTab, setActiveTab] = useState<Tab>('hot');

        description: error.message || 'Failed to like',

        variant: 'destructive',      toast({

      });

    }        title: 'Error',

  };

        description: error.message || 'Failed to load feed',

  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>        variant: 'destructive',  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );      });



    if (item) {    } finally {    try {

      const url = type === 'POST'

        ? `/posts/${item.post!.slug}`      setIsLoading(false);

        : `/reflections/${itemId}`;

      router.push(url);      setIsLoadingMore(false);      if (pageNum === 1) {  const [isLoading, setIsLoading] = useState(true);type Tab = 'hot' | 'following' | 'topic';type Tab = 'hot' | 'following' | 'topic';

    }

  };    }



  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {  };        setIsLoading(true);

    toast({

      title: 'Coming Soon',

      description: 'Collections feature is coming soon!',

    });  useEffect(() => {      } else {  const [isLoadingMore, setIsLoadingMore] = useState(false);

  };

    setFeedItems([]);

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>    setPage(1);        setIsLoadingMore(true);

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );    setHasMore(true);



    if (item) {    fetchFeed(1, false);      }  const [page, setPage] = useState(1);

      const url = type === 'POST'

        ? `${window.location.origin}/posts/${item.post!.slug}`  }, [activeTab, topic]);

        : `${window.location.origin}/reflections/${itemId}`;



      try {

        await navigator.clipboard.writeText(url);  const handleTabChange = (tab: Tab) => {

        toast({

          title: 'Link copied!',    setActiveTab(tab);      const params = new URLSearchParams({  const [hasMore, setHasMore] = useState(true);

          description: 'Share link copied to clipboard',

        });    const params = new URLSearchParams();

      } catch (error) {

        toast({    params.set('tab', tab);        page: pageNum.toString(),

          title: 'Error',

          description: 'Failed to copy link',    if (tab === 'topic' && topic) {

          variant: 'destructive',

        });      params.set('topic', topic);        limit: '20',  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);export default function CommunityPage() {export default function CommunityPage() {

      }

    }    }

  };

    router.push(`/community?${params.toString()}`);        tab: activeTab,

  const handleLoadMore = () => {

    if (!isLoadingMore && hasMore) {  };

      fetchFeed(page + 1, true);

    }      });  const [topic, setTopic] = useState<string | null>(null);

  };

  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {

  return (

    <div className="min-h-screen bg-background">    if (!session) {

      <div className="border-b bg-card sticky top-0 z-10">

        <div className="container mx-auto px-4 py-4">      toast({

          <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold">Community</h1>        title: 'Sign in required',      if (activeTab === 'topic' && topic) {  const { data: session } = useSession();  const { data: session } = useSession();

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>        description: 'Please sign in to like content',

                <Plus className="mr-2 h-4 w-4" />

                Create Post        variant: 'destructive',        params.append('topic', topic);

              </Button>

            )}      });

          </div>

      return;      }  // Read initial state from URL

          <div className="flex gap-4 mt-4">

            <Button    }

              variant={activeTab === 'hot' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('hot')}

              className="gap-2"

            >    try {

              <TrendingUp className="h-4 w-4" />

              Hot      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;      const response = await fetch(`/api/feed?${params.toString()}`);  useEffect(() => {  const router = useRouter();  const router = useRouter();

            </Button>

            <Button      const response = await fetch(endpoint, { method: 'POST' });

              variant={activeTab === 'following' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('following')}      const data = await response.json();      const data = await response.json();

              className="gap-2"

              disabled={!session}

            >

              <Users className="h-4 w-4" />      if (!response.ok) {    const tabParam = searchParams.get('tab') as Tab;

              Following

            </Button>        throw new Error(data.error || 'Failed to like');

            {topic && activeTab === 'topic' && (

              <Button variant="default" className="gap-2">      }      if (!response.ok) {

                <Hash className="h-4 w-4" />

                {topic}

              </Button>

            )}      setFeedItems((prev) =>        throw new Error(data.error || 'Failed to fetch feed');    const topicParam = searchParams.get('topic');  const searchParams = useSearchParams();  const searchParams = useSearchParams();

          </div>

        </div>        prev.map((item) => {

      </div>

          if (type === 'POST' && item.post?.id === itemId) {      }

      <div className="container mx-auto px-4 py-8">

        {isLoading ? (            return {

          <div className="flex justify-center items-center py-12">

            <Loader2 className="h-8 w-8 animate-spin text-primary" />              ...item,    

          </div>

        ) : feedItems.length === 0 ? (              hasLiked: data.liked,

          <div className="text-center py-12">

            <p className="text-muted-foreground text-lg mb-4">              post: {      if (append) {

              {activeTab === 'following'

                ? 'No posts from people you follow yet. Start following some users!'                ...item.post!,

                : activeTab === 'topic'

                ? `No posts found for #${topic}`                likeCount: data.likeCount,        setFeedItems((prev) => [...prev, ...data.feedItems]);    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {  const { toast } = useToast();  const { toast } = useToast();

                : 'No posts yet. Be the first to create one!'}

            </p>              },

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>            };      } else {

                Create First Post

              </Button>          }

            )}

          </div>          if (type === 'REFLECTION' && item.reflection?.id === itemId) {        setFeedItems(data.feedItems);      setActiveTab(tabParam);

        ) : (

          <div className="max-w-3xl mx-auto space-y-6">            return {

            {feedItems.map((item) => (

              <FeedItem              ...item,      }

                key={item.id}

                item={item}              hasLiked: data.liked,

                onLike={handleLike}

                onComment={handleComment}              reflection: {    }  const [categories, setCategories] = useState<Category[]>([])

                onSave={handleSave}

                onShare={handleShare}                ...item.reflection!,

                currentUserId={session?.user?.id}

              />                likeCount: data.likeCount,      setHasMore(data.pagination.hasMore);

            ))}

              },

            {hasMore && (

              <div className="flex justify-center py-8">            };      setPage(pageNum);    

                <Button

                  variant="outline"          }

                  onClick={handleLoadMore}

                  disabled={isLoadingMore}          return item;    } catch (error: any) {

                >

                  {isLoadingMore ? (        })

                    <>

                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />      );      console.error('Error fetching feed:', error);    if (topicParam) {  // State  const [topics, setTopics] = useState<Topic[]>([])

                      Loading...

                    </>    } catch (error: any) {

                  ) : (

                    'Load More'      console.error('Error liking:', error);      toast({

                  )}

                </Button>      toast({

              </div>

            )}        title: 'Error',        title: 'Error',      setTopic(topicParam);

          </div>

        )}        description: error.message || 'Failed to like',

      </div>

        variant: 'destructive',        description: error.message || 'Failed to load feed',

      <CreatePostModal

        open={isCreateModalOpen}      });

        onOpenChange={setIsCreateModalOpen}

        onSuccess={() => {    }        variant: 'destructive',      setActiveTab('topic');  const [activeTab, setActiveTab] = useState<Tab>('hot');  const [stats, setStats] = useState<Stats>({ totalTopics: 0, totalPosts: 0, activeUsers: 0 })

          setFeedItems([]);

          setPage(1);  };

          fetchFeed(1, false);

        }}      });

      />

    </div>  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {

  );

}    const item = feedItems.find((i) =>    } finally {    }


      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );      setIsLoading(false);



    if (item) {      setIsLoadingMore(false);  }, [searchParams]);  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);  const [loading, setLoading] = useState(true)

      const url = type === 'POST'

        ? `/posts/${item.post!.slug}`    }

        : `/reflections/${itemId}`;

      router.push(url);  };

    }

  };



  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {  useEffect(() => {  // Fetch feed data  const [isLoading, setIsLoading] = useState(true);

    toast({

      title: 'Coming Soon',    setFeedItems([]);

      description: 'Collections feature is coming soon!',

    });    setPage(1);  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {

  };

    setHasMore(true);

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>    fetchFeed(1, false);    try {  const [isLoadingMore, setIsLoadingMore] = useState(false);  useEffect(() => {

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );  }, [activeTab, topic]);



    if (item) {      if (pageNum === 1) {

      const url = type === 'POST'

        ? `${window.location.origin}/posts/${item.post!.slug}`  const handleTabChange = (tab: Tab) => {

        : `${window.location.origin}/reflections/${itemId}`;

    setActiveTab(tab);        setIsLoading(true);  const [page, setPage] = useState(1);    fetchCommunityData()

      try {

        await navigator.clipboard.writeText(url);    const params = new URLSearchParams();

        toast({

          title: 'Link copied!',    params.set('tab', tab);      } else {

          description: 'Share link copied to clipboard',

        });    if (tab === 'topic' && topic) {

      } catch (error) {

        toast({      params.set('topic', topic);        setIsLoadingMore(true);  const [hasMore, setHasMore] = useState(true);  }, [])

          title: 'Error',

          description: 'Failed to copy link',    }

          variant: 'destructive',

        });    router.push(`/community?${params.toString()}`);      }

      }

    }  };

  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLoadMore = () => {

    if (!isLoadingMore && hasMore) {  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {

      fetchFeed(page + 1, true);

    }    if (!session) {      const params = new URLSearchParams({

  };

      toast({

  return (

    <div className="min-h-screen bg-background">        title: 'Sign in required',        page: pageNum.toString(),  const [topic, setTopic] = useState<string | null>(null);  const fetchCommunityData = async () => {

      <div className="border-b bg-card sticky top-0 z-10">

        <div className="container mx-auto px-4 py-4">        description: 'Please sign in to like content',

          <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold">Community</h1>        variant: 'destructive',        limit: '20',

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>      });

                <Plus className="mr-2 h-4 w-4" />

                Create Post      return;        tab: activeTab,    try {

              </Button>

            )}    }

          </div>

      });

          <div className="flex gap-4 mt-4">

            <Button    try {

              variant={activeTab === 'hot' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('hot')}      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;  // Read initial state from URL      const [communityRes, topicsRes] = await Promise.all([

              className="gap-2"

            >      const response = await fetch(endpoint, { method: 'POST' });

              <TrendingUp className="h-4 w-4" />

              Hot      const data = await response.json();      if (activeTab === 'topic' && topic) {

            </Button>

            <Button

              variant={activeTab === 'following' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('following')}      if (!response.ok) {        params.append('topic', topic);  useEffect(() => {        fetch('/api/community'),

              className="gap-2"

              disabled={!session}        throw new Error(data.error || 'Failed to like');

            >

              <Users className="h-4 w-4" />      }      }

              Following

            </Button>

            {topic && activeTab === 'topic' && (

              <Button variant="default" className="gap-2">      setFeedItems((prev) =>    const tabParam = searchParams.get('tab') as Tab;        fetch('/api/community/topics?limit=5'),

                <Hash className="h-4 w-4" />

                {topic}        prev.map((item) => {

              </Button>

            )}          if (type === 'POST' && item.post?.id === itemId) {      const response = await fetch(`/api/feed?${params.toString()}`);

          </div>

        </div>            return {

      </div>

              ...item,      const data = await response.json();    const topicParam = searchParams.get('topic');      ])

      <div className="container mx-auto px-4 py-8">

        {isLoading ? (              hasLiked: data.liked,

          <div className="flex justify-center items-center py-12">

            <Loader2 className="h-8 w-8 animate-spin text-primary" />              post: {

          </div>

        ) : feedItems.length === 0 ? (                ...item.post!,

          <div className="text-center py-12">

            <p className="text-muted-foreground text-lg mb-4">                likeCount: data.likeCount,      if (!response.ok) {          

              {activeTab === 'following'

                ? 'No posts from people you follow yet. Start following some users!'              },

                : activeTab === 'topic'

                ? `No posts found for #${topic}`            };        throw new Error(data.error || 'Failed to fetch feed');

                : 'No posts yet. Be the first to create one!'}

            </p>          }

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>          if (type === 'REFLECTION' && item.reflection?.id === itemId) {      }    if (tabParam && ['hot', 'following', 'topic'].includes(tabParam)) {      const communityData = await communityRes.json()

                Create First Post

              </Button>            return {

            )}

          </div>              ...item,

        ) : (

          <div className="max-w-3xl mx-auto space-y-6">              hasLiked: data.liked,

            {feedItems.map((item) => (

              <FeedItem              reflection: {      if (append) {      setActiveTab(tabParam);      const topicsData = await topicsRes.json()

                key={item.id}

                item={item}                ...item.reflection!,

                onLike={handleLike}

                onComment={handleComment}                likeCount: data.likeCount,        setFeedItems((prev) => [...prev, ...data.feedItems]);

                onSave={handleSave}

                onShare={handleShare}              },

                currentUserId={session?.user?.id}

              />            };      } else {    }      

            ))}

          }

            {hasMore && (

              <div className="flex justify-center py-8">          return item;        setFeedItems(data.feedItems);

                <Button

                  variant="outline"        })

                  onClick={handleLoadMore}

                  disabled={isLoadingMore}      );      }          setCategories(communityData.categories || [])

                >

                  {isLoadingMore ? (    } catch (error: any) {

                    <>

                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />      console.error('Error liking:', error);

                      Loading...

                    </>      toast({

                  ) : (

                    'Load More'        title: 'Error',      setHasMore(data.pagination.hasMore);    if (topicParam) {      setStats(communityData.stats || { totalTopics: 0, totalPosts: 0, activeUsers: 0 })

                  )}

                </Button>        description: error.message || 'Failed to like',

              </div>

            )}        variant: 'destructive',      setPage(pageNum);

          </div>

        )}      });

      </div>

    }    } catch (error: any) {      setTopic(topicParam);      setTopics(topicsData.topics || [])

      <CreatePostModal

        open={isCreateModalOpen}  };

        onOpenChange={setIsCreateModalOpen}

        onSuccess={() => {      console.error('Error fetching feed:', error);

          setFeedItems([]);

          setPage(1);  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {

          fetchFeed(1, false);

        }}    const item = feedItems.find((i) =>      toast({      setActiveTab('topic');    } catch (error) {

      />

    </div>      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

  );

}    );        title: 'Error',




    if (item) {        description: error.message || 'Failed to load feed',    }      console.error('Error fetching community data:', error)

      const url = type === 'POST'

        ? `/posts/${item.post!.slug}`        variant: 'destructive',

        : `/reflections/${itemId}`;

      router.push(url);      });  }, [searchParams]);      // Fallback to empty arrays if API fails

    }

  };    } finally {



  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {      setIsLoading(false);      setCategories([])

    toast({

      title: 'Coming Soon',      setIsLoadingMore(false);

      description: 'Collections feature is coming soon!',

    });    }  // Fetch feed data      setTopics([])

  };

  };

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {    } finally {

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );  // Refresh feed when tab or topic changes



    if (item) {  useEffect(() => {    try {      setLoading(false)

      const url = type === 'POST'

        ? `${window.location.origin}/posts/${item.post!.slug}`    setFeedItems([]);

        : `${window.location.origin}/reflections/${itemId}`;

    setPage(1);      if (pageNum === 1) {    }

      try {

        await navigator.clipboard.writeText(url);    setHasMore(true);

        toast({

          title: 'Link copied!',    fetchFeed(1, false);        setIsLoading(true);  }

          description: 'Share link copied to clipboard',

        });  }, [activeTab, topic]);

      } catch (error) {

        toast({      } else {

          title: 'Error',

          description: 'Failed to copy link',  // Handle tab change

          variant: 'destructive',

        });  const handleTabChange = (tab: Tab) => {        setIsLoadingMore(true);  if (loading) {

      }

    }    setActiveTab(tab);

  };

    const params = new URLSearchParams();      }    return (

  const handleLoadMore = () => {

    if (!isLoadingMore && hasMore) {    params.set('tab', tab);

      fetchFeed(page + 1, true);

    }    if (tab === 'topic' && topic) {      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">

  };

      params.set('topic', topic);

  return (

    <div className="min-h-screen bg-background">    }      const params = new URLSearchParams({        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>

      <div className="border-b bg-card sticky top-0 z-10">

        <div className="container mx-auto px-4 py-4">    router.push(`/community?${params.toString()}`);

          <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold">Community</h1>  };        page: pageNum.toString(),      </div>

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>

                <Plus className="mr-2 h-4 w-4" />

                Create Post  // Handle like        limit: '20',    )

              </Button>

            )}  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {

          </div>

    if (!session) {        tab: activeTab,  }

          <div className="flex gap-4 mt-4">

            <Button      toast({

              variant={activeTab === 'hot' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('hot')}        title: 'Sign in required',      });

              className="gap-2"

            >        description: 'Please sign in to like content',

              <TrendingUp className="h-4 w-4" />

              Hot        variant: 'destructive',  return (

            </Button>

            <Button      });

              variant={activeTab === 'following' ? 'default' : 'ghost'}

              onClick={() => handleTabChange('following')}      return;      if (activeTab === 'topic' && topic) {    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">

              className="gap-2"

              disabled={!session}    }

            >

              <Users className="h-4 w-4" />        params.append('topic', topic);      {/* Animated Background */}

              Following

            </Button>    try {

            {topic && activeTab === 'topic' && (

              <Button variant="default" className="gap-2">      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;      }      <div className="fixed inset-0 overflow-hidden pointer-events-none">

                <Hash className="h-4 w-4" />

                {topic}      const response = await fetch(endpoint, { method: 'POST' });

              </Button>

            )}      const data = await response.json();        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />

          </div>

        </div>

      </div>

      if (!response.ok) {      const response = await fetch(`/api/feed?${params.toString()}`);        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 py-8">

        {isLoading ? (        throw new Error(data.error || 'Failed to like');

          <div className="flex justify-center items-center py-12">

            <Loader2 className="h-8 w-8 animate-spin text-primary" />      }      const data = await response.json();      </div>

          </div>

        ) : feedItems.length === 0 ? (

          <div className="text-center py-12">

            <p className="text-muted-foreground text-lg mb-4">      // Update local state

              {activeTab === 'following'

                ? 'No posts from people you follow yet. Start following some users!'      setFeedItems((prev) =>

                : activeTab === 'topic'

                ? `No posts found for #${topic}`        prev.map((item) => {      if (!response.ok) {      {/* Navigation */}

                : 'No posts yet. Be the first to create one!'}

            </p>          if (type === 'POST' && item.post?.id === itemId) {

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>            return {        throw new Error(data.error || 'Failed to fetch feed');      <nav className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">

                Create First Post

              </Button>              ...item,

            )}

          </div>              hasLiked: data.liked,      }        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        ) : (

          <div className="max-w-3xl mx-auto space-y-6">              post: {

            {feedItems.map((item) => (

              <FeedItem                ...item.post!,          <div className="flex justify-between items-center h-16">

                key={item.id}

                item={item}                likeCount: data.likeCount,

                onLike={handleLike}

                onComment={handleComment}              },      if (append) {            <Link href="/" className="flex items-center space-x-2 group">

                onSave={handleSave}

                onShare={handleShare}            };

                currentUserId={session?.user?.id}

              />          }        setFeedItems((prev) => [...prev, ...data.feedItems]);              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">

            ))}

          if (type === 'REFLECTION' && item.reflection?.id === itemId) {

            {hasMore && (

              <div className="flex justify-center py-8">            return {      } else {                <span className="text-white font-bold text-xl">DB</span>

                <Button

                  variant="outline"              ...item,

                  onClick={handleLoadMore}

                  disabled={isLoadingMore}              hasLiked: data.liked,        setFeedItems(data.feedItems);              </div>

                >

                  {isLoadingMore ? (              reflection: {

                    <>

                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />                ...item.reflection!,      }              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">

                      Loading...

                    </>                likeCount: data.likeCount,

                  ) : (

                    'Load More'              },                Dynasty Built Academy

                  )}

                </Button>            };

              </div>

            )}          }      setHasMore(data.pagination.hasMore);              </span>

          </div>

        )}          return item;

      </div>

        })      setPage(pageNum);            </Link>

      <CreatePostModal

        open={isCreateModalOpen}      );

        onOpenChange={setIsCreateModalOpen}

        onSuccess={() => {    } catch (error: any) {    } catch (error: any) {            

          setFeedItems([]);

          setPage(1);      console.error('Error liking:', error);

          fetchFeed(1, false);

        }}      toast({      console.error('Error fetching feed:', error);            <div className="flex items-center space-x-4">

      />

    </div>        title: 'Error',

  );

}        description: error.message || 'Failed to like',      toast({              <Link href="/dashboard">


        variant: 'destructive',

      });        title: 'Error',                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Dashboard</Button>

    }

  };        description: error.message || 'Failed to load feed',              </Link>



  // Handle comment (navigate to detail page)        variant: 'destructive',              {status === 'authenticated' ? (

  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>      });                <Link href="/community/new">

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );    } finally {                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">



    if (item) {      setIsLoading(false);                    + Start Discussion

      const url = type === 'POST'

        ? `/posts/${item.post!.slug}`      setIsLoadingMore(false);                  </Button>

        : `/reflections/${itemId}`;

      router.push(url);    }                </Link>

    }

  };  };              ) : (



  // Handle save (TODO: Implement collections)                <Link href="/login">

  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    toast({  // Refresh feed when tab or topic changes                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">Sign In</Button>

      title: 'Coming Soon',

      description: 'Collections feature is coming soon!',  useEffect(() => {                </Link>

    });

  };    setFeedItems([]);              )}



  // Handle share    setPage(1);            </div>

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    const item = feedItems.find((i) =>    setHasMore(true);          </div>

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId

    );    fetchFeed(1, false);        </div>



    if (item) {  }, [activeTab, topic]);      </nav>

      const url = type === 'POST'

        ? `${window.location.origin}/posts/${item.post!.slug}`

        : `${window.location.origin}/reflections/${itemId}`;

  // Handle tab change      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

      try {

        await navigator.clipboard.writeText(url);  const handleTabChange = (tab: Tab) => {        {/* Hero Header */}

        toast({

          title: 'Link copied!',    setActiveTab(tab);        <div className="text-center mb-12">

          description: 'Share link copied to clipboard',

        });    const params = new URLSearchParams();          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-green-900/50 border border-purple-500/30 rounded-full backdrop-blur-sm mb-6">

      } catch (error) {

        toast({    params.set('tab', tab);            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>

          title: 'Error',

          description: 'Failed to copy link',    if (tab === 'topic' && topic) {            <span className="text-sm text-purple-200 font-medium">{stats.activeUsers} members online</span>

          variant: 'destructive',

        });      params.set('topic', topic);          </div>

      }

    }    }

  };

    router.push(`/community?${params.toString()}`);          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-green-200 mb-4">

  // Load more

  const handleLoadMore = () => {  };            Dynasty Community 🌟

    if (!isLoadingMore && hasMore) {

      fetchFeed(page + 1, true);          </h1>

    }

  };  // Handle like          <p className="text-xl text-gray-300 max-w-2xl mx-auto">



  return (  const handleLike = async (itemId: string, type: 'POST' | 'REFLECTION') => {            Connect with fellow learners, share ideas, and grow together

    <div className="min-h-screen bg-background">

      {/* Header */}    if (!session) {          </p>

      <div className="border-b bg-card sticky top-0 z-10">

        <div className="container mx-auto px-4 py-4">      toast({

          <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold">Community</h1>        title: 'Sign in required',          {/* Stats */}

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>        description: 'Please sign in to like content',          <div className="flex items-center justify-center gap-8 mt-8">

                <Plus className="mr-2 h-4 w-4" />

                Create Post        variant: 'destructive',            <div className="text-center">

              </Button>

            )}      });              <div className="text-3xl font-bold text-purple-400">{stats.totalTopics}</div>

          </div>

      return;              <div className="text-sm text-gray-400">Discussions</div>

          {/* Tabs */}

          <div className="flex gap-4 mt-4">    }            </div>

            <Button

              variant={activeTab === 'hot' ? 'default' : 'ghost'}            <div className="h-12 w-px bg-purple-500/30"></div>

              onClick={() => handleTabChange('hot')}

              className="gap-2"    try {            <div className="text-center">

            >

              <TrendingUp className="h-4 w-4" />      const endpoint = type === 'POST' ? `/api/posts/${itemId}/like` : `/api/reflections/${itemId}/like`;              <div className="text-3xl font-bold text-green-400">{stats.totalPosts}</div>

              Hot

            </Button>      const response = await fetch(endpoint, { method: 'POST' });              <div className="text-sm text-gray-400">Posts</div>

            <Button

              variant={activeTab === 'following' ? 'default' : 'ghost'}      const data = await response.json();            </div>

              onClick={() => handleTabChange('following')}

              className="gap-2"            <div className="h-12 w-px bg-purple-500/30"></div>

              disabled={!session}

            >      if (!response.ok) {            <div className="text-center">

              <Users className="h-4 w-4" />

              Following        throw new Error(data.error || 'Failed to like');              <div className="text-3xl font-bold text-blue-400">{stats.activeUsers}</div>

            </Button>

            {topic && activeTab === 'topic' && (      }              <div className="text-sm text-gray-400">Active Users</div>

              <Button variant="default" className="gap-2">

                <Hash className="h-4 w-4" />            </div>

                {topic}

              </Button>      // Update local state          </div>

            )}

          </div>      setFeedItems((prev) =>        </div>

        </div>

      </div>        prev.map((item) => {



      {/* Feed Content */}          if (type === 'POST' && item.post?.id === itemId) {        {/* Categories Grid */}

      <div className="container mx-auto px-4 py-8">

        {isLoading ? (            return {        <div className="mb-12">

          <div className="flex justify-center items-center py-12">

            <Loader2 className="h-8 w-8 animate-spin text-primary" />              ...item,          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">

          </div>

        ) : feedItems.length === 0 ? (              hasLiked: data.liked,            <span className="text-3xl">📂</span>

          <div className="text-center py-12">

            <p className="text-muted-foreground text-lg mb-4">              post: {            Categories

              {activeTab === 'following'

                ? 'No posts from people you follow yet. Start following some users!'                ...item.post!,          </h2>

                : activeTab === 'topic'

                ? `No posts found for #${topic}`                likeCount: data.likeCount,          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                : 'No posts yet. Be the first to create one!'}

            </p>              },            {categories.map((category) => (

            {session && (

              <Button onClick={() => setIsCreateModalOpen(true)}>            };              <Link key={category.id} href={`/community/category/${category.slug}`}>

                Create First Post

              </Button>          }                <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden">

            )}

          </div>          if (type === 'REFLECTION' && item.reflection?.id === itemId) {                  {/* Animated Border */}

        ) : (

          <div className="max-w-3xl mx-auto space-y-6">            return {                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">

            {feedItems.map((item) => (

              <FeedItem              ...item,                    <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-sm animate-pulse" />

                key={item.id}

                item={item}              hasLiked: data.liked,                  </div>

                onLike={handleLike}

                onComment={handleComment}              reflection: {

                onSave={handleSave}

                onShare={handleShare}                ...item.reflection!,                  <div className="relative z-10">

                currentUserId={session?.user?.id}

              />                likeCount: data.likeCount,                    <div className="flex items-start justify-between mb-4">

            ))}

              },                      <div 

            {/* Load More */}

            {hasMore && (            };                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-xl"

              <div className="flex justify-center py-8">

                <Button          }                        style={{ backgroundColor: `${category.color}20` }}

                  variant="outline"

                  onClick={handleLoadMore}          return item;                      >

                  disabled={isLoadingMore}

                >        })                        {category.icon}

                  {isLoadingMore ? (

                    <>      );                      </div>

                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Loading...    } catch (error: any) {                      <div className="text-right">

                    </>

                  ) : (      console.error('Error liking:', error);                        <div className="text-2xl font-bold text-white">{category.topicCount}</div>

                    'Load More'

                  )}      toast({                        <div className="text-xs text-gray-400">Topics</div>

                </Button>

              </div>        title: 'Error',                      </div>

            )}

          </div>        description: error.message || 'Failed to like',                    </div>

        )}

      </div>        variant: 'destructive',                    



      {/* Create Post Modal */}      });                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all">

      <CreatePostModal

        open={isCreateModalOpen}    }                      {category.name}

        onOpenChange={setIsCreateModalOpen}

        onSuccess={() => {  };                    </h3>

          // Refresh feed

          setFeedItems([]);                    

          setPage(1);

          fetchFeed(1, false);  // Handle comment (navigate to detail page)                    <div className="flex items-center gap-4 text-sm text-gray-400">

        }}

      />  const handleComment = (itemId: string, type: 'POST' | 'REFLECTION') => {                      <span className="flex items-center gap-1">

    </div>

  );    const item = feedItems.find((i) =>                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

}

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />

    );                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />

                        </svg>

    if (item) {                        {category.postCount} posts

      const url = type === 'POST'                      </span>

        ? `/posts/${item.post!.slug}`                    </div>

        : `/reflections/${itemId}`;                  </div>

      router.push(url);                </div>

    }              </Link>

  };            ))}

          </div>

  // Handle save (TODO: Implement collections)        </div>

  const handleSave = async (itemId: string, type: 'POST' | 'REFLECTION') => {

    toast({        {/* Recent Topics */}

      title: 'Coming Soon',        <div>

      description: 'Collections feature is coming soon!',          <div className="flex items-center justify-between mb-6">

    });            <h2 className="text-2xl font-bold text-white flex items-center gap-3">

  };              <span className="text-3xl">🔥</span>

              Recent Discussions

  // Handle share            </h2>

  const handleShare = async (itemId: string, type: 'POST' | 'REFLECTION') => {            <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm">

    const item = feedItems.find((i) =>              <option>Latest Activity</option>

      type === 'POST' ? i.post?.id === itemId : i.reflection?.id === itemId              <option>Most Replies</option>

    );              <option>Most Liked</option>

              <option>Trending</option>

    if (item) {            </select>

      const url = type === 'POST'          </div>

        ? `${window.location.origin}/posts/${item.post!.slug}`

        : `${window.location.origin}/reflections/${itemId}`;          <div className="space-y-4">

            {topics.map((topic) => (

      try {              <Link key={topic.id} href={`/community/topic/${topic.slug}`}>

        await navigator.clipboard.writeText(url);                <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20">

        toast({                  <div className="flex items-start gap-4">

          title: 'Link copied!',                    {/* Avatar */}

          description: 'Share link copied to clipboard',                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">

        });                      {topic.author.name?.charAt(0) || 'U'}

      } catch (error) {                    </div>

        toast({

          title: 'Error',                    {/* Content */}

          description: 'Failed to copy link',                    <div className="flex-1">

          variant: 'destructive',                      <div className="flex items-center gap-2 mb-2">

        });                        {topic.isPinned && (

      }                          <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold">📌 Pinned</span>

    }                        )}

  };                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">{topic.category.name}</span>

                      </div>

  // Load more                      

  const handleLoadMore = () => {                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">

    if (!isLoadingMore && hasMore) {                        {topic.title}

      fetchFeed(page + 1, true);                      </h3>

    }                      

  };                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{topic.content}</p>

                      

  return (                      <div className="flex items-center gap-6 text-sm text-gray-400">

    <div className="min-h-screen bg-background">                        <span className="flex items-center gap-1">

      {/* Header */}                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">

      <div className="border-b bg-card sticky top-0 z-10">                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

        <div className="container mx-auto px-4 py-4">                          </svg>

          <div className="flex items-center justify-between">                          {topic.replies} replies

            <h1 className="text-3xl font-bold">Community</h1>                        </span>

            {session && (                        <span className="flex items-center gap-1">

              <Button onClick={() => setIsCreateModalOpen(true)}>                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                <Plus className="mr-2 h-4 w-4" />                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

                Create Post                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />

              </Button>                          </svg>

            )}                          {topic.views} views

          </div>                        </span>

                        <span className="flex items-center gap-1">

          {/* Tabs */}                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

          <div className="flex gap-4 mt-4">                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />

            <Button                          </svg>

              variant={activeTab === 'hot' ? 'default' : 'ghost'}                          {topic.likes}

              onClick={() => handleTabChange('hot')}                        </span>

              className="gap-2"                        <span className="ml-auto text-xs">{new Date(topic.createdAt).toLocaleDateString()}</span>

            >                      </div>

              <TrendingUp className="h-4 w-4" />                    </div>

              Hot                  </div>

            </Button>                </div>

            <Button              </Link>

              variant={activeTab === 'following' ? 'default' : 'ghost'}            ))}

              onClick={() => handleTabChange('following')}          </div>

              className="gap-2"

              disabled={!session}          {/* Empty State */}

            >          {topics.length === 0 && (

              <Users className="h-4 w-4" />            <div className="text-center py-20">

              Following              <div className="text-6xl mb-4">💬</div>

            </Button>              <h3 className="text-2xl font-bold text-white mb-2">No discussions yet</h3>

            {topic && activeTab === 'topic' && (              <p className="text-gray-400 mb-6">Be the first to start a conversation!</p>

              <Button variant="default" className="gap-2">              {status === 'authenticated' && (

                <Hash className="h-4 w-4" />                <Link href="/community/new">

                {topic}                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Start First Discussion</Button>

              </Button>                </Link>

            )}              )}

          </div>            </div>

        </div>          )}

      </div>        </div>

      </div>

      {/* Feed Content */}    </div>

      <div className="container mx-auto px-4 py-8">  )

        {isLoading ? (}

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

            {/* Load More */}
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

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // Refresh feed
          setFeedItems([]);
          setPage(1);
          fetchFeed(1, false);
        }}
      />
    </div>
  );
}
