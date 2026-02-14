"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { config } from "@sous/config";
import { useUpdateManager } from "@sous/features";

export function FlavorGate() {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize background update manager
  useUpdateManager();

  useEffect(() => {
    // Only redirect if at root
    if (pathname !== "/") return;

    const checkFlavor = async () => {
      console.log("FlavorGate: Checking flavor...");

      // EMERGENCY REDIRECT: If we are on localhost in native, we are lost. Force to WSL IP.
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost" &&
        (window as any).Capacitor
      ) {
        const targetUrl = config.web.url;

        if (!targetUrl || targetUrl.includes("localhost")) {
          // If we don't have the env var, we might have it injected into the window by the bridge
          // or we can try to guess from the strings.xml if we had a plugin for it.
          // For now, let's assume the build process worked and we have the env var.
          console.warn(
            "FlavorGate: NEXT_PUBLIC_WEB_URL is missing during emergency redirect!",
          );
          return;
        }

        console.log(
          `FlavorGate: Detected localhost in native. Redirecting to ${targetUrl}...`,
        );
        window.location.href =
          targetUrl + window.location.pathname + window.location.search;
        return;
      }

      if (typeof window !== "undefined" && (window as any).Capacitor) {
        try {
          // @ts-expect-error - Capacitor is injected at runtime
          const { SousHardware } = window.Capacitor.Plugins;
          if (SousHardware) {
            const { value: flavor } = await SousHardware.getFlavor();
            console.log("FlavorGate: Detected flavor:", flavor);

            if (flavor === "kds") {
              console.log("FlavorGate: Redirecting to /kds");
              router.replace("/kds");
            } else if (flavor === "pos") {
              console.log("FlavorGate: Redirecting to /pos");
              router.replace("/pos");
            } else if (flavor === "signage") {
              console.log("FlavorGate: Redirecting to /signage/default");
              router.replace("/signage/default");
            } else if (flavor === "tools") {
              console.log("FlavorGate: Redirecting to /dashboard");
              router.replace("/dashboard");
            } else {
              console.log(
                "FlavorGate: No specific flavor found, staying at root",
              );
            }
          } else {
            console.log("FlavorGate: SousHardware plugin not found");
          }
        } catch (e) {
          console.error("FlavorGate: Failed to detect flavor", e);
        }
      } else {
        console.log("FlavorGate: Capacitor not detected");
      }
    };

    checkFlavor();
  }, [pathname, router]);

  return null;
}
