/**
 * Join conditional class names.
 *
 * Deliberately tiny: this project never needs to merge conflicting Tailwind
 * utilities, only to drop falsy values.
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
