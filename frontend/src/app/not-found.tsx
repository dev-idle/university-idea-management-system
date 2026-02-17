import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { TR_PAGE_FADE } from "@/config/design";

export default function NotFound() {
  return (
    <div className="login-page-bg grid min-h-screen place-items-center px-4 font-sans">
      <div className={`${TR_PAGE_FADE} flex w-full max-w-md flex-col items-center text-center`}>
        {/* Code — refined, weight-light */}
        <p className="text-[6rem] font-extralight tabular-nums leading-none tracking-tighter text-primary/20 sm:text-[7rem]">
          404
        </p>

        {/* Overline */}
        <p className="mb-2 mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Page not found
        </p>

        {/* Message */}
        <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground/80">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Actions — refined spacing */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className={buttonVariants({
              variant: "default",
              size: "default",
              className: "gap-2 shadow-sm",
            })}
          >
            <Home className="size-4 shrink-0" aria-hidden />
            Back to home
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
