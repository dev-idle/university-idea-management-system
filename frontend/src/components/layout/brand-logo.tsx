import { cn } from "@/lib/utils";

/**
 * Logo source: 1200 x 304 → aspect ratio 75 / 19 (≈ 3.947).
 * Uses CSS mask (globals.css) — inherits --primary automatically.
 */
const LOGO_ASPECT = "75 / 19";

interface BrandLogoProps {
  className?: string;
  /** Object-position: "left" keeps the compass visible in tight crops. Default "center". */
  align?: "left" | "center";
  label?: string;
}

/**
 * Renders the Greenwich logo. Uses mask-image + background-color (--primary)
 * so the logo always matches the theme. Set height (e.g. h-7); width follows 75:19.
 */
export function BrandLogo({ className, align = "center", label = "University of Greenwich" }: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "brand-logo block bg-primary",
        align === "left" ? "object-left" : "object-center",
        className,
      )}
      style={{ aspectRatio: LOGO_ASPECT }}
    />
  );
}
