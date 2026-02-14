"use client";

import { useState, useEffect } from "react";
import { getHttpClient } from "@sous/client-sdk";

export const useSales = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      const [m, o] = await Promise.all([
        http.get("/sales/metrics"),
        http.get("/sales/organizations")
      ]);
      setMetrics(m);
      setOrganizations(o as any[]);
    } catch (e) {
      console.error("Failed to fetch sales data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    metrics,
    organizations,
    loading,
    refresh: fetchData,
  };
};
