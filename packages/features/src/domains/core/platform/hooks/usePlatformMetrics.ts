"use client";

import { useState, useEffect } from "react";
import { getHttpClient } from "@sous/client-sdk";

export const usePlatformMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get("/metrics/platform");
      setMetrics(data);
    } catch (e) {
      console.error("Failed to fetch platform metrics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, refresh: fetchMetrics };
};
