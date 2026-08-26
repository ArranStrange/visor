import { describe, expect, it } from "vitest";

import { shouldForceLogout } from "../force-logout";

describe("shouldForceLogout", () => {
  it("signs out an expired session", () => {
    expect(shouldForceLogout("jwt expired")).toBe(true);
    expect(shouldForceLogout("Context creation failed: JWT expired")).toBe(true);
  });

  it("signs out when there is no session at all", () => {
    expect(shouldForceLogout("Not authenticated")).toBe(true);
    expect(shouldForceLogout("UNAUTHENTICATED")).toBe(true);
    expect(shouldForceLogout("Authentication required")).toBe(true);
  });

  it("does NOT sign out an ordinary user who lacks permission", () => {
    // The regression this guards: admin gates raise AuthenticationError, so a
    // signed-in non-admin clicking a moderation control would otherwise be
    // logged out of the whole app.
    expect(shouldForceLogout("Admin access required")).toBe(false);
    expect(shouldForceLogout("Only administrators can feature content")).toBe(
      false
    );
    expect(shouldForceLogout("Not authorized")).toBe(false);
  });

  it("does not sign out on a message carrying both words", () => {
    expect(
      shouldForceLogout("Not authenticated as owner — Not authorized")
    ).toBe(false);
  });

  it("ignores unrelated errors", () => {
    expect(shouldForceLogout("Preset not found")).toBe(false);
    expect(shouldForceLogout("Too many attempts. Please try again in 30 seconds.")).toBe(false);
    expect(shouldForceLogout("")).toBe(false);
  });
});
