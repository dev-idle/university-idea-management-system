import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo source: 1200 x 304 → aspect ratio 75 / 19 (≈ 3.947).
 * Height-driven sizing: set height via className, width auto-follows.
 */
const LOGO_ASPECT = "75 / 19";

interface BrandLogoProps {
  className?: string;
  /** Object-position: "left" keeps the compass visible in tight crops. Default "center". */
  align?: "left" | "center";
  label?: string;
}

/**
 * Renders the Greenwich logo recolored to the site's primary via SVG
 * feColorMatrix filter (defined in globals.css as `.brand-logo`).
 *
 * The filter replaces every pixel's RGB with the exact primary color while
 * preserving the original alpha channel, so anti-aliased edges stay smooth.
 *
 * - Light mode: deep indigo (#262067) matching --primary
 * - Dark mode:  bright lavender (#7d7df9) matching --primary
 *
 * Set height only (e.g. `className="h-7"`); width auto-follows the 75:19 ratio.
 */
export function BrandLogo({ className, align = "center", label = "University of Greenwich" }: BrandLogoProps) {
  return (
    <Image
      src="/greenwich-logo.png"
      alt={label}
      width={1200}
      height={304}
      className={cn(
        "brand-logo object-contain",
        align === "left" ? "object-left" : "object-center",
        className,
      )}
      style={{ aspectRatio: LOGO_ASPECT }}
      priority
      draggable={false}
    />
  );
}
