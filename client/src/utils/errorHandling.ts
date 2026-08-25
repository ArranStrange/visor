import { ApolloError } from "@apollo/client";

const DEFAULT_ERROR_MESSAGE = "Something went wrong";

export const getErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE
): string => {
  if (error instanceof ApolloError) {
    return (
      error.graphQLErrors[0]?.message ||
      error.networkError?.message ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error || fallback;
  }

  return fallback;
};

const isExtensionError = (message: string): boolean => {
  return (
    message.includes("message channel closed") ||
    message.includes("listener indicated an asynchronous response")
  );
};

export const setupErrorHandling = (): void => {
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      typeof event.reason === "string" &&
      isExtensionError(event.reason)
    ) {
      event.preventDefault();
      return;
    }
    console.warn("Unhandled promise rejection:", event.reason);
  });

  window.addEventListener("error", (event) => {
    if (event.message && isExtensionError(event.message)) {
      event.preventDefault();
    }
  });
};
