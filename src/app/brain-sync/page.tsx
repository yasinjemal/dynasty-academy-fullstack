import { Metadata } from "next";
import BrainSyncPageClient from "@/components/brain-sync/BrainSyncPageClientNew";

export const metadata: Metadata = {
  title: "Brain Sync | Dynasty Academy",
  description:
    "Real-time multiplayer learning - Study together, grow together. Join live sessions with learners around the world.",
};

export default function BrainSyncPage() {
  return <BrainSyncPageClient />;
}
