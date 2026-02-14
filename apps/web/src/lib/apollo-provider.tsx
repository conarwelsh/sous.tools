"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@sous/client-sdk";
import { client as config } from "@sous/config";

const apiUrl = config.api.url || "http://localhost:4000";
console.log("GraphQLProvider: Using API URL:", apiUrl);

const client = createApolloClient({
  apiUrl,
});

export const GraphQLProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
