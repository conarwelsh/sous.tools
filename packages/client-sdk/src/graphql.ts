import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

export interface ApolloClientConfig {
  apiUrl: string; // e.g. http://localhost:4000
}

export const createApolloClient = (config: ApolloClientConfig) => {
  const httpLink = new HttpLink({
    uri: `${config.apiUrl}/graphql`,
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: `${config.apiUrl.replace("http", "ws")}/graphql`,
          }),
        )
      : null;

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
