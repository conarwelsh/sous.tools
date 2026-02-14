import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
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
}

/**
 * Creates and configures a new Apollo Client instance.
 * Automatically sets up a WebSocket link for subscriptions
 * and an HTTP link for queries and mutations.
 * 
 * Headers are dynamically resolved from localStorage to handle
 * hardware pairing updates without client re-initialization.
 *
 * @param {ApolloClientConfig} config - The client configuration.
 * @returns {ApolloClient} A configured Apollo Client instance.
 */
export const createApolloClient = (config: ApolloClientConfig) => {
  const httpLink = new HttpLink({
    uri: `${config.apiUrl}/graphql`,
  });

  const authLink = setContext((_, { headers }) => {
    if (typeof window === "undefined") return { headers };

    const hardwareId = localStorage.getItem("sous_hardware_id");
    const organizationId = hardwareId ? localStorage.getItem(`sous_org_id_${hardwareId}`) : null;
    const token = localStorage.getItem("token");

    return {
      headers: {
        ...headers,
        "x-hardware-id": hardwareId || "",
        "x-organization-id": organizationId || "",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: `${config.apiUrl.replace("http", "ws")}/graphql`,
            connectionParams: () => {
              const hardwareId = localStorage.getItem("sous_hardware_id");
              const organizationId = hardwareId ? localStorage.getItem(`sous_org_id_${hardwareId}`) : null;
              const token = localStorage.getItem("token");

              return {
                "x-hardware-id": hardwareId || "",
                "x-organization-id": organizationId || "",
                ...(token ? { authorization: `Bearer ${token}` } : {}),
              };
            },
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
          authLink.concat(httpLink),
        )
      : authLink.concat(httpLink);

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};
