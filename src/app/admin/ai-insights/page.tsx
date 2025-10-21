/**
 * 📊 AI INSIGHTS - ADMIN DASHBOARD
 *
 * View AI Coach analytics and insights
 *
 * Features:
 * - Conversation statistics
 * - Most asked questions
 * - Student confusion topics
 * - Sentiment analysis
 * - Usage trends
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import AiInsightsClient from "./AiInsightsClient";

export const metadata = {
  title: "AI Insights | Dynasty Academy",
  description: "AI Coach analytics and insights",
};

async function getInsights() {
  try {
    // Get top confusions
    const confusions = (await prisma.$queryRaw`
      SELECT 
        type,
        content as topic,
        frequency,
        'HIGH' as priority,
        NULL as resolution,
        created_at as last_seen
      FROM ai_insights
      WHERE type = 'CONFUSION'
      ORDER BY frequency DESC
      LIMIT 20
    `) as any[];

    // Get FAQs
    const faqs = (await prisma.$queryRaw`
      SELECT 
        type,
        content as topic,
        frequency,
        created_at as last_seen
      FROM ai_insights
      WHERE type = 'FAQ'
      ORDER BY frequency DESC
      LIMIT 20
    `) as any[];

    // Get conversation stats
    const stats = (await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_conversations,
        SUM(message_count) as total_messages,
        AVG(message_count) as avg_messages_per_conversation,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(total_cost) as avg_cost_per_conversation
      FROM ai_conversations
    `) as any[];

    // Get recent activity
    const recentActivity = (await prisma.$queryRaw`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as conversations,
        SUM(message_count) as messages
      FROM ai_conversations
      WHERE updated_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(updated_at)
      ORDER BY date DESC
    `) as any[];

    return {
      confusions,
      faqs,
      stats: stats[0] || {},
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to get AI insights:", error);
    return {
      confusions: [],
      faqs: [],
      stats: {},
      recentActivity: [],
    };
  }
}

export default async function AiInsightsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get data
  const insights = await getInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 AI Insights</h1>
          <p className="text-gray-400">
            AI Coach analytics and student insights
          </p>
        </div>

        {/* Client Component with data */}
        <AiInsightsClient insights={insights} />
      </div>
    </div>
  );
}
