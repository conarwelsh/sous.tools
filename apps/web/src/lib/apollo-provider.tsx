"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@sous/client-sdk";
import { localConfig } from "@sous/config";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
console.log("GraphQLProvider: Using API URL:", apiUrl);

const client = createApolloClient({
  apiUrl,
});

export const GraphQLProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
