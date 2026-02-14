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
    
    return createApolloClient({
      apiUrl,
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
