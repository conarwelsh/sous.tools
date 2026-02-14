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
  const client = useMemo(() => {
    const apiUrl = config.api.url || "http://localhost:4000";
    
    let hardwareId: string | null = null;
    let organizationId: string | null = null;

    if (typeof window !== "undefined") {
      hardwareId = localStorage.getItem("sous_hardware_id");
      if (hardwareId) {
        organizationId = localStorage.getItem(`sous_org_id_${hardwareId}`);
      }
    }

    return createApolloClient({
      apiUrl,
      hardwareId,
      organizationId,
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
