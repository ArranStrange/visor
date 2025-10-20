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

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(" ");
    if (isExtensionError(message)) return;
    originalConsoleError.apply(console, args);
  };
};
