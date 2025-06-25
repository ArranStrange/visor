import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Use environment variable for GraphQL endpoint, fallback to localhost for development
const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_URI || "http://localhost:4000/graphql";

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: "include",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Debug: Log the exact error message to see if it's triggering logout
      console.log(`[DEBUG] Checking error message: "${message}"`);
      console.log(`[DEBUG] Error path: ${path}`);
      console.log(
        `[DEBUG] Current token: ${
          localStorage.getItem("visor_token") ? "exists" : "missing"
        }`
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
        console.log(`[DEBUG] Authentication error detected - logging out`);
        // Clear local storage
        localStorage.removeItem("visor_token");
        localStorage.removeItem("user");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else {
        console.log(`[DEBUG] Not an authentication error - not logging out`);
        console.log(
          `[DEBUG] This appears to be an authorization or validation error`
        );
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("visor_token");

  // Debug: Log the token being sent
  console.log("[DEBUG] Auth token being sent:", token ? "exists" : "missing");
  if (token) {
    console.log("[DEBUG] Token length:", token.length);
    console.log("[DEBUG] Token starts with:", token.substring(0, 20) + "...");
  }

  // return the headers to the context so httpLink can read them
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
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
