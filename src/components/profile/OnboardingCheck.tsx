"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import OnboardingModal from "@/components/profile/OnboardingModal";
import { usePathname } from "next/navigation";

export default function OnboardingCheck() {
  const { data: session, status, update } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();

  // Check if user needs onboarding (no username set)
  useEffect(() => {
    if (status === "loading") return;

    // Don't show on auth pages
    const isAuthPage =
      pathname?.startsWith("/login") || pathname?.startsWith("/register");
    if (isAuthPage) return;

    // Show modal if user is logged in but has no username
    if (status === "authenticated" && session?.user && !session.user.username) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [status, session, pathname]);

  const handleComplete = async () => {
    setShowOnboarding(false);
    // Refresh session to get updated username
    await update();
  };

  return (
    <OnboardingModal isOpen={showOnboarding} onComplete={handleComplete} />
  );
}
