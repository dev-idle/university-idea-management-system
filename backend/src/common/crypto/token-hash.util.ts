import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;
const HASH_ALGO = 'sha256';

/**
 * Generate cryptographically secure reset token (32 bytes = 64 hex chars).
 * OWASP: sufficient length, CSPRNG.
 */
export function generateResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * Hash token for storage. Never store raw token.
 * OWASP: stored securely.
 */
export function hashToken(token: string): string {
  return createHash(HASH_ALGO).update(token, 'utf8').digest('hex');
}

/**
 * Timing-safe token comparison. Prevents timing attacks.
 * OWASP: constant-time comparison.
 */
export function tokensEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
