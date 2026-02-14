"use client";

import React, { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@sous/client-sdk";
import { client as config } from "@sous/config";

export const GraphQLProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hostIp, setHostIp] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Poll for host IP if in Capacitor
    const checkHostIp = () => {
      const ip = (window as any).sous_host_ip;
      if (ip && ip !== hostIp) {
        setHostIp(ip);
      }
    };

    const interval = setInterval(checkHostIp, 500);
    checkHostIp();
    return () => clearInterval(interval);
  }, [hostIp]);

  const client = useMemo(() => {
    const apiUrl = config.api.url || "http://localhost:4000";
    
    return createApolloClient({
      apiUrl,
    });
  }, [hostIp]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
