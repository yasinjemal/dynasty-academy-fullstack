'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileTabsProps {
  username: string;
  userId: string;
  isOwner: boolean;
}

export default function ProfileTabs({ username, userId, isOwner }: ProfileTabsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-8">
            {/* About Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold">About</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Profile overview coming soon...
              </p>
            </div>

            {/* Highlights - Posts */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold">Latest Posts</h3>
              <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
            </div>

            {/* Highlights - Reflections */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold">Latest Reflections</h3>
              <p className="text-gray-600 dark:text-gray-400">No reflections yet</p>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold">Achievements</h3>
              <p className="text-gray-600 dark:text-gray-400">No achievements yet</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Posts tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reflections">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Reflections tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Collections tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Achievements tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Activity tab coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
