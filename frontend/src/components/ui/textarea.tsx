import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 aria-invalid:border-destructive/80 aria-invalid:ring-destructive/10 dark:aria-invalid:ring-destructive/15 dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-lg border border-border/80 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
