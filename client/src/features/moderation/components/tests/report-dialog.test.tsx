// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import ReportDialog from "../ReportDialog";
import { REPORT_CONTENT } from "@/features/moderation/graphql/reports";

const TARGET_ID = "656f00000000000000000001";

const filedReport = {
  __typename: "Report",
  id: "656f00000000000000000009",
  targetType: "PRESET",
  targetId: TARGET_ID,
  reason: "SPAM",
  detail: null,
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
};

const successMock = {
  request: {
    query: REPORT_CONTENT,
    variables: {
      targetType: "PRESET",
      targetId: TARGET_ID,
      reason: "SPAM",
      detail: null,
    },
  },
  result: { data: { reportContent: filedReport } },
};

const renderDialog = (
  mocks: readonly object[] = [],
  onClose: () => void = () => {}
) =>
  render(
    <MockedProvider mocks={mocks as never[]}>
      <ReportDialog
        open
        onClose={onClose}
        targetType="PRESET"
        targetId={TARGET_ID}
        targetName="Muted Greens"
      />
    </MockedProvider>
  );

const submitButton = () => screen.getByRole("button", { name: /send report/i });

afterEach(cleanup);

describe("ReportDialog", () => {
  it("names what is being reported", () => {
    renderDialog();

    expect(screen.getByText(/Muted Greens/)).toBeTruthy();
  });

  it("cannot be submitted until a reason is picked", () => {
    renderDialog();

    // An empty report tells a moderator nothing, so the button stays disabled.
    expect(submitButton().hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByLabelText("Spam or advertising"));
    expect(submitButton().hasAttribute("disabled")).toBe(false);
  });

  it('requires the detail when the reason is "Something else"', () => {
    renderDialog();

    fireEvent.click(screen.getByLabelText("Something else"));
    expect(submitButton().hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("Report details"), {
      target: { value: "The photo is a stock image." },
    });
    expect(submitButton().hasAttribute("disabled")).toBe(false);
  });

  it("blocks a detail longer than the server accepts", () => {
    renderDialog();

    fireEvent.click(screen.getByLabelText("Spam or advertising"));
    fireEvent.change(screen.getByLabelText("Report details"), {
      target: { value: "x".repeat(1001) },
    });

    expect(submitButton().hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/keep this under 1000 characters/i)).toBeTruthy();
  });

  it("thanks the reporter once the report is filed", async () => {
    renderDialog([successMock]);

    fireEvent.click(screen.getByLabelText("Spam or advertising"));
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(screen.getByText(/a moderator will take a look/i)).toBeTruthy()
    );
    // The form is gone, so the same report cannot be sent twice by accident.
    expect(screen.queryByRole("button", { name: /send report/i })).toBeNull();
  });

  it("shows the server's message when the report is refused", async () => {
    const failureMock = {
      ...successMock,
      result: undefined,
      error: new Error("Too many attempts. Please try again in 60 seconds."),
    };
    renderDialog([failureMock]);

    fireEvent.click(screen.getByLabelText("Spam or advertising"));
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(screen.getByText(/Too many attempts/)).toBeTruthy()
    );
  });

  it("clears itself when cancelled so the next report starts empty", () => {
    const onClose = vi.fn();
    renderDialog([], onClose);

    fireEvent.click(screen.getByLabelText("Abuse or harassment"));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      (screen.getByLabelText("Abuse or harassment") as HTMLInputElement).checked
    ).toBe(false);
  });
});
