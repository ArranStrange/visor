// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  act,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { CameraProvider, useCamera } from "@/context/CameraContext";
import {
  PRIMARY_CAMERA_KEY,
  SHOW_ALL_GENERATIONS_KEY,
  clearStoredCamera,
} from "@/context/camera-storage";
import { GET_USER_PROFILE } from "@/features/auth/graphql/users";

const mockAuth = vi.hoisted(() => ({ isAuthenticated: false }));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

// The context is driven through rendered controls rather than by capturing
// its setters into module scope, which the react-hooks lint rules forbid.
function Probe({ pick }: { pick?: string | null }) {
  const camera = useCamera();

  return (
    <div>
      <span data-testid="key">{camera.cameraKey ?? "none"}</span>
      <span data-testid="name">{camera.camera?.name ?? "none"}</span>
      <span data-testid="sensor">{camera.sensorKey ?? "none"}</span>
      <span data-testid="all">{String(camera.showAllGenerations)}</span>
      <button
        data-testid="pick"
        onClick={() => camera.setPrimaryCamera(pick ?? null)}
      />
      <button
        data-testid="show-all"
        onClick={() => camera.setShowAllGenerations(true)}
      />
    </div>
  );
}

const profileMock = (primaryCamera: string | null) => ({
  request: { query: GET_USER_PROFILE },
  result: {
    data: {
      getCurrentUser: {
        __typename: "User",
        id: "u1",
        username: "ansel",
        email: "ansel@example.com",
        avatar: null,
        bio: null,
        instagram: null,
        cameras: [],
        primaryCamera,
      },
    },
  },
});

const renderProvider = (
  mocks: ReturnType<typeof profileMock>[] = [],
  pick?: string | null
) =>
  render(
    <MockedProvider mocks={mocks}>
      <CameraProvider>
        <Probe pick={pick} />
      </CameraProvider>
    </MockedProvider>
  );

const text = (id: string) => screen.getByTestId(id).textContent;
const click = (id: string) => fireEvent.click(screen.getByTestId(id));

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

beforeEach(() => {
  localStorage.clear();
  mockAuth.isAuthenticated = false;
});

afterEach(cleanup);

describe("CameraProvider", () => {
  it("starts with no camera when nothing is stored", () => {
    renderProvider();

    expect(text("key")).toBe("none");
    expect(text("name")).toBe("none");
    expect(text("sensor")).toBe("none");
    expect(text("all")).toBe("false");
  });

  it("stores the normalized catalogue key, not the display string", () => {
    renderProvider([], "Fujifilm X-T30 II");

    click("pick");

    expect(localStorage.getItem(PRIMARY_CAMERA_KEY)).toBe("xt30ii");
    expect(text("key")).toBe("xt30ii");
    // The display name is derived from the catalogue, never from storage.
    expect(text("name")).toBe("X-T30 II");
    expect(text("sensor")).toBe("x-trans-iv");
  });

  it("hydrates lazily from a value stored by a previous session", () => {
    localStorage.setItem(PRIMARY_CAMERA_KEY, "x100vi");

    renderProvider();

    expect(text("name")).toBe("X100VI");
    expect(text("sensor")).toBe("x-trans-v");
  });

  it("discards a stored value the catalogue no longer knows", () => {
    localStorage.setItem(PRIMARY_CAMERA_KEY, "leicaq3");

    renderProvider();

    expect(text("key")).toBe("none");
  });

  it("clears the stored value when the camera is unset", () => {
    localStorage.setItem(PRIMARY_CAMERA_KEY, "xt5");
    renderProvider([], null);

    click("pick");

    expect(localStorage.getItem(PRIMARY_CAMERA_KEY)).toBeNull();
    expect(text("key")).toBe("none");
  });

  it("ignores a camera name outside the catalogue", () => {
    renderProvider([], "Nikon Z6");

    click("pick");

    expect(text("key")).toBe("none");
    expect(localStorage.getItem(PRIMARY_CAMERA_KEY)).toBeNull();
  });

  it("persists showAllGenerations across sessions", () => {
    renderProvider();
    click("show-all");
    expect(localStorage.getItem(SHOW_ALL_GENERATIONS_KEY)).toBe("true");

    cleanup();
    renderProvider();
    expect(text("all")).toBe("true");
  });

  it("survives localStorage throwing instead of blanking the app", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderProvider()).not.toThrow();
    expect(text("key")).toBe("none");

    getItem.mockRestore();
    consoleError.mockRestore();
  });

  it("adopts the profile's camera when this device has none", async () => {
    mockAuth.isAuthenticated = true;

    renderProvider([profileMock("X-T5")]);
    await flush();

    expect(text("key")).toBe("xt5");
    expect(localStorage.getItem(PRIMARY_CAMERA_KEY)).toBe("xt5");
  });

  it("never lets a stale profile value overwrite this device's choice", async () => {
    mockAuth.isAuthenticated = true;
    localStorage.setItem(PRIMARY_CAMERA_KEY, "xt5");

    renderProvider([profileMock("X-Pro1")]);
    await flush();

    expect(text("key")).toBe("xt5");
  });
});

describe("clearStoredCamera", () => {
  it("removes both keys so the next user starts clean", () => {
    localStorage.setItem(PRIMARY_CAMERA_KEY, "xt5");
    localStorage.setItem(SHOW_ALL_GENERATIONS_KEY, "true");

    clearStoredCamera();

    expect(localStorage.getItem(PRIMARY_CAMERA_KEY)).toBeNull();
    expect(localStorage.getItem(SHOW_ALL_GENERATIONS_KEY)).toBeNull();
  });
});
