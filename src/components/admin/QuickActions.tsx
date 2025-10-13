'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Download,
  Share2,
  BarChart,
  Zap,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsProps {
  bookId: string;
  bookTitle: string;
  isFeatured: boolean;
  isPublished: boolean;
  onActionComplete: () => void;
}

export default function QuickActions({
  bookId,
  bookTitle,
  isFeatured,
  isPublished,
  onActionComplete,
}: QuickActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const performAction = async (action: string) => {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Action completed!');
        onActionComplete();
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setShowMenu(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/books/${bookId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setShowStats(true);
      }
    } catch (error) {
      toast.error('Failed to load stats');
    }
  };

  const actions = [
    {
      icon: Edit,
      label: 'Edit Book',
      action: 'edit',
      color: 'text-blue-500',
      onClick: () => (window.location.href = `/admin/books/${bookId}`),
    },
    {
      icon: Copy,
      label: 'Duplicate',
      action: 'duplicate',
      color: 'text-green-500',
      onClick: () => performAction('duplicate'),
    },
    {
      icon: isPublished ? EyeOff : Eye,
      label: isPublished ? 'Unpublish' : 'Publish',
      action: 'togglePublish',
      color: isPublished ? 'text-orange-500' : 'text-green-500',
      onClick: () => performAction('togglePublish'),
    },
    {
      icon: Star,
      label: isFeatured ? 'Unfeature' : 'Feature',
      action: 'toggleFeatured',
      color: 'text-amber-500',
      onClick: () => performAction('toggleFeatured'),
    },
    {
      icon: BarChart,
      label: 'View Stats',
      action: 'stats',
      color: 'text-purple-500',
      onClick: fetchStats,
    },
    {
      icon: BookOpen,
      label: 'View Public Page',
      action: 'view',
      color: 'text-indigo-500',
      onClick: () => window.open(`/books/${bookId}`, '_blank'),
    },
    {
      icon: Share2,
      label: 'Share Link',
      action: 'share',
      color: 'text-blue-500',
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/books/${bookId}`);
        toast.success('Link copied to clipboard!');
        setShowMenu(false);
      },
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: 'delete',
      color: 'text-red-500',
      onClick: () => {
        if (confirm(`Delete "${bookTitle}"? This cannot be undone.`)) {
          performAction('delete');
        }
        setShowMenu(false);
      },
    },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Quick Actions"
        >
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
              <div className="py-1">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats Modal */}
      {showStats && stats && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStats(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Book Statistics
              </h3>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Views
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.views?.toLocaleString() || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sales
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.sales?.toLocaleString() || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rating
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.rating?.toFixed(1) || '0.0'} ★
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.revenue?.toLocaleString() || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reviews
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.reviews || 0}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Conversion
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.conversionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
