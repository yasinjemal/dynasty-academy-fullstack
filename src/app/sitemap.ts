/**
 * 🗺️ DYNAMIC SITEMAP
 *
 * Auto-generated sitemap for ALL books with multi-language support
 * Updates automatically as you import new books!
 */

import { MetadataRoute } from "next";
import { MultiLanguageSitemapGenerator } from "@/lib/seo/multiLanguageSitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries =
    await MultiLanguageSitemapGenerator.generateMultiLanguageSitemap();

  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
