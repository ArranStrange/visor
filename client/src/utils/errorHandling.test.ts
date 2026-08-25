import { ApolloError } from "@apollo/client";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errorHandling";

describe("getErrorMessage", () => {
  it("prefers the first GraphQL message from an ApolloError", () => {
    const error = new ApolloError({
      graphQLErrors: [
        { message: "GraphQL failed" },
        { message: "Another GraphQL failure" },
      ],
      networkError: new Error("Network failed"),
      errorMessage: "Apollo failed",
    });

    expect(getErrorMessage(error)).toBe("GraphQL failed");
  });

  it("uses the network message when an ApolloError has no GraphQL errors", () => {
    const error = new ApolloError({
      networkError: new Error("Network failed"),
      errorMessage: "Apollo failed",
    });

    expect(getErrorMessage(error)).toBe("Network failed");
  });

  it("uses the ApolloError message when no nested message is available", () => {
    const error = new ApolloError({ errorMessage: "Apollo failed" });

    expect(getErrorMessage(error)).toBe("Apollo failed");
  });

  it("returns the message from a plain Error", () => {
    expect(getErrorMessage(new Error("Plain failure"))).toBe("Plain failure");
  });

  it("returns a string throw", () => {
    expect(getErrorMessage("String failure")).toBe("String failure");
  });

  it("uses the default fallback for unsupported values", () => {
    expect(getErrorMessage({ message: "Do not expose this object" })).toBe(
      "Something went wrong"
    );
  });

  it("uses a custom fallback for unsupported values", () => {
    expect(getErrorMessage(null, "Upload failed")).toBe("Upload failed");
  });
});
