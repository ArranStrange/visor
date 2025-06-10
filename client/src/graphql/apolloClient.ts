import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: "http://192.168.0.71:4000/graphql",
  credentials: "include",
});

// Error handling link
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.error("GraphQL Error:", err);
        // If token is invalid or expired, clear it and redirect to login
        if (
          err.message.includes("Unauthorized") ||
          err.message.includes("invalid token")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    if (networkError) {
      console.error("Network Error:", networkError);
    }
  }
);

const authLink = setContext((_, { headers }) => {
  // Get the token from localStorage
  const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token);

  // Return the headers to the context so httpLink can read them
  const authHeader = token ? `Bearer ${token}` : "";
  console.log("Auth header being sent:", authHeader);

  return {
    headers: {
      ...headers,
      authorization: authHeader,
    },
  };
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
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
