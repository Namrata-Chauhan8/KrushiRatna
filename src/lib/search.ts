/** Case-insensitive "does any of these fields contain the query" test. */
export function matchesQuery(
  query: string,
  ...fields: Array<string | number | null | undefined>
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return fields.some((field) =>
    field === null || field === undefined
      ? false
      : String(field).toLowerCase().includes(needle),
  );
}
