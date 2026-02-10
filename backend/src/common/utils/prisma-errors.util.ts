/**
 * Prisma error helpers. Use across services to avoid duplicating
 * Prisma-specific error-code checks.
 */

/** True when a Prisma `update`/`delete` throws P2025 (record not found). */
export function isPrismaNotFound(e: unknown): boolean {
  return (
    e != null &&
    typeof e === 'object' &&
    (e as { code?: string }).code === 'P2025'
  );
}
