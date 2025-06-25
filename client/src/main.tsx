import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import "./index.css";

// Setup GraphQL endpoint
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql", // Adjust for prod if needed
  credentials: "include",
});

// Attach JWT token if available
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("visor_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client setup
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Add global error handlers to prevent console noise from browser extensions
window.addEventListener("unhandledrejection", (event) => {
  // Check if this is a message channel error from browser extensions
  if (
    event.reason &&
    typeof event.reason === "string" &&
    (event.reason.includes("message channel closed") ||
      event.reason.includes("listener indicated an asynchronous response"))
  ) {
    event.preventDefault(); // Prevent the error from appearing in console
    return;
  }

  // Log other unhandled rejections for debugging
  console.warn("Unhandled promise rejection:", event.reason);
});

// Handle errors from browser extensions trying to access the page
window.addEventListener("error", (event) => {
  // Check if this is a message channel error
  if (
    event.message &&
    (event.message.includes("message channel closed") ||
      event.message.includes("listener indicated an asynchronous response"))
  ) {
    event.preventDefault(); // Prevent the error from appearing in console
    return;
  }
});

// Additional handler for console.error to filter out extension noise
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(" ");
  if (
    message.includes("message channel closed") ||
    message.includes("listener indicated an asynchronous response")
  ) {
    // Silently ignore these specific errors
    return;
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
