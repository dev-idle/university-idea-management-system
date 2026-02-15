/**
 * Normalized error handling: extract user-facing messages from API/Error.
 * Use everywhere we display errors (error boundaries, forms, toasts).
 *
 * Fallback style: sentence case, concise, consistent.
 * - Operations: "Could not [verb] [object]."
 * - Destructive actions: "Could not [verb]."
 * - Load failures: "Could not load [resource]."
 */

const API_PREFIX = "API ";

/** Shared fallbacks for error boundaries and load failures. */
export const ERROR_FALLBACK = {
  /** When a list or resource fails to load. */
  load: "Could not load. Please try again.",
  /** Generic when no specific message applies. */
  generic: "Something went wrong.",
} as const;

/** Form and action fallbacks — use with getErrorMessage(error, FALLBACK.createCategory) etc. */
export const ERROR_FALLBACK_FORM = {
  createCategory: "Could not create category.",
  updateCategory: "Could not update category.",
  createCycle: "Could not create submission cycle.",
  updateCycle: "Could not update submission cycle.",
  createUser: "Could not create user.",
  updateUser: "Could not update user.",
  createDepartment: "Could not create department.",
  updateDepartment: "Could not update department.",
  createAcademicYear: "Could not create academic year.",
  updateAcademicYear: "Could not update academic year.",
  delete: "Could not delete.",
  deactivate: "Could not deactivate.",
  submitIdea: "Submission could not be completed.",
  updateIdea: "Update could not be completed.",
  upload: "Upload failed.",
  openFile: "Could not open file.",
  updatePassword: "Could not update password.",
  /** Login failed (invalid credentials or auth error). */
  loginInvalid: "Invalid email or password.",
} as const;

/**
 * Tries to parse NestJS-style error body: { message: string } or { message: string[] }.
 * Returns the first message or the string as-is if not an array.
 */
function parseApiMessage(jsonStr: string): string | null {
  try {
    const data = JSON.parse(jsonStr) as unknown;
    if (data != null && typeof data === "object" && "message" in data) {
      const msg = (data as { message: string | string[] }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
      if (Array.isArray(msg) && msg.length > 0 && typeof msg[0] === "string")
        return msg[0].trim();
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/**
 * Returns a user-facing error message from any thrown value.
 * - For "API status: body" errors, parses JSON body and uses message field.
 * - For Error instances, uses message (after stripping API prefix if present).
 * - Otherwise uses fallback.
 */
export function getErrorMessage(
  error: unknown,
  fallback?: string
): string {
  const fb = fallback ?? ERROR_FALLBACK.generic;
  if (error == null) return fb;

  let raw = "";
  if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === "string") {
    raw = error;
  } else {
    return fb;
  }

  const trimmed = raw.trim();
  if (!trimmed) return fb;

  // API client throws "API 400: {...}" or "API 401: Unauthorized"
  if (trimmed.startsWith(API_PREFIX)) {
    const afterPrefix = trimmed.slice(API_PREFIX.length);
    const colonIndex = afterPrefix.indexOf(":");
    const body = colonIndex >= 0 ? afterPrefix.slice(colonIndex + 1).trim() : afterPrefix;
    const parsed = parseApiMessage(body);
    if (parsed) return parsed;
    // If body looks like JSON but we didn't get message, avoid showing raw JSON
    if (body.startsWith("{")) return fb;
    if (body.length > 0 && body.length < 200) return body;
  }

  // Don't expose long stack traces or internal messages
  if (trimmed.length > 300) return fb;
  return trimmed;
}
