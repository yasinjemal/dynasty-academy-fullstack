import { Suspense } from "react";
import { getHomepageData } from "@/lib/api/homepage-data";
import HomePageClient from "@/components/home/HomePageClient";

// Force dynamic to ensure fresh data
export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  // Fetch all homepage data in parallel on the server
  const data = await getHomepageData();

  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageClient data={data} />
    </Suspense>
  );
}

// Loading skeleton for the homepage
function HomePageLoading() {
  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="text-gray-400 animate-pulse">
          Loading Dynasty Academy...
        </p>
      </div>
    </div>
  );
}
