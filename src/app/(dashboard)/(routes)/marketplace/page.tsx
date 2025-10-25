"use client";

/**
 * MARKETPLACE BROWSE
 *
 * Multi-product marketplace browser:
 * - Courses, PDFs, Audio, Workshops, Bundles
 * - Advanced filtering
 * - Search & recommendations
 * - Product cards with pricing
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  FileText,
  Headphones,
  Video,
  Calendar,
  Package,
  Star,
  TrendingUp,
  Download,
  ShoppingCart,
} from "lucide-react";

import {
  browseProducts,
  getProductRecommendations,
  type Product,
  type ProductType,
} from "@/lib/marketplace/product-catalog";

const PRODUCT_ICONS: Record<ProductType, any> = {
  course: Video,
  pdf: FileText,
  audio: Headphones,
  workshop: Calendar,
  subscription: TrendingUp,
  bundle: Package,
  download: Download,
};

const PRODUCT_COLORS: Record<ProductType, string> = {
  course: "bg-blue-100 text-blue-600",
  pdf: "bg-red-100 text-red-600",
  audio: "bg-purple-100 text-purple-600",
  workshop: "bg-green-100 text-green-600",
  subscription: "bg-yellow-100 text-yellow-600",
  bundle: "bg-pink-100 text-pink-600",
  download: "bg-gray-100 text-gray-600",
};

export default function MarketplaceBrowse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ProductType | "all">("all");
  const [sortBy, setSortBy] = useState<
    "popular" | "newest" | "price_low" | "price_high" | "rating"
  >("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts();
    loadRecommendations();
  }, [selectedType, sortBy, currentPage, searchQuery]);

  async function loadProducts() {
    try {
      setLoading(true);

      const { products: data, total } = await browseProducts({
        type: selectedType === "all" ? undefined : selectedType,
        search: searchQuery || undefined,
        sortBy,
        page: currentPage,
        limit: 12,
      });

      setProducts(data);
      setTotalProducts(total);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    try {
      const recs = await getProductRecommendations("user_123", 4);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">🛒 Dynasty Marketplace</h1>
        <p className="text-muted-foreground">
          Discover courses, guides, audio lessons, and more
        </p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recommended For You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as ProductType | "all")}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="course">📹 Courses</SelectItem>
                <SelectItem value="pdf">📄 PDF Guides</SelectItem>
                <SelectItem value="audio">🎧 Audio Lessons</SelectItem>
                <SelectItem value="workshop">📅 Workshops</SelectItem>
                <SelectItem value="subscription">📈 Subscriptions</SelectItem>
                <SelectItem value="bundle">📦 Bundles</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">🔥 Most Popular</SelectItem>
                <SelectItem value="newest">🆕 Newest</SelectItem>
                <SelectItem value="price_low">💰 Price: Low to High</SelectItem>
                <SelectItem value="price_high">
                  💎 Price: High to Low
                </SelectItem>
                <SelectItem value="rating">⭐ Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalProducts > 12 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalProducts / 12)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= Math.ceil(totalProducts / 12)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const Icon = PRODUCT_ICONS[product.type];
  const colorClass = PRODUCT_COLORS[product.type];
  const price = product.pricing.prices[0];

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Product Type Badge */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Badge className={colorClass}>
            <Icon className="h-3 w-3 mr-1" />
            {product.type}
          </Badge>
        </div>

        {/* Preview Image */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-32 flex items-center justify-center">
          <Icon className="h-16 w-16 text-purple-300" />
        </div>
      </div>

      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className={compact ? "text-sm" : "text-lg"}>
          {product.title}
        </CardTitle>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className={compact ? "pb-2" : ""}>
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            {product.stats.rating.toFixed(1)}
          </div>
          <div>{product.stats.totalSales} sales</div>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="text-2xl font-bold">${price.amount.toFixed(2)}</div>
          {product.pricing.discountPercentage && (
            <Badge variant="destructive">
              {product.pricing.discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Features (only in full card) */}
        {!compact && (
          <div className="mt-3 space-y-1">
            {price.features.slice(0, 3).map((feature, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <div className="w-1 h-1 bg-purple-500 rounded-full" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {compact ? "Buy" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
