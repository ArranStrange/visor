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
      // Handle ObjectId serialization errors gracefully
      if (
        message.includes("ID cannot represent value") &&
        message.includes("Buffer")
      ) {
        console.warn(
          `[GraphQL warning]: ObjectId serialization issue at path: ${path}. This is a backend issue that needs to be fixed.`
        );
        return; // Don't treat this as a critical error
      }

      // Handle null field errors for required fields
      if (message.includes("Cannot return null for non-nullable field")) {
        console.warn(
          `[GraphQL warning]: Null field error at path: ${path}. Some data may be missing or corrupted.`
        );
        return; // Don't treat this as a critical error
      }

      // Handle date serialization errors
      if (
        message.includes("String cannot represent value") &&
        message.includes("createdAt")
      ) {
        console.warn(
          `[GraphQL warning]: Date serialization issue at path: ${path}. Some dates may not be displaying correctly.`
        );
        return; // Don't treat this as a critical error
      }

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
      } else {
        // console.log(
        //   `[DEBUG] This appears to be an authorization or validation error`
        // );
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
  if (token) {
    // Token exists
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
