import { Metadata } from "next";
import AudioIntelligencePage from "./AudioIntelligenceClient";

export const metadata: Metadata = {
  title: "Audio Intelligence | Dynasty Academy Admin",
  description:
    "Manage audio generation with revolutionary 99% cost savings through intelligent caching",
};

export default function AudioIntelligenceAdminPage() {
  return <AudioIntelligencePage />;
}
