import { cn } from "@/lib/utils";

const LOGO_SRC = "/greenwich-logo.png";

/**
 * Logo source dimensions: 1200 x 304 → aspect ratio 75 / 19 (≈ 3.947).
 * Setting this on the element means we only need to specify height;
 * width auto-computes to the exact logo proportion, keeping the mask
 * pixel-perfect with no dead space.
 */
const LOGO_ASPECT = "75 / 19";

interface BrandLogoProps {
  className?: string;
  /** Mask alignment: "left" keeps the compass visible in tight spaces. Default "center". */
  align?: "left" | "center";
  label?: string;
}

const maskBase: React.CSSProperties = {
  maskImage: `url(${LOGO_SRC})`,
  maskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskImage: `url(${LOGO_SRC})`,
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  aspectRatio: LOGO_ASPECT,
};

/**
 * Renders the Greenwich logo in the site's primary color using CSS mask-image.
 * The PNG acts as the shape mask; `bg-primary` fills the color.
 * Automatically follows light / dark theme with no filter hacks.
 *
 * Usage: set height only (e.g. `className="h-7"`); width follows the logo's
 * native 75:19 aspect ratio for sharp, proportionally correct rendering.
 */
export function BrandLogo({ className, align = "center", label = "University of Greenwich" }: BrandLogoProps) {
  const position = align === "left" ? "left center" : "center center";

  return (
    <div
      className={cn("bg-primary", className)}
      style={{
        ...maskBase,
        maskPosition: position,
        WebkitMaskPosition: position,
      }}
      role="img"
      aria-label={label}
    />
  );
}
