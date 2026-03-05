"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Book,
  Buildings,
  ChatCircle,
  Clock,
  Compass,
  FileText,
  Lightbulb,
  PaperPlaneRight,
  Share,
  Sparkle,
  ThumbsUp,
} from "@phosphor-icons/react";

export function LoginAcademicPanel() {
  return (
    <aside
      className="login-academic-panel relative hidden min-h-screen flex-1 overflow-hidden md:flex"
      aria-hidden
    >
      {/* Ambient glow + gradient mesh */}
      <div className="login-academic-orbs pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
      <div className="login-mesh-gradient pointer-events-none absolute inset-0" aria-hidden />

      {/* Greenwich silhouette — iconic domes + building mass */}
      <div className="login-greenwich-silhouette pointer-events-none absolute inset-0" aria-hidden>
        <svg viewBox="0 0 600 400" className="absolute -right-16 top-1/2 h-[88%] w-[92%] -translate-y-1/2 object-cover opacity-[0.5] dark:opacity-[0.35]" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <linearGradient id="greenwich-dome-fill" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgb(40,34,75)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="rgb(40,34,75)" stopOpacity="0.11" />
              <stop offset="100%" stopColor="rgb(40,34,75)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <ellipse cx="380" cy="90" rx="75" ry="55" fill="url(#greenwich-dome-fill)" />
          <ellipse cx="520" cy="85" rx="70" ry="52" fill="url(#greenwich-dome-fill)" />
          <path fill="url(#greenwich-dome-fill)" d="M250 400 V200 L280 170 L320 150 L380 140 L440 150 L480 170 L520 200 L550 400 Z" />
          <path fill="url(#greenwich-dome-fill)" opacity="0.75" d="M270 400 V220 L350 180 L450 180 L530 220 V400 Z" />
        </svg>
      </div>

      {/* Compass pattern — Prime Meridian, navigation heritage */}
      <div className="login-compass-pattern pointer-events-none absolute inset-0 opacity-[0.38] dark:opacity-[0.11]" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-compass" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
              <circle cx="32" cy="32" r="0.5" fill="rgb(113,113,122)" />
              <line x1="32" y1="8" x2="32" y2="20" stroke="rgb(161,161,170)" strokeWidth="0.4" />
              <line x1="32" y1="44" x2="32" y2="56" stroke="rgb(161,161,170)" strokeWidth="0.4" />
              <line x1="8" y1="32" x2="20" y2="32" stroke="rgb(161,161,170)" strokeWidth="0.4" />
              <line x1="44" y1="32" x2="56" y2="32" stroke="rgb(161,161,170)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-compass)" />
        </svg>
      </div>

      {/* Layout: logo top, content middle, cards bottom */}
      <div className="relative z-10 flex h-full flex-col justify-between px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6 xl:px-10 xl:pt-10 xl:pb-7">
        <div>
          <BrandLogo className="h-14 w-40 drop-shadow-sm dark:drop-shadow-[0_0_16px_rgba(255,255,255,0.25)] xl:h-16 xl:w-44" align="left" />
        </div>

        <div className="relative flex flex-1 flex-col justify-center pl-2">
          <div className="relative ml-0 mr-auto w-full max-w-md pl-6 pr-12 py-10 hidden md:block">
            {/* Icons — portal features: Ideas, Submit, Share, Vote, Proposals, QA, Sparkle, Book */}
            <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
              <div className="absolute -left-2 top-[8%] flex h-8 w-8 rotate-[-6deg] items-center justify-center rounded-lg bg-amber-500/8 text-amber-600/90 dark:bg-amber-400/8 dark:text-amber-400/90">
                <Lightbulb className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute left-[50%] top-[-8%] flex h-9 w-9 rotate-[5deg] items-center justify-center rounded-xl bg-primary/8 text-primary/90 dark:bg-primary/12 dark:text-primary/90">
                <PaperPlaneRight className="text-current" size={16} weight="duotone" />
              </div>
              <div className="absolute right-[2%] top-[20%] flex h-7 w-7 rotate-[4deg] items-center justify-center rounded-md bg-sky-500/8 text-sky-600/80 dark:bg-sky-400/8 dark:text-sky-400/80">
                <Share className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute left-[58%] top-[12%] flex h-8 w-8 rotate-[-8deg] items-center justify-center rounded-md bg-emerald-500/8 text-emerald-600/80 dark:bg-emerald-400/8 dark:text-emerald-400/80">
                <ThumbsUp className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute left-[8%] bottom-[-6%] flex h-7 w-7 rotate-[6deg] items-center justify-center rounded-lg bg-violet-500/8 text-violet-600/80 dark:bg-violet-400/8 dark:text-violet-400/80">
                <FileText className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute right-[28%] bottom-[-5%] flex h-8 w-8 rotate-[-4deg] items-center justify-center rounded-md bg-rose-500/8 text-rose-600/80 dark:bg-rose-400/8 dark:text-rose-400/80">
                <ChatCircle className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute left-[46%] top-[38%] flex h-8 w-8 rotate-[3deg] items-center justify-center rounded-lg bg-indigo-500/8 text-indigo-600/80 dark:bg-indigo-400/8 dark:text-indigo-400/80">
                <Sparkle className="text-current" size={14} weight="duotone" />
              </div>
              <div className="absolute left-[28%] bottom-[2%] flex h-7 w-7 rotate-[-5deg] items-center justify-center rounded-md bg-zinc-500/8 text-zinc-600/70 dark:bg-zinc-400/8 dark:text-zinc-400/70">
                <Book className="text-current" size={14} weight="duotone" />
              </div>
            </div>

            {/* Headline — balanced typographic rhythm */}
            <div className="relative z-10">
              <p className="login-headline-line login-headline-line-1 text-[13px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Greenwich Idea Portal
              </p>
              <h2 className="mt-4 font-sans text-[2.15rem] font-light leading-[1.3] tracking-tight text-foreground xl:text-[2.75rem] xl:leading-[1.25]">
                <span className="login-headline-line login-headline-line-2 block text-muted-foreground">Discover</span>
                <span className="login-headline-line login-headline-line-3 mt-1.5 block pl-6 font-semibold text-primary dark:text-primary xl:pl-8">ideas</span>
                <span className="login-headline-line login-headline-line-4 mt-1 block pl-12 font-light text-foreground/90 xl:pl-16">
                  worth sharing.
                </span>
              </h2>
              <p className="login-headline-line login-headline-line-5 mt-5 text-[14px] leading-[1.65] text-muted-foreground/95">
                Submit and share ideas from Greenwich, on the Thames.
              </p>
            </div>
          </div>

          {/* Mobile headline */}
          <div className="relative z-10 ml-6 max-w-sm md:hidden">
            <p className="login-headline-line login-headline-line-1 text-[13px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Greenwich Idea Portal
            </p>
            <h2 className="mt-4 font-sans text-[2.15rem] font-light leading-[1.3] tracking-tight text-foreground">
              <span className="login-headline-line login-headline-line-2 block text-muted-foreground">Discover</span>
              <span className="login-headline-line login-headline-line-3 mt-1.5 block pl-6 font-semibold text-primary dark:text-primary">ideas</span>
              <span className="login-headline-line login-headline-line-4 mt-1 block pl-12 font-light text-foreground/90">worth sharing.</span>
            </h2>
            <p className="login-headline-line login-headline-line-5 mt-5 text-[14px] leading-[1.65] text-muted-foreground/95">
              Submit and share ideas from Greenwich, on the Thames.
            </p>
          </div>
        </div>

        {/* Info cards — compact, balanced, anchored lower */}
        <div className="login-info-cards mt-4 w-full max-w-md border-t border-border/40 pt-3">
          <div className="grid grid-cols-1 items-stretch gap-1.5 sm:grid-cols-3">
            <div className="login-info-card group flex items-center gap-1.5 rounded-md border border-border/40 bg-card/80 p-2 transition-all duration-200 hover:border-primary/20 hover:bg-card/95 dark:border-border/35 dark:bg-card/35 dark:hover:border-primary/15 dark:hover:bg-card/50">
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/20 dark:group-hover:bg-primary/25">
                <Clock className="text-current" size={12} weight="duotone" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Meridian
                </p>
                <p className="mt-0.5 text-[10px] font-medium leading-snug text-foreground">
                  0° longitude
                </p>
              </div>
            </div>
            <div className="login-info-card group flex items-center gap-1.5 rounded-md border border-border/40 bg-card/80 p-2 transition-all duration-200 hover:border-primary/20 hover:bg-card/95 dark:border-border/35 dark:bg-card/35 dark:hover:border-primary/15 dark:hover:bg-card/50">
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/20 dark:group-hover:bg-primary/25">
                <Buildings className="text-current" size={12} weight="duotone" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Maritime Greenwich
                </p>
                <p className="mt-0.5 text-[10px] font-medium leading-snug text-foreground">
                  UNESCO Heritage
                </p>
              </div>
            </div>
            <div className="login-info-card group flex items-center gap-1.5 rounded-md border border-border/40 bg-card/80 p-2 transition-all duration-200 hover:border-primary/20 hover:bg-card/95 dark:border-border/35 dark:bg-card/35 dark:hover:border-primary/15 dark:hover:bg-card/50">
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/20 dark:group-hover:bg-primary/25">
                <Compass className="text-current" size={12} weight="duotone" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                  University
                </p>
                <p className="mt-0.5 text-[10px] font-medium leading-snug text-foreground">
                  Founded 1890
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
