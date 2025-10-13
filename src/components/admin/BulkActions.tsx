"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  X,
  DollarSign,
  Tag,
  Star,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedBooks: string[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedBooks,
  onActionComplete,
  onClearSelection,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");

  const performBulkAction = async (
    action: string,
    data?: Record<string, any>
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/books/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          bookIds: selectedBooks,
          data,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(result.message || "Bulk action completed!");
        onActionComplete();
        onClearSelection();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to perform bulk action");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePriceUpdate = () => {
    if (!bulkPrice || parseFloat(bulkPrice) < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    performBulkAction("updatePrice", { price: parseFloat(bulkPrice) });
    setShowPriceModal(false);
    setBulkPrice("");
  };

  const handleCategoryUpdate = () => {
    if (!bulkCategory) {
      toast.error("Please select a category");
      return;
    }
    performBulkAction("updateCategory", { category: bulkCategory });
    setShowCategoryModal(false);
    setBulkCategory("");
  };

  if (selectedBooks.length === 0) return null;

  return (
    <>
      <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
              <Check className="w-4 h-4" />
              {selectedBooks.length} selected
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPriceModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Update Price
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCategoryModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Change Category
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => performBulkAction("toggleFeatured")}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Toggle Featured
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => performBulkAction("publish")}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Publish
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => performBulkAction("unpublish")}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Unpublish
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      `Delete ${selectedBooks.length} books? This cannot be undone.`
                    )
                  ) {
                    performBulkAction("delete");
                  }
                }}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Update Price for {selectedBooks.length} Books
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    New Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="29.99"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPriceModal(false);
                      setBulkPrice("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePriceUpdate}>Update Price</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Update Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Change Category for {selectedBooks.length} Books
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    New Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Personal Development">
                      Personal Development
                    </option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setBulkCategory("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCategoryUpdate}>
                    Update Category
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
