"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import AchievementsTab from "./AchievementsTab";
import ActivityTab from "./ActivityTab";

interface ProfileTabsProps {
  username: string;
  userId: string;
  isOwner: boolean;
}

export default function ProfileTabs({
  username,
  userId,
  isOwner,
}: ProfileTabsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="overview"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="posts"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="reflections"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Reflections
          </TabsTrigger>
          <TabsTrigger 
            value="collections"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger 
            value="achievements"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab userId={userId} username={username} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Posts tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reflections" className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Reflections tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Collections tab coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <AchievementsTab userId={userId} username={username} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityTab userId={userId} username={username} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
