/**
 * Formats a Date into a `YYYY-MM-DD` string suitable for API query params.
 * Returns `undefined` when no date is provided.
 */
export function formatDateParam(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
