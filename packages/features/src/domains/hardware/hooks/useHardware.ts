"use client";

import { useState, useEffect, useCallback } from "react";
import { getHttpClient } from "@sous/client-sdk";
import { localConfig } from "@sous/config";
import { gql } from "@apollo/client";
import { useSubscription } from "@apollo/client/react";

const DEVICE_PAIRED_SUBSCRIPTION = gql`
  subscription OnDevicePaired($hardwareId: String!) {
    devicePaired(hardwareId: $hardwareId) {
      id
      organizationId
      hardwareId
    }
  }
`;

export const useHardware = (
  type: "kds" | "pos" | "signage" | string,
): {
  hardwareId: string | null;
  pairingCode: string | null;
  organizationId: string | null;
  isPaired: boolean;
  isLoading: boolean;
  refreshPairingCode: () => Promise<void>;
} => {
  const [hardwareId, setHardwareId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Ensure Hardware ID
    if (typeof window === "undefined") return;

    let id = localStorage.getItem("sous_hardware_id");
    if (!id) {
      id = "hw_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("sous_hardware_id", id);
    }
    setHardwareId(id);

    // Load orgId if already paired
    const storedOrgId = localStorage.getItem(`sous_org_id_${id}`);
    if (storedOrgId && storedOrgId !== "undefined" && storedOrgId !== "null") {
      setOrganizationId(storedOrgId);
      const isPairedStored = localStorage.getItem(`sous_paired_${id}`);
      if (isPairedStored === "true") {
        setIsPaired(true);
        setIsLoading(false);
      }
    } else {
      setIsPaired(false);
      setIsLoading(false);
    }
  }, []);

  const refreshPairingCode = useCallback(async () => {
    if (!hardwareId) return;
    setIsLoading(true);
    let apiUrl = localConfig.api.url || "http://localhost:4000";
    try {
      if (
        typeof window !== "undefined" &&
        ((window as any).Capacitor || (window as any).sous_host_ip)
      ) {
        const hostIp = (window as any).sous_host_ip;
        if (hostIp && hostIp !== "10.0.2.2") {
          apiUrl = apiUrl
            .replace("localhost", hostIp)
            .replace("127.0.0.1", hostIp);
        }
      }

      const http = await getHttpClient(apiUrl);
      const baseType = type.split(":")[0];
      const resp = (await http.post("/hardware/pairing-code", {
        hardwareId,
        type: baseType,
      })) as any;
      setPairingCode(resp.code);
    } catch (e: any) {
      console.error("[useHardware] Failed to get pairing code:", e.message);
    } finally {
      setIsLoading(false);
    }
  }, [hardwareId, type]);

  // 2. Real-time Subscription for Pairing
  const { data: subData } = useSubscription<any>(DEVICE_PAIRED_SUBSCRIPTION, {
    variables: { hardwareId: hardwareId || "" },
    skip: !hardwareId || isPaired,
  });

  useEffect(() => {
    if (subData?.devicePaired) {
      const device = subData.devicePaired;
      setIsPaired(true);
      setPairingCode(null);
      if (device.organizationId) {
        setOrganizationId(device.organizationId);
        localStorage.setItem(
          `sous_org_id_${hardwareId}`,
          device.organizationId,
        );
      }
      localStorage.setItem(`sous_paired_${hardwareId}`, "true");
      setIsLoading(false);
    }
  }, [subData, hardwareId]);

  // 3. Heartbeat logic
  useEffect(() => {
    if (!hardwareId || !isPaired) return;

    let apiUrl = localConfig.api.url || "http://localhost:4000";
    if (
      typeof window !== "undefined" &&
      ((window as any).Capacitor || (window as any).sous_host_ip)
    ) {
      const hostIp = (window as any).sous_host_ip;
      if (hostIp && hostIp !== "10.0.2.2") {
        apiUrl = apiUrl
          .replace("localhost", hostIp)
          .replace("127.0.0.1", hostIp);
      }
    }

    const sendHeartbeat = async () => {
      try {
        const http = await getHttpClient(apiUrl);
        const metadata = {
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform,
          version: localConfig.features.appVersion || "0.1.0",
          timestamp: new Date().toISOString(),
        };
        const resp = (await http.post("/hardware/heartbeat", {
          hardwareId,
          metadata,
        })) as any;

        if (
          resp?.requiredVersion &&
          resp.requiredVersion !== metadata.version
        ) {
          window.location.reload();
        }
      } catch (e: any) {
        if (e.status === 404) {
          localStorage.removeItem(`sous_paired_${hardwareId}`);
          setIsPaired(false);
          void refreshPairingCode();
        }
      }
    };

    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    void sendHeartbeat();

    return () => clearInterval(heartbeatInterval);
  }, [hardwareId, isPaired, refreshPairingCode]);

  // 4. Loading Timeout (failsafe)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return {
    hardwareId,
    pairingCode,
    organizationId,
    isPaired,
    isLoading,
    refreshPairingCode,
  };
};
