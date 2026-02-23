/**
 * CSV escape utility. Prevents formula injection and handles special chars.
 * OWASP: prefix =, +, -, @ with ' to prevent Excel formula execution.
 */
export function escapeCsvValue(value: unknown): string {
  if (value == null || value === '') return '';
  const s = String(value);
  // Formula injection: escape leading = + - @ \
  const first = s.charAt(0);
  if (
    first === '=' ||
    first === '+' ||
    first === '-' ||
    first === '@' ||
    first === '\\'
  ) {
    return `'${escapeQuotes(s)}`;
  }
  return escapeQuotes(s);
}

function escapeQuotes(s: string): string {
  if (
    s.includes('"') ||
    s.includes('\n') ||
    s.includes('\r') ||
    s.includes(',')
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
