/**
 * Reusable query-string pagination parser.
 * Clamps page >= 1 and limit within [1, maxLimit].
 */

export interface PaginationDefaults {
  /** Default page number (>= 1). Default: 1 */
  page?: number;
  /** Default items per page. Default: 10 */
  limit?: number;
  /** Upper bound for limit. Default: 50 */
  maxLimit?: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
}

export function parsePagination(
  page?: string,
  limit?: string,
  defaults: PaginationDefaults = {},
): ParsedPagination {
  const { page: defaultPage = 1, limit: defaultLimit = 10, maxLimit = 50 } = defaults;

  const parsedPage = page ? parseInt(page, 10) : defaultPage;
  const parsedLimit = limit ? parseInt(limit, 10) : defaultLimit;

  return {
    page: Math.max(1, Number.isFinite(parsedPage) ? parsedPage : defaultPage),
    limit: Math.max(1, Math.min(maxLimit, Number.isFinite(parsedLimit) ? parsedLimit : defaultLimit)),
  };
}
