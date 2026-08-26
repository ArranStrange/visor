import { ApolloClient, InMemoryCache, from, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { ENV_CONFIG } from "../config/environment";
import { paginationTypePolicies } from "./pagination-type-policies";
import { getErrorMessage } from "../utils/errorHandling";
import { shouldForceLogout } from "./force-logout";

const httpLink = new HttpLink({
  uri: ENV_CONFIG.GRAPHQL_ENDPOINT,
  credentials: "include",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error(`[GraphQL error]: ${message}`);

      // Sign out on a dead session, but not on a permission denial —
      // see force-logout.ts for why the two have to be told apart by message.
      if (shouldForceLogout(message)) {
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
    console.error(`[Network error]: ${getErrorMessage(networkError)}`);
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
  cache: new InMemoryCache({
    // listPresets/listFilmSims pages share cache entries by filter and page size.
    typePolicies: paginationTypePolicies,
  }),
  defaultOptions: {
    watchQuery: {
      // Query convention: watched reads refresh once with cache-and-network,
      // then stay cache-first; mutations keep partial GraphQL error results.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
