'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Book,
  Star,
  Download,
  Clock,
  Target,
  Zap,
  Award,
  Flame,
} from 'lucide-react';

interface AnalyticsData {
  totalBooks: number;
  publishedBooks: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
  featuredBooks: number;
  revenueGrowth: number;
  viewsGrowth: number;
  topBooks: Array<{
    title: string;
    revenue: number;
    views: number;
    rating: number;
  }>;
  revenueByCategory: Record<string, number>;
  engagementRate: number;
}

export default function BookAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/books/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: 'Total Books',
      value: analytics.totalBooks,
      icon: Book,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      suffix: '',
      subtitle: `${analytics.publishedBooks} published`,
    },
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      suffix: '',
      growth: analytics.revenueGrowth,
      subtitle: `$${analytics.monthlyRevenue.toLocaleString()} this month`,
    },
    {
      title: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      suffix: '',
      growth: analytics.viewsGrowth,
      subtitle: 'All-time views',
    },
    {
      title: 'Average Rating',
      value: analytics.averageRating.toFixed(1),
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      suffix: '/5.0',
      subtitle: `${analytics.totalReviews} reviews`,
    },
    {
      title: 'Featured Books',
      value: analytics.featuredBooks,
      icon: Award,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      suffix: '',
      subtitle: 'Premium showcase',
    },
    {
      title: 'Engagement Rate',
      value: `${analytics.engagementRate}%`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      suffix: '',
      subtitle: 'Reader activity',
    },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4"
            style={{ borderLeftColor: stat.color.replace('text-', '#') }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                {stat.suffix && (
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.subtitle}
                </p>
                {stat.growth !== undefined && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      stat.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 mr-1 ${
                        stat.growth < 0 ? 'rotate-180' : ''
                      }`}
                    />
                    {Math.abs(stat.growth)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Books */}
      {analytics.topBooks.length > 0 && (
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Top Performing Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topBooks.slice(0, 5).map((book, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {book.title}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="w-3 h-3 mr-1" />
                          {book.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center text-xs text-amber-500">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${book.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Category */}
      {Object.keys(analytics.revenueByCategory).length > 0 && (
        <Card className="border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.revenueByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, revenue], index) => {
                  const maxRevenue = Math.max(
                    ...Object.values(analytics.revenueByCategory)
                  );
                  const percentage = (revenue / maxRevenue) * 100;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ${revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
