import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { ENV_CONFIG } from "../config/environment";

const httpLink = new HttpLink({
  uri: ENV_CONFIG.GRAPHQL_ENDPOINT,
  credentials: "include",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors including JWT expiration
      // Only logout for actual authentication failures, not authorization errors
      if (
        message.includes("jwt expired") ||
        message.includes("JWT expired") ||
        message.includes("UNAUTHENTICATED") ||
        message.includes("Authentication") ||
        // Only logout for "Not authenticated" but not "Not authorized"
        (message.includes("Not authenticated") &&
          !message.includes("Not authorized"))
      ) {
        // Clear local storage
        localStorage.removeItem("visor_token");
        localStorage.removeItem("user");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("visor_token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      // Render instantly from cache, then refresh from the network in the
      // background — keeps data fresh without refetch-blocking navigation.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
