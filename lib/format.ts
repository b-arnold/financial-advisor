// Number / date formatting helpers used across the command center.

export const usd0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const usd2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Compact for axis labels etc: $4.8k
export const usdK = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1000) return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return usd0(n);
};

export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

// "2026-06-18" -> "Jun 18"
export function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${mon} ${d}`;
}

// "2026-12" -> "December 2026"
export function monthYear(iso: string | null) {
  if (!iso) return "—";
  const [y, m] = iso.split("-").map(Number);
  const mon = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1];
  return `${mon} ${y}`;
}

export const initialOf = (s: string) => (s.trim()[0] || "?").toUpperCase();
