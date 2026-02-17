import { cn } from "@/lib/utils"

/** Base skeleton — muted/[0.08], design-system aligned. Override with className for variants. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted/[0.08]", className)}
      {...props}
    />
  )
}

export { Skeleton }
