import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Human-readable relative time (e.g. "3 minutes ago", "2 days ago").
 * Falls back to full date for older entries.
 */
export function timeAgo(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} ${day === 1 ? "day" : "days"} ago`;
  const w = Math.floor(day / 7);
  if (w < 5) return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Display info for a comment. Respects isAnonymous — never exposes author when anonymous. */
export function getCommentDisplayInfo(
  comment: { isAnonymous: boolean; author?: { fullName?: string | null; email: string } | null },
) {
  if (comment.isAnonymous || !comment.author) {
    return { displayName: "Anonymous" as const, avatarInitial: "?" as const };
  }
  return {
    displayName:
      comment.author.fullName?.trim() || comment.author.email,
    avatarInitial: getAvatarInitial(
      comment.author.fullName ?? null,
      comment.author.email,
    ),
  };
}

/**
 * Avatar initial: first character of full name if available, otherwise first letter of email.
 * Keeps Profile and navbar avatar in sync.
 */
export function getAvatarInitial(
  fullName: string | null | undefined,
  email: string
): string {
  const name = fullName?.trim()
  if (name && name.length > 0) return name[0].toUpperCase()
  const local = email.split("@")[0]
  if (local?.length > 0) return local[0].toUpperCase()
  return email.length > 0 ? email[0].toUpperCase() : "?"
}
