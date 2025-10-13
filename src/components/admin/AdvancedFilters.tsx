'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  TrendingUp,
  Eye,
  Filter,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: BookFilters) => void;
  activeFilters: BookFilters;
}

export interface BookFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean | null;
  published?: boolean | null;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'views' | 'revenue';
}

export default function AdvancedFilters({
  onFilterChange,
  activeFilters,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<BookFilters>(activeFilters);

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters: BookFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const updateFilter = (key: keyof BookFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof BookFilters] !== undefined && localFilters[key as keyof BookFilters] !== ''
  ).length;

  return (
    <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
            {activeFilterCount > 0 && (
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Search and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Search Books
                </Label>
                <Input
                  placeholder="Title, author, ISBN..."
                  value={localFilters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2 block">Category</Label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={localFilters.category || ''}
                  onChange={(e) => updateFilter('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Personal Development">Personal Development</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Price Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={localFilters.minPrice || ''}
                  onChange={(e) =>
                    updateFilter('minPrice', parseFloat(e.target.value) || undefined)
                  }
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) =>
                    updateFilter('maxPrice', parseFloat(e.target.value) || undefined)
                  }
                />
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <Label className="mb-3 block">Status</Label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.featured === true}
                    onChange={(e) =>
                      updateFilter('featured', e.target.checked ? true : null)
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium">⭐ Featured Only</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.published === true}
                    onChange={(e) =>
                      updateFilter('published', e.target.checked ? true : null)
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium">✓ Published Only</span>
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Minimum Rating
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      updateFilter(
                        'minRating',
                        localFilters.minRating === rating ? undefined : rating
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      localFilters.minRating === rating
                        ? 'bg-amber-500 text-white scale-110'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {rating}★+
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <Label className="mb-2 block">Sort By</Label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={localFilters.sortBy || 'newest'}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as BookFilters['sortBy'])
                }
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="views">Most Views</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={applyFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
