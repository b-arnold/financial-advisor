import { describe, it, expect } from "vitest";
import {
  SCREEN_PATH,
  screenFromPath,
  mobileTabFromPath,
  pathForScreen,
  pathForMobileTab,
} from "./routes";

describe("screenFromPath", () => {
  it("maps the index route to 'today'", () => {
    expect(screenFromPath("/")).toBe("today");
  });

  it("maps known paths back to their screen", () => {
    expect(screenFromPath("/spending")).toBe("spending");
    expect(screenFromPath("/debt")).toBe("debt");
    expect(screenFromPath("/funds")).toBe("funds");
    expect(screenFromPath("/advisor")).toBe("advisor");
  });

  it("falls back to 'today' for unknown paths", () => {
    expect(screenFromPath("/does-not-exist")).toBe("today");
    expect(screenFromPath("")).toBe("today");
  });

  it("round-trips every canonical screen path", () => {
    for (const [screen, path] of Object.entries(SCREEN_PATH)) {
      expect(screenFromPath(path)).toBe(screen);
    }
  });
});

describe("mobileTabFromPath", () => {
  it("returns the screen when it is a valid mobile tab", () => {
    expect(mobileTabFromPath("/spending")).toBe("spending");
    expect(mobileTabFromPath("/funds")).toBe("funds");
    expect(mobileTabFromPath("/debt")).toBe("debt");
    expect(mobileTabFromPath("/")).toBe("today");
  });

  it("falls back to 'today' for screens not in the mobile tab set", () => {
    expect(mobileTabFromPath("/trends")).toBe("today");
    expect(mobileTabFromPath("/bills")).toBe("today");
    expect(mobileTabFromPath("/onboarding")).toBe("today");
  });
});

describe("pathForScreen / pathForMobileTab", () => {
  it("returns the canonical path for a screen", () => {
    expect(pathForScreen("today")).toBe("/");
    expect(pathForScreen("spending")).toBe("/spending");
    expect(pathForScreen("onboarding")).toBe("/onboarding");
  });

  it("returns the canonical path for a mobile tab", () => {
    expect(pathForMobileTab("advisor")).toBe("/advisor");
    expect(pathForMobileTab("today")).toBe("/");
  });
});
