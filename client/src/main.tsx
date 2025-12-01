import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import App from "./App.tsx";
import apolloClient from "@gql/apolloClient";
import { setupErrorHandling } from "utils/errorHandling";
import { scanRuntimeFiles } from "lib/plugins/scanner";
import "./index.css";

setupErrorHandling();

scanRuntimeFiles().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  );
});
