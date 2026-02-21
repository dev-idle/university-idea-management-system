import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-lg border border-border/80 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1",
        "aria-invalid:border-destructive/80 aria-invalid:ring-destructive/10 dark:aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
