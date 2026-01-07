"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to track a CSS media query match
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're on the client
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

// Tailwind CSS breakpoint values
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Hook to check if screen width is below a certain breakpoint
 * @param breakpoint - Tailwind breakpoint name
 * @returns boolean indicating if we're below that breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
}

/**
 * Hook to check if we're on a mobile device (< md breakpoint)
 * Also detects touch devices and mobile user agents
 */
export function useIsMobile(): boolean {
  const isBelowMd = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for touch capability
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Check user agent for mobile
    const mobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    setIsTouchDevice(hasTouch || mobileUA);
  }, []);

  // Return true if either below md breakpoint OR is a touch device at tablet size
  return (
    isBelowMd ||
    (isTouchDevice && useMediaQuery(`(max-width: ${BREAKPOINTS.lg - 1}px)`))
  );
}

/**
 * Hook to check if we're on a tablet (md to lg)
 */
export function useIsTablet(): boolean {
  const isAboveSm = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isBelowLg = useMediaQuery(`(max-width: ${BREAKPOINTS.lg - 1}px)`);
  return isAboveSm && isBelowLg;
}

/**
 * Hook to check if we're on desktop (>= lg)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

/**
 * Hook to get all screen size states at once
 */
export function useScreenSize() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return {
    isMobile,
    isTablet,
    isDesktop,
    // Useful aliases
    isTouchDevice: isMobile || isTablet,
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
  };
}

/**
 * Hook to detect orientation
 */
export function useOrientation(): "portrait" | "landscape" {
  const isPortrait = useMediaQuery("(orientation: portrait)");
  return isPortrait ? "portrait" : "landscape";
}

/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Hook to detect dark mode preference
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

/**
 * Hook to detect if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery("(prefers-contrast: high)");
}

export default useMediaQuery;
