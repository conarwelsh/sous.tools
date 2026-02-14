"use client";

import { useState, useEffect } from "react";
import { getHttpClient } from "@sous/client-sdk";

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      const data = (await http.get("/platform/settings")) as any[];
      setSettings(data);
    } catch (e) {
      console.error("Failed to fetch platform settings", e);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const http = await getHttpClient();
      await http.post("/platform/settings", { key, value });
      await fetchSettings();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    refresh: fetchSettings,
  };
};
