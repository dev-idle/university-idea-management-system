import { cn } from "@/lib/utils";

interface BrandIconProps {
  className?: string;
  label?: string;
}

/**
 * Greenwich compass icon for collapsed sidebar and other compact contexts.
 * Uses mask-image + background-color (--primary) in globals.css — inherits theme.
 */
export function BrandIcon({ className, label = "University of Greenwich" }: BrandIconProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("brand-icon block shrink-0 bg-primary", className)}
    />
  );
}
