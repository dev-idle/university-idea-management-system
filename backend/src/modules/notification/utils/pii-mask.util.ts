/**
 * PII masking for logging. Reduces exposure of sensitive data in production logs.
 */

/**
 * Masks email for logging: "user@domain.com" → "use***@domain.com"
 * In development, returns full email for debugging.
 */
export function maskEmailForLog(email: string, isProduction: boolean): string {
  if (!isProduction) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = Math.min(3, Math.floor(local.length / 2));
  return `${local.slice(0, visible)}***@${domain}`;
}
