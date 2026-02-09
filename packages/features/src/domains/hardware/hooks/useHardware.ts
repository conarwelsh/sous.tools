"use client";

import { useState, useEffect, useCallback } from "react";
import { getHttpClient } from "@sous/client-sdk";
import { io, Socket } from "socket.io-client";
import { localConfig } from "@sous/config";

export const useHardware = (type: "kds" | "pos" | "signage" | string): {
  hardwareId: string | null;
  pairingCode: string | null;
  isPaired: boolean;
  isLoading: boolean;
  socket: Socket | null;
  refreshPairingCode: () => Promise<void>;
} => {
  const [hardwareId, setHardwareId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Ensure Hardware ID
    if (typeof window === "undefined") return;

    let id = localStorage.getItem("sous_hardware_id");
    if (!id) {
      id = "hw_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("sous_hardware_id", id);
    }
    setHardwareId(id);
  }, []);

  const refreshPairingCode = useCallback(async () => {
    if (!hardwareId) return;
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      // Extract base type (e.g. 'signage' from 'signage:primary')
      const baseType = type.split(":")[0];
      const resp = (await http.post("/hardware/pairing-code", {
        hardwareId,
        type: baseType,
      })) as any;
      setPairingCode(resp.code);
    } catch (e) {
      console.error("Failed to get pairing code", e);
    } finally {
      setIsLoading(false);
    }
  }, [hardwareId, type]);

  useEffect(() => {
    if (!hardwareId) return;

    // 2. Connect Socket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || localConfig.api.url || "http://localhost:4000";
    console.log("Connecting to API Realtime at:", apiUrl);
    const s = io(apiUrl, {
      auth: { hardwareId },
    });

    s.on("connect", () => {
      console.log("Hardware node connected to realtime");
    });

    s.on("pairing:success", () => {
      setIsPaired(true);
      setPairingCode(null);
      localStorage.setItem(`sous_paired_${hardwareId}`, "true");
      setIsLoading(false);
    });

    setSocket(s);

    // 3. Heartbeat logic
    const sendHeartbeat = async () => {
      try {
        const http = await getHttpClient();
        const metadata = {
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform,
          version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
          timestamp: new Date().toISOString(),
        };
        console.log(`[Hardware] Sending heartbeat for ${hardwareId}...`);
        const resp = (await http.post("/hardware/heartbeat", { hardwareId, metadata })) as any;
        
        // 4. Remote Update Check
        if (resp && resp.requiredVersion && resp.requiredVersion !== metadata.version) {
          console.log(`🚀 New version required: ${resp.requiredVersion}. Performing whole app update...`);
          
          // Clear service worker caches if they exist
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          
          // Clear local storage (except pairing)
          const pairingId = localStorage.getItem("sous_hardware_id");
          const pairingState = localStorage.getItem(`sous_paired_${hardwareId}`);
          localStorage.clear();
          if (pairingId) localStorage.setItem("sous_hardware_id", pairingId);
          if (pairingState) localStorage.setItem(`sous_paired_${hardwareId}`, pairingState);

          // Force a hard reload from the server (bypassing browser cache)
          window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'update=' + Date.now();
        }
      } catch (e: any) {
        console.error("Heartbeat failed", e);
        // If the server doesn't know about this device (404), clear pairing
        if (e.response?.status === 404 || e.status === 404 || e.message?.includes("404")) {
          console.warn("⚠️ Device pairing lost (not found on server). Returning to pairing mode.");
          localStorage.removeItem(`sous_paired_${hardwareId}`);
          setIsPaired(false);
          setIsLoading(false);
          refreshPairingCode();
        }
      }
    };

    let heartbeatInterval: NodeJS.Timeout;
    const isPairedStored = localStorage.getItem(`sous_paired_${hardwareId}`);
    if (isPairedStored) {
      sendHeartbeat();
      heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30s
    }

    // 4. Check initial pairing state
    if (isPairedStored) {
      setIsPaired(true);
      setIsLoading(false);
    } else {
      refreshPairingCode();
    }

    // 5. Loading Timeout (failsafe)
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      s.disconnect();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      clearTimeout(timeout);
    };
  }, [hardwareId, refreshPairingCode]);

  return {
    hardwareId,
    pairingCode,
    isPaired,
    isLoading,
    socket,
    refreshPairingCode,
  };
};
