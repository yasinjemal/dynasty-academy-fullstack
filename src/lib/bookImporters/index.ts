// 📚 Book Importer Factory & Manager

import { GutenbergImporter } from "./GutenbergImporter";
import { OpenLibraryImporter } from "./OpenLibraryImporter";
import { GoogleBooksImporter } from "./GoogleBooksImporter";
import { BookImporter } from "./types";

export type ImportSource = "gutenberg" | "openlibrary" | "google";

export class BookImporterFactory {
  private static importers: Map<ImportSource, BookImporter> = new Map<
    ImportSource,
    BookImporter
  >([
    ["gutenberg", new GutenbergImporter()],
    ["openlibrary", new OpenLibraryImporter()],
    ["google", new GoogleBooksImporter()],
  ]);

  static getImporter(source: ImportSource): BookImporter {
    const importer = this.importers.get(source);
    if (!importer) {
      throw new Error(`Unknown importer source: ${source}`);
    }
    return importer;
  }

  static getAllImporters(): BookImporter[] {
    return Array.from(this.importers.values());
  }

  static getSupportedSources(): ImportSource[] {
    return Array.from(this.importers.keys());
  }
}

// Export all importers and types
export * from "./types";
export { GutenbergImporter } from "./GutenbergImporter";
export { OpenLibraryImporter } from "./OpenLibraryImporter";
export { GoogleBooksImporter } from "./GoogleBooksImporter";
