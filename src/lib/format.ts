/**
 * Deterministic formatters.
 *
 * Everything here formats in UTC with hand-rolled logic rather than
 * `toLocaleString`, so the markup rendered on the server matches the markup
 * rendered in the browser regardless of the visitor's locale or timezone.
 */

/** Exported for the dashboard's trend chart, which labels months by name. */
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const;

const pad = (value: number) => String(value).padStart(2, "0");

/** `24 Oct 2024, 10:08 am` — the format used across every table. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  const hours24 = date.getUTCHours();
  const meridiem = hours24 < 12 ? "am" : "pm";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${pad(
    hours12,
  )}:${pad(date.getUTCMinutes())} ${meridiem}`;
}

/** Indian digit grouping: 1234567 -> 12,34,567 */
function groupIndian(value: number): string {
  const [whole, fraction] = Math.abs(value).toFixed(2).split(".");
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`
    : last3;
  const sign = value < 0 ? "-" : "";
  return fraction === "00" ? `${sign}${grouped}` : `${sign}${grouped}.${fraction}`;
}

/** `₹12,34,567` — falls back to a dash for empty values. */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `₹${groupIndian(value)}`;
}

/** `16,243` — plain thousands grouping for stat cards. */
export function formatNumber(value: number): string {
  return groupIndian(Math.round(value)).replace(/\.00$/, "");
}

export const nowIso = () => new Date().toISOString();
