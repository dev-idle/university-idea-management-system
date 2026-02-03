import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
