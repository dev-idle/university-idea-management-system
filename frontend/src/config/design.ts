/**
 * Shared design tokens for the application (Staff + Role Managers).
 * Use for consistent, professional UI: cards, headers, spacing, typography.
 */

/** Page content container: bottom padding for scroll. */
export const PAGE_CONTAINER_CLASS = "pb-24";

/** Narrow page wrapper (Ideas): centered, max-width, bottom padding. */
export const PAGE_WRAPPER_NARROW_CLASS = "mx-auto max-w-4xl pb-24";

/** Staff page vertical rhythm (Ideas Hub, idea detail, new proposal). Use with PAGE_WRAPPER_NARROW_CLASS. */
export const STAFF_PAGE_SPACING = "space-y-12";

/** Slightly wider page wrapper (Profile): centered, bottom padding. */
export const PAGE_WRAPPER_PROFILE_CLASS = "mx-auto max-w-5xl pb-24";

/** Card: rounded, border, background, subtle shadow. Use for content blocks. */
export const CARD_CLASS =
  "rounded-xl border border-border bg-card shadow-sm";

/** Card with primary left accent (for highlighted / main content blocks). */
export const CARD_ACCENT_CLASS =
  "rounded-xl border border-border bg-card shadow-sm overflow-hidden";

/** Left accent bar (use inside CARD_ACCENT_CLASS layout). */
export const CARD_ACCENT_BAR_CLASS =
  "w-1 shrink-0 self-stretch rounded-l-xl bg-primary/20";

/** Page/section header block: card with primary left border. */
export const PAGE_HEADER_CARD_CLASS = `${CARD_CLASS} px-6 py-8`;

/** Header left accent (title + description block). */
export const PAGE_HEADER_ACCENT_CLASS = "border-l-4 border-primary/40 pl-5";

/** Section/card left accent (border only). Use with cards/sections for consistency with page headers. */
export const SECTION_LEFT_ACCENT_CLASS = "border-l-4 border-primary/40";

/** Page title (h1). */
export const PAGE_TITLE_CLASS =
  "font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl";

/** Page/section description (muted, relaxed). */
export const PAGE_DESCRIPTION_CLASS =
  "mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground";

/** Page description with wider max-width (management pages). */
export const PAGE_DESCRIPTION_WIDE_CLASS =
  "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground";

/** Uppercase section label (e.g. Description, Attachments). Also for form labels. */
export const SECTION_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

/** Section card header (icon + title + description). */
export const SECTION_CARD_HEADER_CLASS =
  "border-b border-border px-6 pt-5 pb-2";

/** Section card title (h2/h3). */
export const SECTION_CARD_TITLE_CLASS =
  "font-serif text-lg font-semibold tracking-tight text-foreground";

/** Section card description (muted, below title). */
export const SECTION_CARD_DESCRIPTION_CLASS =
  "text-sm leading-relaxed text-muted-foreground";

/** Back / secondary link (muted until hover). */
export const BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary action button (height + rounding). */
export const BUTTON_PRIMARY_CLASS = "h-9 gap-2 rounded-lg px-4";

/** Loading state wrapper (centered, min height). */
export const LOADING_WRAPPER_CLASS =
  "flex min-h-[40vh] items-center justify-center";

/** Loading / empty state text. */
export const LOADING_TEXT_CLASS = "text-sm text-muted-foreground";

/** Stat/summary card with primary top accent (dashboards). */
export const CARD_STAT_CLASS =
  `${CARD_CLASS} border-t-2 border-t-primary/25`;

/** Staff page header accent line (primary gradient). */
export const STAFF_HEADER_ACCENT_CLASS =
  "h-px w-10 bg-gradient-to-r from-primary/80 to-transparent";

/** Staff page description (slightly larger, muted). */
export const STAFF_DESCRIPTION_CLASS =
  "mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground/70";

// ─── Page spacing (Staff + Role Manager) ───────────────────────────────────

/** Role Manager page vertical rhythm (Admin, QA Manager, QA Coordinator). */
export const MANAGEMENT_PAGE_SPACING = "space-y-10";

// ─── Focus & interaction ───────────────────────────────────────────────────

/** Standard focus ring (outline + ring). Use for links, cards, buttons. */
export const FOCUS_RING_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary-tinted focus ring for buttons and interactive elements. */
export const FOCUS_RING_PRIMARY_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

/** Input/select focus (border + ring). Use with rounded-lg inputs. */
export const INPUT_FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-primary/20 border-border";

// ─── Icon boxes (section headers, cards) ─────────────────────────────────────

/** Base icon container: size, center, rounded. */
export const ICON_BOX_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-lg";

/** Muted icon box (dashboards, secondary sections). */
export const ICON_BOX_MUTED_CLASS = `${ICON_BOX_CLASS} bg-muted/80 text-muted-foreground`;

/** Primary-accent icon box (highlighted sections). */
export const ICON_BOX_PRIMARY_CLASS =
  `${ICON_BOX_CLASS} border border-primary/20 bg-primary/10 text-primary`;

// ─── Alerts & inline feedback ───────────────────────────────────────────────

/** Warning/closure alert (amber). Use for submission closed, deadlines. */
export const ALERT_WARNING_CLASS =
  "rounded-xl border-amber-200/80 bg-amber-50/80 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-200";

/** Inline destructive block (validation, errors). */
export const DESTRUCTIVE_INLINE_CLASS =
  "rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive";

/** Inline destructive with left accent (form/block errors). */
export const DESTRUCTIVE_INLINE_ACCENT_CLASS =
  "rounded-lg border-l-4 border-destructive/50 border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive";

// ─── Buttons & form actions ─────────────────────────────────────────────────

/** Standard form submit button (height + rounding). */
export const FORM_SUBMIT_BUTTON_CLASS =
  "h-10 rounded-lg px-5 text-sm font-medium";

/** Standard form outline/cancel button. */
export const FORM_OUTLINE_BUTTON_CLASS =
  "h-10 rounded-lg border-border px-5 text-sm font-medium";
