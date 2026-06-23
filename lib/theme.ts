// Design tokens for the Northstar command center, lifted from the Command Center
// design (warm light theme + dark appearance). Centralised so screens, modals and
// the mobile frame all share one palette. A `dark` variant maps each warm surface
// to its dark equivalent (matching the design's dark appearance overrides).

export type ThemeMode = "light" | "dark" | "system";

export const accents = {
  accent: "#6d5bd0",
  accentSoft: "#8b7bea",
  warm: "#c2705a",
  warmSoft: "#e0a273",
  green: "#2f8f6b",
  teal: "#1f9e8a",
  amber: "#b07d22",
  gold: "#8a7a3e",
  blue: "#3a6ea5",
} as const;

type Surface = {
  bg: string;
  bgRaised: string;
  bgSunken: string;
  bgInput: string;
  bgCard: string;
  ink: string;
  inkSoft: string;
  muted: string;
  faint: string;
  fainter: string;
  faintest: string;
  line: string;
  lineSoft: string;
  lineStrong: string;
  borderBtn: string;
  borderDashed: string;
  appBg: string;
  navBg: string;
};

const light: Surface = {
  bg: "#f6f1e9",
  bgRaised: "#fffefb",
  bgSunken: "#faf6ef",
  bgInput: "#faf6ef",
  bgCard: "#fdfaf4",
  ink: "#2c2722",
  inkSoft: "#3a342d",
  muted: "#6f675c",
  faint: "#8a8175",
  fainter: "#9a9185",
  faintest: "#a59c8e",
  line: "rgba(44,39,34,.08)",
  lineSoft: "rgba(44,39,34,.07)",
  lineStrong: "rgba(44,39,34,.12)",
  borderBtn: "rgba(44,39,34,.16)",
  borderDashed: "rgba(44,39,34,.22)",
  appBg: "#f6f1e9",
  navBg: "rgba(246,241,233,.78)",
};

const dark: Surface = {
  bg: "#17140e",
  bgRaised: "#221d17",
  bgSunken: "#2b251d",
  bgInput: "#2b251d",
  bgCard: "#221d17",
  ink: "#ece7df",
  inkSoft: "#e0dace",
  muted: "#b7afa2",
  faint: "#9d9488",
  fainter: "#928a7e",
  faintest: "#8a8276",
  line: "rgba(255,255,255,.08)",
  lineSoft: "rgba(255,255,255,.06)",
  lineStrong: "rgba(255,255,255,.13)",
  borderBtn: "rgba(255,255,255,.16)",
  borderDashed: "rgba(255,255,255,.17)",
  appBg: "#16130e",
  navBg: "rgba(22,19,14,.84)",
};

export type Tokens = Surface & typeof accents & { font: string; serif: string };

export const makeTokens = (isDark: boolean): Tokens => ({
  ...(isDark ? dark : light),
  ...accents,
  font: "'Geist', system-ui, sans-serif",
  serif: "'Newsreader', serif",
});

// A rotating palette of category / debt / fund colors that the design reuses.
export const palette = [
  "#6d5bd0",
  "#c2705a",
  "#2f8f6b",
  "#3a6ea5",
  "#b07d22",
  "#8a7a3e",
  "#9b5fb0",
  "#d08a4a",
  "#5b8fd0",
  "#c25a8f",
] as const;

// rgba helper for the many translucent fills in the design.
export const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};
