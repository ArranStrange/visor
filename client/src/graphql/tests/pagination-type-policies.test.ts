import { describe, expect, it } from "vitest";
import { paginationTypePolicies } from "../pagination-type-policies";

interface PresetItem {
  __typename: "Preset";
  id: string;
}

interface PresetConnection {
  __typename: "PaginatedPresets";
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
  presets: readonly PresetItem[];
}

type MergePresets = (
  existing: Readonly<PresetConnection> | undefined,
  incoming: Readonly<PresetConnection>,
  options: { args: Record<string, unknown> | null }
) => PresetConnection;

type ReadPresets = (
  existing: Readonly<PresetConnection> | undefined
) => PresetConnection | undefined;

const presetPolicy = getPresetPolicy();

describe("preset pagination field policy", () => {
  it("appends pages at offsets derived from page and limit", () => {
    const firstPage = presetPolicy.merge(undefined, connection(1, ["1", "2"]), {
      args: { page: 1, limit: 2 },
    });
    const secondPage = presetPolicy.merge(
      firstPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(secondPage))).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("overwrites the existing slots when a page is refetched", () => {
    const firstPage = presetPolicy.merge(undefined, connection(1, ["1", "2"]), {
      args: { page: 1, limit: 2 },
    });
    const secondPage = presetPolicy.merge(
      firstPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );
    const refetched = presetPolicy.merge(
      secondPage,
      connection(1, ["1-new", "2-new"]),
      { args: { page: 1, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(refetched))).toEqual([
      "1-new",
      "2-new",
      "3",
      "4",
    ]);
  });

  it("compacts holes when pages arrive out of order", () => {
    const thirdPage = presetPolicy.merge(undefined, connection(3, ["5", "6"]), {
      args: { page: 3, limit: 2 },
    });

    expect(itemIds(presetPolicy.read(thirdPage))).toEqual(["5", "6"]);

    const secondPage = presetPolicy.merge(
      thirdPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(secondPage))).toEqual([
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("isolates filter and limit cache entries while sharing pages", () => {
    expect(presetPolicy.keyArgs).toEqual(["filter", "limit"]);
    expect(presetPolicy.keyArgs).not.toContain("page");
  });
});

function getPresetPolicy() {
  const policy = paginationTypePolicies.Query?.fields?.listPresets;

  if (
    !policy ||
    typeof policy === "function" ||
    typeof policy.merge !== "function" ||
    typeof policy.read !== "function"
  ) {
    throw new Error("Expected listPresets to define merge and read functions");
  }

  return {
    keyArgs: policy.keyArgs,
    merge: policy.merge as unknown as MergePresets,
    read: policy.read as unknown as ReadPresets,
  };
}

function connection(page: number, ids: string[]): PresetConnection {
  return {
    __typename: "PaginatedPresets",
    totalCount: 6,
    hasNextPage: page < 3,
    currentPage: page,
    totalPages: 3,
    presets: ids.map((id) => ({ __typename: "Preset", id })),
  };
}

function itemIds(connection: PresetConnection | undefined): string[] {
  return connection?.presets.map((preset) => preset.id) ?? [];
}
