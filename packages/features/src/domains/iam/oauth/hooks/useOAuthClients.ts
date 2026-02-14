"use client";

import { useState, useEffect } from "react";
import { getHttpClient } from "@sous/client-sdk";

export const useOAuthClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const http = await getHttpClient();
      const data = (await http.get("/oauth/clients")) as any[];
      setClients(data);
    } catch (e) {
      console.error("Failed to fetch OAuth clients", e);
    } finally {
      setLoading(false);
    }
  };

  const registerClient = async (name: string, redirectUris: string[]) => {
    try {
      const http = await getHttpClient();
      await http.post("/oauth/clients", { name, redirectUris });
      await fetchClients();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    registerClient,
    refresh: fetchClients,
  };
};
