// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import AdminReports from "../AdminReports";
import { LIST_REPORTS } from "@/features/moderation/graphql/reports";

const mockAdmin = vi.hoisted(() => ({ value: false }));

vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => mockAdmin.value,
}));

const emptyQueue = {
  request: {
    query: LIST_REPORTS,
    variables: { status: "OPEN", page: 1, limit: 20 },
  },
  result: {
    data: {
      listReports: {
        __typename: "PaginatedReports",
        reports: [],
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages: 0,
      },
    },
  },
};

const oneOpenReport = {
  ...emptyQueue,
  result: {
    data: {
      listReports: {
        __typename: "PaginatedReports",
        reports: [
          {
            __typename: "Report",
            id: "656f00000000000000000009",
            targetType: "PRESET",
            targetId: "656f00000000000000000001",
            reason: "STOLEN_CONTENT",
            detail: "This is my photograph.",
            targetUrl: "/preset/muted-greens",
            status: "OPEN",
            createdAt: "2026-08-26T09:00:00.000Z",
            resolvedAt: null,
            reporter: {
              __typename: "User",
              id: "656f0000000000000000000a",
              username: "arran",
              avatar: null,
            },
            resolvedBy: null,
          },
        ],
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        totalPages: 1,
      },
    },
  },
};

const renderPage = (mocks: readonly object[] = []) =>
  render(
    <MockedProvider mocks={mocks as never[]}>
      <MemoryRouter>
        <AdminReports />
      </MemoryRouter>
    </MockedProvider>
  );

afterEach(() => {
  cleanup();
  mockAdmin.value = false;
});

describe("AdminReports", () => {
  it("tells a non-admin the page is not for them and asks the server nothing", () => {
    // No mocks are provided: if the query ran, MockedProvider would error.
    renderPage();

    expect(screen.getByText(/for moderators/i)).toBeTruthy();
  });

  it("shows a spinner while the queue loads", () => {
    mockAdmin.value = true;
    renderPage([emptyQueue]);

    expect(screen.getByLabelText("Loading reports")).toBeTruthy();
  });

  it("says the queue is empty rather than showing nothing", async () => {
    mockAdmin.value = true;
    renderPage([emptyQueue]);

    await waitFor(() =>
      expect(screen.getByText("Nothing in the queue.")).toBeTruthy()
    );
  });

  it("shows an open report with its reason, reporter and a link through", async () => {
    mockAdmin.value = true;
    renderPage([oneOpenReport]);

    await waitFor(() =>
      expect(screen.getByText("Not the uploader's work")).toBeTruthy()
    );
    expect(screen.getByText(/arran/)).toBeTruthy();
    expect(screen.getByText("This is my photograph.")).toBeTruthy();

    const link = screen.getByRole("link", { name: /view preset/i });
    expect(link.getAttribute("href")).toBe("/preset/muted-greens");

    // Both outcomes are one click away; neither is the default.
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Actioned" })).toBeTruthy();
  });
});
