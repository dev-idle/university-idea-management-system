/**
 * CSV escape utility. Prevents formula injection and handles special chars.
 * OWASP: prefix =, +, -, @ with ' to prevent Excel formula execution.
 */
export function escapeCsvValue(value: unknown): string {
  if (value == null || value === '') return '';
  let raw: string;
  if (typeof value === 'object') {
    raw = JSON.stringify(value);
  } else {
    raw = String(value as string | number | boolean | symbol | bigint);
  }
  const s = raw.trim();
  if (s === '') return '';
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
