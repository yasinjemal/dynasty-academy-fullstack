/**
 * 🖼️ Dynamic OG Image URL Generator
 *
 * Generates URLs for dynamic Open Graph images.
 * These images are used for social media sharing (Facebook, Twitter, LinkedIn, etc.)
 */

/**
 * Get the OG Image URL for a book
 * @param bookId - The book's database ID
 * @param slug - The book's URL slug
 * @param title - The book title
 * @returns The full URL to the dynamic OG image
 */
export function getOGImageURL(
  bookId: string,
  slug: string,
  title: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // For now, we'll use a simple URL structure
  // In the future, you can create /api/og/book/[slug]/route.ts to generate custom images
  const ogImageUrl = `${baseUrl}/api/og/book/${slug}`;

  return ogImageUrl;
}

/**
 * Get the OG Image URL with query parameters for customization
 */
export function getCustomOGImageURL(params: {
  slug: string;
  title: string;
  author?: string;
  category?: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const searchParams = new URLSearchParams({
    title: params.title,
    ...(params.author && { author: params.author }),
    ...(params.category && { category: params.category }),
  });

  return `${baseUrl}/api/og/book/${params.slug}?${searchParams.toString()}`;
}
