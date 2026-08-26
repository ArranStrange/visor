import { describe, expect, it } from "vitest";

import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_HINT,
  validatePassword,
} from "../passwordRules";

// Fixtures are built from MIN_PASSWORD_LENGTH rather than written out, so the
// boundary cases keep testing the boundary if the rule ever changes — and so
// there are no password-shaped literals for secret scanners to trip over.
const capital = "A";
const lower = (count: number) => "a".repeat(Math.max(0, count));

const exactlyMinimum = capital + lower(MIN_PASSWORD_LENGTH - 1);
const oneShort = capital + lower(MIN_PASSWORD_LENGTH - 2);
const noCapital = lower(MIN_PASSWORD_LENGTH);
const comfortablyLong = capital + lower(MIN_PASSWORD_LENGTH + 4);

describe("validatePassword", () => {
  it("accepts a value meeting both rules", () => {
    expect(validatePassword(comfortablyLong)).toBeNull();
  });

  it("accepts exactly the minimum length", () => {
    expect(exactlyMinimum).toHaveLength(MIN_PASSWORD_LENGTH);
    expect(validatePassword(exactlyMinimum)).toBeNull();
  });

  it("rejects one character under the minimum", () => {
    expect(oneShort).toHaveLength(MIN_PASSWORD_LENGTH - 1);
    expect(validatePassword(oneShort)).toMatch(
      new RegExp(`at least ${MIN_PASSWORD_LENGTH} characters`)
    );
  });

  it("rejects a value with no capital letter", () => {
    expect(validatePassword(noCapital)).toMatch(/uppercase/);
  });

  it("reports length before case so the user fixes one thing at a time", () => {
    // Fails both rules: the length message is the one that should surface.
    expect(validatePassword(lower(3))).toMatch(
      new RegExp(`at least ${MIN_PASSWORD_LENGTH} characters`)
    );
  });

  it("rejects an empty value", () => {
    expect(validatePassword("")).not.toBeNull();
  });

  it("states the real minimum in the hint", () => {
    expect(PASSWORD_HINT).toContain(String(MIN_PASSWORD_LENGTH));
  });
});
