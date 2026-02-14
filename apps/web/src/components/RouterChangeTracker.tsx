"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@sous/ui";

export function RouterChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();

  const handleAnchorClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.href.includes("#") &&
        anchor.target !== "_blank" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Check if it's a different route
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(anchor.href);

        if (
          currentUrl.pathname !== targetUrl.pathname ||
          currentUrl.search !== targetUrl.search
        ) {
          startLoading();
        }
      }
    },
    [startLoading],
  );

  useEffect(() => {
    // When pathname or search params change, a navigation happened or finished
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  useEffect(() => {
    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, [handleAnchorClick]);

  return null;
}
