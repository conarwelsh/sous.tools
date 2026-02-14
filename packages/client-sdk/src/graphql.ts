import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

/**
 * Configuration options for the Apollo Client.
 */
export interface ApolloClientConfig {
  /**
   * The base URL of the GraphQL API (e.g. http://localhost:4000).
   */
  apiUrl: string;
  /**
   * Optional hardware context.
   */
  hardwareId?: string | null;
  organizationId?: string | null;
}

/**
 * Creates and configures a new Apollo Client instance.
 * Automatically sets up a WebSocket link for subscriptions
 * and an HTTP link for queries and mutations.
 *
 * @param {ApolloClientConfig} config - The client configuration.
 * @returns {ApolloClient} A configured Apollo Client instance.
 */
export const createApolloClient = (config: ApolloClientConfig) => {
  const headers: Record<string, string> = {};
  if (config.hardwareId) headers["x-hardware-id"] = config.hardwareId;
  if (config.organizationId) headers["x-organization-id"] = config.organizationId;

  const httpLink = new HttpLink({
    uri: `${config.apiUrl}/graphql`,
    headers,
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: `${config.apiUrl.replace("http", "ws")}/graphql`,
            connectionParams: headers,
          }),
        )
      : null;

  /**
   * Splits traffic between HTTP and WebSocket links
   * based on the type of GraphQL operation.
   */
  const splitLink =
    wsLink != null
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink,
        )
      : httpLink;

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};
