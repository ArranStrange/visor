import { describe, expect, it } from "vitest";
import { convertToXMPValue } from "../xmp-value";

describe("convertToXMPValue", () => {
  it.each([
    { input: 100, expected: "1" },
    { input: 25, expected: "0.25" },
    { input: -50, expected: "-0.5" },
    { input: undefined, expected: "0" },
  ])("formats $input as $expected", ({ input, expected }) => {
    expect(convertToXMPValue(input)).toBe(expected);
  });
});
