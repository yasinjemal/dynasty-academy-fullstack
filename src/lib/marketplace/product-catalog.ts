/**
 * DYNASTY PRODUCT CATALOG
 *
 * Multi-product marketplace supporting:
 * - Video courses (existing)
 * - PDF guides & eBooks
 * - Audio lessons & podcasts
 * - Live workshops
 * - Subscriptions & bundles
 * - Digital downloads
 *
 * Features:
 * - Dynamic pricing (one-time, subscription, tiered)
 * - Product bundles & upsells
 * - Licensing (personal, commercial, enterprise)
 * - Version control (v1, v2, updates)
 * - Preview/sample content
 */

export type ProductType =
  | "course" // Video course
  | "pdf" // PDF guide/eBook
  | "audio" // Audio lesson/podcast
  | "workshop" // Live workshop
  | "subscription" // Monthly/yearly access
  | "bundle" // Multiple products
  | "download"; // Generic digital file

export type PricingModel =
  | "one_time" // Pay once, own forever
  | "subscription" // Recurring payment
  | "tiered" // Different access levels
  | "pay_what_you_want"; // User decides

export type LicenseType =
  | "personal" // Individual use
  | "commercial" // Business use
  | "enterprise"; // Unlimited use

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  description: string;
  instructorId: string;

  // Pricing
  pricing: {
    model: PricingModel;
    currency: "USD";
    prices: {
      amount: number;
      label: string; // "Basic", "Pro", "Lifetime"
      features: string[]; // What's included
      license: LicenseType;
    }[];
    discountPercentage?: number; // Limited-time discount
  };

  // Content
  content: {
    fileUrl?: string; // PDF, audio file, etc.
    duration?: number; // Minutes (audio/video)
    pageCount?: number; // PDF pages
    fileSize?: number; // Bytes
    format?: string; // "PDF", "MP3", "MP4"
    previewUrl?: string; // Sample/trailer
  };

  // Metadata
  tags: string[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  version: string; // "1.0", "2.0"

  // Stats
  stats: {
    totalSales: number;
    revenue: number;
    rating: number;
    reviewCount: number;
    views: number;
  };

  // Status
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBundle {
  id: string;
  title: string;
  description: string;
  products: string[]; // Product IDs
  pricing: {
    originalPrice: number;
    bundlePrice: number;
    savings: number;
  };
  createdAt: Date;
}

/**
 * Create new product
 */
export async function createProduct(params: {
  instructorId: string;
  type: ProductType;
  title: string;
  description: string;
  pricing: Product["pricing"];
  content: Product["content"];
  tags: string[];
  category: string;
}): Promise<Product> {
  const {
    instructorId,
    type,
    title,
    description,
    pricing,
    content,
    tags,
    category,
  } = params;

  const product: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    instructorId,
    pricing,
    content,
    tags,
    category,
    difficulty: "beginner",
    language: "en",
    version: "1.0",
    stats: {
      totalSales: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0,
      views: 0,
    },
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // TODO: Store in database
  // await prisma.product.create({ data: product });

  return product;
}

/**
 * Get product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  // TODO: Query from database
  return generateMockProduct(productId);
}

/**
 * Browse products with filters
 */
export async function browseProducts(params: {
  type?: ProductType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: Product["difficulty"];
  tags?: string[];
  search?: string;
  sortBy?: "popular" | "newest" | "price_low" | "price_high" | "rating";
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number }> {
  const {
    type,
    category,
    minPrice,
    maxPrice,
    difficulty,
    tags,
    search,
    sortBy = "popular",
    page = 1,
    limit = 20,
  } = params;

  // TODO: Database query with filters
  const allProducts = Array.from({ length: 50 }, (_, i) =>
    generateMockProduct(`prod_${i}`)
  );

  // Apply filters (mock)
  let filtered = allProducts;

  if (type) {
    filtered = filtered.filter((p) => p.type === type);
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  switch (sortBy) {
    case "newest":
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "price_low":
      filtered.sort(
        (a, b) => a.pricing.prices[0].amount - b.pricing.prices[0].amount
      );
      break;
    case "price_high":
      filtered.sort(
        (a, b) => b.pricing.prices[0].amount - a.pricing.prices[0].amount
      );
      break;
    case "rating":
      filtered.sort((a, b) => b.stats.rating - a.stats.rating);
      break;
    case "popular":
    default:
      filtered.sort((a, b) => b.stats.totalSales - a.stats.totalSales);
  }

  // Paginate
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    products: paginated,
    total: filtered.length,
  };
}

/**
 * Create product bundle
 */
export async function createBundle(params: {
  title: string;
  description: string;
  productIds: string[];
  discountPercentage: number;
}): Promise<ProductBundle> {
  const { title, description, productIds, discountPercentage } = params;

  // Calculate pricing
  const products = await Promise.all(productIds.map((id) => getProduct(id)));

  const originalPrice = products.reduce(
    (sum, p) => sum + (p?.pricing.prices[0].amount || 0),
    0
  );

  const bundlePrice = originalPrice * (1 - discountPercentage / 100);
  const savings = originalPrice - bundlePrice;

  const bundle: ProductBundle = {
    id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    products: productIds,
    pricing: {
      originalPrice,
      bundlePrice,
      savings,
    },
    createdAt: new Date(),
  };

  // TODO: Store in database
  // await prisma.productBundle.create({ data: bundle });

  return bundle;
}

/**
 * Get instructor's product catalog
 */
export async function getInstructorCatalog(instructorId: string): Promise<{
  products: Product[];
  totalRevenue: number;
  totalSales: number;
  topProduct: Product | null;
}> {
  // TODO: Query from database
  const products = Array.from({ length: 10 }, (_, i) =>
    generateMockProduct(`prod_instructor_${instructorId}_${i}`, instructorId)
  );

  const totalRevenue = products.reduce((sum, p) => sum + p.stats.revenue, 0);
  const totalSales = products.reduce((sum, p) => sum + p.stats.totalSales, 0);
  const topProduct =
    products.sort((a, b) => b.stats.revenue - a.stats.revenue)[0] || null;

  return {
    products,
    totalRevenue,
    totalSales,
    topProduct,
  };
}

/**
 * Purchase product
 */
export async function purchaseProduct(params: {
  productId: string;
  userId: string;
  priceId: string; // Which tier/price
  paymentMethod: "wallet" | "stripe";
}): Promise<{
  success: boolean;
  accessGranted: boolean;
  downloadUrl?: string;
}> {
  const { productId, userId, priceId, paymentMethod } = params;

  const product = await getProduct(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const price = product.pricing.prices.find((p) => p.label === priceId);
  if (!price) {
    throw new Error("Invalid price tier");
  }

  // Process payment
  if (paymentMethod === "wallet") {
    // Use wallet system
    const { purchaseWithWallet } = await import("./wallet-system");
    // await purchaseWithWallet({ ... });
  } else {
    // Use Stripe
    // await processStripePayment({ ... });
  }

  // Grant access
  await grantProductAccess(userId, productId);

  // Update stats
  await updateProductStats(productId, {
    totalSales: product.stats.totalSales + 1,
    revenue: product.stats.revenue + price.amount,
  });

  // Generate download link if applicable
  let downloadUrl: string | undefined;
  if (product.content.fileUrl) {
    downloadUrl = await generateSecureDownloadLink(productId, userId);
  }

  return {
    success: true,
    accessGranted: true,
    downloadUrl,
  };
}

/**
 * Grant user access to product
 */
async function grantProductAccess(
  userId: string,
  productId: string
): Promise<void> {
  // TODO: Create database record
  // await prisma.productAccess.create({
  //   data: { userId, productId, grantedAt: new Date() }
  // });
  console.log(`Access granted: User ${userId} → Product ${productId}`);
}

/**
 * Update product statistics
 */
async function updateProductStats(
  productId: string,
  updates: Partial<Product["stats"]>
): Promise<void> {
  // TODO: Update database
  console.log(`Product ${productId} stats updated:`, updates);
}

/**
 * Generate secure download link
 */
async function generateSecureDownloadLink(
  productId: string,
  userId: string
): Promise<string> {
  // Generate signed URL valid for 1 hour
  const token = Buffer.from(
    JSON.stringify({ productId, userId, exp: Date.now() + 3600000 })
  ).toString("base64");

  return `/api/download/${productId}?token=${token}`;
}

/**
 * Check if user has access to product
 */
export async function hasProductAccess(
  userId: string,
  productId: string
): Promise<boolean> {
  // TODO: Query database
  return false; // Mock
}

/**
 * Get product recommendations
 */
export async function getProductRecommendations(
  userId: string,
  limit: number = 5
): Promise<Product[]> {
  // TODO: AI-powered recommendations based on:
  // - User's purchase history
  // - Browsing behavior
  // - Similar users' purchases
  // - Trending products

  return Array.from({ length: limit }, (_, i) =>
    generateMockProduct(`rec_${i}`)
  );
}

/**
 * Generate mock product
 */
function generateMockProduct(id: string, instructorId?: string): Product {
  const types: ProductType[] = [
    "course",
    "pdf",
    "audio",
    "workshop",
    "subscription",
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    id,
    type,
    title: `${
      type.charAt(0).toUpperCase() + type.slice(1)
    }: Advanced Dynasty Skills`,
    description: "Learn advanced techniques with this comprehensive resource.",
    instructorId: instructorId || "instructor_123",
    pricing: {
      model: "one_time",
      currency: "USD",
      prices: [
        {
          amount: 49.99,
          label: "Standard",
          features: ["Full access", "Lifetime updates", "Certificate"],
          license: "personal",
        },
      ],
    },
    content: {
      fileUrl: type === "pdf" ? "/downloads/sample.pdf" : undefined,
      duration: type === "audio" ? 120 : undefined,
      pageCount: type === "pdf" ? 50 : undefined,
      fileSize: 5242880, // 5MB
      format: type === "pdf" ? "PDF" : type === "audio" ? "MP3" : "MP4",
      previewUrl: "/previews/sample.pdf",
    },
    tags: ["advanced", "tutorial", "professional"],
    category: "Development",
    difficulty: "intermediate",
    language: "en",
    version: "1.0",
    stats: {
      totalSales: Math.floor(Math.random() * 500),
      revenue: Math.random() * 10000,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 5000),
    },
    status: "published",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
