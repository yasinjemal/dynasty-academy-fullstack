/**
 * AI Content Indexing Page
 * /admin/ai-indexing
 */

import { Suspense } from "react";
import AiIndexingClient from "./AiIndexingClient";

export const metadata = {
  title: "AI Content Indexing | Dynasty Academy Admin",
  description:
    "Index content into Pinecone vector database for AI-powered search",
};

export default function AiIndexingPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AiIndexingClient />
    </Suspense>
  );
}
