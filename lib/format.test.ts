import { describe, it, expect } from "vitest";
import { usd0, usd2, usdK, pct, shortDate, monthYear, initialOf } from "./format";

describe("usd0", () => {
  it("formats whole dollars with no decimals", () => {
    expect(usd0(1234)).toBe("$1,234");
    expect(usd0(0)).toBe("$0");
  });

  it("rounds fractional cents away", () => {
    expect(usd0(1234.56)).toBe("$1,235");
  });

  it("formats negatives", () => {
    expect(usd0(-50)).toBe("-$50");
  });
});

describe("usd2", () => {
  it("always shows two decimals", () => {
    expect(usd2(1234)).toBe("$1,234.00");
    expect(usd2(7.5)).toBe("$7.50");
    expect(usd2(0)).toBe("$0.00");
  });
});

describe("usdK", () => {
  it("uses plain dollars below 1000", () => {
    expect(usdK(999)).toBe("$999");
    expect(usdK(0)).toBe("$0");
  });

  it("shows one decimal between 1k and 10k", () => {
    expect(usdK(4800)).toBe("$4.8k");
    expect(usdK(1000)).toBe("$1.0k");
  });

  it("drops the decimal at or above 10k", () => {
    expect(usdK(12000)).toBe("$12k");
    expect(usdK(10000)).toBe("$10k");
  });

  it("handles negatives with a leading minus", () => {
    expect(usdK(-4800)).toBe("-$4.8k");
    expect(usdK(-12000)).toBe("-$12k");
  });
});

describe("pct", () => {
  it("defaults to zero decimals", () => {
    expect(pct(42)).toBe("42%");
    expect(pct(42.6)).toBe("43%");
  });

  it("respects a digits argument", () => {
    expect(pct(42.567, 1)).toBe("42.6%");
    expect(pct(42, 2)).toBe("42.00%");
  });
});

describe("shortDate", () => {
  it("renders an ISO date as 'Mon D'", () => {
    expect(shortDate("2026-06-18")).toBe("Jun 18");
    expect(shortDate("2026-01-01")).toBe("Jan 1");
    expect(shortDate("2026-12-31")).toBe("Dec 31");
  });
});

describe("monthYear", () => {
  it("renders 'yyyy-mm' as full month and year", () => {
    expect(monthYear("2026-12")).toBe("December 2026");
    expect(monthYear("2027-06")).toBe("June 2027");
  });

  it("returns an em dash for null", () => {
    expect(monthYear(null)).toBe("—");
  });
});

describe("initialOf", () => {
  it("returns the uppercased first non-space character", () => {
    expect(initialOf("brett")).toBe("B");
    expect(initialOf("  jordan")).toBe("J");
  });

  it("falls back to '?' for empty input", () => {
    expect(initialOf("")).toBe("?");
    expect(initialOf("   ")).toBe("?");
  });
});
