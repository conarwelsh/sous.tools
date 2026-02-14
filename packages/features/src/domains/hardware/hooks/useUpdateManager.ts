"use client";

import { useState, useEffect, useCallback } from "react";
import { config } from "@sous/config";
import { logger } from "@sous/logger";
import { getHttpClient } from "@sous/client-sdk";

export interface ReleaseManifest {
  updatedAt: string;
  channel: string;
  version: string;
  signage?: string;
  kds?: string;
  pos?: string;
  tools?: string;
  wearos?: string;
  rpi?: string;
}

export interface UpdateSettings {
  autoUpdate: boolean;
  scheduleNonBusinessHours: boolean;
  promptUser: boolean;
}

/**
 * Hook to manage background binary updates for the Sous Terminal applications.
 * Handles manifest polling, version comparison, and scheduled installation
 * based on business hours.
 */
export const useUpdateManager = () => {
  const [manifest, setManifest] = useState<ReleaseManifest | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const currentVersion = config.features.appVersion;
  const channel = config.features.appEnv;
  const supabaseUrl = config.storage.supabase.url;
  const bucket = config.storage.supabase.bucket;

  const manifestUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/releases/${channel}/latest/manifest.json`;

  /**
   * Checks for a new version of the application by fetching the manifest
   * from the configured Supabase release channel.
   */
  const checkForUpdates = useCallback(async () => {
    try {
      const response = await fetch(manifestUrl, { cache: "no-cache" });
      if (!response.ok) {
        if (response.status !== 404) {
          logger.warn(`Failed to fetch manifest: ${response.statusText}`);
        }
        return;
      }

      const data: ReleaseManifest = await response.json();
      setManifest(data);
      setLastCheck(new Date());

      // Simple version comparison
      if (data.version !== currentVersion) {
        setUpdateAvailable(true);
        logger.info(`Update available: ${currentVersion} -> ${data.version}`);
      } else {
        setUpdateAvailable(false);
      }
    } catch (error) {
      logger.error("Failed to check for updates", error);
    }
  }, [manifestUrl, currentVersion]);

  /**
   * Determines if the current time is within business hours for the location.
   */
  const isBusinessHours = useCallback(async () => {
    try {
      const http = await getHttpClient();
      const location = (await http.get("/iam/locations/current")) as any;
      if (!location || !location.businessHours) return true; // Default to true if not configured

      const now = new Date();
      const day = now
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase();
      const hours = location.businessHours[day];

      if (!hours || !hours.open || !hours.close) return false;

      const [openH, openM] = hours.open.split(":").map(Number);
      const [closeH, closeM] = hours.close.split(":").map(Number);

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;

      return currentTime >= openTime && currentTime <= closeTime;
    } catch (e) {
      // If we can't check, assume it's business hours to be safe
      return true;
    }
  }, []);

  /**
   * Triggers the update process by downloading the appropriate flavor binary.
   */
  const performUpdate = useCallback(async () => {
    if (!manifest || !updateAvailable) return;

    setIsUpdating(true);

    let downloadUrl = manifest.signage;

    // Detect flavor from native bridge if available
    if (typeof window !== "undefined" && (window as any).Capacitor) {
      try {
        const { SousHardware } = (window as any).Capacitor.Plugins;
        const { value: flavor } = await SousHardware.getFlavor();
        downloadUrl = (manifest as any)[flavor] || downloadUrl;
      } catch (e) {
        logger.warn("Failed to detect flavor for update redirection");
      }
    }

    if (downloadUrl) {
      logger.info(`Starting update to ${manifest.version} via ${downloadUrl}`);
      window.location.href = downloadUrl;
    }

    setIsUpdating(false);
  }, [manifest, updateAvailable]);

  // Initial check and hourly polling
  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 3600000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Automatic scheduling check
  useEffect(() => {
    if (!updateAvailable || !manifest) return;

    const runAutoUpdateCheck = async () => {
      const business = await isBusinessHours();
      if (!business) {
        logger.info("Non-business hours detected. Triggering automatic update.");
        performUpdate();
      }
    };

    runAutoUpdateCheck();
  }, [updateAvailable, manifest, isBusinessHours, performUpdate]);

  return {
    manifest,
    updateAvailable,
    isUpdating,
    lastCheck,
    checkForUpdates,
    performUpdate,
  };
};
